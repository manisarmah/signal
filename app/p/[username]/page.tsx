import { PulseFeed } from '@/components/pulse/feed'
import { getPublicFeedItems } from '@/app/actions/get-feed'
import { fetchGitHubUser } from '@/utils/github'
import { createClient } from '@/utils/supabase/server'
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
    const supabase = await createClient()

    // 0. Fetch GitHub User Profile
    const githubUser = await fetchGitHubUser(username)
    const displayName = githubUser?.name || username

    // 1. Resolve Profile for Bio
    const { data: profile } = await supabase
        .from('profiles')
        .select('bio')
        .eq('username', username)
        .single()

    // 2. Fetch Combined Public Feed
    const combinedFeed = await getPublicFeedItems(username, 1)

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
            <div className="text-center space-y-2 relative">
                <div className="absolute right-0 top-0">
                    <ShareButton username={username} />
                </div>
                <div className="h-20 w-20 bg-muted rounded-full mx-auto overflow-hidden relative mb-4">
                    <img src={githubUser?.avatar_url || `https://github.com/${username}.png`} alt={username} className="object-cover h-full w-full" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                <p className="text-muted-foreground">@{username} • Developer Signal</p>
                {profile?.bio && (
                    <p className="max-w-md mx-auto mt-4 text-sm text-foreground/80 leading-relaxed">
                        {profile.bio}
                    </p>
                )}
            </div>

            <PulseFeed initialEvents={combinedFeed} publicUsername={username} />
        </div>
    )
}
