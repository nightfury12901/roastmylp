import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            roast_id,
            email,
            plan = 'single'
        } = body

        // Verify Razorpay signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET!
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // If it's a pack, add 19 credits (1 used for current roast)
        if (plan === 'pack') {
            const { data: existingCredit } = await supabaseAdmin
                .from('user_credits')
                .select('credits')
                .eq('email', email)
                .single()

            const currentCredits = existingCredit?.credits || 0

            await supabaseAdmin
                .from('user_credits')
                .upsert({
                    email,
                    credits: currentCredits + 19,
                    updated_at: new Date().toISOString()
                })
        }

        // Update Supabase
        const { data: roastData, error } = await supabaseAdmin
            .from('roasts')
            .update({
                is_paid: true,
                payment_id: razorpay_payment_id,
                email,
            })
            .eq('id', roast_id)
            .select('*')
            .single()

        if (error) {
            console.error('Supabase update error:', error)
            return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
        }

        // Send email via Resend
        if (email && roastData?.ai_result) {
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
            
            <p>View your full results at: <a href="${process.env.NEXT_PUBLIC_APP_URL}/roast/${roast_id}/full">${process.env.NEXT_PUBLIC_APP_URL}/roast/${roast_id}/full</a></p>
          `,
                })
            } catch (emailError) {
                console.error('Email send error:', emailError)
            }
        }

        return NextResponse.json({ success: true, roastId: roast_id })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
