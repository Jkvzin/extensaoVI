/* js/login.js */

// MockDB agora é carregado de js/mock-data.js

// Elements
const stepTurma = document.getElementById('step-turma');
const stepAluno = document.getElementById('step-aluno');
const turmasList = document.getElementById('turmas-list');
const alunosList = document.getElementById('alunos-list');
const btnVisitante = document.getElementById('btn-visitante');
const btnVoltar = document.getElementById('btn-voltar');
const tituloTurma = document.getElementById('titulo-turma');

let selectedTurmaId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const currentStudent = localStorage.getItem('currentStudent');
    if (currentStudent && window.location.pathname.endsWith('login.html')) {
        window.location.href = 'index.html';
    } else {
        renderTurmas();
    }
});

function renderTurmas() {
    turmasList.innerHTML = '';
    MockDB.turmas.forEach(turma => {
        const card = document.createElement('div');
        card.className = 'card-selecao';
        card.innerHTML = `
            <span class="avatar">${turma.icone}</span>
            <span>${turma.nome}</span>
        `;
        card.addEventListener('click', () => {
            selectedTurmaId = turma.id;
            tituloTurma.innerText = `Turma ${turma.nome} - Quem é você?`;
            stepTurma.style.display = 'none';
            stepAluno.style.display = 'block';
            renderAlunos(turma.id);
        });
        turmasList.appendChild(card);
    });
}

function renderAlunos(turmaId) {
    alunosList.innerHTML = '';
    const alunos = MockDB.alunos.filter(a => a.turma_id === turmaId);
    
    if (alunos.length === 0) {
        alunosList.innerHTML = `<p>Nenhum aluno encontrado nesta turma.</p>`;
        return;
    }

    alunos.forEach(aluno => {
        const card = document.createElement('div');
        card.className = 'card-selecao';
        card.innerHTML = `
            <span class="avatar">${aluno.avatar_url}</span>
            <span>${aluno.nome}</span>
        `;
        card.addEventListener('click', () => loginAs(aluno));
        alunosList.appendChild(card);
    });
}

function loginAs(aluno) {
    localStorage.setItem('currentStudent', JSON.stringify(aluno));
    window.location.href = 'index.html';
}

btnVoltar.addEventListener('click', () => {
    selectedTurmaId = null;
    stepAluno.style.display = 'none';
    stepTurma.style.display = 'block';
});

btnVisitante.addEventListener('click', () => {
    localStorage.setItem('currentStudent', JSON.stringify({ id: 'visitante', nome: 'Visitante', avatar_url: '👤' }));
    window.location.href = 'index.html';
});
