import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function SettingsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    // Fetch existing profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    async function updateProfile(formData: FormData) {
        'use server'

        const bio = formData.get('bio') as string
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('profiles')
            .update({ bio })
            .eq('id', user.id)

        revalidatePath('/dashboard/settings')
        revalidatePath(`/p/${profile?.username}`)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and account settings.</p>
            </div>

            <div className="space-y-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" value={user.email} disabled />
                    <p className="text-sm text-muted-foreground">Managed via GitHub.</p>
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input type="text" id="username" value={profile?.username || ''} disabled />
                    <p className="text-sm text-muted-foreground">Your unique Signal handle.</p>
                </div>

                <form action={updateProfile} className="space-y-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            placeholder="Tell us about yourself..."
                            defaultValue={profile?.bio || ''}
                            className="min-h-[100px]"
                        />
                        <p className="text-sm text-muted-foreground">
                            This will be displayed on your public profile.
                        </p>
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>
            </div>
        </div>
    )
}
