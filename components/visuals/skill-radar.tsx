'use client'

import { useMemo } from 'react'
import { FeedItem } from '@/types/activity'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SkillRadarProps {
    items: FeedItem[]
}

export function SkillRadar({ items }: SkillRadarProps) {
    const data = useMemo(() => {
        const tagCounts: Record<string, number> = {}

        items.forEach(item => {
            // Extract tags
            let tags: string[] = []

            if (item.metadata?.tags && Array.isArray(item.metadata.tags)) {
                tags = item.metadata.tags
            } else if (item.source === 'leetcode') {
                // Fallback if no specific tags found
                tags = ['Algorithms']
            } else if (item.source === 'github') {
                // Infer from Type
                if (item.type === 'pr' || item.type === 'isssue') tags = ['Collaboration']
                else tags = ['Software Engineering']
            }

            // Count
            tags.forEach(tag => {
                const normalized = tag.trim() //.toLowerCase() // Keep case for display?
                if (normalized) {
                    tagCounts[normalized] = (tagCounts[normalized] || 0) + 1
                }
            })
        })

        // Transform to array and sort
        const sortedTags = Object.entries(tagCounts)
            .map(([subject, A]) => ({ subject, A, fullMark: 100 })) // A is frequency
            .sort((a, b) => b.A - a.A)
            .slice(0, 6) // Top 6

        return sortedTags
    }, [items])

    if (data.length < 3) return null // Need at least 3 points for a radar

    return (
        <Card className="col-span-full md:col-span-1">
            <CardHeader>
                <CardTitle>Skill Radar</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar
                                name="Skills"
                                dataKey="A"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    borderColor: 'var(--border)',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
