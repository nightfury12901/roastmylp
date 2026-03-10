import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const email = url.searchParams.get('email')

        if (!email) {
            return NextResponse.json({ credits: 0 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('email', email)
            .single()

        if (error || !data) {
            return NextResponse.json({ credits: 0 })
        }

        return NextResponse.json({ credits: data.credits })
    } catch (error) {
        return NextResponse.json({ credits: 0 })
    }
}
