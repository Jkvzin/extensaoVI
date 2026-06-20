/* js/login.js */

// Steps
var stepTipo = document.getElementById('step-tipo');
var stepTurma = document.getElementById('step-turma');
var stepAluno = document.getElementById('step-aluno');
var stepSenha = document.getElementById('step-senha');
var stepProfLogin = document.getElementById('step-prof-login');
var stepAdminPanel = document.getElementById('step-admin-panel');

// Admin state
var currentAdmin = null;

// ==================== STEP 0: TIPO DE USUÁRIO ====================

document.getElementById('btn-professor').addEventListener('click', function() {
    stepTipo.style.display = 'none';
    stepProfLogin.style.display = 'block';
    document.getElementById('titulo-prof-login').textContent = 'Acesso do Professor';
});

document.getElementById('btn-admin').addEventListener('click', function() {
    stepTipo.style.display = 'none';
    stepProfLogin.style.display = 'block';
    document.getElementById('titulo-prof-login').textContent = 'Acesso do Diretor 👑';
    // Marca que é admin
    stepProfLogin.setAttribute('data-mode', 'admin');
});

document.getElementById('btn-aluno').addEventListener('click', function() {
    stepTipo.style.display = 'none';
    stepTurma.style.display = 'block';
    renderTurmas();
});

// ==================== LOGIN PROFESSOR / ADMIN ====================

document.getElementById('btn-prof-entrar').addEventListener('click', function() {
    var email = document.getElementById('prof-email').value.trim();
    var senha = document.getElementById('prof-senha').value.trim();
    var erroEl = document.getElementById('prof-erro');
    var mode = stepProfLogin.getAttribute('data-mode') || 'professor';

    if (!email || !senha) {
        erroEl.textContent = 'Preencha e-mail e senha.';
        erroEl.style.display = 'block';
        return;
    }

    var usuario = DB.authUsuario(email, senha);

    if (!usuario) {
        erroEl.textContent = 'E-mail ou senha incorretos.';
        erroEl.style.display = 'block';
        return;
    }

    if (mode === 'admin' && usuario.role !== 'admin') {
        erroEl.textContent = 'Acesso negado. Apenas o diretor pode acessar esta área.';
        erroEl.style.display = 'block';
        return;
    }

    if (mode === 'professor' && usuario.role === 'admin') {
        // Admin tentando logar como professor — permitimos também
    }

    erroEl.style.display = 'none';

    if (usuario.role === 'admin') {
        currentAdmin = usuario;
        stepProfLogin.style.display = 'none';
        stepAdminPanel.style.display = 'block';
        renderAdminPanel();
    } else {
        // Professor — vai para o dashboard
        localStorage.setItem('profUser', JSON.stringify(usuario));
        window.location.href = 'dashboard.html';
    }
});

// Enter key nos campos de login
document.getElementById('prof-senha').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('btn-prof-entrar').click();
    }
});

// ==================== PAINEL DO ADMIN (DIRETOR) ====================

function renderAdminPanel() {
    renderListaProfessores();
}

document.getElementById('btn-cadastrar-prof').addEventListener('click', function() {
    var nome = document.getElementById('novo-prof-nome').value.trim();
    var email = document.getElementById('novo-prof-email').value.trim();
    var senha = document.getElementById('novo-prof-senha').value.trim();
    var erroEl = document.getElementById('cadastro-prof-erro');
    var okEl = document.getElementById('cadastro-prof-ok');

    erroEl.style.display = 'none';
    okEl.style.display = 'none';

    if (!nome || !email || !senha) {
        erroEl.textContent = 'Preencha todos os campos.';
        erroEl.style.display = 'block';
        return;
    }

    if (senha.length < 4) {
        erroEl.textContent = 'A senha deve ter pelo menos 4 caracteres.';
        erroEl.style.display = 'block';
        return;
    }

    var resultado = DB.cadastrarProfessor(nome, email, senha);

    if (resultado.erro) {
        erroEl.textContent = resultado.erro;
        erroEl.style.display = 'block';
        return;
    }

    okEl.textContent = 'Professor ' + nome + ' cadastrado com sucesso! ✅';
    okEl.style.display = 'block';

    // Limpa formulário
    document.getElementById('novo-prof-nome').value = '';
    document.getElementById('novo-prof-email').value = '';
    document.getElementById('novo-prof-senha').value = '';

    renderListaProfessores();
});

