-- DiCampos Studio · Portal Imobiliário
-- Execute este arquivo no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  brand_name text not null,
  initials text,
  creci text,
  whatsapp text,
  email text,
  city text default 'Recife',
  region text,
  bio text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  title text not null,
  purpose text not null check (purpose in ('Venda','Aluguel')),
  property_type text not null,
  status text not null default 'Disponível' check (status in ('Disponível','Reservado','Vendido','Alugado')),
  neighborhood text not null,
  city text not null default 'Recife',
  price numeric(14,2) not null default 0 check (price >= 0),
  area numeric(10,2) not null default 0 check (area >= 0),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  suites integer not null default 0 check (suites >= 0),
  parking_spaces integer not null default 0 check (parking_spaces >= 0),
  condo_fee numeric(12,2) not null default 0 check (condo_fee >= 0),
  iptu numeric(12,2) not null default 0 check (iptu >= 0),
  description text,
  features text[] not null default '{}',
  cover_url text,
  image_urls text[] not null default '{}',
  is_featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (broker_id, code)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  lead_type text not null default 'owner' check (lead_type in ('owner','buyer')),
  name text,
  phone text,
  email text,
  message text,
  source text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  broker_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  event_name text not null,
  source text,
  page_path text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.selections (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  client_name text,
  property_ids uuid[] not null default '{}',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_properties_broker on public.properties(broker_id);
create index if not exists idx_properties_public on public.properties(broker_id, published, status);
create index if not exists idx_properties_neighborhood on public.properties(neighborhood);
create index if not exists idx_leads_broker_created on public.leads(broker_id, created_at desc);
create index if not exists idx_events_broker_created on public.events(broker_id, created_at desc);
create index if not exists idx_events_property on public.events(property_id, event_name);
create index if not exists idx_selections_broker on public.selections(broker_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.events enable row level security;
alter table public.selections enable row level security;

-- Perfis: público lê perfis ativos; dono edita o próprio perfil.
drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable" on public.profiles for select using (active = true or auth.uid() = id);
drop policy if exists "Owners update own profile" on public.profiles;
create policy "Owners update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Imóveis: público lê apenas publicados; corretor gerencia somente os próprios.
drop policy if exists "Public reads published properties" on public.properties;
create policy "Public reads published properties" on public.properties for select using (published = true or broker_id = auth.uid());
drop policy if exists "Owners insert properties" on public.properties;
create policy "Owners insert properties" on public.properties for insert with check (broker_id = auth.uid());
drop policy if exists "Owners update properties" on public.properties;
create policy "Owners update properties" on public.properties for update using (broker_id = auth.uid()) with check (broker_id = auth.uid());
drop policy if exists "Owners delete properties" on public.properties;
create policy "Owners delete properties" on public.properties for delete using (broker_id = auth.uid());

-- Leads: qualquer visitante pode enviar para um corretor ativo; apenas o corretor destinatário pode ler/alterar/excluir.
drop policy if exists "Visitors create leads" on public.leads;
create policy "Visitors create leads" on public.leads for insert with check (exists (select 1 from public.profiles p where p.id = broker_id and p.active = true));
drop policy if exists "Owners read leads" on public.leads;
create policy "Owners read leads" on public.leads for select using (broker_id = auth.uid());
drop policy if exists "Owners update leads" on public.leads;
create policy "Owners update leads" on public.leads for update using (broker_id = auth.uid()) with check (broker_id = auth.uid());
drop policy if exists "Owners delete leads" on public.leads;
create policy "Owners delete leads" on public.leads for delete using (broker_id = auth.uid());

-- Eventos: visitantes podem registrar eventos para um corretor ativo; somente o corretor lê.
drop policy if exists "Visitors create events" on public.events;
create policy "Visitors create events" on public.events for insert with check (exists (select 1 from public.profiles p where p.id = broker_id and p.active = true));
drop policy if exists "Owners read events" on public.events;
create policy "Owners read events" on public.events for select using (broker_id = auth.uid());

-- Seleções: somente o corretor administra. A leitura pública acontece exclusivamente pela função segura abaixo.
drop policy if exists "Owners manage selections" on public.selections;
create policy "Owners manage selections" on public.selections for all using (broker_id = auth.uid()) with check (broker_id = auth.uid());

create or replace function public.get_public_selection(p_token text)
returns table(token text, client_name text, property_ids uuid[])
language sql
security definer
set search_path = public
as $$
  select s.token, s.client_name, s.property_ids
  from public.selections s
  where s.token = p_token
    and (s.expires_at is null or s.expires_at > now())
  limit 1;
$$;
revoke all on function public.get_public_selection(text) from public;
grant execute on function public.get_public_selection(text) to anon, authenticated;

-- Storage das fotos dos imóveis.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads property images" on storage.objects;
create policy "Public reads property images" on storage.objects for select using (bucket_id = 'property-images');
drop policy if exists "Owners upload property images" on storage.objects;
create policy "Owners upload property images" on storage.objects for insert to authenticated with check (bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Owners update property images" on storage.objects;
create policy "Owners update property images" on storage.objects for update to authenticated using (bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Owners delete property images" on storage.objects;
create policy "Owners delete property images" on storage.objects for delete to authenticated using (bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text);
