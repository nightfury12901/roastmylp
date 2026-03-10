'use client'

interface RoastCardProps {
    area: string
    problem: string
    fix: string
    index: number
    accent?: string
}

const ACCENTS = ['#FF2A2A', '#FF9F1C', '#FBFF48', '#33FF57', '#A855F7', '#FF70A6', '#3B82F6', '#FF2A2A', '#33FF57', '#FF9F1C']

export default function RoastCard({ area, problem, fix, index, accent }: RoastCardProps) {
    const color = accent || ACCENTS[index % ACCENTS.length]

    return (
        <div
            className="bg-[#0D0D0D] border-2 border-white/10 p-6 relative transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
            style={{ boxShadow: `4px 4px 0 ${color}30` }}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

            {/* Area label */}
            <div className="flex items-center justify-between mb-4">
                <span
                    className="font-mono text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border"
                    style={{ color, borderColor: color, backgroundColor: `${color}15` }}
                >
                    {String(index + 1).padStart(2, '0')}_{area.replace(/\s+/g, '_').toUpperCase()}
                </span>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            </div>

            {/* Problem */}
            <div className="mb-4">
                <p className="font-mono text-[10px] text-gray-500 uppercase mb-1">PROBLEM:</p>
                <p className="font-display text-white text-sm leading-relaxed">{problem}</p>
            </div>

            {/* Fix */}
            <div className="border-t border-white/5 pt-4">
                <p className="font-mono text-[10px] uppercase mb-1" style={{ color }}>FIX:</p>
                <p className="font-mono text-sm leading-relaxed" style={{ color: `${color}CC` }}>{fix}</p>
            </div>
        </div>
    )
}
