'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateIntegrations } from '../../app/actions/update-integrations' // New action
import { BookOpen, Code, Github, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface IntegrationsFormProps {
    userId: string
    devtoUsername?: string
    leetcodeUsername?: string
}

export function IntegrationsForm({ userId, devtoUsername, leetcodeUsername }: IntegrationsFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const verificationCode = `signal-verify-${userId.slice(0, 8)}`

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await updateIntegrations(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                const changes = result.changes || { devto: false, leetcode: false }

                if (changes.devto && changes.leetcode) {
                    toast.success("Updated Dev.to and LeetCode connections!")
                } else if (changes.devto) {
                    toast.success(`Connected Dev.to as ${result.updated?.devto_username || 'user'}!`)
                } else if (changes.leetcode) {
                    toast.success(`Connected LeetCode as ${result.updated?.leetcode_username || 'user'}!`)
                } else {
                    toast.success("Integrations saved (no changes).")
                }

                router.refresh()
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs">i</span>
                    Verification Required
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    To verifying ownership, please add the following code to your <strong>Bio</strong> (LeetCode) or <strong>Summary</strong> (Dev.to) before saving:
                </p>
                <div className="flex items-center gap-2 bg-background border rounded px-3 py-2 w-fit">
                    <code className="text-sm font-mono">{verificationCode}</code>
                </div>
            </div>

            <h2 className="text-xl font-semibold">Connect Your World</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dev.to Card */}
                <Card className="relative overflow-hidden group border bg-card hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg border">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Dev.to</CardTitle>
                            <CardDescription>Share your writing</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="devto_username" className="text-xs uppercase text-muted-foreground">Username</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="devto_username"
                                    name="devto_username"
                                    placeholder="manisarmah"
                                    defaultValue={devtoUsername}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* LeetCode Card */}
                <Card className="relative overflow-hidden group border bg-card hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg border">
                            <Code className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>LeetCode</CardTitle>
                            <CardDescription>Show off your rank</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="leetcode_username" className="text-xs uppercase text-muted-foreground">Username</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="leetcode_username"
                                    name="leetcode_username"
                                    placeholder="leetcode_user"
                                    defaultValue={leetcodeUsername}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Verifying & Connecting..." : "Verify & Save Integrations"}
                </Button>
            </div>
        </form>
    )
}
