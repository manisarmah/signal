import { PulseFeed } from '@/components/pulse/feed'
import { fetchGitHubEvents } from '@/utils/github'
import { createClient } from '@/utils/supabase/server'
import { FeedItem, GitHubEvent, ManualReceipt } from '@/types/activity'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
    // 1. Fetch GitHub Events
    const githubEvents = await fetchGitHubEvents()

    // 2. Fetch Manual Receipts
    const supabase = await createClient()
    const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false })
        .limit(10)

    // 3. Normalize & Merge
    const normalizedGitHub: FeedItem[] = githubEvents.map((e: any) => ({ ...e, source: 'github' }))
    const normalizedReceipts: FeedItem[] = (receipts || []).map((r: any) => ({ ...r, source: 'manual' }))

    const combinedFeed = [...normalizedGitHub, ...normalizedReceipts].sort((a, b) => {
        const dateA = new Date(a.source === 'manual' ? a.date : a.created_at).getTime()
        const dateB = new Date(b.source === 'manual' ? b.date : b.created_at).getTime()
        return dateB - dateA // Descending
    })

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Pulse</h1>
                    <p className="text-muted-foreground">Real-time aggregate of your developer journey.</p>
                </div>
                <Button asChild variant="outline" className='hidden md:flex'>
                    <Link href={`/p/${githubEvents[0]?.actor?.login || 'me'}`}>
                        View Public Profile
                    </Link>
                </Button>
            </div>

            <PulseFeed initialEvents={combinedFeed} />
        </div>
    )
}
