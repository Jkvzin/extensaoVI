# Contexto do Projeto extensaoVI — Sessão 2026-06-20

## Resumo

Portal Interativo de Matemática — projeto de extensão CAIC.
Repositório: `Jkvzin/extensaoVI` | Branch: `main`
Deploy: GitHub Pages em https://jkvzin.github.io/extensaoVI/

## Stack

- HTML/CSS/JS puro (vanilla), sem frameworks, sem build tools
- YouTube IFrame API para vídeos
- Chart.js (CDN) para gráficos
- canvas-confetti (CDN) para animações
- Supabase (CDN, carregado mas não configurado)
- Persistência: localStorage (chaves `matematica_caic_db` e `matematica_caic_xp`)

## Estrutura de Arquivos

```
marcos/
├── index.html              # Home page (hero, cards, feedback)
├── login.html              # Tela de login (tipo → turma → aluno → senha)
├── quiz.html               # Quiz interativo (4 categorias, 3 níveis, dinâmico)
├── jogos.html              # Jogos educativos (12 jogos com categorias)
├── videos.html             # 12 vídeos do YouTube embed
├── multiplayer.html        # Modo X1 split-screen
├── dashboard.html          # Painel do professor (login, CRUD, métricas, relatórios)
├── css/
│   ├── style.css           # Estilos globais + multiplayer + ajuda + XP + responsivo
│   ├── login.css           # Estilos da tela de login
│   └── dashboard.css       # Estilos do dashboard + @media print
├── js/
│   ├── mock-data.js        # DB unificado (usuários, turmas, alunos, progresso)
│   ├── data.js             # VIDEOS_DATA (12), JOGOS_DATA (12), CATEGORIAS_QUIZ (4), QUIZ_DATA (16)
│   ├── xp.js               # Sistema de XP/níveis (Iniciante → Gênio)
│   ├── questaoDinamica.js  # Motor de perguntas dinâmicas por operação
│   ├── distratores.js      # Motor de distratores inteligentes
│   ├── quiz.js             # Lógica do quiz (categorias, dificuldade, respostas, revisão de erros)
│   ├── main.js             # Auth check, render perfil, feedback, validação de aluno
│   ├── ajuda.js            # Modal de ajuda (carrega docs/guia-uso.md)
│   ├── login.js            # Fluxo de login com senha + painel admin
│   ├── dashboard.js        # CRUD turmas/alunos, métricas, gráficos Chart.js, relatório individual
│   ├── jogos.js            # Renderização de cards de jogos com categoria e descrição
│   ├── videos.js           # Players YouTube + XP ao assistir
│   └── multiplayer.js      # Modo X1 split-screen (P1: ASDW, P2: setas)
└── docs/
    └── guia-uso.md         # Guia de uso do painel do professor (Markdown)
```

## Ordem de Carregamento de Scripts por Página

| Página | Scripts (em ordem) |
|---|---|
| index.html | xp.js → main.js → ajuda.js |
| login.html | mock-data.js → login.js |
| quiz.html | mock-data.js → data.js → xp.js → questaoDinamica.js → distratores.js → quiz.js → main.js → ajuda.js |
| jogos.html | data.js → xp.js → jogos.js → main.js → ajuda.js |
| videos.html | data.js → xp.js → videos.js → main.js → ajuda.js |
| multiplayer.html | data.js → xp.js → multiplayer.js → main.js |
| dashboard.html | mock-data.js → xp.js → dashboard.js |

## MockDB (mock-data.js) — API

```javascript
DB = {
    // Usuários
    authUsuario(email, senha)           → objeto ou null
    cadastrarProfessor(nome, email, senha)
    listarProfessores()                 → array
    removerProfessor(id)
    trocarSenhaAdmin(novaSenha)         → true/false

    // Turmas
    listarTurmas()                      → array
    getTurma(id)                        → objeto ou null
    criarTurma(nome, anoLetivo, professorId)
    excluirTurma(id)

    // Alunos
    listarAlunos(turmaId?)             → array
    getAluno(id)                        → objeto ou null
    criarAluno(nome, turmaId)           → objeto (com senha gerada)
    excluirAluno(id)
    contarAlunosPorTurma(turmaId)       → número

    // Progresso
    registrarProgresso({aluno_id, aluno_nome, categoria, acertos, total, pct, xp_ganho, timestamp})
    getProgressoAluno(alunoId)          → array
    getProgressoTurma(turmaId)          → array
    resetDB()
    _raw()                              → acesso direto aos dados
}
```

## Fluxo de Autenticação

1. Aluno: login.html → "Sou Aluno" → seleciona turma → seleciona nome → digita senha → index.html
2. Professor: login.html → "Sou Professor" → digita email/senha → dashboard.html
3. Diretor: login.html → "Sou Diretor" → painel admin (cadastrar professores)
4. Visitante: login.html → "Entrar como visitante" → index.html

Auth check: main.js redireciona para login.html se `localStorage.currentStudent` estiver vazio.
Páginas públicas (sem auth): login.html, dashboard.html.

## Sistema de XP

