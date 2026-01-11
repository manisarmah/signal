import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, FileText, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'

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

    const NavContent = ({ mobile = false }: { mobile?: boolean }) => {
        const LinkWrapper = ({ children }: { children: React.ReactNode }) => {
            if (mobile) {
                return (
                    <SheetClose asChild>
                        {children}
                    </SheetClose>
                )
            }
            return <>{children}</>
        }

        return (
            <div className="flex flex-col h-full">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tight">The Signal</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <LinkWrapper>
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/dashboard">
                                <Activity className="h-4 w-4" />
                                Pulse
                            </Link>
                        </Button>
                    </LinkWrapper>
                    <LinkWrapper>
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/dashboard/proofs">
                                <FileText className="h-4 w-4" />
                                Proofs
                            </Link>
                        </Button>
                    </LinkWrapper>
                    <LinkWrapper>
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/dashboard/settings">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    </LinkWrapper>
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                        {/* Avatar could go here */}
                        <div className="text-sm font-medium truncate">
                            {user.user_metadata.user_name || user.email}
                        </div>
                    </div>
                    <form action="/auth/signout" method="post">
                        {/* Sign out doesn't need to close sheet necessarily, but good UX if it does */}
                        <LinkWrapper>
                            <Button variant="outline" className="w-full gap-2">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </LinkWrapper>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex flex-col">
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b flex items-center px-6 md:hidden justify-between">
                    <span className="font-bold">The Signal</span>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                </header>
                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
