'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/app/actions/update-profile' // We'll move the action
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
    initialBio: string
}

export function SettingsForm({ initialBio }: SettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter() // To refresh client cache if needed

    // We can use a simple form handler wrapping the server action
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)


            const result = await updateProfile(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Profile updated successfully!")
                router.refresh()
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself..."
                    defaultValue={initialBio}
                    className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                    This will be displayed on your public profile.
                </p>
            </div>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}
