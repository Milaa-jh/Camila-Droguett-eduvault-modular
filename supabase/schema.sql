-- ============================================================
-- EduVault Modular — Esquema de base de datos
-- Ejecutar en: Supabase SQL Editor
-- Jerarquía: profiles -> subjects -> units -> materials / summaries / tests -> questions -> options
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- profiles (1:1 con auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- subjects (asignaturas)
-- ------------------------------------------------------------
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  code text,
  description text,
  color text default '#3466ff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subjects_user_id on public.subjects(user_id);

-- ------------------------------------------------------------
-- units (unidades)
-- ------------------------------------------------------------
create table if not exists public.units (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  description text,
  unit_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_units_subject_id on public.units(subject_id);

-- ------------------------------------------------------------
-- materials (material de estudio)
-- ------------------------------------------------------------
create table if not exists public.materials (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('apunte', 'texto', 'pdf', 'enlace', 'documento')),
  file_url text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_materials_unit_id on public.materials(unit_id);

-- ------------------------------------------------------------
-- summaries (resúmenes)
-- ------------------------------------------------------------
create table if not exists public.summaries (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_summaries_unit_id on public.summaries(unit_id);

-- ------------------------------------------------------------
-- tests
-- ------------------------------------------------------------
create table if not exists public.tests (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tests_unit_id on public.tests(unit_id);

-- ------------------------------------------------------------
-- questions (preguntas)
-- ------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid not null references public.tests(id) on delete cascade,
  question_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_questions_test_id on public.questions(test_id);

-- ------------------------------------------------------------
-- options (alternativas)
-- ------------------------------------------------------------
create table if not exists public.options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false
);
create index if not exists idx_options_question_id on public.options(question_id);

-- ------------------------------------------------------------
-- test_attempts (intentos / resultados)
-- ------------------------------------------------------------
create table if not exists public.test_attempts (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid not null references public.tests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  percentage numeric(5,2) not null,
  completed_at timestamptz not null default now()
);
create index if not exists idx_test_attempts_user_id on public.test_attempts(user_id);
create index if not exists idx_test_attempts_test_id on public.test_attempts(test_id);

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Trigger genérico: actualizar updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.subjects;
create trigger set_updated_at before update on public.subjects
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.units;
create trigger set_updated_at before update on public.units
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.materials;
create trigger set_updated_at before update on public.materials
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.summaries;
create trigger set_updated_at before update on public.summaries
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.tests;
create trigger set_updated_at before update on public.tests
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.questions;
create trigger set_updated_at before update on public.questions
  for each row execute procedure public.set_updated_at();
