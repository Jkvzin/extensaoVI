-- Tabela Turmas
CREATE TABLE IF NOT EXISTS turmas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    ano_letivo integer,
    professor_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Tabela Alunos
CREATE TABLE IF NOT EXISTS alunos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    turma_id uuid REFERENCES turmas(id) ON DELETE CASCADE,
    avatar_url text,
    created_at timestamptz DEFAULT now()
);

-- Tabela Progresso
CREATE TABLE IF NOT EXISTS progresso (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
    tipo_atividade text,
    pontuacao integer,
    detalhes jsonb,
    created_at timestamptz DEFAULT now()
);

-- Índices para otimização de subqueries e RLS
CREATE INDEX IF NOT EXISTS idx_turmas_professor_id ON turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma_id ON alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_progresso_aluno_id ON progresso(aluno_id);

-- Configuração de Row Level Security (RLS)

-- Habilitar RLS em todas as tabelas
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;

-- Políticas para Turmas
-- O professor dono pode ver/editar suas próprias turmas
CREATE POLICY "Professores podem ver suas turmas" 
ON turmas FOR SELECT 
USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem inserir turmas" 
ON turmas FOR INSERT 
WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professores podem atualizar suas turmas" 
ON turmas FOR UPDATE 
USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem excluir suas turmas" 
ON turmas FOR DELETE 
USING (auth.uid() = professor_id);

-- Políticas para Alunos
-- Leitura pública para que os alunos possam se selecionar na tela inicial
CREATE POLICY "Leitura de alunos é pública" 
ON alunos FOR SELECT 
USING (true);

-- Apenas o professor dono da turma pode inserir, atualizar ou excluir alunos
CREATE POLICY "Apenas professores inserem alunos" 
ON alunos FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT professor_id FROM turmas WHERE id = turma_id));

CREATE POLICY "Apenas professores atualizam alunos" 
ON alunos FOR UPDATE 
USING (auth.uid() IN (SELECT professor_id FROM turmas WHERE id = turma_id));

CREATE POLICY "Apenas professores excluem alunos" 
ON alunos FOR DELETE 
USING (auth.uid() IN (SELECT professor_id FROM turmas WHERE id = turma_id));

-- Políticas para Progresso
-- Inserção pelo frontend (público) - qualquer aluno logado visualmente pode enviar progresso
-- TODO: Restringir isso no futuro, atualmente permite spoofing se alguém descobrir o aluno_id
CREATE POLICY "Alunos inserem progresso" 
ON progresso FOR INSERT 
WITH CHECK (true);

-- Nota: Não há políticas de UPDATE/DELETE para progresso intencionalmente.
-- O progresso é um log imutável de atividades. Apenas inserções são permitidas.

-- Apenas o professor dono da turma do aluno pode ler o progresso
CREATE POLICY "Professores leem progresso de suas turmas" 
ON progresso FOR SELECT 
USING (
    auth.uid() IN (
        SELECT t.professor_id 
        FROM turmas t 
        JOIN alunos a ON a.turma_id = t.id 
        WHERE a.id = aluno_id
    )
);
