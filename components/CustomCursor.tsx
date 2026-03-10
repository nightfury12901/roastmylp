'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: -100, y: -100 })
    const [isHovering, setIsHovering] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Track mouse movement
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', updatePosition)

        // Track hover states
        const handleMouseOver = (e: MouseEvent) => {
            const el = e.target as HTMLElement
            if (el && (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
                setIsHovering(true)
            } else {
                setIsHovering(false)
            }
        }
        window.addEventListener('mouseover', handleMouseOver)

        // Track scroll progress
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            if (totalHeight > 0) {
                setProgress((window.scrollY / totalHeight) * 100)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('mousemove', updatePosition)
            window.removeEventListener('mouseover', handleMouseOver)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <>
            {/* Custom cursor dot */}
            <div
                className="pointer-events-none fixed z-[9999] rounded-full border-2 border-black hidden lg:block"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: isHovering ? '50px' : '24px',
                    height: isHovering ? '50px' : '24px',
                    backgroundColor: isHovering ? '#FBFF48' : '#fff',
                    mixBlendMode: isHovering ? 'normal' : 'difference',
                    transition: 'width 0.2s, height 0.2s, background-color 0.2s',
                }}
            />

            {/* Scroll progress bar */}
            <div
                className="fixed top-0 left-0 h-[3px] z-[60] border-b border-black transition-all duration-75"
                style={{ width: `${progress}%`, background: '#FBFF48', boxShadow: '0 0 8px #FBFF48' }}
            />
        </>
    )
}
