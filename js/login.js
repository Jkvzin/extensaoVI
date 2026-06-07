/* js/login.js */

// MockDB carregado de js/mock-data.js

var stepTurma = document.getElementById('step-turma');
var stepAluno = document.getElementById('step-aluno');
var turmasList = document.getElementById('turmas-list');
var alunosList = document.getElementById('alunos-list');
var btnVisitante = document.getElementById('btn-visitante');
var btnVoltar = document.getElementById('btn-voltar');
var tituloTurma = document.getElementById('titulo-turma');

var selectedTurmaId = null;

function renderTurmas() {
    turmasList.innerHTML = '';
    MockDB.turmas.forEach(function(turma) {
        var card = document.createElement('div');
        card.className = 'card-selecao';
        card.innerHTML = '<span class="avatar">' + turma.icone + '</span><span>' + turma.nome + '</span>';
        card.addEventListener('click', function() {
            selectedTurmaId = turma.id;
            tituloTurma.innerText = 'Turma ' + turma.nome + ' - Quem e voce?';
            stepTurma.style.display = 'none';
            stepAluno.style.display = 'block';
            renderAlunos(turma.id);
        });
        turmasList.appendChild(card);
    });
}

function renderAlunos(turmaId) {
    alunosList.innerHTML = '';
    var alunos = MockDB.alunos.filter(function(a) { return a.turma_id === turmaId; });
    
    if (alunos.length === 0) {
        alunosList.innerHTML = '<p>Nenhum aluno encontrado nesta turma.</p>';
        return;
    }

    alunos.forEach(function(aluno) {
        var card = document.createElement('div');
        card.className = 'card-selecao';
        card.innerHTML = '<span class="avatar">' + aluno.avatar_url + '</span><span>' + aluno.nome + '</span>';
        card.addEventListener('click', function() { loginAs(aluno); });
        alunosList.appendChild(card);
    });
}

function loginAs(aluno) {
    localStorage.setItem('currentStudent', JSON.stringify(aluno));
    window.location.href = 'index.html';
}

btnVoltar.addEventListener('click', function() {
    selectedTurmaId = null;
    stepAluno.style.display = 'none';
    stepTurma.style.display = 'block';
});

btnVisitante.addEventListener('click', function() {
    localStorage.setItem('currentStudent', JSON.stringify({ id: 'visitante', nome: 'Visitante', avatar_url: '\uD83D\uDC64' }));
    window.location.href = 'index.html';
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    var currentStudent = localStorage.getItem('currentStudent');
    if (currentStudent && window.location.pathname.indexOf('login.html') !== -1) {
        window.location.href = 'index.html';
    } else {
        renderTurmas();
    }
});
