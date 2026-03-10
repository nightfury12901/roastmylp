'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flame, ArrowRight, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <header className="border-b-4 border-black bg-[#FBFF48] p-4 flex justify-between items-center relative z-10 sticky top-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="bg-black p-1.5">
                    <Flame size={20} className="text-[#FBFF48]" />
                </div>
                <span className="font-black text-xl tracking-tighter hidden sm:inline">ROASTMYLP</span>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 font-mono text-sm border-2 border-black/10 px-3 py-1.5 bg-black/5">
                            <User size={14} className="text-black" />
                            <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex font-mono font-black text-sm items-center gap-2 hover:bg-black hover:text-[#FBFF48] px-3 py-1.5 transition-colors border-2 border-black hover:border-black"
                            style={{ boxShadow: '2px 2px 0 #000' }}
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">SIGN OUT</span>
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth"
                        className="flex font-mono font-black text-sm items-center gap-2 hover:bg-black hover:text-[#FBFF48] px-3 py-1.5 transition-colors border-2 border-black hover:border-black"
                        style={{ boxShadow: '2px 2px 0 #000' }}
                    >
                        SIGN IN <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </header>
    )
}
