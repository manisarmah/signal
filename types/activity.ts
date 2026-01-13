export interface BaseFeedItem {
    id: string
    source: 'github' | 'manual' | 'devto' | 'leetcode' | 'stackoverflow' | 'other'
    type: 'commit' | 'pr' | 'issue' | 'project' | 'article' | 'problem_solved' | 'achievement' | 'other' |
    'PushEvent' | 'PullRequestEvent' | 'WatchEvent' | 'CreateEvent' | 'IssueCommentEvent' | 'image' | 'pdf'
    title: string
    description?: string // Make optional
    url: string
    date: string // ISO string
    created_at: string
    actor?: { // Optional, mostly for GitHub
        login: string
        avatar_url: string
    }
    repo?: { // Optional, mostly for GitHub
        name: string
        url: string
    }
    metadata?: Record<string, any> // Flexible bag for source-specific data (tags, difficulty, etc.)
}

// Deprecating separate interfaces in favor of the unified one, 
// OR we can keep them as extensions of BaseFeedItem.
// For now, let's keep it simple and start merging structure.

export type FeedItem = BaseFeedItem
