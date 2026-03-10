import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Keyword → ordered list of CSS selectors to try for that element type
const ZONE_SELECTORS: Record<string, string[]> = {
    headline: [
        'h1',
        '[class*="hero"] h1',
        '[class*="Hero"] h1',
        '[class*="heading"]',
        'header h1',
        '[class*="banner"] h1',
    ],
    cta: [
        '[class*="cta"] a',
        '[class*="cta"] button',
        'a[class*="btn"]',
        'button[class*="btn"]',
        '.btn-primary',
        'a.btn',
        '[class*="hero"] a',
        '[class*="hero"] button',
        'a[class*="primary"]',
        '[role="button"]',
    ],
    social_proof: [
        '[class*="logo-grid"]',
        '[class*="customer"]',
        '[class*="partner"]',
        '[class*="trust"]',
        '[class*="social-proof"]',
        '[class*="testimonial"]',
        '[class*="logos"]',
        '[class*="clients"]',
    ],
    trust: [
        '[class*="badge"]',
        '[class*="security"]',
        '[class*="compliance"]',
        '[class*="certification"]',
        '[class*="guarantee"]',
        '[class*="trust-badge"]',
    ],
    value_prop: [
        '[class*="value-prop"]',
        '[class*="benefit"]',
        'h2',
        '[class*="feature"]:first-of-type',
        '[class*="hero"] p',
        'section:first-of-type p',
    ],
    pricing: [
        '[class*="pricing"]',
        '[class*="price"]',
        '[id*="pricing"]',
        '[class*="plan"]',
    ],
    form: [
        'form',
        'input[type="email"]',
        '[class*="signup-form"]',
        '[class*="form-group"]',
    ],
    navigation: [
        'nav',
        'header',
        '[role="navigation"]',
    ],
    urgency: [
        '[class*="countdown"]',
        '[class*="timer"]',
        '[class*="offer"]',
        '[class*="promo"]',
        '[class*="banner"]',
    ],
    mobile: null as unknown as string[], // no specific element — fallback to hero area
    visual_hierarchy: [
        'main > section:first-of-type',
        '[class*="hero"]',
        'header + section',
    ],
}

// Keyword → zone key
const KEYWORD_TO_ZONE: { keywords: string[]; zone: string }[] = [
    { keywords: ['headline', 'title', 'h1', 'heading', 'vague', 'generic', 'direct', 'unclear headline'], zone: 'headline' },
    { keywords: ['cta', 'call to action', 'button', 'start now', 'request an invite', 'sign up now', 'get started', 'weak cta', 'urgency in cta'], zone: 'cta' },
    { keywords: ['social proof', 'testimonial', 'logo', 'review', 'customer', 'client', 'partner', 'prominently display'], zone: 'social_proof' },
    { keywords: ['trust signal', 'badge', 'security', 'compliance', 'certification', 'uptime', 'credibility', 'guarantee'], zone: 'trust' },
    { keywords: ['value prop', 'value proposition', 'benefit', 'scattered', 'clearly state', 'offer clarity', 'what you do'], zone: 'value_prop' },
    { keywords: ['pricing', 'price', 'cost', 'plan', 'tier'], zone: 'pricing' },
    { keywords: ['form', 'field', 'sign up', 'signup', 'register', 'friction'], zone: 'form' },
    { keywords: ['navigation', 'nav', 'menu', 'above-the-fold content', 'above the fold'], zone: 'navigation' },
    { keywords: ['urgency', 'fomo', 'scarcity', 'limited', 'procrastinat', 'sense of urgency'], zone: 'urgency' },
    { keywords: ['mobile', 'responsive', 'phone', 'viewport', 'tap', 'small screen'], zone: 'mobile' },
    { keywords: ['visual hierarchy', 'layout', 'design', 'overwhelming', 'cluttered', 'colour', 'color', 'typography'], zone: 'visual_hierarchy' },
]

function classifyProblem(problemText: string): string {
    const lower = problemText.toLowerCase()
    for (const entry of KEYWORD_TO_ZONE) {
        if (entry.keywords.some((kw) => lower.includes(kw))) {
            return entry.zone
        }
    }
    return 'headline' // fallback
}

interface BoundingBox {
    top_pct: number
    left_pct: number
    width_pct: number
    height_pct: number
    found: boolean
    selector_used: string
}

const VIEWPORT_W = 1280
const VIEWPORT_H = 900

