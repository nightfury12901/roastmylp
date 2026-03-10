'use client'

import { useState, useEffect } from 'react'

const ANNOTATION_COLORS = ['#FF2A2A', '#FF9F1C', '#A855F7']

// Keyword-matched industry statistics
const STAT_MAP: { keywords: string[]; stat: string; impact: string }[] = [
    {
        keywords: ['headline', 'title', 'h1', 'heading', 'vague', 'generic', 'unclear', 'direct'],
        stat: 'Visitors decide in 3–8 s',
        impact: '~73% leave if headline is unclear',
    },
    {
        keywords: ['cta', 'call to action', 'button', 'start now', 'invite', 'sign up now', 'get started', 'weak cta'],
        stat: 'CTA copy affects 30–90% of clicks',
        impact: 'Weak CTA = up to 60% fewer conversions',
    },
    {
        keywords: ['trust', 'social proof', 'testimonial', 'review', 'logo', 'badge', 'credibility', 'security', 'uptime'],
        stat: '92% check social proof before buying',
        impact: 'No trust signals = 48% lower conversion',
    },
    {
        keywords: ['mobile', 'responsive', 'phone', 'viewport', 'tap'],
        stat: '60%+ traffic is mobile',
        impact: 'Poor mobile UX = 57% fewer conversions',
    },
    {
        keywords: ['speed', 'load', 'slow', 'performance'],
        stat: '53% abandon > 3s load time',
        impact: '100ms delay = ~7% conversion drop',
    },
    {
        keywords: ['value prop', 'scattered', 'benefit', 'offer clarity', 'clearly state', 'what you do', 'differenti'],
        stat: 'Visitors need the "why" in 5 s',
        impact: 'Unclear value prop = 38% more bounces',
    },
    {
        keywords: ['price', 'pricing', 'cost', 'plan'],
        stat: 'Price anxiety is #1 objection',
        impact: 'Hidden pricing = 56% drop in leads',
    },
    {
        keywords: ['form', 'field', 'sign up', 'signup', 'friction'],
        stat: 'Every extra form field = −11% conversions',
        impact: 'Fewer fields → +50% signups avg.',
    },
    {
        keywords: ['urgency', 'fomo', 'scarcity', 'limited', 'procrastinat'],
        stat: 'FOMO increases conversions 14–30%',
        impact: 'No urgency = 22% lower sign-up rate',
    },
    {
        keywords: ['visual hierarchy', 'layout', 'design', 'overwhelming', 'cluttered', 'typography'],
        stat: 'Visuals processed 60,000× faster than text',
        impact: 'Poor layout = 40% less time on site',
    },
    {
        keywords: ['above-the-fold', 'above the fold', 'navigation', 'nav', 'cluttered'],
        stat: 'You have ~8 s to hook a visitor',
        impact: 'Cluttered ATF = 60% immediate bounce',
    },
    {
        keywords: ['copy', 'text', 'message', 'content', 'clarity', 'confus'],
        stat: 'Average reading level: 8th grade',
        impact: 'Complex copy = 45% higher exit rate',
    },
]

function inferStat(problemText: string): { stat: string; impact: string } {
    const lower = problemText.toLowerCase()
    for (const entry of STAT_MAP) {
        if (entry.keywords.some((kw) => lower.includes(kw))) {
            return { stat: entry.stat, impact: entry.impact }
        }
    }
    return { stat: 'Visitors convert in avg. 1.7 visits', impact: 'Each friction point = −15–25% conversions' }
}

function truncate(str: string, len: number) {
    return str.length > len ? str.slice(0, len) + '…' : str
}

interface AnnotationBox {
    top_pct: number
    left_pct: number
    width_pct: number
    height_pct: number
    found: boolean
    selector_used: string
}

interface Props {
    siteUrl: string
    problems: string[]
}

