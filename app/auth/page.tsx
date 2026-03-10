'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Browser-only Supabase client — avoids importing the admin client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthPage() {
    const router = useRouter()
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setSuccess('Check your email to confirm your account, then sign in!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                router.push('/roast')
                router.refresh()
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white grid-bg flex flex-col items-center justify-center px-4">

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
                </div>
            </nav>

            <div className="w-full max-w-md">

                {/* Badge */}
                <div
                    className="inline-block border-2 border-white/10 px-4 py-1.5 mb-8 font-mono text-sm text-[#33FF57]"
                    style={{ boxShadow: '3px 3px 0 #33FF57' }}
                >
                    ● ACCESS_PANEL
                </div>

                {/* Heading */}
                <h1 className="text-5xl font-black uppercase leading-[0.9] mb-8">
                    {mode === 'signin' ? (
                        <>SIGN<br /><span className="text-[#FBFF48]">IN.</span></>
                    ) : (
                        <>CREATE<br /><span className="text-[#33FF57]">ACCOUNT.</span></>
                    )}
                </h1>

                {/* Mode tabs */}
                <div className="flex border-2 border-white/10 mb-8" style={{ boxShadow: '4px 4px 0 rgba(251,255,72,0.15)' }}>
                    <button
                        onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                        className="flex-1 py-3 font-mono font-black text-sm uppercase transition-all"
                        style={{
                            background: mode === 'signin' ? '#FBFF48' : 'transparent',
                            color: mode === 'signin' ? '#000' : '#666',
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                        className="flex-1 py-3 font-mono font-black text-sm uppercase transition-all"
                        style={{
                            background: mode === 'signup' ? '#33FF57' : 'transparent',
                            color: mode === 'signup' ? '#000' : '#666',
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Email */}
                    <div
                        className="border-2 border-white/10 p-5 relative hover:border-white/30 transition-colors"
                        style={{ boxShadow: '4px 4px 0 rgba(251,255,72,0.15)' }}
                    >
                        <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2">
                            <label className="font-mono font-black text-[10px] text-[#FBFF48] uppercase tracking-widest">
                                EMAIL_ADDRESS *
                            </label>
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-transparent font-mono text-white text-base placeholder-gray-600 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div
                        className="border-2 border-white/10 p-5 relative hover:border-white/30 transition-colors"
                        style={{ boxShadow: '4px 4px 0 rgba(51,255,87,0.15)' }}
                    >
                        <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2">
                            <label className="font-mono font-black text-[10px] text-[#33FF57] uppercase tracking-widest">
                                PASSWORD * {mode === 'signup' ? '(min 6 chars)' : ''}
                            </label>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-transparent font-mono text-white text-base placeholder-gray-600 focus:outline-none"
                            required
                            minLength={6}
                        />
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

                    {/* Success */}
                    {success && (
                        <div
                            className="border-2 border-[#33FF57] p-4 font-mono text-sm text-[#33FF57]"
                            style={{ boxShadow: '3px 3px 0 #33FF57' }}
                        >
                            ✓ {success}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-black text-xl py-5 border-2 border-black hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                        style={{
                            background: mode === 'signin' ? '#FBFF48' : '#33FF57',
                            color: '#000',
                            boxShadow: '6px 6px 0 #FF2A2A',
                        }}
                    >
                        {loading
                            ? '⏳ PROCESSING...'
                            : mode === 'signin'
                                ? '→ SIGN IN'
                                : '→ CREATE ACCOUNT'}
                    </button>

                    <p className="text-center font-mono text-xs text-gray-600">
                        {mode === 'signin' ? (
                            <>No account? <button type="button" onClick={() => setMode('signup')} className="text-[#FBFF48] hover:underline">Sign up free →</button></>
                        ) : (
                            <>Already have one? <button type="button" onClick={() => setMode('signin')} className="text-[#33FF57] hover:underline">Sign in →</button></>
                        )}
                    </p>
                </form>

                <div className="mt-10 border-t border-white/5 pt-6 text-center">
                    <Link href="/roast" className="font-mono text-xs text-gray-600 hover:text-[#FBFF48] transition-colors">
                        ← Continue without account
                    </Link>
                </div>
            </div>
        </main>
    )
}