// Simple in-memory cache
const annotationCache = new Map<string, { boxes: BoundingBox[]; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { url, problems } = body as { url: string; problems: string[] }

        if (!url || !Array.isArray(problems)) {
            return NextResponse.json({ error: 'url and problems[] required' }, { status: 400 })
        }

        let parsedUrl: URL
        try {
            parsedUrl = new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        // Cache key = url + problems joined
        const cacheKey = parsedUrl.href + '|' + problems.join('|')
        const cached = annotationCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json({ boxes: cached.boxes })
        }

        // Classify each problem into a zone
        const zones = problems.slice(0, 3).map(classifyProblem)

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        })

        try {
            const page = await browser.newPage()
            await page.setViewport({ width: VIEWPORT_W, height: VIEWPORT_H, deviceScaleFactor: 1 })
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )

            // Block heavy resources to speed up load
            await page.setRequestInterception(true)
            page.on('request', (req) => {
                const type = req.resourceType()
                if (type === 'media' || type === 'font') req.abort()
                else req.continue()
            })

            await page.goto(parsedUrl.href, { waitUntil: 'domcontentloaded', timeout: 15000 })
            await new Promise((r) => setTimeout(r, 300))

            // Find bounding boxes — sequential so we can deduplicate used selectors
            const usedSelectors = new Set<string>()
            const boxes: BoundingBox[] = []

            for (const zone of zones) {
                const selectors = ZONE_SELECTORS[zone]

                // Mobile — no specific element, use full-width hero fallback
                if (!selectors) {
                    boxes.push({ top_pct: 10, left_pct: 2, width_pct: 96, height_pct: 35, found: false, selector_used: 'fallback' })
                    continue
                }

                let found = false
                for (const selector of selectors) {
                    if (usedSelectors.has(selector)) continue   // already used by a prior problem

                    const rect = await page.evaluate((sel: string) => {
                        const el = document.querySelector(sel) as HTMLElement | null
                        if (!el) return null
                        const r = el.getBoundingClientRect()
                        // Skip elements that are too small, or outside the initial viewport
                        if (r.width < 20 || r.height < 8) return null
                        if (r.top < 0 || r.top > window.innerHeight - 20) return null
                        return {
                            top: (r.top / window.innerHeight) * 100,
                            left: (r.left / window.innerWidth) * 100,
                            width: (r.width / window.innerWidth) * 100,
                            height: (r.height / window.innerHeight) * 100,
                        }
                    }, selector)

                    if (rect) {
                        const top_pct = Math.max(0, Math.min(92, rect.top - 0.5))
                        const left_pct = Math.max(0, Math.min(90, rect.left - 0.5))
                        const width_pct = Math.min(99 - left_pct, rect.width + 1)
                        const height_pct = Math.min(99 - top_pct, rect.height + 1)
                        usedSelectors.add(selector)
                        boxes.push({ top_pct, left_pct, width_pct, height_pct, found: true, selector_used: selector })
                        found = true
                        break
                    }
                }

                if (!found) {
                    const FALLBACKS: Record<string, Omit<BoundingBox, 'found' | 'selector_used'>> = {
                        headline: { top_pct: 15, left_pct: 3, width_pct: 70, height_pct: 18 },
                        cta: { top_pct: 45, left_pct: 3, width_pct: 25, height_pct: 8 },
                        social_proof: { top_pct: 58, left_pct: 3, width_pct: 94, height_pct: 12 },
                        trust: { top_pct: 58, left_pct: 3, width_pct: 94, height_pct: 12 },
                        value_prop: { top_pct: 28, left_pct: 3, width_pct: 94, height_pct: 20 },
                        pricing: { top_pct: 50, left_pct: 3, width_pct: 94, height_pct: 25 },
                        form: { top_pct: 40, left_pct: 3, width_pct: 60, height_pct: 20 },
                        navigation: { top_pct: 1, left_pct: 3, width_pct: 94, height_pct: 8 },
                        urgency: { top_pct: 35, left_pct: 3, width_pct: 94, height_pct: 12 },
                        visual_hierarchy: { top_pct: 10, left_pct: 3, width_pct: 94, height_pct: 40 },
                    }
                    const fb = FALLBACKS[zone] ?? { top_pct: 10, left_pct: 3, width_pct: 94, height_pct: 20 }
                    boxes.push({ ...fb, found: false, selector_used: 'fallback' })
                }
            }


            annotationCache.set(cacheKey, { boxes, timestamp: Date.now() })
            return NextResponse.json({ boxes, zones })
        } finally {
            await browser.close()
        }
    } catch (error) {
        console.error('Annotate error:', error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
