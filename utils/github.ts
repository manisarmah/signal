import { createClient } from '@/utils/supabase/server'

export async function fetchGitHubEvents(usernameOverride?: string) {
    let username = usernameOverride
    let token = undefined

    if (!username) {
        const supabase = await createClient()
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) return []

        // Get username from metadata
        const { user } = session
        username = user.user_metadata.user_name ||
            user.user_metadata.preferred_username ||
            user.user_metadata.iss?.split('/').pop()

        token = session.provider_token
    }

    if (!username) return []

    try {
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'The-Signal-App'
        }

        if (token) {
            headers['Authorization'] = `token ${token}`
        }

        const response = await fetch(`https://api.github.com/users/${username}/events?per_page=10`, {
            headers,
            cache: 'no-store'
        })

        if (!response.ok) {
            console.error('GitHub API Error:', await response.text())
            // Return empty array on error to not break the entire dashboard
            return []
        }

        return await response.json()
    } catch (err) {
        console.error('GitHub API fetch error:', err)
        return []
    }
}
