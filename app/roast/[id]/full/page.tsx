'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import ScoreDisplay from '@/components/ScoreDisplay'
import RoastCard from '@/components/RoastCard'
import AnnotatedScreenshot from '@/components/AnnotatedScreenshot'
import { supabase } from '@/lib/supabase'

interface FullRoastData {
    id: string
    url: string
    score: number
    top_3_problems: string[]
    first_headline: string
    full_roast: { area: string; problem: string; fix: string }[]
    rewrite: { headline: string; subheadline: string; benefits: string[]; cta_text: string }
    quick_fixes: string[]
    is_paid: boolean
    created_at: string
}

export default function FullResults() {
    const params = useParams()
    const id = params.id as string

    const [data, setData] = useState<FullRoastData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        fetchFullRoast()
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
        // No need to redirect since they paid for this page via ID, but refresh
        window.location.reload()
    }

    const fetchFullRoast = async () => {
        try {
            const res = await fetch(`/api/roast/${id}`)
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Not found')

            if (!json.is_paid) {
                setError('Payment required. Please complete payment to access full roast.')
                return
            }

            setData(json)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const shareText = data
        ? `My landing page scored ${data.score}/10 on RoastMyLP 🔥 Get yours brutally roasted by AI at roastmylp.com`
        : ''

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center grid-bg">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FBFF48] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-mono text-gray-400">Loading full roast...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 grid-bg">
                <div className="text-center border-2 border-[#FF2A2A] p-8" style={{ boxShadow: '6px 6px 0 #FF2A2A' }}>
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="font-black text-2xl mb-2 text-[#FF2A2A]">ACCESS_DENIED</h2>
                    <p className="font-mono text-gray-400 mb-6">{error}</p>
                    <Link
                        href={`/roast/${id}`}
                        className="bg-[#FBFF48] text-black font-black px-6 py-3 border-2 border-black hover:bg-white transition-colors"
                    >
                        ← BACK TO ROAST
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white grid-bg">

            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 px-4 py-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
                    <Link
                        href="/"
                        className="bg-[#0a0a0a] border-2 border-white px-4 py-1 font-mono font-black text-xl hover:bg-[#FBFF48] hover:text-black transition-all"
                        style={{ boxShadow: '3px 3px 0 #FBFF48' }}
                    >
                        ROAST<span className="text-[#FBFF48]">MY</span>LP
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* Share button */}
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-block font-mono font-black text-xs px-3 py-2 border-2 border-white/20 hover:border-[#33FF57] hover:text-[#33FF57] transition-colors"
                        >
                            𝕏 SHARE
                        </a>

                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-2 font-mono text-xs text-gray-400 border-2 border-white/10 px-3 py-1.5 bg-white/5">
                                    <User size={12} />
                                    <span className="truncate max-w-[120px]">{user.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-[#0a0a0a] text-white flex items-center gap-2 border-2 border-white/20 font-mono font-black text-xs px-3 py-2 hover:border-[#FBFF48] hover:text-[#FBFF48] transition-all"
                                >
                                    <LogOut size={14} /> SIGN OUT
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth"
                                className="bg-[#0a0a0a] text-white border-2 border-white/20 font-mono font-black text-xs px-3 py-2 hover:border-[#FBFF48] hover:text-[#FBFF48] transition-all"
                            >
                                SIGN IN
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-12 reveal">
                    <div
                        className="inline-block bg-[#33FF57] text-black font-mono font-black text-xs px-3 py-1 mb-4 border-2 border-black"
                        style={{ boxShadow: '3px 3px 0 #000' }}
                    >
                        ✓ PAID · FULL_ACCESS_GRANTED
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-2">
                        YOUR FULL
                        <br />
                        <span className="text-[#FBFF48]">ROAST REPORT.</span>
                    </h1>
                    <p className="font-mono text-sm text-gray-500">
            // {data.url} · Analysed {new Date(data.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Score + Summary */}
                <div
                    className="border-2 border-white/10 p-8 reveal flex flex-col md:flex-row items-center gap-8 mb-10"
                    style={{ boxShadow: '4px 4px 0 rgba(251,255,72,0.2)' }}
                >
                    <div className="flex-shrink-0">
                        <ScoreDisplay score={data.score} />
                    </div>
                    <div>
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                            CONVERSION_CLARITY_SCORE
                        </p>
                        <h2 className="text-2xl font-black mb-3">
                            Overall: <span className="text-[#FBFF48]">{data.score}/10</span>
                        </h2>
                        <div className="space-y-2">
                            {data.top_3_problems.map((p, i) => (
                                <div key={i} className="flex items-start gap-2 font-mono text-sm text-gray-400">
                                    <span className="text-[#FF2A2A] flex-shrink-0">✗</span>
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ---- ANNOTATED SCREENSHOT ---- */}
                <div className="mb-12 reveal">
                    <AnnotatedScreenshot siteUrl={data.url} problems={data.top_3_problems} />
                </div>

                {/* Full Roast */}
                <section className="mb-12 reveal">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <h2 className="font-mono font-black text-lg text-[#FF2A2A] uppercase tracking-wider">
                            Full CRO Roast
                        </h2>
                        <span className="font-mono text-xs text-gray-600">// {data.full_roast.length} CRITIQUES</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.full_roast.map((item, i) => (
                            <RoastCard key={i} {...item} index={i} />
                        ))}
                    </div>
                </section>

                {/* Rewrite */}
                <section
                    className="mb-12 border-2 border-[#33FF57]/30 p-8 reveal"
                    style={{ boxShadow: '6px 6px 0 rgba(51,255,87,0.2)' }}
                >
                    <div className="absolute-top-0 left-0 right-0 h-1 bg-[#33FF57]" />
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-2 bg-[#33FF57] animate-pulse" />
                        <h2 className="font-mono font-black text-lg text-[#33FF57] uppercase tracking-wider">
                            AI_REWRITE
                        </h2>
                        <span className="font-mono text-xs text-gray-600">// DROP_IN_REPLACEMENT</span>
                    </div>

                    {/* Headline */}
                    <div className="mb-6 pb-6 border-b border-white/5">
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">HEADLINE:</p>
                        <h3 className="text-3xl md:text-4xl font-black leading-tight text-white">
                            {data.rewrite.headline}
                        </h3>
                    </div>

                    {/* Subheadline */}
                    <div className="mb-6 pb-6 border-b border-white/5">
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">SUBHEADLINE:</p>
                        <p className="text-xl font-display text-gray-200 leading-relaxed">
                            {data.rewrite.subheadline}
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6 pb-6 border-b border-white/5">
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">BENEFIT_BULLETS:</p>
                        <ul className="space-y-3">
                            {data.rewrite.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-3 font-mono text-sm text-gray-200">
                                    <span className="text-[#33FF57] font-black flex-shrink-0">→</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <div>
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-3">CTA_TEXT:</p>
                        <div
                            className="inline-block bg-[#FBFF48] text-black font-black text-lg px-8 py-4 border-2 border-black"
                            style={{ boxShadow: '4px 4px 0 #000' }}
                        >
                            {data.rewrite.cta_text}
                        </div>
                    </div>
                </section>

                {/* Quick Fixes */}
                <section className="mb-12 reveal">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <h2 className="font-mono font-black text-lg text-[#FF9F1C] uppercase tracking-wider">
                            Quick Fix Checklist
                        </h2>
                        <span className="font-mono text-xs text-gray-600">// RANKED_BY_IMPACT</span>
                    </div>
                    <div className="space-y-3">
                        {data.quick_fixes.map((fix, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 border-2 border-white/5 p-4 hover:border-[#FF9F1C]/30 transition-colors"
                            >
                                <span
                                    className="font-mono font-black text-2xl flex-shrink-0"
                                    style={{ color: `hsl(${30 + i * 10}, 100%, 60%)` }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <p className="font-mono text-sm text-gray-300 leading-relaxed">{fix}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Share Card */}
                <div
                    className="border-2 border-white/10 p-8 text-center reveal mb-12"
                    style={{ boxShadow: '4px 4px 0 rgba(255,255,255,0.05)' }}
                >
                    <p className="font-mono text-gray-500 text-xs uppercase tracking-widest mb-4">SHARE_YOUR_SCORE</p>
                    <p className="font-black text-2xl mb-6">
                        My landing page scored <span className="text-[#FBFF48]">{data.score}/10</span>
                        <br />
                        <span className="text-gray-400 text-lg">— got yours roasted?</span>
                    </p>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-black text-white border-2 border-white font-black px-8 py-4 hover:bg-[#FBFF48] hover:text-black hover:border-black transition-all"
                        style={{ boxShadow: '4px 4px 0 #FBFF48' }}
                    >
                        𝕏 SHARE ON TWITTER →
                    </a>
                </div>

                {/* Upsell */}
                <div
                    className="border-2 border-[#FF70A6]/30 p-8 reveal"
                    style={{ boxShadow: '6px 6px 0 rgba(255,112,166,0.2)' }}
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF70A6]" />
                    <p className="font-mono text-[10px] text-[#FF70A6] uppercase tracking-widest mb-3">UPSELL_OFFER</p>
                    <h3 className="text-2xl font-black mb-2">Want us to rebuild your landing page?</h3>
                    <p className="font-mono text-sm text-gray-400 mb-6">
                        We implement every fix in this report + build you a high-converting page from scratch.
                        <span className="text-white font-bold"> Starting at ₹15,000.</span>
                    </p>
                    <a
                        href="https://calendly.com/roastmylp/consultation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#FF70A6] text-black font-black px-8 py-4 border-2 border-black hover:bg-white transition-colors"
                        style={{ boxShadow: '4px 4px 0 #000' }}
                    >
                        BOOK CONSULTATION →
                    </a>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/roast" className="font-mono text-xs text-gray-600 hover:text-[#FBFF48] transition-colors">
                        ← Roast another landing page
                    </Link>
                </div>
            </div>
        </main>
    )
}
