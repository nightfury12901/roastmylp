'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageLoader from '@/components/PageLoader'
import { LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const EXAMPLE_ROASTS = [
  {
    url: 'acmecorp.com',
    score: 3,
    problem: 'Your headline says "Empowering Businesses" — this means absolutely nothing to anyone.',
    color: '#FF2A2A',
  },
  {
    url: 'startupxyz.io',
    score: 5,
    problem: 'No social proof above the fold. Why would anyone trust you in the first 5 seconds?',
    color: '#FF9F1C',
  },
  {
    url: 'saaslaunch.co',
    score: 4,
    problem: 'Your CTA says "Learn More" — this is the most conversion-killing button text in existence.',
    color: '#A855F7',
  },
]

const MARQUEE_ITEMS = [
  '🔥 ROAST MY LANDING PAGE',
  '⚡ AI-POWERED CRO',
  '💀 BRUTAL FEEDBACK',
  '✍️ INSTANT REWRITE',
  '🎯 MORE CONVERSIONS',
  '🚀 30 SECOND AUDIT',
  '🧠 GROQ AI POWERED',
]

export default function Home() {
  const router = useRouter()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showLoader, setShowLoader] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Only show loader once per session
    const hasLoaded = sessionStorage.getItem('rmlp_loaded')
    if (hasLoaded) {
      setShowLoader(false)
      setContentVisible(true)
    } else {
      setShowLoader(true)
    }
  }, [])

  const handleLoaderComplete = () => {
    sessionStorage.setItem('rmlp_loaded', '1')
    setShowLoader(false)
    setContentVisible(true)
  }

  useEffect(() => {
    if (!contentVisible) return
    const revealEls = document.querySelectorAll('.reveal, .reveal-left')
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('active') }) },
      { threshold: 0.08 }
    )
    revealEls.forEach((el) => observer.observe(el))

    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => { observer.disconnect(); window.removeEventListener('mousemove', handleMouse) }
  }, [contentVisible])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      {showLoader && <PageLoader onComplete={handleLoaderComplete} />}
      <main
        className="min-h-screen bg-[#FFFDF5] text-black neo-grid-bg overflow-x-hidden"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: 'opacity 0.4s ease 0.1s',
        }}
      >

        {/* ====== NAV ====== */}
        <nav className="fixed top-0 w-full z-50 px-4 py-4 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
            <div
              className="bg-[#FFFDF5] border-2 border-black px-4 py-1 font-mono font-black text-xl hover:bg-[#FBFF48] transition-all"
              style={{ boxShadow: '3px 3px 0 #000' }}
            >
              ROAST<span className="text-[#FF2A2A]">MY</span>LP.exe
            </div>
            <div className="hidden md:flex gap-1 bg-[#FFFDF5] border-2 border-black p-1.5 pointer-events-auto items-center" style={{ boxShadow: '3px 3px 0 #000' }}>
              <Link href="/roast" className="px-3 py-1.5 font-mono font-bold text-sm hover:bg-black hover:text-white transition-colors">/ROAST</Link>
              <Link href="#how-it-works" className="px-3 py-1.5 font-mono font-bold text-sm hover:bg-black hover:text-white transition-colors">/HOW</Link>
              {user ? (
                <>
                  <div className="flex items-center gap-1 font-mono text-sm px-2 text-gray-600 border-l-2 border-r-2 border-black/10 mx-1">
                    <User size={13} />
                    <span className="truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <button onClick={handleSignOut} className="flex items-center gap-1 px-3 py-1.5 font-mono font-bold text-sm hover:bg-black hover:text-[#FBFF48] transition-colors">
                    <LogOut size={14} /> SIGN OUT
                  </button>
                </>
              ) : (
                <Link href="/auth" className="px-3 py-1.5 font-mono font-bold text-sm hover:bg-black hover:text-white transition-colors">/SIGN IN</Link>
              )}
              <Link href="/roast" className="ml-2 px-3 py-1.5 font-mono font-bold text-sm bg-[#FBFF48] border border-black hover:bg-[#FF70A6] transition-colors">
                ROAST IT →
              </Link>
            </div>
          </div>
        </nav>


        {/* ====== HERO ====== */}
        <section className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 pb-16 relative overflow-hidden border-b-4 border-black">

          {/* Floating shapes */}
          <div
            className="absolute top-1/3 left-[8%] w-14 h-14 bg-[#3B82F6] border-4 border-black hidden lg:block"
            style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`, boxShadow: '4px 4px 0 #000', animation: 'float 3s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-1/3 right-[8%] w-20 h-20 rounded-full bg-[#FF70A6] border-4 border-black hidden lg:block"
            style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`, boxShadow: '4px 4px 0 #000', animation: 'float 4s ease-in-out infinite 1s' }}
          />
          <div
            className="absolute top-[22%] right-[14%] w-10 h-10 bg-[#33FF57] border-4 border-black rotate-12 hidden lg:block"
            style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * -15}px) rotate(12deg)`, boxShadow: '3px 3px 0 #000' }}
          />

          {/* Big background watermark */}
          <div className="absolute bottom-4 left-0 text-[18vw] font-black text-black opacity-[0.03] leading-none select-none pointer-events-none tracking-tighter">
            ROAST
          </div>

          <div className="relative z-10 text-center max-w-5xl">
            {/* Status badge */}
            <div
              className="inline-block bg-[#FFFDF5] border-2 border-black px-4 py-1.5 mb-8 reveal"
              style={{ boxShadow: '3px 3px 0 #000', transform: 'rotate(-1deg)' }}
            >
              <span className="font-mono font-black text-[#33FF57] bg-black px-2 mr-2 text-xs">●</span>
              <span className="font-mono text-sm font-bold">AI_STATUS: ONLINE · GROQ_POWERED</span>
            </div>

            {/* Main headline */}
            <h1 className="text-[13vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter mb-6 reveal">
              GET YOUR
              <br />
              <span className="text-white" style={{ WebkitTextStroke: '3px #000' }}>
                LANDING PAGE
              </span>
              <br />
              <span className="text-[#FF2A2A]">ROASTED.</span>
            </h1>

            {/* Sub */}
            <p
              className="font-mono text-base md:text-lg max-w-xl mx-auto mb-10 reveal bg-[#FBFF48] border-2 border-black p-4"
              style={{ boxShadow: '4px 4px 0 #000', transform: 'rotate(0.5deg)' }}
            >
              Find out exactly why visitors leave without converting —<br />
              <strong>get a rewritten hero section in 30 seconds.</strong>
            </p>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row justify-center gap-5 reveal">
              <Link
                href="/roast"
                className="bg-black text-white border-2 border-black px-10 py-5 text-xl font-black hover:bg-[#33FF57] hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                style={{ boxShadow: '6px 6px 0 #000' }}
              >
                🔥 ROAST MY LANDING PAGE →
              </Link>
              <a
                href="#examples"
                className="bg-[#FFFDF5] text-black border-2 border-black px-10 py-5 text-xl font-black hover:bg-[#FF70A6] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                style={{ boxShadow: '6px 6px 0 #000' }}
              >
                SEE EXAMPLES ↓
              </a>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 justify-center mt-12 reveal">
              {[
                { num: '< 30s', label: 'to get roasted' },
                { num: '100%', label: 'AI-generated' },
                { num: '₹499', label: 'full unlock' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black">{s.num}</div>
                  <div className="font-mono text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== MARQUEE ====== */}
        <div className="border-b-4 border-black bg-black py-3 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content gap-8 text-white">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="font-mono font-bold text-lg px-6 whitespace-nowrap">
                  {item} <span className="text-[#FBFF48]/40 mx-4">///</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ====== HOW IT WORKS ====== */}
        <section id="how-it-works" className="py-24 px-4 max-w-7xl mx-auto border-x-4 border-black bg-white my-12" style={{ boxShadow: '8px 8px 0 #000' }}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-4 border-black pb-4">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter reveal">
              HOW IT<span className="text-[#33FF57] [text-shadow:2px_2px_0_#000]">_WORKS</span>
            </h2>
            <div className="flex items-center gap-2 reveal">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <p className="font-mono font-bold text-sm">/// 3_STEPS_ONLY</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black reveal">
            {[
              {
                step: '01', title: 'PASTE_URL', icon: '🔗', color: '#FBFF48',
                desc: 'Drop your landing page URL + answer 2 quick questions about your target customer and desired action.',
              },
              {
                step: '02', title: 'AI_ROASTS', icon: '🔥', color: '#FF70A6',
                desc: 'Our AI scrapes your page and delivers 8-10 specific critiques across every conversion element. No fluff.',
              },
              {
                step: '03', title: 'GET_REWRITE', icon: '✍️', color: '#33FF57',
                desc: 'Unlock the full roast + a completely rewritten hero section, CTA, and 5-step quick fix checklist.',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-black last:border-r-0 hover:scale-[1.01] transition-transform group"
                style={{ backgroundColor: i % 2 === 1 ? '#f9f9f9' : 'white' }}
              >
                <div className="font-mono text-6xl font-black mb-4 text-black/10">{s.step}</div>
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3
                  className="font-mono font-black text-xl mb-3 border-b-2 border-black pb-2"
                  style={{ color: s.color !== '#FBFF48' ? s.color : '#000' }}
                >
                  {s.title}
                </h3>
                <p className="font-mono text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 reveal">
            <Link
              href="/roast"
              className="inline-block bg-black text-white font-black px-10 py-4 border-2 border-black text-lg hover:bg-[#FBFF48] hover:text-black transition-colors"
              style={{ boxShadow: '6px 6px 0 #000' }}
            >
              START FOR FREE →
            </Link>
          </div>
        </section>

        {/* ====== EXAMPLE ROASTS ====== */}
        <section id="examples" className="py-24 bg-[#F5F5F0] border-y-4 border-black px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 reveal">
              EXAMPLE<span className="text-[#FF2A2A]">_ROASTS</span>
            </h2>
            <p className="font-mono text-gray-500 mb-12 reveal">
            // Real critiques our AI found — names changed to protect the burned
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXAMPLE_ROASTS.map((roast, i) => (
                <div
                  key={i}
                  className="reveal bg-white border-4 border-black p-6 relative overflow-hidden hover:-translate-y-1 transition-all duration-300"
                  style={{ boxShadow: `6px 6px 0 ${roast.color}` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: roast.color }} />
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-gray-400 uppercase">{roast.url}</span>
                    <div
                      className="font-mono font-black px-2 py-0.5 text-black text-sm border-2 border-black"
                      style={{ background: roast.color }}
                    >
                      {roast.score}/10
                    </div>
                  </div>
                  <p className="font-display text-sm leading-relaxed mb-6 text-black">{roast.problem}</p>
                  <div className="relative">
                    <div className="text-xs font-mono text-gray-500 leading-relaxed" style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                      Fix: Rewrite headline to specifically address pain point — remove buzzwords, add specificity, numbers, or proof.
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Link
                        href="/roast"
                        className="font-mono font-black text-xs px-3 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                        style={{ boxShadow: '2px 2px 0 #000' }}
                      >
                        🔒 UNLOCK FULL FIX →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== SOCIAL PROOF MARQUEE ====== */}
        <div className="border-b-4 border-black bg-[#FBFF48] py-3 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content-slow flex gap-8">
              {[
                '"Brutal. Honest. Exactly what we needed."',
                '"Rewrote our CTA based on the fix — conversions up 40%."',
                '"Found things we missed in 6 months of A/B testing."',
                '"Worth every rupee. Got ROI in week 1."',
                '"Brutal. Honest. Exactly what we needed."',
                '"Rewrote our CTA based on the fix — conversions up 40%."',
                '"Found things we missed in 6 months of A/B testing."',
                '"Worth every rupee. Got ROI in week 1."',
              ].map((q, i) => (
                <span key={i} className="font-display font-bold text-sm text-black px-8 whitespace-nowrap">
                  {q} <span className="text-black/20 mx-4">★★★★★</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ====== WHAT YOU GET ====== */}
        <section className="py-24 px-4 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 reveal">
            FREE VS <span className="bg-[#FBFF48] px-2 border-b-4 border-black">PAID</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Free */}
            <div className="border-4 border-black p-8 reveal bg-white" style={{ boxShadow: '6px 6px 0 #000' }}>
              <div className="inline-block bg-[#33FF57] text-black font-mono font-black text-xs px-3 py-1 mb-6 border-2 border-black">
                FREE · INSTANT
              </div>
              <h3 className="text-2xl font-black mb-6 uppercase border-b-2 border-black pb-3">What you get <span className="text-[#33FF57] [text-shadow:1px_1px_0_#000]">free</span></h3>
              <ul className="space-y-4">
                {['Overall conversion score (1–10)', 'Top 3 specific problems killing conversions', 'First line of your rewritten headline'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-mono text-sm">
                    <span className="font-black text-[#33FF57] bg-black px-1">[✓]</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Paid */}
            <div
              className="border-4 border-black p-8 reveal bg-[#FBFF48]"
              style={{ boxShadow: '6px 6px 0 #FF2A2A' }}
            >
              <div className="inline-block bg-black text-[#FBFF48] font-mono font-black text-xs px-3 py-1 mb-6 border-2 border-black">
                ₹499 · ONE-TIME
              </div>
              <h3 className="text-2xl font-black mb-6 uppercase border-b-2 border-black pb-3">What you get <span className="text-[#FF2A2A]">paid</span></h3>
              <ul className="space-y-4">
                {[
                  '8-10 critiques: headline, value prop, CTA, trust, mobile...',
                  'Full hero rewrite: headline + subheadline + benefits + CTA',
                  '5-item Quick Fix Checklist ranked by conversion impact',
                  'Email with your full roast report',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-mono text-sm">
                    <span className="font-black bg-black text-[#FBFF48] px-1">[★]</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/roast"
                className="mt-8 inline-block bg-black text-white font-black px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors"
                style={{ boxShadow: '4px 4px 0 #FF2A2A' }}
              >
                GET ROASTED NOW →
              </Link>
            </div>
          </div>
        </section>

        {/* ====== FINAL CTA ====== */}
        <section className="py-32 px-4 border-t-4 border-black bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
          <div className="absolute bottom-0 left-0 text-[18vw] font-black text-white/[0.03] leading-none select-none pointer-events-none tracking-tighter overflow-hidden">
            ROAST
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center reveal">
            <div
              className="inline-block border-2 border-white/30 px-4 py-2 mb-8 font-mono text-sm text-[#33FF57]"
              style={{ boxShadow: '3px 3px 0 #33FF57' }}
            >
              ● READY_TO_ROAST
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] mb-8">
              YOUR LANDING
              <br />PAGE IS LOSING
              <br /><span className="text-[#FF2A2A]">MONEY.</span>
            </h2>
            <p className="font-mono text-gray-400 text-lg mb-10 max-w-lg mx-auto">
              Fix it in 30 seconds. No account needed.<br />
              Free preview · Full unlock at ₹499.
            </p>
            <Link
              href="/roast"
              className="inline-block bg-[#FBFF48] text-black font-black text-2xl px-12 py-6 border-2 border-white hover:bg-white transition-colors"
              style={{ boxShadow: '8px 8px 0 #FF2A2A' }}
            >
              🔥 ROAST MY LANDING PAGE →
            </Link>
            <p className="font-mono text-xs text-gray-600 mt-6">
              Powered by Groq (llama-3.3-70b) · Results in ~15 seconds
            </p>
          </div>
        </section>

        {/* ====== FOOTER ====== */}
        <footer className="border-t-4 border-black bg-[#FBFF48] py-10 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-mono font-black text-xl text-black">
              ROAST<span className="text-[#FF2A2A]">MY</span>LP<span>.exe</span>
            </div>
            <p className="font-mono text-xs text-black/50">
              © 2026 RoastMyLP // AI_CRO_SYSTEM_v1.0
            </p>
            <Link href="/roast" className="font-mono text-xs text-black hover:underline">/roast</Link>
          </div>
        </footer>
      </main>
    </>
  )
}
