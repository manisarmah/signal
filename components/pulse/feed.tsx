'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { EventCard } from './event-card'
import { FeedItem } from '@/types/activity'
import { Skeleton } from '@/components/ui/skeleton'
import { getFeedItems } from '@/app/actions/get-feed'

export function PulseFeed({ initialEvents = [] }: { initialEvents?: FeedItem[] }) {
    const [events, setEvents] = useState<FeedItem[]>(initialEvents)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const observer = useRef<IntersectionObserver | null>(null)
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreEvents()
            }
        })

        if (node) observer.current.observe(node)
    }, [loadingMore, hasMore])

    // Load more events function
    const loadMoreEvents = async () => {
        setLoadingMore(true)
        try {
            const nextPage = page + 1
            const newEvents = await getFeedItems(nextPage)

            if (newEvents.length === 0) {
                setHasMore(false)
            } else {
                setEvents(prev => [...prev, ...newEvents])
                setPage(nextPage)
            }
        } catch (error) {
            console.error("Failed to load more events", error)
        } finally {
            setLoadingMore(false)
        }
    }

    // Reset if initialEvents change (e.g. user navigation)
    useEffect(() => {
        setEvents(initialEvents)
        setPage(1)
        setHasMore(true)
    }, [initialEvents])

    if (events.length === 0 && !hasMore) {
        return <div className="text-muted-foreground text-sm">No activity found.</div>
    }

    return (
        <div className="space-y-4">
            {events.map((event, index) => {
                if (index === events.length - 1) {
                    return (
                        <div ref={lastElementRef} key={`${event.id}-${index}`}>
                            <EventCard event={event} />
                        </div>
                    )
                }
                return <EventCard key={`${event.id}-${index}`} event={event} />
            })}

            {loadingMore && (
                <div className="space-y-4 pt-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}

            {!hasMore && events.length > 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                    You've reached the end of the feed.
                </div>
            )}
        </div>
    )
}
