import type { Metadata } from 'next'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
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
  title: 'RoastMyLP — AI Landing Page Roast & Rewrite Tool',
  description:
    'Get your landing page brutally roasted by AI in 30 seconds. Find out exactly why visitors leave without converting — and get a rewritten hero section instantly.',
  keywords: ['landing page audit', 'conversion rate optimization', 'CRO', 'landing page roast', 'AI copywriting'],
  openGraph: {
    title: 'RoastMyLP — AI Landing Page Roast & Rewrite',
    description: 'Get your landing page brutally roasted by AI in 30 seconds.',
    type: 'website',
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
        {/* Custom cursor */}
        <div id="cursor" className="pointer-events-none fixed z-[9999] w-6 h-6 bg-white rounded-full border-2 border-black hidden lg:block"
          style={{ mixBlendMode: 'difference', transition: 'width 0.2s, height 0.2s, background-color 0.2s, transform 0.1s' }} />

        {/* Scroll progress bar */}
        <div id="progressBar" className="fixed top-0 left-0 h-[3px] z-[60] border-b border-black"
          style={{ width: '0%', background: '#FBFF48', boxShadow: '0 0 8px #FBFF48' }} />

        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var cursor = document.getElementById('cursor');
                var progressBar = document.getElementById('progressBar');

                if (cursor) {
                  document.addEventListener('mousemove', function(e) {
                    cursor.style.left = e.clientX + 'px';
                    cursor.style.top = e.clientY + 'px';
                    cursor.style.transform = 'translate(-50%, -50%)';
                  });

                  document.addEventListener('mouseover', function(e) {
                    var el = e.target;
                    if (el && (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
                      cursor.style.width = '50px';
                      cursor.style.height = '50px';
                      cursor.style.backgroundColor = '#FBFF48';
                      cursor.style.mixBlendMode = 'normal';
                    } else {
                      cursor.style.width = '24px';
                      cursor.style.height = '24px';
                      cursor.style.backgroundColor = '#fff';
                      cursor.style.mixBlendMode = 'difference';
                    }
                  });
                }

                if (progressBar) {
                  window.addEventListener('scroll', function() {
                    var scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                    progressBar.style.width = scrolled + '%';
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
