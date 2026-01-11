'use client'

import { Button } from '@/components/ui/button'
import { Share2, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function ShareButton({ username }: { username: string }) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const url = `${window.location.origin}/p/${username}`

        // Try Web Share API first (Mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${username}'s Signal`,
                    text: `Check out ${username}'s developer journey on The Signal.`,
                    url
                })
                return
            } catch (err) {
                // Determine if user cancelled or error, but fallback to copy anyway if not abort
            }
        }

        // Fallback to Clipboard
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success("Profile URL copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy URL")
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied" : "Share Profile"}
        </Button>
    )
}
