-- Allow everyone to view receipts
-- Drop the old policy if strict control was intended, but adding a permissive one works too (Policies are OR'ed).
-- However, for clarity, let's keep the user one for implicit "my dashboard" context if needed, 
-- but actually "public view" covers it.

create policy "Everyone can view receipts"
  on receipts for select
  using ( true );
