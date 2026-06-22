# Portal Interativo de Matematica - CAIC

Plataforma interativa para aprender matematica brincando. Jogos, videos, quizzes e muito mais!

**Deploy:** https://jkvzin.github.io/extensaoVI/

## Funcionalidades

- **Quiz Interativo** — Adicao, subtracao, multiplicacao e divisao com perguntas dinamicas
- **Jogos Educativos** — 4 jogos categorizados por operacao matematica
- **Videos Explicativos** — Players do YouTube integrados com fallback de erro
- **Modo X1 (Multiplayer Split-Screen)** — Dois jogadores no mesmo teclado
- **Sistema de XP** — Niveis, conquistas e barra de progresso
- **Painel do Professor** — CRUD de turmas/alunos, metricas, graficos e relatorios
- **Acessibilidade** — Alto contraste, TTS (Text-to-Speech), feedback sonoro

## Stack

- HTML/CSS/JS puro (vanilla), sem frameworks
- YouTube IFrame API para videos
- Chart.js (CDN) para graficos
- canvas-confetti (CDN) para animacoes
- Supabase para sincronizacao de dados

## Estrutura

```
marcos/
├── index.html              # Home page
├── login.html              # Tela de login
├── quiz.html               # Quiz interativo
├── jogos.html              # Jogos educativos
├── videos.html             # Videos do YouTube
├── multiplayer.html        # Modo X1 split-screen
├── dashboard.html          # Painel do professor
├── css/
│   ├── style.css           # Estilos globais
│   ├── login.css           # Estilos da tela de login
│   └── dashboard.css       # Estilos do dashboard
├── js/
│   ├── data.js             # Dados estaticos (videos, jogos, quiz)
│   ├── mock-data.js        # DB unificado (localStorage)
│   ├── xp.js               # Sistema de XP/niveis
│   ├── questaoDinamica.js  # Motor de perguntas dinamicas
│   ├── distratores.js      # Motor de distratores inteligentes
│   └── ...
└── docs/
    └── guia-uso.md         # Guia de uso do painel do professor
```

## Como Rodar

1. Clone o repositorio
2. Abra `index.html` em qualquer navegador
3. Ou acesse a versao deployada: https://jkvzin.github.io/extensaoVI/

## Colaboradores

- Joao Victor Borges Carvalho (Jkvzin)
- Carlos Barbosa (c4rlosfb)
- Joao Guilherme Garcia Mangueira (JoaoGarciaM)
- GrouwBer
