import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const { roastId, email } = await request.json()

        if (!roastId || !email) {
            return NextResponse.json({ error: 'Missing roastId or email' }, { status: 400 })
        }

        // 1. Check credits
        const { data: creditData } = await supabaseAdmin
            .from('user_credits')
            .select('credits')
            .eq('email', email)
            .single()

        if (!creditData || creditData.credits < 1) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
        }

        // 2. Decrement credits
        await supabaseAdmin
            .from('user_credits')
            .update({ credits: creditData.credits - 1, updated_at: new Date().toISOString() })
            .eq('email', email)

        // 3. Mark roast as paid
        const { data: roastData, error } = await supabaseAdmin
            .from('roasts')
            .update({ is_paid: true, email, payment_id: 'CREDIT' })
            .eq('id', roastId)
            .select('*')
            .single()

        if (error || !roastData) {
            return NextResponse.json({ error: 'Failed to unlock roast' }, { status: 500 })
        }

        // 4. Send Email
        if (roastData.ai_result) {
            const result = roastData.ai_result as any
            try {
                await resend.emails.send({
                    from: 'RoastMyLP <onboarding@resend.dev>',
                    to: email,
                    subject: `Your Landing Page Roast is Ready 🔥 (Score: ${roastData.score}/10)`,
                    html: `
            <h1>Your Full Landing Page Roast</h1>
            <p><strong>URL:</strong> ${roastData.url}</p>
            <p><strong>Conversion Score:</strong> ${roastData.score}/10</p>
            
            <h2>Top 3 Problems</h2>
            <ol>
              ${result.top_3_problems?.map((p: string) => `<li>${p}</li>`).join('') || ''}
            </ol>
            
            <h2>Full Roast</h2>
            ${result.full_roast?.map((r: any) => `
              <h3>${r.area}</h3>
              <p><strong>Problem:</strong> ${r.problem}</p>
              <p><strong>Fix:</strong> ${r.fix}</p>
            `).join('') || ''}
            
            <h2>Your Rewrite</h2>
            <p><strong>Headline:</strong> ${result.rewrite?.headline}</p>
            <p><strong>Subheadline:</strong> ${result.rewrite?.subheadline}</p>
            <p><strong>Benefits:</strong></p>
            <ul>
              ${result.rewrite?.benefits?.map((b: string) => `<li>${b}</li>`).join('') || ''}
            </ul>
            <p><strong>CTA:</strong> ${result.rewrite?.cta_text}</p>
            
            <h2>Quick Fix Checklist</h2>
            <ol>
              ${result.quick_fixes?.map((f: string) => `<li>${f}</li>`).join('') || ''}
            </ol>
            
            <p>View your full results at: <a href="${process.env.NEXT_PUBLIC_APP_URL}/roast/${roastId}/full">${process.env.NEXT_PUBLIC_APP_URL}/roast/${roastId}/full</a></p>
          `,
                })
            } catch (emailError) {
                console.error('Email send err in use-credit:', emailError)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Credit usage error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
