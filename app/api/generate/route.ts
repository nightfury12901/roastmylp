import { NextResponse } from 'next/server'
import { scrapeUrl } from '@/lib/scraper'
import { generateRoast } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { url, targetCustomer, desiredAction } = await request.json()

        if (!url || !targetCustomer || !desiredAction) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate URL
        let parsedUrl: URL
        try {
            parsedUrl = new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        // Scrape the page
        let scrapedContent = ''
        try {
            scrapedContent = await scrapeUrl(parsedUrl.href)
        } catch {
            scrapedContent = `URL: ${url}\nNote: Could not scrape this page automatically. Analysis will be limited.`
        }

        // Call Groq AI
        const aiResult = await generateRoast(scrapedContent, targetCustomer, desiredAction)

        // Save to Supabase
        const { data, error } = await supabaseAdmin
            .from('roasts')
            .insert({
                url,
                target_customer: targetCustomer,
                desired_action: desiredAction,
                scraped_content: scrapedContent,
                ai_result: aiResult,
                score: aiResult.score,
                is_paid: false,
            })
            .select('id')
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: 'Failed to save roast' }, { status: 500 })
        }

        return NextResponse.json({
            id: data.id,
            score: aiResult.score,
            top_3_problems: aiResult.top_3_problems,
            first_headline: aiResult.rewrite.headline,
        })
    } catch (error) {
        console.error('Generate error:', error)
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to generate roast' },
            { status: 500 }
        )
    }
}
