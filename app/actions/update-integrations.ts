'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { DevToAdapter } from '@/utils/adapters/devto'

export async function updateIntegrations(formData: FormData) {
    const devto_username = formData.get('devto_username') as string
    const leetcode_username = formData.get('leetcode_username') as string

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Generate expected verification code
    const verificationCode = `signal-verify-${user.id.slice(0, 8)}`

    // Verify Dev.to if provided and changed
    if (devto_username) {
        // We verify every time for security, or at least check ownership if it's a new one.
        // For MVP, checking every time ensures they still own it.
        console.log('[Debug] Verifying Dev.to user:', devto_username)
        const isValid = await DevToAdapter.verifyIdentity(devto_username, verificationCode)
        console.log('[Debug] Verification result:', isValid)

        if (!isValid) {
            // Fallback: Check if they just forgot the code, maybe checking existence is enough for legacy?
            // User requested stricter security. So we enforce it.
            return { error: `Verification Failed for Dev.to! Please add "${verificationCode}" to your Dev.to bio/summary.` }
        }
    }


    // Verify LeetCode if provided
    if (leetcode_username) {
        // Import Adapter here
        const { LeetCodeAdapter } = require('@/utils/adapters/leetcode')

        console.log('[Debug] Verifying LeetCode user:', leetcode_username)
        const isValid = await LeetCodeAdapter.verifyIdentity(leetcode_username, verificationCode)

        if (!isValid) {
            return { error: `Verification Failed for LeetCode! Please add "${verificationCode}" to your LeetCode about/summary.` }
        }
    }

    // Update Profile
    console.log('[Debug] Updating profile for user:', user.id, { devto_username, leetcode_username })

    // First check if profile exists
    const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!existingProfile) {
        console.error('[Debug] Profile not found before update.')
        return { error: 'Profile does not exist. Please allow a few seconds for self-healing.' }
    }

    // Calculate changes
    const devtoChanged = devto_username !== existingProfile.devto_username
    const leetcodeChanged = leetcode_username !== existingProfile.leetcode_username

    const { data, error } = await supabase
        .from('profiles')
        .update({
            devto_username,
            leetcode_username
        })
        .eq('id', user.id)
        .select()

    if (error) {
        console.error('[Debug] Update Error:', error)
        return { error: `Update Failed: ${error.message}` }
    }

    if (!data || data.length === 0) {
        console.error('[Debug] Update failed - RLS blocked return or no rows updated.')
        return { error: 'Update failed. Please check database permissions.' }
    }

    console.log('[Debug] Update Success:', data[0])
    revalidatePath('/dashboard/settings')
    return {
        success: true,
        updated: data[0],
        changes: {
            devto: devtoChanged,
            leetcode: leetcodeChanged
        }
    }
}