Níveis: Iniciante (0) → Aprendiz (100) → Estudante (250) → Sabido (500) → Mestre (1000) → Gênio (2000)
Recompensas: quizComplete=25, quizPerfect=+25, videoWatched=15, multiplayerWin=30, multiplayerPlay=10

## Colaboradores do Projeto

| GitHub | Nome | Issues ativas |
|--------|------|---------------|
| Jkvzin | João Victor Borges Carvalho | — |
| c4rlosfb | Carlos Barbosa | — |
| GrouwBer | — | #39 |
| JoaoGarciaM | João Guilherme Garcia Mangueira | #30, #32, #33 |

---

## O que foi feito nesta sessão (2026-06-20)

### Features implementadas

1. **Catálogo de jogos expandido** (data.js + jogos.js)
   - 1 → 12 jogos com categorias (geral, adição, subtração, multiplicação, frações, raciocínio)
   - Cada jogo tem: título, ícone, URL, corHover, descricao, categoria
   - Renderização com tag de categoria e descrição

2. **Sistema de revisão de erros no quiz** (quiz.js + quiz.html)
   - Array `erros[]` rastreia questões erradas durante o quiz
   - Ao final, seção "Revisão do que você errou" com cards individuais
   - Cada card: pergunta, "Você marcou" (vermelho) vs "Correto" (verde), explicação expansível
   - Botão "Refazer apenas as que errei" — novo quiz só com os erros, embaralhados
   - Scroll suave até a seção de revisão

3. **Relatório individual do aluno** (dashboard.js + dashboard.html)
   - Modal acessível pelo botão "Ver Progresso" na tabela de alunos
   - Avatar, nome, turma, XP total, nível, quizzes feitos, média de acertos
   - Gráfico Chart.js de evolução (últimos 10 quizzes, linha de % acertos)
   - Tabela de histórico com data, categoria, acertos/total, %, XP

4. **Gráficos do dashboard com dados reais** (dashboard.js)
   - `updateCharts()` consome `DB._raw().progresso` e `DB.getProgressoTurma()`
   - Gráfico de barras: média de acertos por operação (Adição/Subtração/Multiplicação/Divisão)
   - Gráfico de linha: evolução semanal (agrupado por `getWeekNumber()`)
   - `setupCharts()` inicia com dados zerados (não mais hardcoded)

5. **Exportação de PDF real** (dashboard.js + dashboard.css)
   - Botão "Exportar PDF" usa `window.print()` com CSS `@media print`
   - Cabeçalho temporário com nome da turma e data
   - Elementos de UI ocultados na impressão
   - Métricas, gráficos e ranking preservados

6. **Senha do admin aleatória** (mock-data.js)
   - `_gerarSenhaForte()`: 10 caracteres alfanuméricos (sem caracteres ambíguos)
   - Gerada na primeira execução, exibida no console
   - `DB.trocarSenhaAdmin(novaSenha)` para troca posterior

### Bugs corrigidos

| # | Bug | Arquivo | Correção |
|---|-----|---------|----------|
| #34 | Aluno removido continuava logado | main.js | Valida `DB.getAluno()` no auth check. Se removido, limpa localStorage e redireciona |
| #35 | Senha admin hardcoded `admin123` | mock-data.js | Senha aleatória gerada no primeiro acesso + `trocarSenhaAdmin()` |
| #36 | Fallback distratores gerava <4 opções para respostas <=5 | quiz.js | Respostas <=5 usam apenas offsets positivos. Fallback com `while` até 50 garante 4 opções |
| #38 | Quiz quebrava com `currentCategory` null | quiz.js | Fallback `(currentCategory ? currentCategory.nome : 'matemática')` |
| — | `escaparHTML` ausente no quiz.js | quiz.js | Função adicionada (estava só no dashboard.js, usada na revisão de erros) |

### Issues do GitHub — Status final

**Criadas e fechadas (6):** #31, #34, #35, #36, #37, #38

**Fechadas posteriormente (4):**
- #30 JoaoGarciaM — Multiplayer usa QUIZ_DATA estático (fechada 2026-06-21, resolvida via PR #40)
- #32 JoaoGarciaM — Multiplayer não registra progresso no DB (fechada 2026-06-21, resolvida via PR #41)
- #33 JoaoGarciaM — Ambos jogadores devem ganhar XP base no multiplayer (fechada 2026-06-21, resolvida via PR #42)
- #39 GrouwBer — Tratamento de erro/fallback para vídeos YouTube (fechada 2026-06-21, resolvida via commit f4089f4)

**Issues originais do PRD (1-14):** todas já estavam fechadas antes desta sessão.

### Commits

```
f4089f4 feat: fallback visual e spinner para videos do YouTube (fix #39)
741d23a docs: arquivo de contexto com arquitetura, progresso e bugs conhecidos
ca04141 fix: adiciona escaparHTML() ausente no quiz.js (quebrava revisão de erros)
7e396db feat: revisão geral — 12 jogos, revisão de erros no quiz, relatório individual...
```

---

## Bugs e armadilhas conhecidas