function renderListaProfessores() {
    var container = document.getElementById('lista-professores');
    var professores = DB.listarProfessores();

    if (professores.length === 0) {
        container.innerHTML = '<p style="color: #636E72;">Nenhum professor cadastrado ainda.</p>';
        return;
    }

    var html = '';
    professores.forEach(function(prof) {
        html += '<div class="card-selecao" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; cursor: default;">' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
            '<span class="avatar">👨‍🏫</span>' +
            '<div style="text-align: left;">' +
            '<span style="font-weight: 700;">' + prof.nome + '</span>' +
            '<span style="display: block; font-size: 0.85rem; color: #636E72;">' + prof.email + '</span>' +
            '</div>' +
            '</div>' +
            '<button class="btn-remover-prof" data-id="' + prof.id + '" style="background: var(--primary-color); color: white; border: none; border-radius: 50px; padding: 6px 16px; cursor: pointer; font-family: var(--font-main); font-weight: 700;">Remover</button>' +
            '</div>';
    });

    container.innerHTML = html;

    // Bind remove buttons
    container.querySelectorAll('.btn-remover-prof').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja remover este professor?')) {
                DB.removerProfessor(id);
                renderListaProfessores();
            }
        });
    });
}

document.getElementById('btn-admin-sair').addEventListener('click', function() {
    currentAdmin = null;
    stepAdminPanel.style.display = 'none';
    stepTipo.style.display = 'block';
    stepProfLogin.removeAttribute('data-mode');
});

// ==================== NAVEGAÇÃO PROF/ADMIN ====================

document.getElementById('btn-voltar-prof').addEventListener('click', function() {
    stepProfLogin.style.display = 'none';
    stepTipo.style.display = 'block';
    stepProfLogin.removeAttribute('data-mode');
    document.getElementById('prof-email').value = '';
    document.getElementById('prof-senha').value = '';
    document.getElementById('prof-erro').style.display = 'none';
});

// ==================== STEP 1: TURMAS ====================

function renderTurmas() {
    var turmasList = document.getElementById('turmas-list');
    turmasList.innerHTML = '';
    var turmas = DB.listarTurmas();

    turmas.forEach(function(turma) {
        var card = document.createElement('div');
        card.className = 'card-selecao';
        card.innerHTML = '<span class="avatar">' + turma.icone + '</span><span>' + turma.nome + '</span>';
        card.addEventListener('click', function() {
            selectedTurmaId = turma.id;
            document.getElementById('titulo-turma').innerText = 'Turma ' + turma.nome + ' - Quem é você?';
            stepTurma.style.display = 'none';
            stepAluno.style.display = 'block';
            renderAlunos(turma.id);
        });
        turmasList.appendChild(card);
    });
}

// ==================== STEP 2: ALUNOS ====================

var selectedTurmaId = null;
var selectedAluno = null;

function renderAlunos(turmaId) {
    var alunosList = document.getElementById('alunos-list');
    alunosList.innerHTML = '';
    var alunos = DB.listarAlunos(turmaId);

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
    document.getElementById('avatar-aluno-selecionado').textContent = aluno.avatar_url;
    document.getElementById('nome-aluno-selecionado').textContent = aluno.nome;
    document.getElementById('titulo-senha').innerText = 'Olá, ' + aluno.nome + '!';
    document.getElementById('input-senha').value = '';
    document.getElementById('senha-erro').style.display = 'none';
    document.getElementById('input-senha').focus();
    stepAluno.style.display = 'none';
    stepSenha.style.display = 'block';
}

document.getElementById('btn-entrar').addEventListener('click', function() {
    var senhaDigitada = document.getElementById('input-senha').value.trim();
    if (!senhaDigitada) {
        document.getElementById('senha-erro').textContent = 'Digite sua senha!';
        document.getElementById('senha-erro').style.display = 'block';
        return;
    }
    if (senhaDigitada !== selectedAluno.senha) {
        document.getElementById('senha-erro').textContent = 'Senha incorreta! Tente novamente.';
        document.getElementById('senha-erro').style.display = 'block';
        document.getElementById('input-senha').value = '';
        document.getElementById('input-senha').focus();
        return;
    }
    loginAs(selectedAluno);
});

document.getElementById('input-senha').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('btn-entrar').click();
    }
});

// ==================== LOGIN ====================

function loginAs(aluno) {
    localStorage.setItem('currentStudent', JSON.stringify(aluno));
    window.location.href = 'index.html';
}

// ==================== NAVEGAÇÃO ALUNO ====================

document.getElementById('btn-voltar-tipo').addEventListener('click', function() {
    selectedTurmaId = null;
    stepTurma.style.display = 'none';
    stepTipo.style.display = 'block';
});

document.getElementById('btn-voltar-turma').addEventListener('click', function() {
    selectedTurmaId = null;
    stepAluno.style.display = 'none';
    stepTurma.style.display = 'block';
});

document.getElementById('btn-voltar-aluno').addEventListener('click', function() {
    selectedAluno = null;
    stepSenha.style.display = 'none';
    stepAluno.style.display = 'block';
});

document.getElementById('btn-visitante').addEventListener('click', function() {
    localStorage.setItem('currentStudent', JSON.stringify({ id: 'visitante', nome: 'Visitante', avatar_url: '👤' }));
    window.location.href = 'index.html';
});

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', function() {
    var currentStudent = localStorage.getItem('currentStudent');
    if (currentStudent && window.location.pathname.indexOf('login.html') !== -1) {
        window.location.href = 'index.html';
    }
});
