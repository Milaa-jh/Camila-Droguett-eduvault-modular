-- ============================================================
-- EduVault Modular — Datos de prueba
-- IMPORTANTE: primero crea un usuario real vía Supabase Auth
-- (registro normal en /register), luego reemplaza
-- 'REEMPLAZA_CON_USER_ID' por el UUID de ese usuario
-- (lo encuentras en Authentication > Users en el dashboard de Supabase).
-- ============================================================

do $$
declare
  v_user_id uuid := 'REEMPLAZA_CON_USER_ID';
  v_subject_mineria uuid;
  v_subject_web uuid;
  v_subject_bd uuid;
  v_subject_ing uuid;
  v_unit1 uuid;
  v_unit2 uuid;
  v_unit3 uuid;
  v_test1 uuid;
  v_q1 uuid;
  v_q2 uuid;
begin
  -- Asignaturas
  insert into public.subjects (user_id, name, code, description, color)
  values (v_user_id, 'Minería de Datos', 'BLY7121', 'Análisis de datos y modelos predictivos.', '#3466ff')
  returning id into v_subject_mineria;

  insert into public.subjects (user_id, name, code, description, color)
  values (v_user_id, 'Programación Web', 'INF201', 'Desarrollo de aplicaciones web modernas.', '#22c55e')
  returning id into v_subject_web;

  insert into public.subjects (user_id, name, code, description, color)
  values (v_user_id, 'Base de Datos', 'INF150', 'Modelado y administración de bases de datos.', '#f59e0b')
  returning id into v_subject_bd;

  insert into public.subjects (user_id, name, code, description, color)
  values (v_user_id, 'Ingeniería de Software', 'INF310', 'Procesos y metodologías de desarrollo.', '#a855f7')
  returning id into v_subject_ing;

  -- Unidades de Minería de Datos
  insert into public.units (subject_id, name, description, unit_order)
  values (v_subject_mineria, 'Introducción', 'Conceptos fundamentales de minería de datos.', 1)
  returning id into v_unit1;

  insert into public.units (subject_id, name, description, unit_order)
  values (v_subject_mineria, 'Preparación de datos', 'Limpieza y transformación de datos.', 2)
  returning id into v_unit2;

  insert into public.units (subject_id, name, description, unit_order)
  values (v_subject_mineria, 'Análisis exploratorio', 'Técnicas de EDA.', 3)
  returning id into v_unit3;

  insert into public.units (subject_id, name, description, unit_order)
  values (v_subject_mineria, 'Modelos predictivos', 'Regresión y clasificación.', 4);

  insert into public.units (subject_id, name, description, unit_order)
  values (v_subject_mineria, 'Clustering', 'Agrupamiento de datos.', 5);

  -- Material de ejemplo
  insert into public.materials (unit_id, title, description, type, external_url)
  values (v_unit1, 'Apuntes de introducción', 'Resumen de la primera clase.', 'apunte', null);

  insert into public.materials (unit_id, title, description, type, external_url)
  values (v_unit3, 'Guía de EDA en Python', 'Recursos externos sobre pandas y matplotlib.', 'enlace', 'https://pandas.pydata.org/docs/');

  -- Resumen de ejemplo
  insert into public.summaries (unit_id, title, content)
  values (v_unit3, 'Resumen — Análisis exploratorio',
    'El análisis exploratorio de datos (EDA) permite identificar patrones, valores atípicos y relaciones entre variables antes de construir modelos.');

  -- Test de ejemplo (Unidad 3)
  insert into public.tests (unit_id, title, description)
  values (v_unit3, 'Test — Unidad 3: Análisis Exploratorio', 'Autoevaluación sobre EDA.')
  returning id into v_test1;

  insert into public.questions (test_id, question_text)
  values (v_test1, '¿Cuál es el objetivo del análisis exploratorio?')
  returning id into v_q1;

  insert into public.options (question_id, option_text, is_correct) values
    (v_q1, 'Eliminar todos los datos', false),
    (v_q1, 'Encontrar patrones en los datos', true),
    (v_q1, 'Crear usuarios', false),
    (v_q1, 'Crear una base de datos', false);

  insert into public.questions (test_id, question_text)
  values (v_test1, '¿Qué algoritmo permite agrupar datos?')
  returning id into v_q2;

  insert into public.options (question_id, option_text, is_correct) values
    (v_q2, 'Regresión Lineal', false),
    (v_q2, 'K-Means', true),
    (v_q2, 'Naive Bayes', false),
    (v_q2, 'SVM', false);

  -- Un intento de test ya resuelto (para poblar Dashboard/Progreso)
  insert into public.test_attempts (test_id, user_id, score, total_questions, percentage)
  values (v_test1, v_user_id, 8, 10, 80.00);

end $$;
