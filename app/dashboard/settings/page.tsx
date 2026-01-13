import { createClient } from '@/utils/supabase/server'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { IntegrationsForm } from '@/components/dashboard/integrations-form'

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

                <SettingsForm initialBio={profile?.bio || ''} />

                <div className="border-t pt-6">
                    <IntegrationsForm
                        userId={user.id}
                        devtoUsername={profile?.devto_username || ''}
                        leetcodeUsername={profile?.leetcode_username || ''}
                    />
                </div>
            </div>
        </div>
    )
}
