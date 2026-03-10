import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Cache screenshots in memory for the lifetime of the server process
// Key: URL, Value: { buffer, timestamp }
const cache = new Map<string, { buffer: Buffer; timestamp: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
        parsedUrl = new URL(url)
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Invalid protocol')
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Check cache
    const cached = cache.get(parsedUrl.href)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return new NextResponse(new Uint8Array(cached.buffer), {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
                'X-Cache': 'HIT',
            },
        })
    }

    let browser = null
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1280,900',
            ],
        })

        const page = await browser.newPage()

        // Set a realistic viewport and user agent
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 })
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // Block ads, analytics, fonts to speed up render
        await page.setRequestInterception(true)
        page.on('request', (req) => {
            const type = req.resourceType()
            const urlStr = req.url()
            if (
                type === 'media' ||
                urlStr.includes('google-analytics') ||
                urlStr.includes('doubleclick') ||
                urlStr.includes('hotjar') ||
                urlStr.includes('intercom') ||
                urlStr.includes('crisp')
            ) {
                req.abort()
            } else {
                req.continue()
            }
        })

        // Navigate with a timeout
        await page.goto(parsedUrl.href, {
            waitUntil: 'networkidle2',
            timeout: 20000,
        })

        // Wait a beat for lazy images / animations to settle
        await new Promise((r) => setTimeout(r, 1500))

        // Dismiss cookie banners / overlays with a JS injection
        await page.evaluate(() => {
            const selectors = [
                '[id*="cookie"]', '[class*="cookie"]',
                '[id*="consent"]', '[class*="consent"]',
                '[id*="gdpr"]', '[class*="gdpr"]',
                '[id*="banner"]', '[class*="banner"]',
                '[id*="overlay"]', '[class*="modal"]',
            ]
            selectors.forEach((sel) => {
                document.querySelectorAll(sel).forEach((el) => {
                    (el as HTMLElement).style.display = 'none'
                })
            })
        })

        // Take the screenshot
        const buffer = await page.screenshot({
            type: 'jpeg',
            quality: 85,
            clip: { x: 0, y: 0, width: 1280, height: 900 },
        })

        // Ensure buffer is the right type
        const imgBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)

        // Cache it
        cache.set(parsedUrl.href, { buffer: imgBuffer, timestamp: Date.now() })

        return new NextResponse(new Uint8Array(imgBuffer), {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
                'X-Cache': 'MISS',
            },
        })
    } catch (error) {
        console.error('Screenshot error:', error)
        return NextResponse.json(
            { error: 'Failed to capture screenshot: ' + (error as Error).message },
            { status: 500 }
        )
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
