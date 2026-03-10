'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingAnimation from '@/components/LoadingAnimation'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const DESIRED_ACTIONS = [
    { value: 'sign_up', label: 'Sign Up / Create Account' },
    { value: 'book_demo', label: 'Book a Demo' },
    { value: 'buy_now', label: 'Buy Now / Purchase' },
    { value: 'get_quote', label: 'Get a Quote' },
    { value: 'download', label: 'Download / Free Trial' },
    { value: 'contact', label: 'Contact / Reach Out' },
    { value: 'other', label: 'Other' },
]

export default function RoastForm() {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [targetCustomer, setTargetCustomer] = useState('')
    const [desiredAction, setDesiredAction] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // Reveal animations
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
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate URL
        try { new URL(url) } catch {
            setError('Please enter a valid URL (e.g. https://yoursite.com)')
            return
        }

        if (!targetCustomer.trim()) {
            setError('Please describe your target customer')
            return
        }
        if (!desiredAction) {
            setError('Please select what you want visitors to do')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, targetCustomer, desiredAction }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate roast')
            }

            router.push(`/roast/${data.id}`)
        } catch (err) {
            setError((err as Error).message)
            setLoading(false)
        }
    }

    if (loading) return <LoadingAnimation />

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
                        ← ROAST<span className="text-[#FBFF48]">MY</span>LP
                    </Link>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-gray-400 border-2 border-white/10 px-3 py-1.5 bg-white/5">
                                    <User size={12} />
                                    <span className="truncate max-w-[150px]">{user.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-[#0a0a0a] text-white flex items-center gap-2 border-2 border-white/20 font-mono font-black text-xs px-3 py-2 hover:border-[#FBFF48] hover:text-[#FBFF48] transition-all"
                                    style={{ boxShadow: '2px 2px 0 rgba(251,255,72,0.3)' }}
                                >
                                    <LogOut size={14} /> SIGN OUT
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth"
                                className="bg-[#0a0a0a] text-white border-2 border-white/20 font-mono font-black text-xs px-3 py-2 hover:border-[#FBFF48] hover:text-[#FBFF48] transition-all"
                                style={{ boxShadow: '2px 2px 0 rgba(251,255,72,0.3)' }}
                            >
                                SIGN IN →
                            </Link>
                        )}
                    </div>
                </div>
            </nav>


            <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-12 reveal">
                    <div
                        className="inline-block border-2 border-white/10 px-4 py-1.5 mb-6 font-mono text-sm text-[#33FF57]"
                        style={{ boxShadow: '3px 3px 0 #33FF57' }}
                    >
                        ● STEP 1 OF 1 · TAKES ~15 SECONDS
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.85] mb-4">
                        LET'S ROAST
                        <br />
                        <span className="text-[#FF2A2A]">YOUR PAGE.</span>
                    </h1>
                    <p className="font-mono text-gray-400">
            // No account needed · AI-powered CRO audit
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8 reveal">

                    {/* URL Input */}
                    <div
                        className="border-2 border-white/10 p-6 relative hover:border-white/30 transition-colors"
                        style={{ boxShadow: '4px 4px 0 rgba(251,255,72,0.2)' }}
                    >
                        <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2">
                            <label className="font-mono font-black text-[10px] text-[#FBFF48] uppercase tracking-widest">
                                01_LANDING_PAGE_URL *
                            </label>
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://yourlandingpage.com"
                            className="w-full bg-transparent font-mono text-white text-lg placeholder-gray-600 focus:outline-none"
                            required
                        />
                        <div className="mt-2 font-mono text-[10px] text-gray-600">
              // Must be publicly accessible · JS-heavy sites may use fallback text input
                        </div>
                    </div>

                    {/* Target Customer */}
                    <div
                        className="border-2 border-white/10 p-6 relative hover:border-white/30 transition-colors"
                        style={{ boxShadow: '4px 4px 0 rgba(51,255,87,0.2)' }}
                    >
                        <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2">
                            <label className="font-mono font-black text-[10px] text-[#33FF57] uppercase tracking-widest">
                                02_TARGET_CUSTOMER *
                            </label>
                        </div>
                        <input
                            type="text"
                            value={targetCustomer}
                            onChange={(e) => setTargetCustomer(e.target.value)}
                            placeholder='e.g. "indie SaaS founders" or "e-commerce store owners"'
                            className="w-full bg-transparent font-mono text-white text-base placeholder-gray-600 focus:outline-none"
                            required
                        />
                        <div className="mt-2 font-mono text-[10px] text-gray-600">
              // Be specific — better customer desc = better roast
                        </div>
                    </div>

                    {/* Desired Action */}
                    <div
                        className="border-2 border-white/10 p-6 relative hover:border-white/30 transition-colors"
                        style={{ boxShadow: '4px 4px 0 rgba(255,112,166,0.2)' }}
                    >
                        <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2">
                            <label className="font-mono font-black text-[10px] text-[#FF70A6] uppercase tracking-widest">
                                03_DESIRED_ACTION *
                            </label>
                        </div>
                        <p className="font-mono text-[10px] text-gray-500 mb-4">What should visitors do on your page?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {DESIRED_ACTIONS.map((action) => (
                                <button
                                    key={action.value}
                                    type="button"
                                    onClick={() => setDesiredAction(action.value)}
                                    className="text-left px-4 py-3 font-mono text-sm border-2 transition-all"
                                    style={{
                                        borderColor: desiredAction === action.value ? '#FF70A6' : 'rgba(255,255,255,0.1)',
                                        background: desiredAction === action.value ? '#FF70A6' : 'transparent',
                                        color: desiredAction === action.value ? '#000' : '#fff',
                                        boxShadow: desiredAction === action.value ? '3px 3px 0 #000' : 'none',
                                    }}
                                >
                                    {desiredAction === action.value ? '● ' : '○ '}{action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="border-2 border-[#FF2A2A] p-4 font-mono text-sm text-[#FF2A2A]"
                            style={{ boxShadow: '3px 3px 0 #FF2A2A' }}
                        >
                            ⚠ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FBFF48] text-black font-black text-2xl py-6 border-2 border-black hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                        style={{ boxShadow: '8px 8px 0 #FF2A2A' }}
                    >
                        🔥 ROAST IT →
                    </button>

                    <p className="text-center font-mono text-xs text-gray-600">
                        Takes ~15 seconds · No account needed · Free preview instant
                    </p>
                </form>
            </div>
        </main>
    )
}
