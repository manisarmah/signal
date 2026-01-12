'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const bio = formData.get('bio') as string
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Update
    const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    // Revalidate
    // We need to fetch the username to revalidate the public path, 
    // or we can blindly revalidate if we don't have it handy, but better to be precise or just let it cache-bust naturally or return the needed data.
    // For now, let's just revalidate the dashboard settings.
    revalidatePath('/dashboard/settings')
    // We can't easily get the username here without another query, so we'll skip specific public page revalidation 
    // efficiently unless we fetch it. The client can also force refresh.

    return { success: true }
}
