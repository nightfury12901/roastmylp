import * as cheerio from 'cheerio'

export async function scrapeUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: AbortSignal.timeout(10000),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Remove only pure noise — keep nav links as they may show trust signals
        $('script, style, noscript, svg, iframe, [aria-hidden="true"]').remove()

        const title = $('title').text().trim()
        const metaDesc = $('meta[name="description"]').attr('content') || ''
        const h1 = $('h1').map((_, el) => $(el).text().trim()).get().join(' | ')
        const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 8).join(' | ')
        const h3s = $('h3').map((_, el) => $(el).text().trim()).get().slice(0, 6).join(' | ')

        // Grab CTA buttons specifically
        const buttons = $('button, a[href]')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(t => t.length > 2 && t.length < 60)
            .slice(0, 10)
            .join(' | ')

        // Try to capture above-the-fold section content (first major section)
        const firstSection = $('section, [class*="hero"], [class*="banner"], main').first().text()
            .replace(/\s+/g, ' ').trim().slice(0, 800)

        // Get logos/brand names in trust sections (alt text of images, text in partner sections)
        const logoAltTexts = $('img[alt]')
            .map((_, el) => $(el).attr('alt') || '')
            .get()
            .filter(t => t.length > 1 && t.length < 50)
            .slice(0, 15)
            .join(', ')

        // Body text for context
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2000)

        const combined = [
            `TITLE: ${title}`,
            `META DESCRIPTION: ${metaDesc}`,
            `H1: ${h1}`,
            `H2s: ${h2s}`,
            `H3s: ${h3s}`,
            `BUTTONS/CTAs FOUND: ${buttons}`,
            `HERO/FIRST-SECTION TEXT: ${firstSection}`,
            logoAltTexts ? `LOGOS/IMAGES FOUND (alt texts — indicates social proof): ${logoAltTexts}` : '',
            `FULL BODY TEXT: ${bodyText}`,
        ]
            .filter(Boolean)
            .join('\n\n')

        return combined
    } catch (error) {
        throw new Error(`Failed to scrape ${url}: ${(error as Error).message}`)
    }
}

