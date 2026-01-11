import { PulseFeed } from '@/components/pulse/feed'
import { fetchGitHubEvents } from '@/utils/github'
import { createClient } from '@/utils/supabase/server'
import { FeedItem } from '@/types/activity'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ShareButton } from '@/components/public-profile/share-button'

interface PageProps {
    params: Promise<{
        username: string
    }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params
    return {
        title: `${username}'s Signal`,
        description: `Check out ${username}'s developer journey on The Signal.`,
    }
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { username } = await params

    // 1. Fetch GitHub Events (Public)
    const githubEvents = await fetchGitHubEvents(username)
    let manualReceipts: FeedItem[] = []

    const supabase = await createClient()

    // 2. Resolve Username -> User ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

    // 3. Fetch Manual Receipts (if profile exists)
    if (profile) {
        const { data: receipts } = await supabase
            .from('receipts')
            .select('*')
            .eq('user_id', profile.id)
            .order('date', { ascending: false })
            .limit(10)

        if (receipts) {
            manualReceipts = receipts.map((r: any) => ({ ...r, source: 'manual' }))
        }
    }

    // 4. Normalize & Merge
    const normalizedGitHub: FeedItem[] = githubEvents.map((e: any) => ({ ...e, source: 'github' }))
    const combinedFeed = [...normalizedGitHub, ...manualReceipts].sort((a, b) => {
        const dateA = new Date(a.source === 'manual' ? a.date : a.created_at).getTime()
        const dateB = new Date(b.source === 'manual' ? b.date : b.created_at).getTime()
        return dateB - dateA // Descending
    })

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
            <div className="text-center space-y-2 relative">
                <div className="absolute right-0 top-0">
                    <ShareButton username={username} />
                </div>
                <div className="h-20 w-20 bg-muted rounded-full mx-auto overflow-hidden relative mb-4">
                    {/* Placeholder Avatar - in real app would fetch from GitHub API user details */}
                    <img src={`https://github.com/${username}.png`} alt={username} className="object-cover" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{username}</h1>
                <p className="text-muted-foreground">Developer Signal</p>
            </div>

            <PulseFeed initialEvents={combinedFeed} />
        </div>
    )
}
