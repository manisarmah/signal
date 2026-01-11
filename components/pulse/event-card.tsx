import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCommit, GitPullRequest, Star, Plus, GitBranch, MessageSquare, FileText, Image as ImageIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { FeedItem, GitHubEvent, ManualReceipt } from '@/types/activity'
import Link from 'next/link'

const EventIcon = ({ item }: { item: FeedItem }) => {
    if (item.source === 'manual') {
        return item.type === 'image' ?
            <ImageIcon className="h-5 w-5 text-pink-500" /> :
            <FileText className="h-5 w-5 text-orange-500" />
    }

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

const EventDescription = ({ item }: { item: FeedItem }) => {
    if (item.source === 'manual') {
        return (
            <span>
                Added proof: <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{item.title}</a>
            </span>
        )
    }

    const { type, payload, repo } = item as GitHubEvent
    const repoName = repo.name
    const repoUrl = `https://github.com/${repoName}`

    const LinkText = ({ href, children }: { href: string, children: React.ReactNode }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
            {children}
        </a>
    )

    switch (type) {
        case 'PushEvent':
            const commitCount = payload.size
            return (
                <span>
                    Pushed {commitCount} commit{commitCount > 1 ? 's' : ''} to <LinkText href={`${repoUrl}/commits`}>{repoName}</LinkText>
                </span>
            )
        case 'PullRequestEvent':
            return (
                <span>
                    {payload.action} PR in <LinkText href={payload.pull_request.html_url}>{repoName}</LinkText>
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
                    Performed {type} on <LinkText href={repoUrl}>{repoName}</LinkText>
                </span>
            )
    }
}

export function EventCard({ event }: { event: FeedItem }) {
    const date = event.source === 'manual' ? event.date : event.created_at

    // For manual receipts, maybe link to the proofs page or the file itself?
    // For now, let's keep it simple.

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
                        {formatDistanceToNow(new Date(date), { addSuffix: true })}
                        • {event.source === 'manual' ? 'Manual Proof' : 'GitHub'}
                    </span>
                </div>
            </CardHeader>
            {event.source === 'manual' && event.description && (
                <CardContent className="pb-4 pt-0 pl-[4.5rem]">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
            )}
        </Card>
    )
}
