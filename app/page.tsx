import AuthButton from '@/components/auth-button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">The Signal</h1>
        <p className="text-muted-foreground text-lg">
          Aggregate your developer journey. GitHub events, manual proofs, and more.
          Verified. Real-time.
        </p>
        <div className="flex justify-center">
          <AuthButton />
        </div>
      </div>
    </div>
  )
}
