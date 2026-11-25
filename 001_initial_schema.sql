-- MonsterBit initial schema.
-- Run in Supabase SQL Editor or apply with Supabase CLI.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 20),
  trainer_level integer not null default 1 check (trainer_level >= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.monsters (
  id text primary key,
  name text not null,
  element text not null,
  description text not null default '',
  base_hp integer not null default 20 check (base_hp > 0),
  base_attack integer not null default 5 check (base_attack > 0)
);

create table if not exists public.player_monsters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  monster_id text not null references public.monsters(id),
  nickname text,
  level integer not null default 1 check (level between 1 and 100),
  experience integer not null default 0 check (experience >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id text primary key,
  name text not null,
  description text not null default '',
  item_type text not null
);

create table if not exists public.player_inventory (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null references public.items(id),
  quantity integer not null default 0 check (quantity >= 0),
  primary key (owner_id, item_id)
);

create table if not exists public.player_locations (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  map_id text not null default 'verdantia_outskirts',
  x numeric not null default 360,
  y numeric not null default 300,
  updated_at timestamptz not null default now()
);

create table if not exists public.quests (
  id text primary key,
  title text not null,
  description text not null default '',
  reward_xp integer not null default 0 check (reward_xp >= 0)
);

create table if not exists public.player_quests (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  quest_id text not null references public.quests(id),
  status text not null default 'available' check (status in ('available','active','completed')),
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, quest_id)
);

alter table public.profiles enable row level security;
alter table public.monsters enable row level security;
alter table public.player_monsters enable row level security;
alter table public.items enable row level security;
alter table public.player_inventory enable row level security;
alter table public.player_locations enable row level security;
alter table public.quests enable row level security;
alter table public.player_quests enable row level security;

create policy "Profiles are readable by authenticated users"
on public.profiles for select to authenticated using (true);
create policy "Users can create their own profile"
on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their own profile"
on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Monster catalog is readable"
on public.monsters for select to authenticated using (true);
create policy "Item catalog is readable"
on public.items for select to authenticated using (true);
create policy "Quest catalog is readable"
on public.quests for select to authenticated using (true);

create policy "Players can read their creatures"
on public.player_monsters for select to authenticated using (auth.uid() = owner_id);
create policy "Players can read their inventory"
on public.player_inventory for select to authenticated using (auth.uid() = owner_id);
create policy "Players can read their location"
on public.player_locations for select to authenticated using (auth.uid() = owner_id);
create policy "Players can read their quest progress"
on public.player_quests for select to authenticated using (auth.uid() = owner_id);

-- Important: no client insert/update policies for creature ownership, inventory,
-- currency, rewards, or quest completion yet. Add trusted server-side operations
-- before enabling those gameplay actions.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  chosen_name text;
begin
  chosen_name := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'Trainer' || substr(new.id::text, 1, 6));
  insert into public.profiles (id, username)
  values (new.id, chosen_name)
  on conflict (id) do nothing;
  insert into public.player_locations (owner_id) values (new.id)
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.monsters (id,name,element,description,base_hp,base_attack) values
('MB001','Emberling','Fire','A curious spark creature that loves warm places.',24,8),
('MB002','Brookit','Water','A playful stream-dweller with a gentle nature.',28,6),
('MB003','Mossprout','Nature','A tiny guardian that grows wherever life blooms.',30,5),
('MB004','Voltkit','Electric','A quick-footed creature charged with static energy.',22,9)
on conflict (id) do nothing;

insert into public.items (id,name,description,item_type) values
('capture_pod','Capture Pod','A basic device for attempting to befriend wild creatures.','capture'),
('small_tonic','Small Tonic','A small restorative item.','healing')
on conflict (id) do nothing;
