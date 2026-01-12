'use server'

import { fetchGitHubEvents } from '@/utils/github'
import { createClient } from '@/utils/supabase/server'
import { FeedItem } from '@/types/activity'

export async function getFeedItems(page: number = 1) {
    const PAGE_SIZE = 10

    // 1. Fetch GitHub Events for the specific page
    const githubEvents = await fetchGitHubEvents(undefined, page)

    // 2. Fetch Manual Receipts for the specific range
    const supabase = await createClient()
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false })
        .range(from, to)

    // 3. Normalize & Merge
    const normalizedGitHub: FeedItem[] = githubEvents.map((e: any) => ({ ...e, source: 'github' }))
    const normalizedReceipts: FeedItem[] = (receipts || []).map((r: any) => ({ ...r, source: 'manual' }))

    // 4. Combine and Sort
    const combinedFeed = [...normalizedGitHub, ...normalizedReceipts].sort((a, b) => {
        const dateA = new Date(a.source === 'manual' ? a.date : a.created_at).getTime()
        const dateB = new Date(b.source === 'manual' ? b.date : b.created_at).getTime()
        return dateB - dateA // Descending
    })

    return combinedFeed
}
