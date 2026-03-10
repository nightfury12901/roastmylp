import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatScore(score: number): { label: string; color: string; bg: string } {
    if (score <= 3) return { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500' }
    if (score <= 5) return { label: 'Poor', color: 'text-orange-500', bg: 'bg-orange-500' }
    if (score <= 7) return { label: 'Average', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    return { label: 'Good', color: 'text-green-500', bg: 'bg-green-500' }
}
