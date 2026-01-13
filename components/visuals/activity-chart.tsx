'use client'

import { useMemo } from 'react'
import { FeedItem } from '@/types/activity'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'

interface ActivityChartProps {
    items: FeedItem[]
}

export function ActivityChart({ items }: ActivityChartProps) {
    const data = useMemo(() => {
        // Generate last 30 days
        const days = Array.from({ length: 30 }, (_, i) => {
            const date = startOfDay(subDays(new Date(), 29 - i))
            return {
                date: format(date, 'MMM dd'),
                rawDate: date,
                github: 0,
                leetcode: 0,
                devto: 0,
                proof: 0
            }
        })

        // Fill counts
        items.forEach(item => {
            const itemDate = startOfDay(new Date(item.date))
            const day = days.find(d => isSameDay(d.rawDate, itemDate))

            if (day) {
                if (item.source === 'github') day.github++
                else if (item.source === 'leetcode') day.leetcode++
                else if (item.source === 'devto') day.devto++
                else if (item.source === 'manual') day.proof++
            }
        })

        return days
    }, [items])

    return (
        <Card className="col-span-full md:col-span-2">
            <CardHeader>
                <CardTitle>Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="date"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={32}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    borderColor: 'var(--border)',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                            <Bar dataKey="github" name="GitHub" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="leetcode" name="LeetCode" stackId="a" fill="#FFA116" />
                            <Bar dataKey="devto" name="Dev.to" stackId="a" fill="#059669" />
                            <Bar dataKey="proof" name="Others" stackId="a" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
