'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, FileText, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export default function MobileNav({ userEmail }: { userEmail: string }) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <SheetDescription className="sr-only">Navigate through the dashboard sections</SheetDescription>

                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <h2 className="text-xl font-bold tracking-tight">The Signal</h2>
                    </div>
                    <nav className="flex-1 px-4 space-y-2">
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => setOpen(false)}
                        >
                            <Link href="/dashboard">
                                <Activity className="h-4 w-4" />
                                Pulse
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => setOpen(false)}
                        >
                            <Link href="/dashboard/proofs">
                                <FileText className="h-4 w-4" />
                                Proofs
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => setOpen(false)}
                        >
                            <Link href="/dashboard/settings">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    </nav>
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-sm font-medium truncate">
                                {userEmail}
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
            </SheetContent>
        </Sheet>
    )
}
