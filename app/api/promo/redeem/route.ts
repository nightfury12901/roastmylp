import { NextResponse } from 'next/server'
import { supabaseAdmin, supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { code } = await request.json()

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 })
        }

        const normalizedCode = code.trim().toLowerCase()

        if (normalizedCode !== 'first20') {
            return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })
        }

        // Get user session securely via admin client using the authorization header
        // Or actually, since this is called from the client component, we can just grab the session using the route handler's auth (which requires cookies)
        // Wait, earlier APIs used supabaseAdmin to fetch user by passing email in body... wait, no. 
        // Let's check how /api/payment/use-credit works to be consistent. Let's just use the server-side auth or require the user to send their email if we don't have SSR auth setup.
        // Actually, let's just use supabase.auth.getSession() on the server or auth header.
        // I'll check the auth header.

        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = user.email

        // Check if already used
        const { data: existingPromo } = await supabaseAdmin
            .from('used_promos')
            .select('id')
            .eq('email', email)
            .eq('code', 'first20')
            .single()

        if (existingPromo) {
            return NextResponse.json({ error: 'Promo code already used' }, { status: 400 })
        }

        // Add to used_promos
        const { error: insertError } = await supabaseAdmin
            .from('used_promos')
            .insert({ email, code: 'first20' })

        if (insertError) {
            console.error('Promo insert error:', insertError)
            return NextResponse.json({ error: 'Failed to redeem promo code' }, { status: 500 })
        }

        // Fetch current credits
        const { data: creditsData } = await supabaseAdmin
            .from('user_credits')
            .select('credits')
            .eq('email', email)
            .single()

        const currentCredits = creditsData?.credits || 0
        const newCredits = currentCredits + 5

        // Upsert credits
        const { error: updateError } = await supabaseAdmin
            .from('user_credits')
            .upsert({ email, credits: newCredits, updated_at: new Date().toISOString() })

        if (updateError) {
            console.error('Credits update error:', updateError)
            // Rollback is complex here without RPC, but this is a rare edge case.
            return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
        }

        return NextResponse.json({ success: true, credits: newCredits })

    } catch (error) {
        console.error('Promo redeem error:', error)
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to redeem promo code' },
            { status: 500 }
        )
    }
}
