-- =========================================
-- Pro Ink — Migration inicial
-- Cole e execute no Supabase SQL Editor
-- =========================================

-- Tabela de perfis (1 por usuário Clerk)
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id    TEXT UNIQUE NOT NULL,
  email            TEXT,
  plan             TEXT NOT NULL DEFAULT 'free'
                     CHECK (plan IN ('free', 'starter', 'pro', 'creator')),
  credits_total    INTEGER NOT NULL DEFAULT 0,
  credits_used     INTEGER NOT NULL DEFAULT 0,
  plan_expires_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de transações de crédito (log imutável)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id  TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount         INTEGER NOT NULL,
  description    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de jobs de decalque
CREATE TABLE IF NOT EXISTS decal_jobs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id  TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  input_url      TEXT,
  output_url     TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Atualiza updated_at automaticamente no profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_decal_jobs_user ON decal_jobs(clerk_user_id, created_at DESC);

-- RLS: desabilitado por enquanto (usamos service role no servidor)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE decal_jobs DISABLE ROW LEVEL SECURITY;
