import type { Metadata } from 'next'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import CustomCursor from '@/components/CustomCursor'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-mono',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://roastmylpage.vercel.app'),
  title: 'RoastMyLP — AI Landing Page Roast & Rewrite Tool',
  description:
    'Get your landing page brutally roasted by AI in 30 seconds. Find out exactly why visitors leave without converting — and get a rewritten hero section instantly.',
  keywords: ['landing page audit', 'conversion rate optimization', 'CRO', 'landing page roast', 'AI copywriting', 'website review'],
  openGraph: {
    title: 'RoastMyLP — Brutal AI Landing Page Roasts',
    description: 'Find out exactly why visitors leave without converting — and get a rewritten hero section instantly.',
    url: 'https://roastmylpage.vercel.app',
    siteName: 'RoastMyLP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoastMyLP — Brutal AI Landing Page Roasts',
    description: 'Find out exactly why visitors leave without converting — and get a rewritten hero section instantly.',
  },
  verification: {
    google: 'hSSiY8gP1kbW9s84_Jic5Vef_i4brETAn8RyeQwNTzQ',
  },
  other: {
    'google-adsense-account': 'ca-pub-9844229485914412',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
        style={{ cursor: 'none' }}
      >
        <CustomCursor />

        {children}

        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-14RZRGXRY7" />

        {/* Google AdSense */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9844229485914412"
        />
      </body>
    </html>
  )
}
