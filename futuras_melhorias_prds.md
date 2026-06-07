# Documento de Requisitos de Produto (PRDs) - Futuras Melhorias
**Portal Interativo de Matemática - Projeto de Extensão (CAIC)**

Este documento contém 5 mini-PRDs com propostas de evolução para o portal. O objetivo é que estas propostas possam ser desmembradas em cerca de 10 ou mais *Issues* (tarefas) no GitHub/Jira para a equipe de desenvolvimento.

A estrutura foi dividida em áreas de impacto e, ao final, organizada em **Duas Sprints**, sendo uma focada inteiramente no Frontend e outra focada no Backend (que agora se fará necessário para alguns dos novos recursos).

---

## 🚀 PRD 1: Motor de Questões Dinâmicas (Infinitas)
**Problema:** Atualmente, as questões do quiz são estáticas (hardcoded). O aluno acaba decorando a resposta após jogar algumas vezes.
**Solução:** Criar um gerador de questões parametrizado no Frontend. O aluno escolhe um "Tipo de Questão" (ex: Soma com Frutas) e o sistema injeta valores aleatórios a cada rodada, calculando a resposta certa por trás dos panos.

*   **Requisitos:**
    *   Criar uma interface onde o aluno possa escolher o "Tema" ou a "Operação" que quer treinar.
    *   O JS deve ter "Templates" de texto, ex: `"Se [NOME] tem {A} maçãs e compra mais {B}, com quantas fica?"`.
    *   O motor em JavaScript deve gerar `{A}` e `{B}` aleatoriamente dentro de um limite (ex: 1 a 10 para nível fácil).
    *   O JS resolve a equação `A + B` para saber a resposta correta e gera 3 alternativas erradas próximas do valor real para confundir de forma didática.
*   **Issues Sugeridas:**
    1. Criar interface de seleção de categorias de Quiz.
    2. Desenvolver a classe/função geradora de questões matemáticas com variáveis aleatórias.
    3. Criar a lógica de geração de respostas falsas (distratores) plausíveis.

---

## 🎮 PRD 2: Sistema de Gamificação e Recompensas (Frontend)
**Problema:** Crianças precisam de estímulos constantes para manter o engajamento com plataformas educativas.
**Solução:** Implementar um sistema de progressão visual. Como não temos login no momento, a progressão pode ser salva temporariamente no `localStorage` do navegador da escola.

*   **Requisitos:**
    *   Barra de "XP" (Experiência) que enche a cada quiz finalizado ou vídeo assistido.
    *   Sistema de "Conquistas/Badges" (Ex: "Mestre da Tabuada", "Explorador de Vídeos").
    *   Loja fictícia de Avatares (a criança ganha moedas virtuais acertando questões e pode trocar a foto do seu perfil temporário).
*   **Issues Sugeridas:**
    4. Implementar sistema de XP e armazenamento via `localStorage`.
    5. Desenvolver UI (Interface) para a galeria de Conquistas/Badges.

---

## 🔊 PRD 3: Módulo de Acessibilidade e Áudio (Frontend)
**Problema:** Crianças do ensino fundamental podem estar em diferentes níveis de alfabetização, dificultando a leitura das questões longas.
**Solução:** Adicionar suporte a Text-to-Speech (Leitura em voz alta) e navegação facilitada.

*   **Requisitos:**
    *   Botão de "Ouvir Pergunta" usando a API nativa do navegador (`SpeechSynthesisUtterance`).
    *   Efeitos sonoros lúdicos globais (Som de "plim" ao acertar, som de "boing" ao errar).
    *   Opção de "Alto Contraste" para crianças com deficiência visual leve.
*   **Issues Sugeridas:**
    6. Implementar API de leitura de texto (Text-to-Speech) nos cards do Quiz e Resolução.
    7. Adicionar feedback sonoro às interações (botões, acertos e erros).

---

## 📊 PRD 4: Painel do Professor e Gestão de Turmas (Supabase / BaaS)
**Problema:** Os professores do CAIC não sabem quais alunos estão com mais dificuldade. Como criar logins de e-mail é inviável para crianças, precisamos de algo simples para mapear o progresso.
**Solução:** Utilizar o **Supabase** (Backend as a Service) para criar um banco de dados gratuito. O professor tem login (CRUD completo) para criar as Turmas. A criança entra apenas selecionando o seu nome e a sua turma de uma lista pré-criada pelo professor.

