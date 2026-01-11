'use client'

import { useEffect, useState } from 'react'
import { EventCard } from './event-card'
import { FeedItem } from '@/types/activity'
import { Skeleton } from '@/components/ui/skeleton'

export function PulseFeed({ initialEvents = [] }: { initialEvents?: FeedItem[] }) {
    const [events, setEvents] = useState<FeedItem[]>(initialEvents)
    const [loading, setLoading] = useState(initialEvents.length === 0)
    const [error, setError] = useState<string | null>(null)

    // Only fetch if no initial events provided (or if revalidating)
    useEffect(() => {
        if (initialEvents.length > 0) {
            setLoading(false)
            setEvents(initialEvents)
            return
        }

        // Fallback to client-side fetch if needed (e.g. for refresh)
        async function loadEvents() {
            try {
                const res = await fetch('/api/github/events')
                if (!res.ok) throw new Error('Failed to fetch events')
                const data = await res.json()
                // Mark them as source: github if not present (legacy API output)
                const standardizedData = data.map((e: any) => ({ ...e, source: 'github' }))
                setEvents(standardizedData)
            } catch (err: any) {
                setError('Failed to load activity feed')
            } finally {
                setLoading(false)
            }
        }

        loadEvents()
    }, [initialEvents])

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>
    }

    if (events.length === 0) {
        return <div className="text-muted-foreground text-sm">No recent activity found.</div>
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    )
}
