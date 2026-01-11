-- Create a table for public profiles
create table if not exists "public"."profiles" (
  "id" uuid references auth.users not null primary key,
  "username" text unique not null,
  "updated_at" timestamp with time zone,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security!
alter table "public"."profiles" enable row level security;

-- Allow public read access to profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Allow users to insert/update their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'user_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- BACKFILL for existing users (Run this manually if needed, or I'll include it in the logic)
-- This is a bit tricky from SQL editor since we can't iterate easily without a script.
-- But for the current user, they might need to sign in again or we handle it in the app.
