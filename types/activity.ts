export interface GitHubEvent {
    id: string
    type: string
    actor: {
        login: string
        avatar_url: string
    }
    repo: {
        name: string
        url: string
    }
    payload: any
    created_at: string
    source: 'github'
}

export interface ManualReceipt {
    id: string
    user_id: string
    title: string
    description?: string // Make optional
    url: string
    type: 'image' | 'pdf'
    date: string // ISO string from DB
    created_at: string
    source: 'manual'
}

export type FeedItem = GitHubEvent | ManualReceipt
