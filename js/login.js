1|/* js/login.js */
2|
3|// MockDB agora é carregado de js/mock-data.js
4|
5|// Elements
6|const stepTurma = document.getElementById('step-turma');
7|const stepAluno = document.getElementById('step-aluno');
8|const turmasList = document.getElementById('turmas-list');
9|const alunosList = document.getElementById('alunos-list');
10|const btnVisitante = document.getElementById('btn-visitante');
11|const btnVoltar = document.getElementById('btn-voltar');
12|const tituloTurma = document.getElementById('titulo-turma');
13|
14|let selectedTurmaId = null;
15|
16|// Initialize
17|document.addEventListener('DOMContentLoaded', () => {
18|    // Check if already logged in
19|    const currentStudent = localStorage.getItem('currentStudent');
20|    if (currentStudent && window.location.pathname.endsWith('login.html')) {
21|        window.location.href = 'index.html';
22|    } else {
23|        renderTurmas();
24|    }
25|});
26|
27|function renderTurmas() {
28|    turmasList.innerHTML = '';
29|    MockDB.turmas.forEach(turma => {
30|        const card = document.createElement('div');
31|        card.className = 'card-selecao';
32|        card.innerHTML = `
33|            <span class="avatar">${turma.icone}</span>
34|            <span>${turma.nome}</span>
35|        `;
36|        card.addEventListener('click', () => {
37|            selectedTurmaId = turma.id;
38|            tituloTurma.innerText = `Turma ${turma.nome} - Quem é você?`;
39|            stepTurma.style.display = 'none';
40|            stepAluno.style.display = 'block';
41|            renderAlunos(turma.id);
42|        });
43|        turmasList.appendChild(card);
44|    });
45|}
46|
47|function renderAlunos(turmaId) {
48|    alunosList.innerHTML = '';
49|    const alunos = MockDB.alunos.filter(a => a.turma_id === turmaId);
50|    
51|    if (alunos.length === 0) {
52|        alunosList.innerHTML = `<p>Nenhum aluno encontrado nesta turma.</p>`;
53|        return;
54|    }
55|
56|    alunos.forEach(aluno => {
57|        const card = document.createElement('div');
58|        card.className = 'card-selecao';
59|        card.innerHTML = `
60|            <span class="avatar">${aluno.avatar_url}</span>
61|            <span>${aluno.nome}</span>
62|        `;
63|        card.addEventListener('click', () => loginAs(aluno));
64|        alunosList.appendChild(card);
65|    });
66|}
67|
68|function loginAs(aluno) {
69|    localStorage.setItem('currentStudent', JSON.stringify(aluno));
70|    window.location.href = 'index.html';
71|}
72|
73|btnVoltar.addEventListener('click', () => {
74|    selectedTurmaId = null;
75|    stepAluno.style.display = 'none';
76|    stepTurma.style.display = 'block';
77|});
78|
79|btnVisitante.addEventListener('click', () => {
80|    localStorage.setItem('currentStudent', JSON.stringify({ id: 'visitante', nome: 'Visitante', avatar_url: '👤' }));
81|    window.location.href = 'index.html';
82|});
83|