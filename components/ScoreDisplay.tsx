'use client'

import { useEffect, useRef } from 'react'

interface ScoreDisplayProps {
    score: number
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
    const circleRef = useRef<SVGCircleElement>(null)

    const getColor = (s: number) => {
        if (s <= 3) return '#FF2A2A'
        if (s <= 5) return '#FF9F1C'
        if (s <= 7) return '#FBFF48'
        return '#33FF57'
    }

    const getLabel = (s: number) => {
        if (s <= 3) return 'CRITICAL'
        if (s <= 5) return 'POOR'
        if (s <= 7) return 'AVERAGE'
        return 'DECENT'
    }

    const color = getColor(score)
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (score / 10) * circumference

    useEffect(() => {
        if (circleRef.current) {
            circleRef.current.style.strokeDashoffset = String(circumference)
            setTimeout(() => {
                if (circleRef.current) {
                    circleRef.current.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.25,1,0.5,1)'
                    circleRef.current.style.strokeDashoffset = String(dashOffset)
                }
            }, 100)
        }
    }, [score, dashOffset, circumference])

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <svg width="140" height="140" className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="#333"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    {/* Score arc */}
                    <circle
                        ref={circleRef}
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        style={{
                            filter: `drop-shadow(0 0 10px ${color})`,
                        }}
                    />
                </svg>
                {/* Score number in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-4xl font-black"
                        style={{ color, fontFamily: 'JetBrains Mono, monospace', textShadow: `0 0 20px ${color}` }}
                    >
                        {score}
                    </span>
                    <span className="text-xs font-mono text-gray-400">/10</span>
                </div>
            </div>
            {/* Label badge */}
            <div
                className="px-4 py-1 border-2 border-black font-mono font-black text-sm"
                style={{ backgroundColor: color, color: '#000', boxShadow: '3px 3px 0 #000' }}
            >
                {getLabel(score)} SCORE
            </div>
        </div>
    )
}
