import { FeedItem } from '@/types/activity'

export interface AdapterConfig {
    username: string
    [key: string]: any
}

export interface DataSourceAdapter {
    providerId: string // 'devto', 'leetcode', etc.
    name: string
    icon: React.ComponentType<{ className?: string }>

    // Fetch and Normalize Data
    fetchActivity(config: AdapterConfig): Promise<FeedItem[]>

    // Validate that the user exists on this platform
    verifyIdentity(username: string): Promise<boolean>

    // Get profile data (avatar, followers, etc.)
    getProfileDetails?(username: string): Promise<any>
}
