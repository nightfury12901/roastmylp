'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import ScoreDisplay from '@/components/ScoreDisplay'
import PaywallModal from '@/components/PaywallModal'
import AnnotatedScreenshot from '@/components/AnnotatedScreenshot'
import { supabase } from '@/lib/supabase'

interface RoastData {
    id: string
    url: string
    score: number
    top_3_problems: string[]
    first_headline: string
    is_paid: boolean
    created_at: string
}

const PROBLEM_LABELS = ['⚡ CRITICAL HIT', '🎯 CONVERSION KILLER', '💀 TRUST DESTROYER']


export default function RoastResults() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [data, setData] = useState<RoastData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showPaywall, setShowPaywall] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        fetchRoast()
    }, [id])

    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-left')
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('active') })
        }, { threshold: 0.1 })
        els.forEach((el) => obs.observe(el))

        // Auth state
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            setUser(session?.user || null)
        })

        return () => {
            obs.disconnect()
            subscription.unsubscribe()
        }
    }, [data])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const fetchRoast = async () => {
        try {
            const res = await fetch(`/api/roast/${id}`)
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Not found')
            setData(json)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentSuccess = () => {
        setShowPaywall(false)
        router.push(`/roast/${id}/full`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center grid-bg">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FBFF48] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-mono text-gray-400">Loading roast...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 grid-bg">
                <div className="text-center border-2 border-[#FF2A2A] p-8" style={{ boxShadow: '6px 6px 0 #FF2A2A' }}>
                    <div className="text-5xl mb-4">💀</div>
                    <h2 className="font-black text-2xl mb-2 text-[#FF2A2A]">ROAST_NOT_FOUND</h2>
                    <p className="font-mono text-gray-400 mb-6">{error || 'This roast does not exist'}</p>
                    <Link href="/roast" className="bg-[#FBFF48] text-black font-black px-6 py-3 border-2 border-black hover:bg-white transition-colors">
                        START A NEW ROAST →
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white grid-bg">

            {/* Paywall Modal */}
            {showPaywall && (
                <PaywallModal
                    roastId={id}
                    onClose={() => setShowPaywall(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {/* Nav */}
            <nav className="fixed top-0 w-full z-40 px-4 py-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
                    <Link
                        href="/"
                        className="bg-[#0a0a0a] border-2 border-white px-4 py-1 font-mono font-black text-xl hover:bg-[#FBFF48] hover:text-black transition-all"
                        style={{ boxShadow: '3px 3px 0 #FBFF48' }}
                    >
                        ROAST<span className="text-[#FBFF48]">MY</span>LP
                    </Link>
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-gray-400 border-2 border-white/10 px-3 py-1.5 bg-white/5">
                                    <User size={12} />
                                    <span className="truncate max-w-[120px]">{user.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="hidden sm:flex items-center gap-2 bg-[#0a0a0a] text-white border-2 border-white/20 font-mono font-black text-xs px-3 py-2 hover:border-[#FBFF48] hover:text-[#FBFF48] transition-all"
                                >
                                    <LogOut size={14} /> SIGN OUT
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth"
                                className="hidden sm:block bg-[#0a0a0a] text-white border-2 border-white/20 font-mono font-black text-xs px-3 py-2 hover:border-[#FBFF48] hover:text-[#FBFF48] transition-all"
                            >
                                SIGN IN
                            </Link>
                        )}
                        <button
                            onClick={() => setShowPaywall(true)}
                            className="bg-[#FBFF48] text-black font-mono font-black text-sm px-4 py-2 border-2 border-black hover:bg-white transition-colors"
                            style={{ boxShadow: '3px 3px 0 #000' }}
                        >
                            🔓 UNLOCK FULL →
                        </button>
                    </div>
                </div>
            </nav>

            <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-10 reveal">
                    <div
                        className="inline-block border-2 border-white/10 px-3 py-1 mb-4 font-mono text-xs text-gray-500"
                    >
                        ANALYSING: {data.url}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-2">
                        YOUR ROAST IS
                        <br />
                        <span className="text-[#FF2A2A]">READY. 🔥</span>
                    </h1>
                    <p className="font-mono text-sm text-gray-500">
                        // Free preview below · View full roast
                    </p>
                </div>

                {/* ---- ANNOTATED SCREENSHOT ---- */}
                <div className="mb-10 reveal">
                    <AnnotatedScreenshot siteUrl={data.url} problems={data.top_3_problems} />
                </div>

                {/* ---- FREE SECTION ---- */}
                <div className="space-y-8">

                    {/* Score */}
                    <div
                        className="border-2 border-white/10 p-8 reveal flex flex-col md:flex-row items-center gap-8"
                        style={{ boxShadow: '4px 4px 0 rgba(251,255,72,0.1)' }}
                    >
                        <div className="flex-shrink-0">
                            <ScoreDisplay score={data.score} />
                        </div>
                        <div>
                            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">CONVERSION_CLARITY_SCORE</p>
                            <h2 className="text-2xl font-black mb-2">
                                Your page scored <span className="text-[#FBFF48]">{data.score}/10</span>
                            </h2>
                            <p className="font-mono text-sm text-gray-400">
                                {data.score <= 4
                                    ? 'Visitors are confused and leaving without converting. Critical issues need immediate attention.'
                                    : data.score <= 6
                                        ? 'Your page has potential but key conversion elements are missing or unclear.'
                                        : 'Not bad, but there is significant room for improvement in your conversion funnel.'}
                            </p>
                        </div>
                    </div>

                    {/* Top 3 Problems */}
                    <div className="reveal">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <h2 className="font-mono font-black text-lg text-[#FF2A2A] uppercase">Top 3 Conversion Killers</h2>
                            <span className="font-mono text-xs text-gray-600">// FREE_PREVIEW</span>
                        </div>

                        <div className="space-y-4">
                            {data.top_3_problems.map((problem, i) => (
                                <div
                                    key={i}
                                    className="border-2 border-white/10 p-5 relative overflow-hidden hover:border-white/20 transition-colors"
                                    style={{ boxShadow: '3px 3px 0 rgba(255,42,42,0.2)' }}
                                >
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF2A2A]" />
                                    <div className="pl-4">
                                        <div className="font-mono text-[10px] text-[#FF2A2A] uppercase tracking-widest mb-2">
                                            {PROBLEM_LABELS[i]}
                                        </div>
                                        <p className="font-display text-sm text-gray-300 leading-relaxed">{problem}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* First line of rewrite - teaser */}
                    <div
                        className="border-2 border-[#33FF57]/20 p-6 reveal"
                        style={{ boxShadow: '4px 4px 0 rgba(51,255,87,0.1)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#33FF57] animate-pulse" />
                            <p className="font-mono text-[10px] text-[#33FF57] uppercase tracking-widest">AI_REWRITE_PREVIEW</p>
                        </div>
                        <p className="font-mono text-xs text-gray-500 mb-3">New Headline (first line only):</p>
                        <p className="text-xl md:text-2xl font-black text-white leading-tight">"{data.first_headline}"</p>
                        <p className="font-mono text-xs text-gray-600 mt-3">// Unlock to see the full rewrite: subheadline + benefits + CTA</p>
                    </div>

                    {/* ---- LOCKED SECTION ---- */}
                    <div className="relative reveal">
                        {/* Blur overlay */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                            style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,0.95) 30%)' }}
                        >
                            <div className="text-center px-4 py-12">
                                <div className="text-6xl mb-4">🔒</div>
                                <h3 className="font-black text-2xl md:text-3xl mb-2 uppercase">
                                    Full Roast + Rewrite
                                </h3>
                                <p className="font-mono text-sm text-gray-400 mb-6 max-w-lg">
                                    8-10 specific critiques across every conversion element + a completely rewritten hero section + 5-item quick fix checklist
                                </p>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            router.push('/auth')
                                        } else {
                                            setShowPaywall(true)
                                        }
                                    }}
                                    className="bg-[#FBFF48] text-black font-black text-xl px-10 py-5 border-2 border-black hover:translate-x-1 hover:translate-y-1 transition-all uppercase"
                                    style={{ boxShadow: '6px 6px 0 #000' }}
                                >
                                    🔓 VIEW FULL ROAST →
                                </button>
                                <p className="font-mono text-xs text-gray-500 mt-4">One-time · Instant access · Includes email delivery</p>
                            </div>
                        </div>

                        {/* Blurred preview content */}
                        <div className="border-2 border-white/5 p-6 space-y-4" style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                            <div className="font-mono text-[10px] text-gray-500 uppercase mb-4">FULL_ROAST — 8 CRITIQUES</div>
                            {[
                                { area: 'Headline Clarity', problem: 'Lorem ipsum dolor sit amet consectetur', fix: 'Fix your headline to directly address...' },
                                { area: 'Value Proposition', problem: 'Your value prop is buried below the fold', fix: 'Move your key differentiator above fold' },
                                { area: 'Social Proof', problem: 'No testimonials or trust signals visible', fix: 'Add 3 logos or star ratings above fold' },
                                { area: 'CTA Strength', problem: 'Learn More is conversion death', fix: 'Replace CTA with action-outcome phrasing' },
                            ].map((item, i) => (
                                <div key={i} className="border border-white/5 p-4">
                                    <div className="font-mono text-xs text-gray-400 mb-2">{item.area}</div>
                                    <p className="text-sm text-gray-300">{item.problem}</p>
                                    <p className="text-sm text-[#33FF57] mt-2">→ {item.fix}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-12 text-center reveal">
                    <Link href="/roast" className="font-mono text-xs text-gray-500 hover:text-[#FBFF48] transition-colors">
                        ← Roast another page
                    </Link>
                </div>
            </div>
        </main>
    )
}
