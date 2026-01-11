import { render, screen } from '@testing-library/react'
import { EventCard } from '@/components/pulse/event-card'
import { describe, it, expect } from 'vitest'

describe('EventCard Smoke Test', () => {
    it('renders a PushEvent correctly', () => {
        const mockEvent = {
            id: '1',
            type: 'PushEvent',
            actor: { login: 'testuser', avatar_url: '' },
            repo: { name: 'test/repo', url: '' },
            payload: { size: 2 },
            created_at: new Date().toISOString()
        }

        render(<EventCard event={mockEvent} />)

        expect(screen.getByText(/Pushed 2 commits/i)).toBeDefined()
        expect(screen.getByText('test/repo')).toBeDefined()
    })
})
