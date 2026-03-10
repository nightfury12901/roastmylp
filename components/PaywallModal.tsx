'use client'

import { useState, useEffect } from 'react'
import { X, Lock, Zap, Tag, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PaywallModalProps {
    roastId: string
    onClose: () => void
    onSuccess: () => void
}

declare global {
    interface Window { Razorpay: any }
}

export default function PaywallModal({ roastId, onClose, onSuccess }: PaywallModalProps) {
    const [email, setEmail] = useState('')
    const [promoCode, setPromoCode] = useState('')
    const [promoApplied, setPromoApplied] = useState(false)
    const [loading, setLoading] = useState(false)
    const [promoLoading, setPromoLoading] = useState(false)
    const [error, setError] = useState('')
    const [promoError, setPromoError] = useState('')

    const [plan, setPlan] = useState<'single' | 'pack'>('single')
    const [credits, setCredits] = useState(0)
    const [fetchingCredits, setFetchingCredits] = useState(false)

    // Check if user is logged in natively
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email) {
                setEmail(session.user.email)
            }
        })
    }, [])

    // Fetch credits whenever email changes (debounce 400ms)
    useEffect(() => {
        if (!email.includes('@')) {
            setCredits(0)
            return
        }
        const t = setTimeout(async () => {
            setFetchingCredits(true)
            try {
                const r = await fetch(`/api/user/credits?email=${encodeURIComponent(email)}`)
                const d = await r.json()
                setCredits(d.credits || 0)
            } finally {
                setFetchingCredits(false)
            }
        }, 400)
        return () => clearTimeout(t)
    }, [email])

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return
        setPromoLoading(true)
        setPromoError('')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const res = await fetch('/api/payment/promo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ code: promoCode, roastId }),
            })
            const data = await res.json()

            if (!res.ok) {
                setPromoError(data.error || 'Invalid promo code')
            } else {
                setPromoApplied(true)
                setTimeout(() => onSuccess(), 1000)
            }
        } catch {
            setPromoError('Something went wrong. Try again.')
        } finally {
            setPromoLoading(false)
        }
    }

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true)
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleUseCredit = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/payment/use-credit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roastId, email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to use credit')
            onSuccess()
        } catch (err) {
            setError((err as Error).message)
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email')
            return
        }
        setLoading(true)
        setError('')

        try {
            const loaded = await loadRazorpayScript()
            if (!loaded) throw new Error('Could not load Razorpay')

            const orderRes = await fetch('/api/payment/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roastId, email, plan }),
            })
            const orderData = await orderRes.json()
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order')

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'RoastMyLP',
                description: plan === 'pack' ? '20 Landing Page Roasts' : 'Full Landing Page Roast',
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    const verifyRes = await fetch('/api/payment/webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            roast_id: roastId,
                            email,
                            plan
                        }),
                    })
                    const verifyData = await verifyRes.json()
                    if (verifyData.success) {
                        onSuccess()
                    } else {
                        setError('Payment verification failed. Please contact support.')
                    }
                },
                prefill: { email },
                theme: { color: '#FBFF48' },
                modal: { ondismiss: () => setLoading(false) },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err) {
            setError((err as Error).message)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative z-10 w-full max-w-md bg-[#0a0a0a] border-4 border-white"
                style={{ boxShadow: '8px 8px 0 #FBFF48' }}
            >
                {/* Header */}
                <div className="bg-[#FBFF48] border-b-4 border-black p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Lock size={20} className="text-black" />
                        <span className="font-mono font-black text-black text-lg">UNLOCK_FULL_ROAST.exe</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-black hover:text-white p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5 h-[70vh] overflow-y-auto">
                    {/* What you get */}
                    <ul className="space-y-2">
                        {[
                            '8-10 critiques across every conversion element',
                            'Full hero rewrite: headline + sub + bullets + CTA',
                            'Annotated screenshot highlighting exact problems UI',
                            'Email with your full roast report',
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 font-mono text-sm text-gray-300">
                                <Zap size={14} className="text-[#FBFF48] mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    {/* Email Input (moved up to check credits early) */}
                    <div>
                        <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">
                            YOUR_EMAIL (receipt + report):
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-black border-2 border-white/20 px-3 py-3 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#FBFF48] transition-colors"
                        />
                    </div>

                    {fetchingCredits ? (
                        <p className="font-mono text-xs text-gray-400">Checking account...</p>
                    ) : credits > 0 ? (
                        <div className="border-2 border-[#33FF57] p-4 bg-[#33FF57]/10">
                            <h3 className="font-mono font-black text-[#33FF57] flex items-center gap-2 mb-2">
                                <Star size={16} fill="#33FF57" /> {credits} ROAST CREDITS AVAILABLE
                            </h3>
                            <button
                                onClick={handleUseCredit}
                                disabled={loading}
                                className="w-full bg-[#33FF57] text-black font-black py-3 border-2 border-black hover:bg-white transition-colors"
                                style={{ boxShadow: '4px 4px 0 #000' }}
                            >
                                {loading ? 'UNLOCKING...' : `UNLOCK WITH 1 CREDIT →`}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Pricing Tiers */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button
                                    onClick={() => setPlan('single')}
                                    className={`border-2 p-3 text-left transition-all ${plan === 'single' ? 'border-[#FBFF48] bg-[#FBFF48]/10' : 'border-white/20 hover:border-white/50'
                                        }`}
                                >
                                    <div className="font-mono text-xs text-gray-400 mb-1">SINGLE ROAST</div>
                                    <div className={`font-black text-2xl ${plan === 'single' ? 'text-[#FBFF48]' : 'text-white'}`}>₹49</div>
                                </button>
                            </div>

                            {/* PROMO CODE */}
                            <div className="border-2 border-dashed border-white/20 p-4 mt-4">
                                <label className="font-mono text-[10px] text-[#33FF57] uppercase tracking-widest flex items-center gap-1 mb-2">
                                    <Tag size={10} /> PROMO_CODE (optional):
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                        placeholder="ENTER_CODE"
                                        className="flex-1 bg-black border-2 border-white/20 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#33FF57] uppercase"
                                        disabled={promoApplied}
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || promoApplied || !promoCode.trim()}
                                        className="px-4 py-2 font-mono font-black text-sm border-2 transition-all disabled:opacity-40"
                                        style={{
                                            background: promoApplied ? '#33FF57' : '#FBFF48',
                                            color: '#000',
                                            borderColor: promoApplied ? '#33FF57' : '#000',
                                            boxShadow: '3px 3px 0 #000',
                                        }}
                                    >
                                        {promoApplied ? '✓' : promoLoading ? '...' : 'APPLY'}
                                    </button>
                                </div>
                                {promoError && <p className="font-mono text-xs text-[#FF2A2A] mt-2">⚠ {promoError}</p>}
                                {promoApplied && <p className="font-mono text-xs text-[#33FF57] mt-2">✓ Code applied! Unlocking...</p>}
                            </div>

                            {error && (
                                <p className="font-mono text-sm text-[#FF2A2A] border border-[#FF2A2A] px-3 py-2 mt-4">⚠ {error}</p>
                            )}

                            {!promoApplied && (
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full mt-4 bg-[#FBFF48] text-black font-black text-lg py-4 border-2 border-black hover:bg-white transition-colors disabled:opacity-50"
                                    style={{ boxShadow: '4px 4px 0 #000' }}
                                >
                                    {loading ? 'PROCESSING...' : `PAY ₹49 WITH RAZORPAY →`}
                                </button>
                            )}

                            <p className="text-center font-mono text-xs text-gray-500 mt-3">
                                Secured by Razorpay · Instant access after payment
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
