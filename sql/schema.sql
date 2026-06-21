-- ================================================
-- Portal de Matematica CAIC - Schema Supabase
-- ================================================
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/llyrodahdmwzdoceaoyw/sql/new
-- ================================================

-- Tabela de usuarios (admin e professores)
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'professor')),
    avatar_url TEXT DEFAULT '👨‍🏫',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    icone TEXT DEFAULT '🏫',
    ano_letivo INTEGER DEFAULT 2026,
    professor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    turma_id TEXT REFERENCES turmas(id) ON DELETE CASCADE,
    avatar_url TEXT DEFAULT '👦',
    senha TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso (quiz, jogos, etc.)
CREATE TABLE IF NOT EXISTS progresso (
    id SERIAL PRIMARY KEY,
    aluno_id TEXT REFERENCES alunos(id) ON DELETE CASCADE,
    turma_id TEXT REFERENCES turmas(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL,
    operacao TEXT,
    acertos INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    pontuacao INTEGER DEFAULT 0,
    xp_ganho INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- DADOS INICIAIS
-- ================================================

-- Admin padrao (senha: admin123)
INSERT INTO usuarios (id, nome, email, senha, role, avatar_url)
VALUES ('admin-1', 'Diretor', 'admin@caic.com.br', 'admin123', 'admin', '👑')
ON CONFLICT (id) DO NOTHING;

-- Turmas padrao
INSERT INTO turmas (id, nome, icone, ano_letivo) VALUES
    ('1', '3º Ano A', '🏫', 2026),
    ('2', '4º Ano B', '🎒', 2026),
    ('3', '5º Ano C', '🎓', 2026)
ON CONFLICT (id) DO NOTHING;

-- Alunos padrao
INSERT INTO alunos (id, nome, turma_id, avatar_url, senha) VALUES
    ('101', 'Joãozinho', '1', '👦', 'gato123'),
    ('102', 'Mariazinha', '1', '👧', 'flor456'),
    ('103', 'Pedrinho', '2', '👦', 'cachorro789'),
    ('104', 'Ana', '2', '👧', 'estrela321'),
    ('105', 'Bia', '3', '👧', 'lua654')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;

-- Politicas: permite leitura publica (anon key) para o app funcionar
-- Em producao, restrinja conforme necessario

CREATE POLICY "Leitura publica de usuarios" ON usuarios
    FOR SELECT USING (true);

CREATE POLICY "Leitura publica de turmas" ON turmas
    FOR SELECT USING (true);

CREATE POLICY "Leitura publica de alunos" ON alunos
    FOR SELECT USING (true);

CREATE POLICY "Leitura publica de progresso" ON progresso
    FOR SELECT USING (true);

-- Escrita: permitir inserts/updates via anon key (app cliente)
CREATE POLICY "Escrita de usuarios" ON usuarios
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualizacao de usuarios" ON usuarios
    FOR UPDATE USING (true);

CREATE POLICY "Escrita de turmas" ON turmas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualizacao de turmas" ON turmas
    FOR UPDATE USING (true);

CREATE POLICY "Delecao de turmas" ON turmas
    FOR DELETE USING (true);

CREATE POLICY "Escrita de alunos" ON alunos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualizacao de alunos" ON alunos
    FOR UPDATE USING (true);

CREATE POLICY "Delecao de alunos" ON alunos
    FOR DELETE USING (true);

CREATE POLICY "Escrita de progresso" ON progresso
    FOR INSERT WITH CHECK (true);
