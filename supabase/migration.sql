-- ============================================================
-- MLC SCRIPTUM - Migration completa
-- Execute este SQL no Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── EXTENSOES ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TIPOS ENUM ───────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('admin', 'advogado', 'operador');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_status as enum ('ativo', 'inativo', 'pendente');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type modelo_categoria as enum ('contrato', 'peticao', 'procuracao', 'parecer', 'outros');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type modelo_status as enum ('sincronizado', 'pendente', 'erro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type documento_status as enum ('rascunho', 'em_revisao', 'finalizado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type atividade_tipo as enum ('criado', 'editado', 'utilizado', 'excluido', 'sincronizado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type atividade_origem as enum ('word', 'web');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type sync_status as enum ('sucesso', 'erro');
exception when duplicate_object then null;
end $$;

-- ─── TABELA: users ────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  email       text not null unique,
  role        user_role not null default 'operador',
  status      user_status not null default 'ativo',
  ultimo_acesso timestamptz,
  word_conectado boolean not null default false,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── TABELA: modelos ──────────────────────────────────────────
create table if not exists public.modelos (
  id           uuid primary key default uuid_generate_v4(),
  nome         text not null,
  categoria    modelo_categoria not null default 'outros',
  descricao    text,
  autor_id     uuid references public.users(id) on delete set null,
  autor_nome   text not null,
  status       modelo_status not null default 'pendente',
  blocos_count integer not null default 0,
  uso_count    integer not null default 0,
  ultima_edicao timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── TABELA: documentos ───────────────────────────────────────
create table if not exists public.documentos (
  id           uuid primary key default uuid_generate_v4(),
  nome         text not null,
  modelo_id    uuid references public.modelos(id) on delete set null,
  modelo_nome  text not null,
  cliente_nome text,
  autor_id     uuid references public.users(id) on delete set null,
  autor_nome   text not null,
  status       documento_status not null default 'rascunho',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── TABELA: atividades ───────────────────────────────────────
create table if not exists public.atividades (
  id             uuid primary key default uuid_generate_v4(),
  tipo           atividade_tipo not null,
  descricao      text not null,
  documento_nome text,
  modelo_nome    text,
  user_id        uuid references public.users(id) on delete set null,
  user_nome      text not null,
  origem         atividade_origem not null default 'web',
  created_at     timestamptz not null default now()
);

-- ─── TABELA: word_syncs ───────────────────────────────────────
create table if not exists public.word_syncs (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.users(id) on delete set null,
  documentos_count integer not null default 0,
  status           sync_status not null default 'sucesso',
  created_at       timestamptz not null default now()
);

-- ─── TRIGGER: updated_at automatico ───────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplica trigger em todas as tabelas com updated_at
do $$
declare
  t text;
begin
  for t in select unnest(array['users', 'modelos', 'documentos'])
  loop
    execute format('
      drop trigger if exists set_updated_at on public.%I;
      create trigger set_updated_at
        before update on public.%I
        for each row execute function public.handle_updated_at();
    ', t, t);
  end loop;
end $$;

-- ─── INDICES ──────────────────────────────────────────────────
create index if not exists idx_modelos_categoria on public.modelos(categoria);
create index if not exists idx_modelos_autor_id on public.modelos(autor_id);
create index if not exists idx_documentos_modelo_id on public.documentos(modelo_id);
create index if not exists idx_documentos_autor_id on public.documentos(autor_id);
create index if not exists idx_documentos_status on public.documentos(status);
create index if not exists idx_atividades_user_id on public.atividades(user_id);
create index if not exists idx_atividades_created_at on public.atividades(created_at desc);
create index if not exists idx_word_syncs_user_id on public.word_syncs(user_id);

-- ─── RLS (Row Level Security) ─────────────────────────────────
-- Habilita RLS em todas as tabelas
alter table public.users enable row level security;
alter table public.modelos enable row level security;
alter table public.documentos enable row level security;
alter table public.atividades enable row level security;
alter table public.word_syncs enable row level security;

-- Politicas: permite leitura e escrita para anon (plataforma interna)
-- Em producao, substituir por politicas baseadas em auth.uid()
do $$
declare
  t text;
begin
  for t in select unnest(array['users', 'modelos', 'documentos', 'atividades', 'word_syncs'])
  loop
    execute format('
      drop policy if exists "Allow full access" on public.%I;
      create policy "Allow full access" on public.%I
        for all
        using (true)
        with check (true);
    ', t, t);
  end loop;
end $$;

-- ─── DADOS INICIAIS (Seed) ───────────────────────────────────
-- Usuario admin padrao
insert into public.users (nome, email, role, status, word_conectado)
values
  ('Joao Delgado', 'joao@mlcadvogados.com', 'admin', 'ativo', true),
  ('Maria Santos', 'maria@mlcadvogados.com', 'advogado', 'ativo', true),
  ('Ana Costa', 'ana@mlcadvogados.com', 'advogado', 'ativo', false),
  ('Carlos Mendes', 'carlos@mlcadvogados.com', 'operador', 'ativo', false)
on conflict (email) do nothing;

-- Modelos de exemplo
insert into public.modelos (nome, categoria, descricao, autor_nome, status, blocos_count, uso_count, ultima_edicao)
values
  ('Contrato de Prestacao de Servicos', 'contrato', 'Modelo padrao para contratos de prestacao de servicos juridicos', 'Joao Delgado', 'sincronizado', 5, 23, now() - interval '2 hours'),
  ('Peticao Inicial Civel', 'peticao', 'Template para peticoes iniciais em acoes civeis', 'Maria Santos', 'sincronizado', 8, 45, now() - interval '1 day'),
  ('Procuracao Ad Judicia', 'procuracao', 'Modelo de procuracao para representacao judicial', 'Joao Delgado', 'sincronizado', 3, 67, now() - interval '3 days'),
  ('Parecer Juridico', 'parecer', 'Estrutura padrao para pareceres juridicos internos', 'Ana Costa', 'pendente', 6, 12, now() - interval '5 days'),
  ('Contrato de Honorarios', 'contrato', 'Modelo para contrato de honorarios advocaticios', 'Joao Delgado', 'sincronizado', 4, 31, now() - interval '1 week')
on conflict do nothing;

-- Documentos de exemplo (referenciando modelos)
insert into public.documentos (nome, modelo_nome, cliente_nome, autor_nome, status)
values
  ('Contrato - Empresa Alpha Ltda', 'Contrato de Prestacao de Servicos', 'Empresa Alpha Ltda', 'Joao Delgado', 'finalizado'),
  ('Peticao Inicial - Caso Silva', 'Peticao Inicial Civel', 'Jose Silva', 'Maria Santos', 'em_revisao'),
  ('Procuracao - Maria Oliveira', 'Procuracao Ad Judicia', 'Maria Oliveira', 'Joao Delgado', 'finalizado'),
  ('Parecer - Consultoria Tributaria', 'Parecer Juridico', 'Tech Solutions SA', 'Ana Costa', 'rascunho'),
  ('Contrato Honorarios - Caso Pereira', 'Contrato de Honorarios', 'Carlos Pereira', 'Joao Delgado', 'em_revisao')
on conflict do nothing;

-- Atividades de exemplo
insert into public.atividades (tipo, descricao, documento_nome, modelo_nome, user_nome, origem)
values
  ('criado', 'Documento criado a partir do modelo', 'Contrato - Empresa Alpha Ltda', 'Contrato de Prestacao de Servicos', 'Joao Delgado', 'word'),
  ('editado', 'Documento editado no Word', 'Peticao Inicial - Caso Silva', 'Peticao Inicial Civel', 'Maria Santos', 'word'),
  ('utilizado', 'Modelo utilizado para gerar documento', null, 'Procuracao Ad Judicia', 'Joao Delgado', 'web'),
  ('criado', 'Novo modelo criado', null, 'Parecer Juridico', 'Ana Costa', 'web'),
  ('sincronizado', 'Documentos sincronizados via plugin', 'Contrato Honorarios - Caso Pereira', null, 'Joao Delgado', 'word'),
  ('editado', 'Modelo atualizado com novos blocos', null, 'Contrato de Prestacao de Servicos', 'Joao Delgado', 'web')
on conflict do nothing;

-- Sincronizacoes Word de exemplo
insert into public.word_syncs (documentos_count, status)
values
  (3, 'sucesso'),
  (1, 'sucesso'),
  (5, 'sucesso'),
  (2, 'sucesso')
on conflict do nothing;
