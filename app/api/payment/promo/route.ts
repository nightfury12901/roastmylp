import { NextResponse } from 'next/server'
import { supabaseAdmin, supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { code, roastId } = await request.json()

        if (!code || !roastId) {
            return NextResponse.json({ error: 'Missing code or roastId' }, { status: 400 })
        }

        const normalized = code.trim().toUpperCase()

        if (normalized === 'FIRST20') {
            // Requires authentication to store credits
            const authHeader = request.headers.get('Authorization')
            let user = null;

            if (authHeader) {
                const token = authHeader.replace('Bearer ', '')
                const { data } = await supabase.auth.getUser(token)
                user = data?.user
            } else {
                // Fallback: check session natively if called from client
                const { data: { session } } = await supabase.auth.getSession()
                user = session?.user
            }

            if (!user || !user.email) {
                return NextResponse.json({ error: 'You must be signed in to claim this promo.' }, { status: 401 })
            }

            const email = user.email

            // Check if already used
            const { data: existingPromo } = await supabaseAdmin
                .from('used_promos')
                .select('id')
                .eq('email', email)
                .eq('code', 'FIRST20')
                .single()

            if (existingPromo) {
                return NextResponse.json({ error: 'You have already used this promo code.' }, { status: 400 })
            }

            // Unlock the roast
            const { error: unlockError } = await supabaseAdmin
                .from('roasts')
                .update({ is_paid: true, payment_id: 'PROMO_FIRST20' })
                .eq('id', roastId)

            if (unlockError) throw unlockError

            // Mark promo as used
            await supabaseAdmin.from('used_promos').insert({ email, code: 'FIRST20' })

            // Add 4 credits (since 1 was effectively used for the current roast to equal 5 total)
            const { data: creditsData } = await supabaseAdmin
                .from('user_credits')
                .select('credits')
                .eq('email', email)
                .single()

            const currentCredits = creditsData?.credits || 0
            await supabaseAdmin
                .from('user_credits')
                .upsert({ email, credits: currentCredits + 4, updated_at: new Date().toISOString() })

            return NextResponse.json({ success: true })
        }

        if (normalized === 'CHINMAYPRO') {
            // Legacy promo simply unlocks the roast
            const { error } = await supabaseAdmin
                .from('roasts')
                .update({ is_paid: true, payment_id: `PROMO_${normalized}` })
                .eq('id', roastId)

            if (error) {
                console.error('Promo unlock error:', error)
                return NextResponse.json({ error: 'Failed to unlock' }, { status: 500 })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
    } catch (err) {
        console.error('Promo route error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
