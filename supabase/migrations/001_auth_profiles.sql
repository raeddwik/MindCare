create type public.app_role as enum (
  'patient',
  'therapist',
  'admin'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'patient',
  timezone text not null default 'Africa/Cairo',
  preferred_language text not null default 'ar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx
  on public.profiles(role);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