*   **Requisitos:**
    *   **Pré-requisito Humano (Setup Manual):** Antes de iniciar a programação desta Sprint, um membro da equipe precisará acessar o site do Supabase manualmente, criar o projeto, pegar as chaves de API e configurar as tabelas no painel deles.
    *   **Backend (Supabase):** Tabelas para `Turmas`, `Alunos` e `Progresso`.
    *   **Área do Professor:** Uma página administrativa (com login real) onde o professor cadastra as turmas e os nomes dos alunos. Ele vê gráficos de desempenho individual de cada aluno e da turma toda em tempo real.
    *   **Área do Aluno:** Antes de começar a jogar, o aluno vê uma tela amigável: "Quem é você?". Ele seleciona a turma (ex: "3º Ano A") e, em seguida, clica apenas no seu próprio nome na lista que o professor cadastrou. Todo o progresso a partir daí vai para o banco vinculado àquele nome.
*   **Issues Sugeridas:**
    8. [TAREFA MANUAL] Criar conta no Supabase, gerar API Keys e modelar tabelas (Turmas, Alunos, Progresso) pelo painel web.
    9. Criar interface de Seleção de Turma/Aluno para as crianças (Autenticação simplificada).
    10. Criar o Dashboard do Professor (com tela de Login, CRUD de turmas e visualização de métricas).

---

## ⚔️ PRD 5: Modo Desafio / Multiplayer Local (Frontend)
**Problema:** A matemática pode se tornar uma atividade solitária no laboratório.
**Solução:** Criar um modo "X1" (1 contra 1) onde duas crianças dividem o mesmo teclado/mouse ou tela para resolver questões ao mesmo tempo.

*   **Requisitos:**
    *   Tela dividida ao meio (Jogador Vermelho vs Jogador Azul).
    *   As mesmas questões dinâmicas (do PRD 1) aparecem para os dois ao mesmo tempo.
    *   Quem clicar na resposta certa primeiro usando atalhos do teclado (ex: Letras 'A,S,D' para jogador 1 e Setas para jogador 2) ganha o ponto.
*   **Issues Sugeridas:**
    11. Criar layout de tela dividida (Split-screen) para o Quiz.
    12. Implementar lógica de controle por teclas de atalho (Event Listeners de teclado simultâneos).

---

## 📖 PRD 6: Tutorial e Onboarding (Guia de Uso)
**Problema:** Com a introdução de turmas e relatórios, novos professores e alunos podem ficar confusos sobre como realizar o login simplificado e acessar os dados.
**Solução:** Criar fluxos de integração (Onboarding) visuais e interativos na própria plataforma.

*   **Requisitos:**
    *   **Tutorial do Aluno:** Um overlay (balõezinhos explicativos flutuantes) que aparece apenas na primeira vez que a criança acessa o site, ensinando: "Clique aqui para escolher sua turma!" e "Agora clique no seu nome!".
    *   **Guia do Professor:** Um botão de "Ajuda / Como Funciona" no painel administrativo com um vídeo curto ou PDF embutido explicando como cadastrar a turma e interpretar os gráficos do Supabase.
*   **Issues Sugeridas:**
    13. Criar biblioteca/script de *tour guiado* (balões de dica) para o primeiro acesso do aluno.
    14. Escrever e integrar a documentação/guia de uso dentro do painel do professor.

---

## 📅 Organização das Sprints

### Sprint 1: Foco em Engajamento e Rejogabilidade (Puramente Frontend)
O objetivo desta sprint é tornar o projeto infinito e mais viciante sem adicionar custo de infraestrutura.
*   **Issue 1, 2, 3:** Desenvolver o Motor de Questões Dinâmicas (Essencial para não enjoar).
*   **Issue 6, 7:** Implementar Áudio e Acessibilidade (Essencial para inclusão rápida).
*   **Issue 4, 5:** Gamificação local com `localStorage`.
*(Ao fim da Sprint 1, o projeto já é um produto de alto nível rodando apenas no GitHub Pages)*

### Sprint 2: Foco em Dados e Infraestrutura (Fullstack / Backend)
O objetivo desta sprint é dar ferramentas analíticas para a escola/professores, introduzindo um servidor.
*   **Issue 8:** Setup da API e Banco de Dados (Supabase).
*   **Issue 9:** Conectar o Frontend com o Backend e Autenticação Simplificada (Aluno/Turma).
*   **Issue 10:** Criação do Dashboard para professores (CRUD e Métricas).
*   **Issue 13, 14:** Implementar Onboarding/Tutoriais visuais de adoção da plataforma.
*   **Issue 11, 12:** (Opcional) Modo Multiplayer Local para as crianças competirem no laboratório.
