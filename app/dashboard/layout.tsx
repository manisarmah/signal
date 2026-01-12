import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, FileText, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MobileNav from '@/components/dashboard/mobile-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    // Self-Heal: Ensure public profile exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        console.log('Profile missing for user. ID:', user.id)
        console.log('Metadata available:', user.user_metadata)

        const newProfile = {
            id: user.id,
            username: user.user_metadata.user_name || user.user_metadata.preferred_username || user.email?.split('@')[0],
            bio: 'Developer'
        }
        console.log('Attempting to create profile:', newProfile)

        const { error: insertError } = await supabase.from('profiles').insert(newProfile)

        if (insertError) {
            console.error('FAILED to create profile:', insertError)
        } else {
            console.log('Successfully created profile!')
        }
    }

    const userDisplayName = user.user_metadata.full_name || user.user_metadata.user_name || user.email || ''
    const avatarUrl = user.user_metadata.avatar_url || ''

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex flex-col">
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <h2 className="text-xl font-bold tracking-tight">The Signal</h2>
                    </div>
                    <nav className="flex-1 px-4 space-y-2">
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/dashboard">
                                <Activity className="h-4 w-4" />
                                Pulse
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/dashboard/proofs">
                                <FileText className="h-4 w-4" />
                                Proofs
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/dashboard/settings">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    </nav>
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={avatarUrl} alt={userDisplayName} />
                                <AvatarFallback>{userDisplayName[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-medium truncate">
                                {userDisplayName}
                            </div>
                        </div>
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" className="w-full gap-2">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b flex items-center px-6 md:hidden justify-between">
                    <span className="font-bold">The Signal</span>
                    <MobileNav userEmail={userDisplayName} avatarUrl={avatarUrl} />
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