1. **write_file no Windows**: corrompe arquivos com emoji/símbolos Unicode (✓🚀❌). Usar `patch` para edições ou `cat << 'EOF'` para novos arquivos com emoji.

2. **Emojis em data.js**: foram convertidos para escape sequences Unicode (`\uD83D\uDC0D`) pelo patch tool. Funcionam corretamente em JavaScript mas o código-fonte fica menos legível.

3. **Admin password no console**: `_defaultData()` loga a senha no console a cada primeira carga (quando localStorage está vazio). Em ambiente real isso acontece uma vez. Nos testes de browser automation, cada nova sessão gera uma senha diferente.

4. **Páginas sem mock-data.js**: index.html, jogos.html, videos.html, multiplayer.html NÃO carregam mock-data.js. A validação de aluno removido (#34) usa guard `typeof DB !== 'undefined'` para não quebrar nessas páginas.

5. **GitHub Pages CDN cache**: após push, o arquivo pode demorar alguns minutos para propagar. Usar query params (`?t=...`) para forçar cache bust nos testes.

6. **Browser automation**: clicks do browser nem sempre disparam eventos JS (especialmente em elementos com event listeners vinculados via JS). Chamar funções diretamente via console é mais confiável para testes.

---

## Labels do GitHub disponíveis

acessibilidade, backend, bug, documentation, duplicate, enhancement, feature, frontend, fullstack, gamificacao, `good first issue`, `help wanted`, invalid, manual, question, sprint-1, sprint-2, wontfix

---

## Convenções

- Comunicação: português brasileiro
- Mensagens de commit: português
- Issues: títulos podem ser PT ou EN, corpo sempre PT-BR
- Código: variáveis e funções em português
- Persistência: localStorage (não há backend real ainda)
- GitHub Pages: deploy automático da branch main

---

## Status em 2026-06-21 (final)

### Issues: 0 abertas
Todas as issues foram fechadas.

### PRs: 0 abertos (6 mergeados)
| PR | Autor | Título | Status |
|----|-------|--------|--------|
| #40 | JoaoGarciaM | Multiplayer usa perguntas dinâmicas | Mergeado (squash) |
| #41 | JoaoGarciaM | Multiplayer registra progresso no DB | Aplicado manual (stacked) |
| #42 | JoaoGarciaM | Ambos jogadores ganham XP base | Aplicado manual (stacked) |
| #29 | GrouwBer | Text-to-Speech nos cards do quiz | Mergeado (squash) |
| #28 | GrouwBer | Feedback sonoro + alto contraste | Aplicado manual (conflitos) |
| #27 | GrouwBer | Tour guiado (balões de dica) | Aplicado manual (conflitos) |

### Novos arquivos JS criados
`js/tts.js`, `js/audio.js`, `js/acessibilidade.js`, `js/tour.js`, `js/tour-config.js`

### Documentação acadêmica
- `documentacao/Projeto_ExtensaoVI_Unificado.docx` — Documento ABNT completo (etapas 1-8 + conclusão + referências)
- `documentacao/Projeto_ExtensaoVI_Unificado.html` — Versão HTML com CSS de impressão ABNT
- Etapas 6 (Execução), 7 (Monitoramento), 8 (Socialização) e Conclusão foram escritas com base no código real implementado

### Commits do dia (dev)
```
7f29d7c feat: tour guiado com baloes de dica
4e24c7e feat: feedback sonoro e modo alto contraste
bbee879 feat: Text-to-Speech nos cards do quiz
14aef19 feat: ambos jogadores ganham XP base no multiplayer
ddcf982 fix: progresso multiplayer no DB + XP
d952caa feat: multiplayer usa QuestaoDinamica + DistratorEngine
f4089f4 feat: fallback visual e spinner para videos do YouTube
```

---

## Sessao 2026-06-21 (tarde) — Correcoes e Supabase

### Correcoes

1. **login.html corrompido** — arquivo com prefixos de linha `N|N|` (bug write_file no Windows).
   Recriado via terminal com todos os 6 steps (step-tipo, step-prof-login, step-admin-panel,
   step-turma, step-aluno, step-senha).

2. **tour-config.js desatualizado** — tour esperava fluxo antigo (step-turma como primeiro step).
   Corrigido: 4 passos no login.html, cada um com condicao `when` para so mostrar quando
   o elemento esta visivel.

### Integracao Supabase

- **URL:** `https://llyrodahdmwzdoceaoyw.supabase.co`
- **Tabelas:** usuarios, turmas, alunos, progresso (SQL em `sql/schema.sql`)
- **Arquitetura:** local-first — localStorage fonte primaria, Supabase sincroniza em background
- **Arquivos novos:** `js/supabase-client.js` (camada de sync), `sql/schema.sql`
- **Fallback:** se Supabase offline, app continua funcionando normalmente

### Commits (main)
```
e85d5b7 feat: integracao Supabase com sincronizacao localStorage (local-first)
887568f fix: atualiza passos do tour no login.html para incluir step-tipo e condicoes when
a4e2bd6 fix: recria login.html com todos os steps e corrige corrupcao de write_file
```
