-- ============================================================
-- Budget Tracker App - Schema SQL
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users de Supabase con datos del perfil
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  currency      CHAR(3)   NOT NULL DEFAULT 'USD',
  timezone      TEXT      NOT NULL DEFAULT 'UTC',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_id ON public.profiles(id);

-- Trigger: auto-crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA: categories
-- Categorías de gastos (sistema + personalizadas por usuario)
-- ============================================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  icon        TEXT,
  color       CHAR(7) NOT NULL DEFAULT '#6366F1',
  type        TEXT    NOT NULL CHECK (type IN ('expense', 'income', 'both')),
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- Categorías del sistema (seed)
INSERT INTO public.categories (name, icon, color, type, is_system) VALUES
  ('SaaS / Software',  'cloud',       '#6366F1', 'expense', TRUE),
  ('IA / LLMs',        'cpu',         '#8B5CF6', 'expense', TRUE),
  ('APIs',             'code',        '#3B82F6', 'expense', TRUE),
  ('Hosting',          'server',      '#14B8A6', 'expense', TRUE),
  ('Dominio',          'globe',       '#10B981', 'expense', TRUE),
  ('Educación',        'book-open',   '#F59E0B', 'expense', TRUE),
  ('Freelance',        'briefcase',   '#22C55E', 'income',  TRUE),
  ('Salario',          'banknote',    '#16A34A', 'income',  TRUE),
  ('Otro gasto',       'circle',      '#6B7280', 'expense', TRUE),
  ('Otro ingreso',     'circle',      '#6B7280', 'income',  TRUE);

-- ============================================================
-- TABLA: transactions
-- Registro unificado de gastos e ingresos
-- ============================================================
CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.categories(id),
  type            TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount          NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  description     TEXT,
  notes           TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring    BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_id UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id    ON public.transactions(user_id);
CREATE INDEX idx_transactions_date       ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type       ON public.transactions(type);
CREATE INDEX idx_transactions_category   ON public.transactions(category_id);

-- ============================================================
-- TABLA: subscriptions
-- Suscripciones activas (SaaS, APIs, herramientas)
-- ============================================================
CREATE TABLE public.subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id       UUID NOT NULL REFERENCES public.categories(id),
  name              TEXT NOT NULL,
  description       TEXT,
  amount            NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  billing_cycle     TEXT NOT NULL CHECK (billing_cycle IN ('daily','weekly','monthly','quarterly','yearly')),
  billing_day       SMALLINT CHECK (billing_day BETWEEN 1 AND 31),
  start_date        DATE NOT NULL,
  end_date          DATE,
  next_billing_date DATE,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  url               TEXT,
  logo_url          TEXT,
  alert_days_before SMALLINT NOT NULL DEFAULT 3,
  auto_renews       BOOLEAN NOT NULL DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id    ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status     ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_next_date  ON public.subscriptions(next_billing_date);

-- FK de transactions → subscriptions
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transaction_subscription
  FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;

-- profiles: solo el propio usuario
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- categories: ver las del sistema (user_id IS NULL) + las propias
CREATE POLICY "categories_select" ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- transactions: solo el propio usuario
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update_own" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete_own" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- subscriptions: solo el propio usuario
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_delete_own" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);
