'use client'

import { useEffect, useState } from 'react'

const BOOT_LINES = [
    { text: 'INITIALISING_ROAST_ENGINE...', delay: 0, color: '#33FF57' },
    { text: 'LOADING_AI_MODEL: llama-3.3-70b', delay: 300, color: '#fff' },
    { text: 'CONNECTING_TO_GROQ_API...........OK', delay: 600, color: '#33FF57' },
    { text: 'SCRAPER_MODULE.....................READY', delay: 900, color: '#fff' },
    { text: 'BRUTALITY_LEVEL: MAXIMUM', delay: 1200, color: '#FF2A2A' },
    { text: 'MERCY_MODULE.......................DISABLED', delay: 1400, color: '#FF2A2A' },
    { text: 'SYSTEM_READY ■', delay: 1700, color: '#FBFF48' },
]

export default function PageLoader({ onComplete }: { onComplete: () => void }) {
    const [visibleLines, setVisibleLines] = useState<number[]>([])
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState<'boot' | 'reveal'>('boot')
    const [slideUp, setSlideUp] = useState(false)

    useEffect(() => {
        // Show boot lines one by one
        BOOT_LINES.forEach((line, i) => {
            setTimeout(() => {
                setVisibleLines((prev) => [...prev, i])
            }, line.delay)
        })

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval)
                    return 100
                }
                return prev + 2
            })
        }, 40)

        // Start slide-out after boot completes
        const revealTimer = setTimeout(() => {
            setPhase('reveal')
            setTimeout(() => {
                setSlideUp(true)
                setTimeout(onComplete, 700)
            }, 50)
        }, 2300)

        return () => {
            clearInterval(progressInterval)
            clearTimeout(revealTimer)
        }
    }, [onComplete])

    return (
        <div
            className="fixed inset-0 z-[99999] overflow-hidden"
            style={{
                transition: slideUp ? 'transform 0.7s cubic-bezier(0.77, 0, 0.175, 1)' : 'none',
                transform: slideUp ? 'translateY(-100%)' : 'translateY(0)',
            }}
        >
            {/* Background split — left black, right yellow */}
            <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-black" />
                <div className="w-1/2 bg-[#FBFF48]" />
            </div>

            {/* Center card */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div
                    className="w-full max-w-xl bg-black border-4 border-[#FBFF48] p-8 relative"
                    style={{ boxShadow: '8px 8px 0 #FBFF48' }}
                >
                    {/* Top bar */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#FBFF48]/20">
                        <div className="w-3 h-3 rounded-full bg-[#FF2A2A] border border-red-700" />
                        <div className="w-3 h-3 rounded-full bg-[#FBFF48] border border-yellow-600" />
                        <div className="w-3 h-3 rounded-full bg-[#33FF57] border border-green-700" />
                        <span className="font-mono text-xs text-gray-500 ml-2">ROASTMYLP.exe — BOOT_SEQUENCE</span>
                    </div>

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="font-mono font-black text-5xl text-white tracking-tighter">
                            ROAST<span className="text-[#FBFF48]">MY</span>LP
                            <span className="text-[#33FF57] blink">_</span>
                        </div>
                        <div className="font-mono text-xs text-gray-500 mt-1">// AI LANDING PAGE ROAST ENGINE v1.0</div>
                    </div>

                    {/* Boot lines */}
                    <div className="space-y-1.5 mb-6 min-h-[140px]">
                        {BOOT_LINES.map((line, i) => (
                            <div
                                key={i}
                                className="font-mono text-xs transition-all duration-300"
                                style={{
                                    opacity: visibleLines.includes(i) ? 1 : 0,
                                    transform: visibleLines.includes(i) ? 'translateX(0)' : 'translateX(-8px)',
                                    color: line.color,
                                }}
                            >
                                <span className="text-gray-600 mr-2 select-none">{'>'}</span>
                                {line.text}
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="border border-[#FBFF48]/30 p-[2px]">
                        <div
                            className="h-1.5 bg-[#FBFF48] transition-all duration-75"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="font-mono text-[10px] text-gray-600">LOADING BRUTALITY MODULE</span>
                        <span className="font-mono text-[10px] text-[#FBFF48]">{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-6 left-6 font-mono text-[#FBFF48]/20 text-xs select-none hidden lg:block">
                {`> SYS_BOOT @ ${new Date().toLocaleTimeString()}`}
            </div>
            <div className="absolute bottom-6 right-6 font-mono text-black/20 text-xs select-none hidden lg:block">
                POWERED_BY_GROQ ▲
            </div>

            {/* Scanline effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                }}
            />
        </div>
    )
}
