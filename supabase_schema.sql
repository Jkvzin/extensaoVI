1|-- Tabela Turmas
2|CREATE TABLE IF NOT EXISTS turmas (
3|    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
4|    nome text NOT NULL,
5|    ano_letivo integer,
6|    professor_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
7|    created_at timestamptz DEFAULT now()
8|);
9|
10|-- Tabela Alunos
11|CREATE TABLE IF NOT EXISTS alunos (
12|    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
13|    nome text NOT NULL,
14|    turma_id uuid REFERENCES turmas(id) ON DELETE CASCADE,
15|    avatar_url text,
16|    created_at timestamptz DEFAULT now()
17|);
18|
19|-- Tabela Progresso
20|CREATE TABLE IF NOT EXISTS progresso (
21|    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
22|    aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
23|    tipo_atividade text,
24|    pontuacao integer,
25|    detalhes jsonb,
26|    created_at timestamptz DEFAULT now()
27|);
28|
29|-- Índices para otimização de subqueries e RLS
30|CREATE INDEX IF NOT EXISTS idx_turmas_professor_id ON turmas(professor_id);
31|CREATE INDEX IF NOT EXISTS idx_alunos_turma_id ON alunos(turma_id);
32|CREATE INDEX IF NOT EXISTS idx_progresso_aluno_id ON progresso(aluno_id);
33|
34|-- Configuração de Row Level Security (RLS)
35|
36|-- Habilitar RLS em todas as tabelas
37|ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
38|ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
39|ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;
40|
41|-- Políticas para Turmas
42|-- O professor dono pode ver/editar suas próprias turmas
43|CREATE POLICY "Professores podem ver suas turmas" 
44|ON turmas FOR SELECT 
45|USING (auth.uid() = professor_id);
46|
47|CREATE POLICY "Professores podem inserir turmas" 
48|ON turmas FOR INSERT 
49|WITH CHECK (auth.uid() = professor_id);
50|
51|CREATE POLICY "Professores podem atualizar suas turmas" 
52|ON turmas FOR UPDATE 
53|USING (auth.uid() = professor_id);
54|
55|CREATE POLICY "Professores podem excluir suas turmas" 
56|ON turmas FOR DELETE 
57|USING (auth.uid() = professor_id);
58|
59|-- Políticas para Alunos
60|-- Leitura pública para que os alunos possam se selecionar na tela inicial
61|CREATE POLICY "Leitura de alunos é pública" 
62|ON alunos FOR SELECT 
63|USING (true);
64|
65|-- Apenas o professor dono da turma pode inserir, atualizar ou excluir alunos
66|CREATE POLICY "Apenas professores inserem alunos" 
67|ON alunos FOR INSERT 
68|WITH CHECK (auth.uid() IN (SELECT professor_id FROM turmas WHERE id = turma_id));
69|
70|CREATE POLICY "Apenas professores atualizam alunos" 
71|ON alunos FOR UPDATE 
72|USING (auth.uid() IN (SELECT professor_id FROM turmas WHERE id = turma_id));
73|
74|CREATE POLICY "Apenas professores excluem alunos" 
75|ON alunos FOR DELETE 
76|USING (auth.uid() IN (SELECT professor_id FROM turmas WHERE id = turma_id));
77|
78|-- Políticas para Progresso
79|-- Inserção pelo frontend (público) - qualquer aluno logado visualmente pode enviar progresso
80|-- TODO: Restringir isso no futuro, atualmente permite spoofing se alguém descobrir o aluno_id
81|CREATE POLICY "Alunos inserem progresso" 
82|ON progresso FOR INSERT 
83|WITH CHECK (true);
84|
85|-- Nota: Não há políticas de UPDATE/DELETE para progresso intencionalmente.
86|-- O progresso é um log imutável de atividades. Apenas inserções são permitidas.
87|
88|-- Apenas o professor dono da turma do aluno pode ler o progresso
89|CREATE POLICY "Professores leem progresso de suas turmas" 
90|ON progresso FOR SELECT 
91|USING (
92|    auth.uid() IN (
93|        SELECT t.professor_id 
94|        FROM turmas t 
95|        JOIN alunos a ON a.turma_id = t.id 
96|        WHERE a.id = aluno_id
97|    )
98|);
99|