export default function AnnotatedScreenshot({ siteUrl, problems }: Props) {
    const [imgLoaded, setImgLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [activeZone, setActiveZone] = useState<number | null>(null)
    const [loadingTooLong, setLoadingTooLong] = useState(false)
    const [annotationBoxes, setAnnotationBoxes] = useState<AnnotationBox[] | null>(null)

    const screenshotSrc = `/api/screenshot?url=${encodeURIComponent(siteUrl)}`

    // Fetch precise annotation positions from Puppeteer-powered API
    useEffect(() => {
        setImgLoaded(false)
        setImgError(false)
        setLoadingTooLong(false)
        setAnnotationBoxes(null)

        fetch('/api/annotate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: siteUrl, problems: problems.slice(0, 3) }),
        })
            .then((r) => r.json())
            .then((data: { boxes: AnnotationBox[] }) => {
                if (data.boxes) setAnnotationBoxes(data.boxes)
            })
            .catch(() => {
                // If annotation API fails, fall back to generic positions
                setAnnotationBoxes([
                    { top_pct: 5, left_pct: 3, width_pct: 94, height_pct: 18, found: false, selector_used: 'fallback' },
                    { top_pct: 30, left_pct: 3, width_pct: 94, height_pct: 18, found: false, selector_used: 'fallback' },
                    { top_pct: 58, left_pct: 3, width_pct: 94, height_pct: 18, found: false, selector_used: 'fallback' },
                ])
            })
    }, [siteUrl, problems])

    // Show "taking a while" hint after 8s
    useEffect(() => {
        if (imgLoaded || imgError) return
        const t = setTimeout(() => setLoadingTooLong(true), 8000)
        return () => clearTimeout(t)
    }, [imgLoaded, imgError])

    const annotations = problems.slice(0, 3).map((problem, i) => {
        const { stat, impact } = inferStat(problem)
        const box = annotationBoxes?.[i]
        return {
            id: i + 1,
            problem,
            stat,
            impact,
            color: ANNOTATION_COLORS[i],
            box,
        }
    })

    const bothReady = imgLoaded && annotationBoxes !== null

    return (
        <div
            className="border-2 border-white/10 overflow-hidden"
            style={{ boxShadow: '6px 6px 0 rgba(255,42,42,0.25)' }}
        >
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#FF2A2A] animate-pulse" />
                    <span className="font-mono font-black text-xs text-[#FF2A2A] uppercase tracking-widest">
                        VISUAL_AUDIT — ANNOTATED SCREENSHOT
                    </span>
                </div>
                <span className="font-mono text-[10px] text-gray-600 hidden sm:block">
                    // Hover markers for details
                </span>
            </div>

            {/* Viewport */}
            <div className="relative bg-[#111] overflow-hidden" style={{ aspectRatio: '1280/900' }}>

                {/* Loading state */}
                {!imgLoaded && !imgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                        <div className="w-12 h-12 border-4 border-[#FBFF48] border-t-transparent rounded-full animate-spin" />
                        <div className="text-center">
                            <p className="font-mono text-xs text-gray-500">Rendering screenshot with headless browser…</p>
                            {loadingTooLong && (
                                <p className="font-mono text-[10px] text-gray-600 mt-1">
                                    Locating issue elements on the page…
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Screenshot */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={screenshotSrc}
                    alt={`Screenshot of ${siteUrl}`}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => { setImgLoaded(false); setImgError(true) }}
                />

                {/* Error */}
                {imgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                        <div className="text-4xl">🌐</div>
                        <p className="font-mono text-xs text-gray-500 text-center px-4">
                            Screenshot unavailable.<br />See issues below.
                        </p>
                    </div>
                )}

                {/* Dim overlay */}
                {bothReady && (
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
                )}

                {/* Scanline effect */}
                {bothReady && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
                        }}
                    />
                )}

                {/* Precise annotation boxes */}
                {(bothReady || imgError) && annotationBoxes !== null && annotations.map((ann) => {
                    const box = ann.box
                    if (!box) return null

                    const style = {
                        position: 'absolute' as const,
                        top: `${box.top_pct}%`,
                        left: `${box.left_pct}%`,
                        width: `${box.width_pct}%`,
                        height: `${box.height_pct}%`,
                    }

                    const isActive = activeZone === ann.id

                    return (
                        <div key={ann.id}>
                            {/* Highlight box — tightly wrapping the real element */}
                            <div
                                style={{
                                    ...style,
                                    border: `2px solid ${ann.color}`,
                                    boxShadow: isActive
                                        ? `0 0 0 2px ${ann.color}88, inset 0 0 20px ${ann.color}33`
                                        : `0 0 0 1px ${ann.color}44, inset 0 0 8px ${ann.color}22`,
                                    background: isActive ? `${ann.color}20` : `${ann.color}0a`,
                                    transition: 'box-shadow 0.15s, background 0.15s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={() => setActiveZone(ann.id)}
                                onMouseLeave={() => setActiveZone(null)}
                            />

                            {/* Number badge — top-left corner of the box */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${box.top_pct}%`,
                                    left: `${box.left_pct}%`,
                                    transform: 'translate(-4px, -4px)',
                                    background: ann.color,
                                    color: '#fff',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'monospace',
                                    fontWeight: 900,
                                    fontSize: '11px',
                                    border: '2px solid #fff',
                                    boxShadow: '2px 2px 0 #000',
                                    zIndex: 20,
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s',
                                    ...(isActive ? { transform: 'translate(-4px, -4px) scale(1.25)' } : {}),
                                }}
                                onMouseEnter={() => setActiveZone(ann.id)}
                                onMouseLeave={() => setActiveZone(null)}
                            >
                                {ann.id}
                            </div>

                            {/* Tooltip — appears above/below the box depending on position */}
                            {isActive && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: box.top_pct > 50
                                            ? `${Math.max(2, box.top_pct - 34)}%`
                                            : `${Math.min(85, box.top_pct + box.height_pct + 1)}%`,
                                        left: ann.id === 3 ? 'auto' : `${box.left_pct}%`,
                                        right: ann.id === 3 ? '3%' : 'auto',
                                        zIndex: 30,
                                        maxWidth: '260px',
                                        padding: '12px 14px',
                                        background: '#0d0d0d',
                                        border: `2px solid ${ann.color}`,
                                        boxShadow: `4px 4px 0 ${ann.color}`,
                                    }}
                                >
                                    <div
                                        className="font-mono font-black text-[9px] uppercase tracking-widest mb-1.5"
                                        style={{ color: ann.color }}
                                    >
                                        ISSUE {ann.id}
                                        {!box.found && (
                                            <span className="ml-2 text-gray-600 normal-case tracking-normal">approx. location</span>
                                        )}
                                    </div>
                                    <p className="font-display text-xs text-gray-300 leading-snug mb-2.5">
                                        {truncate(ann.problem, 100)}
                                    </p>
                                    <div className="border-t border-white/10 pt-2 space-y-1">
                                        <div className="flex items-start gap-1.5">
                                            <span className="font-mono text-[8px] text-gray-500 uppercase mt-0.5 shrink-0">STAT</span>
                                            <span className="font-mono text-[9px] text-gray-300">{ann.stat}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="font-mono text-[9px] font-black px-1 shrink-0"
                                                style={{ background: ann.color, color: '#000' }}
                                            >
                                                IMPACT
                                            </span>
                                            <span
                                                className="font-mono text-[9px] font-black"
                                                style={{ color: ann.color }}
                                            >
                                                {ann.impact}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend strip */}
            <div className="border-t border-white/10 px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {annotations.map((ann) => (
                    <div
                        key={ann.id}
                        className="flex items-start gap-2.5 cursor-pointer group"
                        onMouseEnter={() => setActiveZone(ann.id)}
                        onMouseLeave={() => setActiveZone(null)}
                    >
                        <div
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center font-mono font-black text-[10px] mt-0.5"
                            style={{
                                background: ann.color,
                                color: '#fff',
                                border: '1.5px solid rgba(255,255,255,0.15)',
                                boxShadow: `2px 2px 0 ${ann.color}55`,
                            }}
                        >
                            {ann.id}
                        </div>
                        <div className="min-w-0">
                            <div
                                className="font-mono text-[10px] font-black uppercase mb-0.5"
                                style={{ color: ann.color }}
                            >
                                {ann.impact}
                            </div>
                            <p className="font-mono text-[10px] text-gray-500 leading-snug group-hover:text-gray-300 transition-colors">
                                {truncate(ann.problem, 70)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
