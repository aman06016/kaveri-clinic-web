create extension if not exists "pgcrypto";

create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references public.slots(id) on delete set null,
  patient_name text not null,
  patient_phone text not null,
  service_name text not null,
  booking_status text not null default 'confirmed',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.slots enable row level security;
alter table public.bookings enable row level security;

create policy "Allow read slots"
on public.slots
for select
using (true);

create policy "Allow insert bookings"
on public.bookings
for insert
with check (true);
