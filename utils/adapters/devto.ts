import { DataSourceAdapter, AdapterConfig } from './types'
import { FeedItem } from '@/types/activity'
import { BookOpen } from 'lucide-react'

export const DevToAdapter: DataSourceAdapter = {
    providerId: 'devto',
    name: 'Dev.to',
    icon: BookOpen,

    async fetchActivity(config: AdapterConfig): Promise<FeedItem[]> {
        const username = config.username
        if (!username) return []

        try {
            // Fetch articles from Dev.to API
            const response = await fetch(`https://dev.to/api/articles?username=${username}`, {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            })

            if (!response.ok) {
                console.error('Dev.to API Error:', await response.text())
                return []
            }

            const articles = await response.json()

            // Normalize to FeedItem
            return articles.map((article: any) => ({
                id: `devto-${article.id}`,
                source: 'devto',
                type: 'article',
                title: article.title,
                description: article.description,
                url: article.url,
                date: article.published_at,
                created_at: article.created_at,
                metadata: {
                    tags: article.tag_list,
                    reading_time_minutes: article.reading_time_minutes,
                    cover_image: article.cover_image,
                    public_reactions_count: article.public_reactions_count
                }
            }))

        } catch (error) {
            console.error('Dev.to fetch error:', error)
            return []
        }
    },

    async verifyIdentity(username: string, verificationCode?: string): Promise<boolean> {
        try {
            const response = await fetch(`https://dev.to/api/users/by_username?url=${username}`, {
                cache: 'no-store'
            })

            if (!response.ok) return false

            if (verificationCode) {
                const user = await response.json()
                const summary = user.summary || ''
                return summary.includes(verificationCode)
            }

            return true
        } catch {
            return false
        }
    }
}
