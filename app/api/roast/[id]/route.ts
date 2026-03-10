import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('roasts')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            console.error('Supabase fetch error:', error)
            return NextResponse.json({ error: 'Roast not found' }, { status: 404 })
        }

        // If not paid, return preview only
        if (!data.is_paid) {
            return NextResponse.json({
                id: data.id,
                url: data.url,
                score: data.score,
                top_3_problems: data.ai_result?.top_3_problems || [],
                first_headline: data.ai_result?.rewrite?.headline || '',
                is_paid: false,
                created_at: data.created_at,
            })
        }

        // Paid — return full data
        return NextResponse.json({
            id: data.id,
            url: data.url,
            score: data.score,
            top_3_problems: data.ai_result?.top_3_problems || [],
            first_headline: data.ai_result?.rewrite?.headline || '',
            full_roast: data.ai_result?.full_roast || [],
            rewrite: data.ai_result?.rewrite || {},
            quick_fixes: data.ai_result?.quick_fixes || [],
            is_paid: true,
            created_at: data.created_at,
        })
    } catch (error) {
        console.error('Route error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
