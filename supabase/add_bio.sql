alter table profiles
add column if not exists bio text;

-- Allow users to update their own bio (RLS already exists for update)
-- Just ensuring RLS allows it (it does: "Users can update own profile.")
