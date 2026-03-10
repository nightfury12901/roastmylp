import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { roastId, email, plan = 'single' } = await request.json()

        if (!roastId || !email) {
            return NextResponse.json({ error: 'Missing roastId or email' }, { status: 400 })
        }

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
        }

        const amount = plan === 'pack' ? 49900 : 4900; // 499 or 49 INR in paise

        // Create Razorpay order via REST (avoid SDK issues on edge)
        const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${credentials}`,
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'INR',
                receipt: `roast_${roastId.slice(0, 8)}`,
                notes: {
                    roast_id: roastId,
                    email,
                    plan,
                },
            }),
        })

        if (!response.ok) {
            const err = await response.json()
            return NextResponse.json({ error: err.error?.description || 'Failed to create order' }, { status: 500 })
        }

        const order = await response.json()
        return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
