-- Boushra Services Textile Beauté — Supabase schema.
-- Tables, Row Level Security, the order-pricing trigger and the storage buckets.
-- Safe to re-run. Normally applied by `npm run setup:supabase`; can also be pasted into
-- SQL Editor -> New query -> Run (then seed.sql and cron.sql, see README).

-- =========================================================
-- 0. ADMINS
-- Being signed in is NOT enough to manage the shop: the user must also be listed here.
-- Add an admin after creating their login in Authentication -> Users:
--   insert into admins (user_id) select id from auth.users where email = 'admin@exemple.com';
-- =========================================================
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

drop policy if exists "Admins can see their own row" on admins;
create policy "Admins can see their own row"
  on admins for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- =========================================================
-- 1. PRODUCTS
-- =========================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique,
  category text not null,
  price integer not null check (price >= 0),          -- FCFA, no decimals
  description text,
  options text[] not null default '{}',               -- sizes / models the shopper picks from
  featured boolean not null default false,
  sold boolean not null default false,                -- "Épuisé"
  images text[] not null default '{}',                -- first image = main picture
  created_at timestamptz not null default now()
);

-- English version of the site: optional overrides, French is used when empty.
alter table products add column if not exists name_en text check (char_length(name_en) <= 120);
alter table products add column if not exists description_en text;

alter table products enable row level security;

drop policy if exists "Products are publicly readable" on products;
create policy "Products are publicly readable"
  on products for select
  using (true);

drop policy if exists "Admins can insert products" on products;
create policy "Admins can insert products"
  on products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update products" on products;
create policy "Admins can update products"
  on products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on products;
create policy "Admins can delete products"
  on products for delete
  to authenticated
  using (public.is_admin());

-- =========================================================
-- 2. ORDERS
-- =========================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer jsonb not null,            -- { name, phone, zone, address, city, notes }
  items jsonb not null,               -- [{ productId, slug, name, price, qty, option, image }]
  subtotal integer not null default 0,
  shipping integer not null default 0,
  total integer not null default 0,
  payment_method text not null default 'cod'
    check (payment_method in ('cod', 'transfer')),
  payment_status text not null default 'cod'
    check (payment_status in ('cod', 'awaiting_verification', 'verified', 'rejected')),
  payment_proof_path text unique,     -- object in the private payment-proofs bucket
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

drop policy if exists "Anyone can place an order" on orders;
create policy "Anyone can place an order"
  on orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can view orders" on orders;
create policy "Admins can view orders"
  on orders for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update orders" on orders;
create policy "Admins can update orders"
  on orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete orders" on orders;
create policy "Admins can delete orders"
  on orders for delete
  to authenticated
  using (public.is_admin());

-- Never trust totals from the browser: rebuild every line from the products table,
-- apply the delivery fee for the zone, and force the initial statuses.
-- Delivery fees must match DELIVERY_ZONES in src/config/site.js.
create or replace function public.prepare_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  p record;
  qty int;
  clean_items jsonb := '[]'::jsonb;
  sub integer := 0;
  zone text := coalesce(new.customer ->> 'zone', 'senegal');
begin
  if jsonb_typeof(new.items) is distinct from 'array' or jsonb_array_length(new.items) = 0 then
    raise exception 'La commande est vide';
  end if;
  if jsonb_array_length(new.items) > 30 then
    raise exception 'Trop d''articles dans la commande';
  end if;
  if coalesce(trim(new.customer ->> 'name'), '') = '' or coalesce(trim(new.customer ->> 'phone'), '') = '' then
    raise exception 'Nom et téléphone obligatoires';
  end if;

  for item in select value from jsonb_array_elements(new.items) loop
    qty := nullif(item ->> 'qty', '')::int;
    if qty is null or qty < 1 or qty > 20 then
      raise exception 'Quantité invalide';
    end if;

    select id, name, slug, price, sold, images into p
    from products where id::text = item ->> 'productId';
    if not found then
      raise exception 'Produit introuvable';
    end if;
    if p.sold then
      raise exception 'Produit épuisé : %', p.name;
    end if;

    sub := sub + p.price * qty;
    clean_items := clean_items || jsonb_build_object(
      'productId', p.id,
      'slug', p.slug,
      'name', p.name,
      'price', p.price,
      'qty', qty,
      'option', nullif(left(item ->> 'option', 60), ''),
      'image', p.images[1]
    );
  end loop;

  if zone not in ('retrait', 'mbour', 'senegal') then
    zone := 'senegal';
  end if;

  new.items := clean_items;
  new.customer := jsonb_build_object(
    'name', left(trim(new.customer ->> 'name'), 80),
    'phone', left(trim(new.customer ->> 'phone'), 30),
    'zone', zone,
    'address', left(coalesce(new.customer ->> 'address', ''), 200),
    'city', left(coalesce(new.customer ->> 'city', ''), 60),
    'notes', left(coalesce(new.customer ->> 'notes', ''), 500)
  );
  new.subtotal := sub;
  new.shipping := case zone when 'retrait' then 0 when 'mbour' then 1000 else 2500 end;
  new.total := sub + new.shipping;
  new.status := 'pending';
  new.created_at := now();

  if new.payment_method = 'transfer' then
    if new.payment_proof_path is null or not exists (
      select 1 from storage.objects
      where bucket_id = 'payment-proofs' and name = new.payment_proof_path
    ) then
      raise exception 'Reçu de paiement manquant';
    end if;
    new.payment_status := 'awaiting_verification';
  else
    new.payment_method := 'cod';
    new.payment_proof_path := null;
    new.payment_status := 'cod';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_prepare on orders;
create trigger orders_prepare
  before insert on orders
  for each row execute function public.prepare_order();

-- =========================================================
-- 3. REVIEWS
-- =========================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 60),
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 3 and 1000),
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on reviews;
create policy "Reviews are publicly readable"
  on reviews for select
  using (true);

drop policy if exists "Anyone can leave a review" on reviews;
create policy "Anyone can leave a review"
  on reviews for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can delete reviews" on reviews;
create policy "Admins can delete reviews"
  on reviews for delete
  to authenticated
  using (public.is_admin());

-- =========================================================
-- 4. CONTACT MESSAGES
-- =========================================================
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  phone text check (char_length(phone) <= 30),
  email text check (char_length(email) <= 120),
  message text not null check (char_length(trim(message)) between 3 and 2000),
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

drop policy if exists "Anyone can send a message" on messages;
create policy "Anyone can send a message"
  on messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read messages" on messages;
create policy "Admins can read messages"
  on messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can delete messages" on messages;
create policy "Admins can delete messages"
  on messages for delete
  to authenticated
  using (public.is_admin());

-- =========================================================
-- 5. STORAGE
-- products: public (product photos). payment-proofs: PRIVATE (customer receipts) —
-- shoppers can upload but never read or list; only admins can view them.
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('payment-proofs', 'payment-proofs', false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do nothing;

drop policy if exists "Admins can list product images" on storage.objects;
create policy "Admins can list product images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Anyone can upload a payment receipt" on storage.objects;
create policy "Anyone can upload a payment receipt"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'payment-proofs');

drop policy if exists "Admins can view payment receipts" on storage.objects;
create policy "Admins can view payment receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

drop policy if exists "Admins can delete payment receipts" on storage.objects;
create policy "Admins can delete payment receipts"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

-- =========================================================
-- 6. INDEXES
-- =========================================================
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_featured on products (featured) where featured;
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_orders_proof_created on orders (created_at) where payment_proof_path is not null;
create index if not exists idx_reviews_product_id on reviews (product_id);

-- Make the REST API pick up new columns immediately.
notify pgrst, 'reload schema';
