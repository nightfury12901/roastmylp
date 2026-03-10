'use client'

import { useState, useEffect } from 'react'

const MESSAGES = [
    '⚡ Scraping your landing page...',
    '🔍 Analyzing conversion elements...',
    '🧠 Consulting AI roasting expert...',
    '🔥 Crafting brutal but fair critiques...',
    '✍️ Writing your rewrite...',
    '📋 Compiling quick fix checklist...',
    '🚀 Almost done — this will sting a little...',
]

export default function LoadingAnimation() {
    const [msgIndex, setMsgIndex] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMsgIndex((i) => (i + 1) % MESSAGES.length)
        }, 2000)

        const progressInterval = setInterval(() => {
            setProgress((p) => {
                if (p >= 90) return p
                return p + Math.random() * 8
            })
        }, 800)

        return () => {
            clearInterval(msgInterval)
            clearInterval(progressInterval)
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4"
            style={{
                backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}
        >
            {/* Terminal window */}
            <div className="w-full max-w-lg border-4 border-white" style={{ boxShadow: '8px 8px 0 #FBFF48' }}>
                {/* Terminal bar */}
                <div className="bg-[#1a1a1a] border-b-2 border-white px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-black" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black" />
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-black" />
                    <span className="font-mono text-xs text-gray-400 ml-2">roastmylp — bash</span>
                </div>

                {/* Terminal body */}
                <div className="bg-black p-6 min-h-48">
                    <div className="font-mono text-sm space-y-2">
                        <div className="text-[#33FF57]">$ roast-engine --start</div>
                        <div className="text-gray-400">Initializing CRO analysis...</div>

                        {MESSAGES.slice(0, msgIndex + 1).map((msg, i) => (
                            <div
                                key={i}
                                className="text-gray-300"
                                style={{ opacity: i === msgIndex ? 1 : 0.4 }}
                            >
                                {i < msgIndex ? '✓ ' : '→ '}{msg}
                            </div>
                        ))}

                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-[#FBFF48]">$</span>
                            <span className="inline-block w-2 h-4 bg-[#FBFF48] animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-[#1a1a1a] border-t-2 border-white p-4">
                    <div className="flex justify-between font-mono text-xs text-gray-400 mb-2">
                        <span>PROGRESS</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-[#222] border border-white/20">
                        <div
                            className="h-full transition-all duration-800"
                            style={{ width: `${progress}%`, backgroundColor: '#FBFF48' }}
                        />
                    </div>
                </div>
            </div>

            <p className="font-mono text-gray-500 text-sm mt-8 text-center">
                Takes ~15 seconds · No account needed
            </p>
        </div>
    )
}
