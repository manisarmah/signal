import { PulseFeed } from '@/components/pulse/feed'
import { getFeedItems } from '@/app/actions/get-feed'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    let username = 'me'

    // Attempt to get username for the profile link
    if (session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single()
        if (profile?.username) username = profile.username
    }

    // Use the Unified Feed Action
    const initialFeed = await getFeedItems(1)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Pulse</h1>
                    <p className="text-muted-foreground">Real-time aggregate of your developer journey.</p>
                </div>
                <Button asChild variant="outline" className='hidden md:flex'>
                    <Link href={`/p/${username}`}>
                        View Public Profile
                    </Link>
                </Button>
            </div>

            <PulseFeed initialEvents={initialFeed} />
        </div>
    )
}
