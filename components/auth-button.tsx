'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function AuthButton() {
    const supabase = createClient()

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <Button onClick={handleLogin} variant="outline" className="gap-2">
            <Github className="h-4 w-4" />
            Login with GitHub
        </Button>
    )
}
