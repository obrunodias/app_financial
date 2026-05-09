-- Criar tabela de transações
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(12, 2) check (amount > 0) not null,
  description text not null,
  category text not null,
  date date not null,
  created_at timestamptz default now() not null
);

-- Habilitar Row Level Security
alter table public.transactions enable row level security;

-- Políticas RLS: cada usuário vê e gerencia apenas suas próprias transações
create policy "Usuário lê suas transações"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Usuário cria suas transações"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza suas transações"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Usuário exclui suas transações"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Índices para performance
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date desc);
