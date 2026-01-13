import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCommit, GitPullRequest, Star, Plus, GitBranch, MessageSquare, FileText, Image as ImageIcon, ExternalLink, BookOpen, Code } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { FeedItem } from '@/types/activity'
import Link from 'next/link'

const EventIcon = ({ item }: { item: FeedItem }) => {
    if (item.source === 'manual') {
        return item.type === 'image' ?
            <ImageIcon className="h-5 w-5 text-pink-500" /> :
            <FileText className="h-5 w-5 text-orange-500" />
    }

    // Dev.to Mapping
    if (item.source === 'devto') {
        return <BookOpen className="h-5 w-5 text-indigo-500" />
    }

    // LeetCode Mapping
    if (item.source === 'leetcode') {
        return <Code className="h-5 w-5 text-orange-500" />
    }

    // GitHub Mapping
    if (item.source === 'github') {
        switch (item.type) {
            case 'PushEvent':
                return <GitCommit className="h-5 w-5 text-yellow-500" />
            case 'PullRequestEvent':
                return <GitPullRequest className="h-5 w-5 text-purple-500" />
            case 'WatchEvent':
                return <Star className="h-5 w-5 text-yellow-400" />
            case 'CreateEvent':
                return <Plus className="h-5 w-5 text-green-500" />
            case 'IssueCommentEvent':
                return <MessageSquare className="h-5 w-5 text-blue-500" />
            default:
                return <GitBranch className="h-5 w-5 text-gray-500" />
        }
    }

    return <ExternalLink className="h-5 w-5 text-gray-400" />
}

const EventDescription = ({ item }: { item: FeedItem }) => {
    // 1. Manual Receipts
    if (item.source === 'manual') {
        return (
            <span>
                Added proof: <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{item.title}</a>
            </span>
        )
    }

    // 2. Dev.to Articles
    if (item.source === 'devto') {
        const tags = item.metadata?.tags || []
        const readTime = item.metadata?.reading_time_minutes

        return (
            <div className="flex flex-col gap-1">
                <span>
                    Published article: <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{item.title}</a>
                </span>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                    {readTime && <span>{readTime} min read</span>}
                    {tags.map((tag: string) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-zinc-800 rounded-md">#{tag}</span>
                    ))}
                </div>
            </div>
        )
    }

    // 3. LeetCode Problems
    if (item.source === 'leetcode') {
        const url = item.url || '#'
        return (
            <span>
                Solved <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline text-orange-500">{item.title}</a>
            </span>
        )
    }

    // 4. GitHub Events
    if (item.source === 'github') {
        const payload = item.metadata?.payload || {}
        const repoName = item.repo?.name || 'unknown/repo'
        const repoUrl = item.repo?.url ? `https://github.com/${item.repo.name}` : '#'

        const LinkText = ({ href, children }: { href: string, children: React.ReactNode }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                {children}
            </a>
        )

        switch (item.type) {
            case 'PushEvent':
                // GitHub sometimes strips 'commits' from public event payloads, sending only head/before.
                // We fallback to 1 if it's a PushEvent but payload is empty, assuming at least the push happened.
                const commitCount = payload.size || payload.commits?.length || 1
                return (
                    <span>
                        Pushed {commitCount} commit{commitCount > 1 ? 's' : ''} to <LinkText href={`${repoUrl}/commits`}>{repoName}</LinkText>
                    </span>
                )
            case 'PullRequestEvent':
                return (
                    <span>
                        {payload.action} PR in <LinkText href={payload.pull_request?.html_url || repoUrl}>{repoName}</LinkText>
                    </span>
                )
            case 'WatchEvent':
                return (
                    <span>
                        Starred <LinkText href={repoUrl}>{repoName}</LinkText>
                    </span>
                )
            case 'CreateEvent':
                const refUrl = payload.ref_type === 'repository' ? repoUrl : `${repoUrl}/tree/${payload.ref}`
                return (
                    <span>
                        Created {payload.ref_type} <LinkText href={refUrl}>{payload.ref_type === 'repository' ? repoName : payload.ref}</LinkText> in <LinkText href={repoUrl}>{repoName}</LinkText>
                    </span>
                )
            case 'IssueCommentEvent':
                return (
                    <span>
                        Commented on issue in <LinkText href={payload.comment?.html_url || repoUrl}>{repoName}</LinkText>
                    </span>
                )
            default:
                return (
                    <span>
                        Performed {item.type} on <LinkText href={repoUrl}>{repoName}</LinkText>
                    </span>
                )
        }
    }

    // Fallback
    return <span>{item.title}</span>
}

export function EventCard({ event }: { event: FeedItem }) {
    return (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="p-2 bg-muted rounded-full">
                    <EventIcon item={event} />
                </div>
                <div className="flex flex-col">
                    <CardTitle className="text-sm font-normal">
                        <EventDescription item={event} />
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        • {event.source.charAt(0).toUpperCase() + event.source.slice(1)}
                    </span>
                </div>
            </CardHeader>
            {event.description && (
                <CardContent className="pb-4 pt-0 pl-[4.5rem]">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
            )}
        </Card>
    )
}
