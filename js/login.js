/* js/login.js */

// Steps
var stepTipo = document.getElementById('step-tipo');
var stepTurma = document.getElementById('step-turma');
var stepAluno = document.getElementById('step-aluno');
var stepSenha = document.getElementById('step-senha');

// Turma selection
var turmasList = document.getElementById('turmas-list');
var btnVisitante = document.getElementById('btn-visitante');
var btnVoltarTipo = document.getElementById('btn-voltar-tipo');
var btnVoltarTurma = document.getElementById('btn-voltar-turma');
var btnVoltarAluno = document.getElementById('btn-voltar-aluno');
var tituloTurma = document.getElementById('titulo-turma');

// Password step
var avatarAlunoSelecionado = document.getElementById('avatar-aluno-selecionado');
var nomeAlunoSelecionado = document.getElementById('nome-aluno-selecionado');
var inputSenha = document.getElementById('input-senha');
var senhaErro = document.getElementById('senha-erro');
var btnEntrar = document.getElementById('btn-entrar');
var tituloSenha = document.getElementById('titulo-senha');

var selectedTurmaId = null;
var selectedAluno = null;

// ==================== STEP 0: TIPO DE USUÁRIO ====================

document.getElementById('btn-professor').addEventListener('click', function() {
    window.location.href = 'dashboard.html';
});

document.getElementById('btn-aluno').addEventListener('click', function() {
    stepTipo.style.display = 'none';
    stepTurma.style.display = 'block';
    renderTurmas();
});

// ==================== STEP 1: TURMAS ====================

function renderTurmas() {
    turmasList.innerHTML = '';
    MockDB.turmas.forEach(function(turma) {
        var card = document.createElement('div');
        card.className = 'card-selecao';
        card.innerHTML = '<span class="avatar">' + turma.icone + '</span><span>' + turma.nome + '</span>';
        card.addEventListener('click', function() {
            selectedTurmaId = turma.id;
            tituloTurma.innerText = 'Turma ' + turma.nome + ' - Quem é você?';
            stepTurma.style.display = 'none';
            stepAluno.style.display = 'block';
            renderAlunos(turma.id);
        });
        turmasList.appendChild(card);
    });
}

// ==================== STEP 2: ALUNOS ====================

function renderAlunos(turmaId) {
    var alunosList = document.getElementById('alunos-list');
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
        card.addEventListener('click', function() {
            selectAluno(aluno);
        });
        alunosList.appendChild(card);
    });
}

// ==================== STEP 3: SENHA ====================

function selectAluno(aluno) {
    selectedAluno = aluno;
    avatarAlunoSelecionado.textContent = aluno.avatar_url;
    nomeAlunoSelecionado.textContent = aluno.nome;
    tituloSenha.innerText = 'Olá, ' + aluno.nome + '!';
    inputSenha.value = '';
    senhaErro.style.display = 'none';
    inputSenha.focus();
    stepAluno.style.display = 'none';
    stepSenha.style.display = 'block';
}

btnEntrar.addEventListener('click', function() {
    var senhaDigitada = inputSenha.value.trim();
    if (!senhaDigitada) {
        senhaErro.textContent = 'Digite sua senha!';
        senhaErro.style.display = 'block';
        return;
    }
    if (senhaDigitada !== selectedAluno.senha) {
        senhaErro.textContent = 'Senha incorreta! Tente novamente.';
        senhaErro.style.display = 'block';
        inputSenha.value = '';
        inputSenha.focus();
        return;
    }
    loginAs(selectedAluno);
});

inputSenha.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        btnEntrar.click();
    }
});

// ==================== LOGIN ====================

function loginAs(aluno) {
    localStorage.setItem('currentStudent', JSON.stringify(aluno));
    window.location.href = 'index.html';
}

// ==================== NAVEGAÇÃO ====================

btnVoltarTipo.addEventListener('click', function() {
    selectedTurmaId = null;
    stepTurma.style.display = 'none';
    stepTipo.style.display = 'block';
});

btnVoltarTurma.addEventListener('click', function() {
    selectedTurmaId = null;
    stepAluno.style.display = 'none';
    stepTurma.style.display = 'block';
});

btnVoltarAluno.addEventListener('click', function() {
    selectedAluno = null;
    stepSenha.style.display = 'none';
    stepAluno.style.display = 'block';
});

btnVisitante.addEventListener('click', function() {
    localStorage.setItem('currentStudent', JSON.stringify({ id: 'visitante', nome: 'Visitante', avatar_url: '👤' }));
    window.location.href = 'index.html';
});

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', function() {
    var currentStudent = localStorage.getItem('currentStudent');
    if (currentStudent && window.location.pathname.indexOf('login.html') !== -1) {
        window.location.href = 'index.html';
    }
    // Step 0 já está visível por padrão
});
