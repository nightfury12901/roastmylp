import Groq from 'groq-sdk'
import { RoastResult } from './supabase'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateRoast(
  scrapedText: string,
  targetCustomer: string,
  desiredAction: string
): Promise<RoastResult> {
  const systemPrompt = `You are a senior conversion rate optimization (CRO) expert who gives brutally honest, evidence-based audits of landing pages.

CRITICAL RULES YOU MUST FOLLOW:
1. You ONLY flag issues that are demonstrably present based on the actual page content provided. If the content shows social proof (logos, testimonials, trust badges), you DO NOT say social proof is missing.
2. Be SPECIFIC — quote actual text from the page when criticising it. Never give generic advice.
3. If a page element is genuinely good, acknowledge it briefly and focus your critique on what is actually weak.
4. Your score (1-10) must MATCH your findings. A page with only minor issues should score 7+. If you find serious problems, score 4 or below.
5. NEVER invent problems that are not supported by the scraped content.
6. IGNORE navigation links when evaluating CTAs. A list of links like 'Products', 'Solutions', 'Pricing', 'Sign In' at the top of the page is a standard website navigation bar, NOT a cluttered cluster of competing CTAs. Do not penalize pages for having a normal navigation menu.
7. Respond ONLY with valid JSON. No markdown, no explanation outside JSON.`

  const userPrompt = `Analyse the following ACTUAL scraped content from a real landing page. Base every single critique on what you see in this content — do not assume things are missing unless the content confirms they are absent.

NOTE: The scraped text often lists header/navigation links right at the top (e.g., "Home Products Pricing Sign In Contact"). DO NOT critique these as "multiple competing CTAs" or "clutter". Focus your CTA critique on the actual hero section's primary button and general page layout.

--- SCRAPED PAGE CONTENT ---
${scrapedText.slice(0, 3000)}
---

Target customer: ${targetCustomer}
Desired action: ${desiredAction}

Based ONLY on the content above, return this JSON structure:
{
  "score": <integer 1-10 — must be justified by your findings, do NOT default to low scores for well-known brands>,
  "top_3_problems": [<most impactful specific problem>, <second problem>, <third problem>],
  "full_roast": [
    { "area": <area name>, "problem": <SPECIFIC problem quoting actual page text>, "fix": <CONCRETE actionable fix with example copy> }
  ],
  "rewrite": {
    "headline": <improved headline based on the page's actual product/service>,
    "subheadline": <improved subheadline>,
    "benefits": [<benefit 1>, <benefit 2>, <benefit 3>],
    "cta_text": <stronger CTA text>
  },
  "quick_fixes": [<fix 1>, <fix 2>, <fix 3>, <fix 4>, <fix 5>]
}

The full_roast array must have 8-10 items. Cover areas that have REAL issues. If an area is genuinely well done, make the "problem" very minor or skip it for a more broken area. Areas to consider: Headline Clarity, Value Proposition, Social Proof, CTA Strength, Above-the-fold Content, Trust Signals, Offer Clarity, Mobile Experience, Visual Hierarchy, Urgency/FOMO — but ONLY flag what is actually wrong.`

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('No content from Groq')

  const parsed = JSON.parse(content) as RoastResult
  return parsed
}

