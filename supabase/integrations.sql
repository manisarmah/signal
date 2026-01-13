-- Add integration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS devto_username text,
ADD COLUMN IF NOT EXISTS leetcode_username text,
ADD COLUMN IF NOT EXISTS stackoverflow_username text;

-- Add RLS policies if needed (existing strict policies cover update of own profile)
-- Ensure users can update these new columns (the generic "update own profile" policy usually covers all columns, but worth checking).
