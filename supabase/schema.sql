-- Create the 'receipts' table if it doesn't exist
create table if not exists receipts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  url text not null,
  type text not null, /* 'image', 'pdf' */
  date timestamptz not null default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table receipts enable row level security;

-- Create policies for 'receipts'
create policy "Users can insert their own receipts"
  on receipts for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own receipts"
  on receipts for select
  using (auth.uid() = user_id);

-- Create a storage bucket for 'proofs'
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload proofs"
  on storage.objects for insert
  with check ( bucket_id = 'proofs' and auth.role() = 'authenticated' );

create policy "Everyone can view proofs"
  on storage.objects for select
  using ( bucket_id = 'proofs' );
