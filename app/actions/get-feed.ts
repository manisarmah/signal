'use server'

import { fetchGitHubEvents } from '@/utils/github'
import { createClient } from '@/utils/supabase/server'
import { FeedItem } from '@/types/activity'
import { DevToAdapter } from '@/utils/adapters/devto'
import { LeetCodeAdapter } from '@/utils/adapters/leetcode'

export async function getFeedItems(page: number = 1) {
    const PAGE_SIZE = 10
    const supabase = await createClient()

    // 0. Get User Profile for Integrations
    const { data: { session } } = await supabase.auth.getSession()
    let devtoUsername = null
    let leetcodeUsername = null

    if (session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
        devtoUsername = profile?.devto_username
        leetcodeUsername = profile?.leetcode_username
    }

    // 1. Fetch GitHub Events
    // Note: We should eventually move GitHub to the Adapter pattern too explicitly here, 
    // but for now we keep the direct call as it handles the auth token complexity internally.
    const githubPromise = fetchGitHubEvents(undefined, page)

    // 2. Fetch Dev.to Articles (if connected)
    // Only fetch for page 1 for now to fairly mix them, or we implement proper pagination for adapters later.
    // For MVP, we fetch recent articles on every load (cached) and sort.
    const devtoPromise = devtoUsername
        ? DevToAdapter.fetchActivity({ username: devtoUsername })
        : Promise.resolve([])

    // 3. Fetch LeetCode Activity (if connected)
    const leetcodePromise = leetcodeUsername
        ? LeetCodeAdapter.fetchActivity({ username: leetcodeUsername })
        : Promise.resolve([])

    // 4. Fetch Manual Receipts
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const receiptsPromise = supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false })
        .range(from, to)

    // Parallel Execution
    const [githubEvents, devtoEvents, leetcodeEvents, receiptsResult] = await Promise.all([
        githubPromise,
        devtoPromise,
        leetcodePromise,
        receiptsPromise
    ])

    const receipts = receiptsResult.data || []

    // 4. Normalize & Merge
    const normalizedGitHub: FeedItem[] = githubEvents.map((e: any) => {
        return {
            id: e.id,
            source: 'github',
            type: e.type,
            title: e.type,
            description: '',
            url: `https://github.com/${e.repo.name}`,
            date: e.created_at,
            created_at: e.created_at,
            actor: e.actor,
            repo: e.repo,
            metadata: {
                payload: e.payload
            }
        }
    })


    const normalizedDevTo: FeedItem[] = (devtoEvents as FeedItem[])
    const normalizedLeetCode: FeedItem[] = (leetcodeEvents as FeedItem[])

    const normalizedReceipts: FeedItem[] = receipts.map((r: any) => ({
        id: r.id,
        source: 'manual',
        type: r.type,
        title: r.title,
        description: r.description,
        url: r.url,
        date: r.date,
        created_at: r.created_at || r.date,
        metadata: {}
    }))

    // 5. Combine and Sort
    const combinedFeed = [...normalizedGitHub, ...normalizedDevTo, ...normalizedReceipts].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
    })

    // Simple client-side pagination simulation for the mixed feed
    // Since we fetched fresh batches from different sources, proper pagination is complex.
    // For this MVP, we slice the combined result. 
    // This allows "Loading More" to work visually, though it might re-fetch/overlap data slightly.
    // Ideally, we'd pass `page` to adapters.
    const sliceFrom = (page - 1) * 10
    const sliceTo = sliceFrom + 10

    // If page > 1, slicing locally might be weird if we didn't fetch enough history from adapters.
    // But since GitHub fetches by page, and Receipts by range, they are correct.
    // Dev.to fetches ALL recent (cached).
    // So we just return the whole sorted list? No, that breaks the "Load More" concatenation on client.
    // We should return the specific slice if we are aggregating EVERYTHING.
    // BUT, GitHub returns *only* 10 items for that page. Receipts *only* 10.
    // Dev.to returns *all* (say 30).
    // So if we just merge: Page 1 has 10 GH + 30 DevTo + 10 Receipts = 50 items.
    // Page 2 has 10 GH (next page) + 30 DevTo (same cached) + 10 Receipts (next range).
    // This results in duplicates for Dev.to.

    // Fix: We should slice Dev.to events based on the page.
    const pagedDevTo = normalizedDevTo.slice((page - 1) * 3, page * 3)
    const pagedLeetCode = normalizedLeetCode.slice((page - 1) * 5, page * 5)

    const finalFeed = [...normalizedGitHub, ...pagedDevTo, ...pagedLeetCode, ...normalizedReceipts].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
    })

    // FORCE INJECT FAKE LEETCODE ITEM FOR DEBUGGING
    const debugItem: FeedItem = {
        id: 'debug-leetcode-1',
        source: 'leetcode',
        type: 'problem_solved',
        title: '[DEBUG] Two Sum',
        description: 'Solved Two Sum',
        url: 'https://leetcode.com',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        metadata: { slug: 'two-sum' }
    }

    // Unshift debug item to top
    // return [debugItem, ...finalFeed]
    return finalFeed
}

export async function getPublicFeedItems(username: string, page: number = 1) {
    const PAGE_SIZE = 10
    const supabase = await createClient()

    // 0. Resolve Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (!profile) return []

    const devtoUsername = profile.devto_username
    const leetcodeUsername = profile.leetcode_username
    const userId = profile.id

    // 1. Fetch GitHub Events
    const githubPromise = fetchGitHubEvents(username, page)

    // 2. Fetch Dev.to Activity
    const devtoPromise = devtoUsername
        ? DevToAdapter.fetchActivity({ username: devtoUsername })
        : Promise.resolve([])

    // 3. Fetch LeetCode Activity
    const leetcodePromise = leetcodeUsername
        ? LeetCodeAdapter.fetchActivity({ username: leetcodeUsername })
        : Promise.resolve([])

    // 4. Fetch Manual Receipts
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const receiptsPromise = supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(from, to)

    // Parallel Execution
    const [githubEvents, devtoEvents, leetcodeEvents, receiptsResult] = await Promise.all([
        githubPromise,
        devtoPromise,
        leetcodePromise,
        receiptsPromise
    ])

    const receipts = receiptsResult.data || []

    // 5. Normalize & Merge
    const normalizedGitHub: FeedItem[] = githubEvents.map((e: any) => ({
        id: e.id,
        source: 'github',
        type: e.type,
        title: e.type,
        description: '',
        url: `https://github.com/${e.repo.name}`,
        date: e.created_at,
        created_at: e.created_at,
        actor: e.actor,
        repo: e.repo,
        metadata: {
            payload: e.payload
        }
    }))

    const normalizedDevTo: FeedItem[] = (devtoEvents as FeedItem[])
    const normalizedLeetCode: FeedItem[] = (leetcodeEvents as FeedItem[])

    const normalizedReceipts: FeedItem[] = receipts.map((r: any) => ({
        id: r.id,
        source: 'manual',
        type: r.type,
        title: r.title,
        description: r.description,
        url: r.url,
        date: r.date,
        created_at: r.created_at || r.date,
        metadata: {}
    }))

    // Slice Logic
    const pagedDevTo = normalizedDevTo.slice((page - 1) * 3, page * 3)
    const pagedLeetCode = normalizedLeetCode.slice((page - 1) * 5, page * 5)

    const finalFeed = [...normalizedGitHub, ...pagedDevTo, ...pagedLeetCode, ...normalizedReceipts].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
    })

    return finalFeed
}
