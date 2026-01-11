import { fetchGitHubEvents } from '@/utils/github'
import { NextResponse } from 'next/server'

export async function GET() {
    const events = await fetchGitHubEvents()
    return NextResponse.json(events)
}
