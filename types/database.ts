export type MaterialType = 'apunte' | 'texto' | 'pdf' | 'enlace' | 'documento';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  unit_order: number;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  type: MaterialType;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  unit_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

/** Test con sus preguntas y alternativas anidadas, tal como se consulta para "Realizar test" */
export interface TestWithQuestions extends Test {
  questions: (Question & { options: QuestionOption[] })[];
}

/** Estadísticas agregadas mostradas en el Dashboard (sección 9) */
export interface DashboardStats {
  subjectsCount: number;
  unitsCount: number;
  materialsCount: number;
  testsCount: number;
  averageScore: number;
}

/** Progreso por asignatura (sección 17) */
export interface SubjectProgress {
  subject: Subject;
  unitsCount: number;
  testsCompleted: number;
  averagePercentage: number;
}

/**
 * Esquema completo de la base de datos, tipado para el cliente de Supabase
 * (@supabase/supabase-js createClient<Database>()).
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string; email: string };
        Update: Partial<Profile>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Subject, 'id' | 'user_id'>>;
      };
      units: {
        Row: Unit;
        Insert: Omit<Unit, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Unit, 'id' | 'subject_id'>>;
      };
      materials: {
        Row: Material;
        Insert: Omit<Material, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Material, 'id' | 'unit_id'>>;
      };
      summaries: {
        Row: Summary;
        Insert: Omit<Summary, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Summary, 'id' | 'unit_id'>>;
      };
      tests: {
        Row: Test;
        Insert: Omit<Test, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Test, 'id' | 'unit_id'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Question, 'id' | 'test_id'>>;
      };
      options: {
        Row: QuestionOption;
        Insert: Omit<QuestionOption, 'id'> & { id?: string };
        Update: Partial<Omit<QuestionOption, 'id' | 'question_id'>>;
      };
      test_attempts: {
        Row: TestAttempt;
        Insert: Omit<TestAttempt, 'id' | 'completed_at'> & { id?: string; completed_at?: string };
        Update: never;
      };
    };
  };
}
