-- Ejecutar una vez en SQL Editor del proyecto Supabase personal.
-- Crear tu usuario en Authentication > Users y desactivar nuevos registros públicos.

create table if not exists public.bills (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 100),
  due_day smallint not null check (due_day between 1 and 31),
  category text not null,
  expected_cents bigint check (expected_cents > 0)
);

create table if not exists public.movements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  title text not null check (length(trim(title)) between 1 and 100),
  category text not null,
  amount_cents bigint not null check (amount_cents > 0),
  occurred_on date not null,
  essential boolean not null default false,
  bill_id uuid references public.bills(id) on delete set null
);

create index if not exists movements_user_date_idx on public.movements (user_id, occurred_on desc);
create index if not exists bills_user_due_idx on public.bills (user_id, due_day);

alter table public.bills enable row level security;
alter table public.movements enable row level security;

revoke all on public.bills, public.movements from anon;
grant select, insert, update, delete on public.bills, public.movements to authenticated;

create policy "Own bills select" on public.bills for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Own bills insert" on public.bills for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Own bills update" on public.bills for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own bills delete" on public.bills for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Own movements select" on public.movements for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Own movements insert" on public.movements for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Own movements update" on public.movements for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own movements delete" on public.movements for delete to authenticated
using ((select auth.uid()) = user_id);
