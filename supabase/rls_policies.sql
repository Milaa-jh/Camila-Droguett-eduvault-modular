-- ============================================================
-- EduVault Modular — Row Level Security (RLS)
-- Regla principal: un estudiante solo puede ver/modificar sus propios datos.
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.materials enable row level security;
alter table public.summaries enable row level security;
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.test_attempts enable row level security;

-- ------------------------------------------------------------
-- profiles: cada usuario solo ve y edita su propio perfil
-- ------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- (el insert lo hace el trigger handle_new_user con security definer)

-- ------------------------------------------------------------
-- subjects: propiedad directa vía user_id
-- ------------------------------------------------------------
create policy "subjects_select_own" on public.subjects
  for select using (auth.uid() = user_id);

create policy "subjects_insert_own" on public.subjects
  for insert with check (auth.uid() = user_id);

create policy "subjects_update_own" on public.subjects
  for update using (auth.uid() = user_id);

create policy "subjects_delete_own" on public.subjects
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- units: propiedad heredada vía subjects.user_id
-- ------------------------------------------------------------
create policy "units_select_own" on public.units
  for select using (
    exists (select 1 from public.subjects s where s.id = units.subject_id and s.user_id = auth.uid())
  );

create policy "units_insert_own" on public.units
  for insert with check (
    exists (select 1 from public.subjects s where s.id = units.subject_id and s.user_id = auth.uid())
  );

create policy "units_update_own" on public.units
  for update using (
    exists (select 1 from public.subjects s where s.id = units.subject_id and s.user_id = auth.uid())
  );

create policy "units_delete_own" on public.units
  for delete using (
    exists (select 1 from public.subjects s where s.id = units.subject_id and s.user_id = auth.uid())
  );

-- ------------------------------------------------------------
-- materials: propiedad heredada vía units -> subjects
-- ------------------------------------------------------------
create policy "materials_select_own" on public.materials
  for select using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = materials.unit_id and s.user_id = auth.uid()
    )
  );

create policy "materials_insert_own" on public.materials
  for insert with check (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = materials.unit_id and s.user_id = auth.uid()
    )
  );

create policy "materials_update_own" on public.materials
  for update using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = materials.unit_id and s.user_id = auth.uid()
    )
  );

create policy "materials_delete_own" on public.materials
  for delete using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = materials.unit_id and s.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- summaries: propiedad heredada vía units -> subjects
-- ------------------------------------------------------------
create policy "summaries_select_own" on public.summaries
  for select using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = summaries.unit_id and s.user_id = auth.uid()
    )
  );

create policy "summaries_insert_own" on public.summaries
  for insert with check (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = summaries.unit_id and s.user_id = auth.uid()
    )
  );

create policy "summaries_update_own" on public.summaries
  for update using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = summaries.unit_id and s.user_id = auth.uid()
    )
  );

create policy "summaries_delete_own" on public.summaries
  for delete using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = summaries.unit_id and s.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- tests: propiedad heredada vía units -> subjects
-- ------------------------------------------------------------
create policy "tests_select_own" on public.tests
  for select using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = tests.unit_id and s.user_id = auth.uid()
    )
  );

create policy "tests_insert_own" on public.tests
  for insert with check (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = tests.unit_id and s.user_id = auth.uid()
    )
  );

create policy "tests_update_own" on public.tests
  for update using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = tests.unit_id and s.user_id = auth.uid()
    )
  );

create policy "tests_delete_own" on public.tests
  for delete using (
    exists (
      select 1 from public.units u
      join public.subjects s on s.id = u.subject_id
      where u.id = tests.unit_id and s.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- questions: propiedad heredada vía tests -> units -> subjects
-- ------------------------------------------------------------
create policy "questions_select_own" on public.questions
  for select using (
    exists (
      select 1 from public.tests t
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where t.id = questions.test_id and s.user_id = auth.uid()
    )
  );

create policy "questions_insert_own" on public.questions
  for insert with check (
    exists (
      select 1 from public.tests t
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where t.id = questions.test_id and s.user_id = auth.uid()
    )
  );

create policy "questions_update_own" on public.questions
  for update using (
    exists (
      select 1 from public.tests t
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where t.id = questions.test_id and s.user_id = auth.uid()
    )
  );

create policy "questions_delete_own" on public.questions
  for delete using (
    exists (
      select 1 from public.tests t
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where t.id = questions.test_id and s.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- options: propiedad heredada vía questions -> tests -> units -> subjects
-- ------------------------------------------------------------
create policy "options_select_own" on public.options
  for select using (
    exists (
      select 1 from public.questions q
      join public.tests t on t.id = q.test_id
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where q.id = options.question_id and s.user_id = auth.uid()
    )
  );

create policy "options_insert_own" on public.options
  for insert with check (
    exists (
      select 1 from public.questions q
      join public.tests t on t.id = q.test_id
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where q.id = options.question_id and s.user_id = auth.uid()
    )
  );

create policy "options_update_own" on public.options
  for update using (
    exists (
      select 1 from public.questions q
      join public.tests t on t.id = q.test_id
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where q.id = options.question_id and s.user_id = auth.uid()
    )
  );

create policy "options_delete_own" on public.options
  for delete using (
    exists (
      select 1 from public.questions q
      join public.tests t on t.id = q.test_id
      join public.units u on u.id = t.unit_id
      join public.subjects s on s.id = u.subject_id
      where q.id = options.question_id and s.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- test_attempts: propiedad directa vía user_id
-- ------------------------------------------------------------
create policy "attempts_select_own" on public.test_attempts
  for select using (auth.uid() = user_id);

create policy "attempts_insert_own" on public.test_attempts
  for insert with check (auth.uid() = user_id);

-- No se permite update/delete de intentos: son un registro histórico inmutable.
