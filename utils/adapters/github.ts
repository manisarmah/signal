import { DataSourceAdapter, AdapterConfig } from './types'
import { FeedItem } from '@/types/activity'
import { Github } from 'lucide-react'

// Re-using existing fetch logic but wrapping it
import { fetchGitHubEvents, fetchGitHubUser } from '@/utils/github'

export const GitHubAdapter: DataSourceAdapter = {
    providerId: 'github',
    name: 'GitHub',
    icon: Github,

    async fetchActivity(config: AdapterConfig): Promise<FeedItem[]> {
        // Our existing util returns refined events, we might need to map them to the new schema
        // if the new schema is strictly enforced.
        // The existing `fetchGitHubEvents` returns `GitHubEvent[]` which matches the structure of `FeedItem` mostly.
        const events = await fetchGitHubEvents(config.username, 1) // Default to page 1 for now

        // Map to new Unified FeedItem
        return events.map((event: any) => ({
            id: event.id,
            source: 'github',
            type: event.type as any, // We will refine this map
            title: event.type === 'PushEvent' ?
                `Pushed ${event.payload?.size || 0} commits` :
                `Activity on ${event.repo.name}`,
            description: event.payload?.commits?.[0]?.message || '',
            url: `https://github.com/${event.repo.name}`,
            date: event.created_at,
            created_at: event.created_at,
            actor: event.actor,
            repo: event.repo,
            metadata: {
                payload: event.payload
            }
        }))
    },

    async verifyIdentity(username: string): Promise<boolean> {
        try {
            const user = await fetchGitHubUser(username)
            return !!user
        } catch (e) {
            return false
        }
    }
}
