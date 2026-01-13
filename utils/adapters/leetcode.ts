import { DataSourceAdapter, AdapterConfig } from './types'
import { FeedItem } from '@/types/activity'
import { Code } from 'lucide-react'

export const LeetCodeAdapter: DataSourceAdapter = {
    providerId: 'leetcode',
    name: 'LeetCode',
    icon: Code,

    async fetchActivity(config: AdapterConfig): Promise<FeedItem[]> {
        const username = config.username
        if (!username) return []

        try {
            const query = `
                query RecentAcSubmissionList($username: String!) {
                    recentAcSubmissionList(username: $username, limit: 15) {
                        title
                        titleSlug
                        timestamp
                    }
                }
            `

            const response = await fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Referer': 'https://leetcode.com',
                },
                body: JSON.stringify({
                    query,
                    variables: { username }
                }),
                next: { revalidate: 0 } // No cache for real-time updates during dev
            })

            if (!response.ok) {
                console.error('LeetCode API Error:', response.statusText)
                return []
            }

            const result = await response.json()
            const submissions = result.data?.recentAcSubmissionList || []

            return submissions.map((sub: any) => ({
                id: `leetcode-${sub.timestamp}-${sub.titleSlug}`,
                source: 'leetcode',
                type: 'problem_solved',
                title: sub.title,
                description: `Solved ${sub.title}`,
                url: `https://leetcode.com/problems/${sub.titleSlug}/`,
                date: new Date(parseInt(sub.timestamp) * 1000).toISOString(),
                created_at: new Date(parseInt(sub.timestamp) * 1000).toISOString(),
                metadata: {
                    slug: sub.titleSlug
                }
            }))

        } catch (error) {
            console.error('LeetCode fetch error:', error)
            return []
        }
    },

    async verifyIdentity(username: string, verificationCode?: string): Promise<boolean> {
        try {
            const query = `
                query UserProfile($username: String!) {
                    matchedUser(username: $username) {
                        username
                        profile {
                            aboutMe
                        }
                    }
                }
            `
            const response = await fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables: { username } }),
                cache: 'no-store'
            })

            const result = await response.json()
            const user = result.data?.matchedUser

            if (!user) return false

            // If legitimate code provided, check for it
            if (verificationCode) {
                const about = user.profile?.aboutMe || ''
                return about.includes(verificationCode)
            }

            return true
        } catch {
            return false
        }
    }
}
