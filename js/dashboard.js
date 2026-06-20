/* js/dashboard.js */

// State
var currentUser = null;
var currentTurmaId = null;
var chartOperacoes = null;
var chartEvolucao = null;
var chartAlunoEvolucao = null;

// DOM Elements
var authView = document.getElementById('auth-view');
var dashboardView = document.getElementById('dashboard-view');
var loginForm = document.getElementById('login-form');
var logoutBtn = document.getElementById('logout-btn');
var authError = document.getElementById('auth-error');

var tabBtns = document.querySelectorAll('.tab-btn');
var tabContents = document.querySelectorAll('.tab-content');

var turmasList = document.getElementById('turmas-list');
var btnNovaTurma = document.getElementById('btn-nova-turma');
var modalTurma = document.getElementById('modal-turma');
var formTurma = document.getElementById('form-turma');

var alunosContainer = document.getElementById('alunos-container');
var btnNovoAluno = document.getElementById('btn-novo-aluno');
var btnVoltarTurmas = document.getElementById('btn-voltar-turmas');
var modalAluno = document.getElementById('modal-aluno');
var formAluno = document.getElementById('form-aluno');
var alunosListEl = document.getElementById('alunos-list');
var turmaSelecionadaNome = document.getElementById('turma-selecionada-nome');

var filtroTurma = document.getElementById('filtro-turma');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupTabs();
    setupModals();
    setupCharts();

    // Login form
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value.trim();

        if (!email || !password) {
            authError.textContent = 'Preencha e-mail e senha.';
            authError.style.display = 'block';
            return;
        }

        var usuario = DB.authUsuario(email, password);

        if (!usuario) {
            authError.textContent = 'E-mail ou senha incorretos.';
            authError.style.display = 'block';
            return;
        }

        if (usuario.role === 'admin') {
            authError.textContent = 'Diretor deve usar o painel administrativo na tela de login.';
            authError.style.display = 'block';
            return;
        }

        currentUser = usuario;
        localStorage.setItem('profUser', JSON.stringify(usuario));
        showDashboard();
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('profUser');
        showAuth();
    });

    // Voltar turmas
    btnVoltarTurmas.addEventListener('click', function() {
        currentTurmaId = null;
        alunosContainer.style.display = 'none';
        turmasList.style.display = 'grid';
    });

    // Filtro turma
    filtroTurma.addEventListener('change', updateMetrics);

    // Export PDF
    document.getElementById('btn-export-pdf').addEventListener('click', function() {
        // Garante que dados estão atualizados
        updateMetrics();
        updateCharts();

        // Adiciona cabeçalho temporário com data
        var turmaNome = filtroTurma.options[filtroTurma.selectedIndex].text;
        var dataRelatorio = document.createElement('div');
        dataRelatorio.id = 'print-header-temp';
        dataRelatorio.style.cssText = 'text-align:center;margin-bottom:20px;padding:10px;border-bottom:2px solid black;display:none;';
        dataRelatorio.innerHTML = '<p style="font-size:1.2rem;font-weight:900;color:black;">📊 Relatório de Desempenho — Portal Matemática CAIC</p>' +
            '<p style="color:#666;">Turma: ' + turmaNome + ' | Gerado em: ' + new Date().toLocaleDateString('pt-BR') + '</p>';

        var dashboardView = document.getElementById('dashboard-view');
        dashboardView.insertBefore(dataRelatorio, dashboardView.firstChild);

        // Mostra cabeçalho só na impressão
        var style = document.createElement('style');
        style.id = 'print-style-temp';
        style.textContent = '@media print { #print-header-temp { display: block !important; } } @media screen { #print-header-temp { display: none !important; } }';
        document.head.appendChild(style);

        // Muda para tab métricas
        tabBtns.forEach(function(b) { b.classList.remove('active'); });
        tabContents.forEach(function(c) { c.classList.remove('active'); });
        document.querySelector('[data-tab="metricas"]').classList.add('active');
        document.getElementById('tab-metricas').classList.add('active');

        setTimeout(function() {
            window.print();

            // Limpa elementos temporários
            setTimeout(function() {
                var tempHeader = document.getElementById('print-header-temp');
                var tempStyle = document.getElementById('print-style-temp');
                if (tempHeader) tempHeader.remove();
                if (tempStyle) tempStyle.remove();
            }, 500);
        }, 300);
    });
});

// Setup Tabs
function setupTabs() {
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            tabBtns.forEach(function(b) { b.classList.remove('active'); });
            tabContents.forEach(function(c) { c.classList.remove('active'); });

            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');

            if (btn.dataset.tab === 'metricas') {
                updateMetrics();
            }
        });
    });
}

// Setup Modals
function setupModals() {
    // Turma Modal
    btnNovaTurma.addEventListener('click', function() {
        modalTurma.style.display = 'flex';
    });

    formTurma.addEventListener('submit', function(e) {
        e.preventDefault();
        var nome = document.getElementById('nome-turma').value.trim();
        var ano = document.getElementById('ano-letivo').value;

        if (!nome) return;

        DB.criarTurma(nome, parseInt(ano), currentUser ? currentUser.id : null);
        modalTurma.style.display = 'none';
        formTurma.reset();
        renderTurmas();
    });

    // Aluno Modal
    btnNovoAluno.addEventListener('click', function() {
        modalAluno.style.display = 'flex';
    });

    formAluno.addEventListener('submit', function(e) {
        e.preventDefault();
        var nome = document.getElementById('nome-aluno').value.trim();
        if (!nome || !currentTurmaId) return;

        var novoAluno = DB.criarAluno(nome, currentTurmaId);
        modalAluno.style.display = 'none';
        formAluno.reset();

        // Mostra a senha gerada para o professor
        alert('Aluno ' + nome + ' cadastrado!\n\nSenha gerada: ' + novoAluno.senha + '\n\nAnote esta senha e entregue ao aluno.');

        renderAlunos(currentTurmaId);
    });

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.target.closest('.modal').style.display = 'none';
        });
    });
}

// Functions
function checkAuth() {
    var savedUser = localStorage.getItem('profUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showDashboard();
        } catch (e) {
            localStorage.removeItem('profUser');
            showAuth();
        }
    } else {
        showAuth();
    }
}

function showAuth() {
    authView.style.display = 'block';
    dashboardView.style.display = 'none';
}

function showDashboard() {
    authView.style.display = 'none';
    dashboardView.style.display = 'block';
    renderTurmas();
    populateFiltroTurmas();
}

function renderTurmas() {
    turmasList.innerHTML = '';
    var turmas = DB.listarTurmas();

    if (turmas.length === 0) {
        turmasList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhuma turma cadastrada. Clique em "+ Nova Turma" para começar.</p>';
        return;
    }

    turmas.forEach(function(turma) {
        var alunosCount = DB.contarAlunosPorTurma(turma.id);

        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = '' +
            '<div class="card-icon">🏫</div>' +
            '<h3 class="card-title">' + escaparHTML(turma.nome) + '</h3>' +
            '<p>' + turma.ano_letivo + '</p>' +
            '<p style="font-size: 0.9rem; color: #718096;">' + alunosCount + ' alunos</p>' +
            '<button class="btn-secondary" style="margin-top: 15px;" data-acao="ver" data-id="' + turma.id + '" data-nome="' + escaparHTML(turma.nome) + '">Ver Alunos</button>' +
            '<button class="btn-secondary" style="margin-top: 10px; background-color: var(--primary-color);" data-acao="excluir" data-id="' + turma.id + '">Excluir</button>';

        turmasList.appendChild(card);
    });

    // Bind dos botões
    turmasList.querySelectorAll('button[data-acao="ver"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            abrirTurma(this.dataset.id, this.dataset.nome);
        });
    });

    turmasList.querySelectorAll('button[data-acao="excluir"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (confirm("Tem certeza que deseja excluir esta turma? Todos os dados dos alunos serão perdidos!")) {
                DB.excluirTurma(this.dataset.id);
                renderTurmas();
                populateFiltroTurmas();
                if (currentTurmaId === this.dataset.id) {
                    currentTurmaId = null;
                    alunosContainer.style.display = 'none';
                    turmasList.style.display = 'grid';
                }
            }
        }.bind(btn));
    });
}

function abrirTurma(id, nome) {
    currentTurmaId = id;
    turmaSelecionadaNome.innerText = 'Turma: ' + nome;
    turmasList.style.display = 'none';
    alunosContainer.style.display = 'block';
    renderAlunos(id);
}

function renderAlunos(turmaId) {
    alunosListEl.innerHTML = '';
    var alunos = DB.listarAlunos(turmaId);

    if (alunos.length === 0) {
        alunosListEl.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum aluno cadastrado.</td></tr>';
        return;
    }

    alunos.forEach(function(aluno) {
        var tr = document.createElement('tr');
        tr.innerHTML = '' +
            '<td style="font-size: 2rem;">' + aluno.avatar_url + '</td>' +
            '<td style="font-weight: bold;">' + escaparHTML(aluno.nome) + '</td>' +
            '<td>' +
            '<span style="font-size: 0.85rem; color: #636E72; margin-right: 10px;">Senha: ' + aluno.senha + '</span>' +
            '<button class="btn-ver-progresso" data-id="' + aluno.id + '" style="padding: 6px 12px; background: var(--secondary-color); color: white; border: none; border-radius: 50px; cursor: pointer; font-family: var(--font-main); font-weight: 700; margin-right: 8px;">Ver Progresso</button>' +
            '<button class="btn-remover-aluno" data-id="' + aluno.id + '" style="padding: 6px 12px; background: var(--primary-color); color: white; border: none; border-radius: 50px; cursor: pointer; font-family: var(--font-main); font-weight: 700;">Remover</button>' +
            '</td>';
        alunosListEl.appendChild(tr);
    });

    alunosListEl.querySelectorAll('.btn-remover-aluno').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (confirm("Remover este aluno?")) {
                DB.excluirAluno(this.dataset.id);
                renderAlunos(turmaId);
            }
        });
    });

    alunosListEl.querySelectorAll('.btn-ver-progresso').forEach(function(btn) {
        btn.addEventListener('click', function() {
            abrirDetalhesAluno(this.dataset.id);
        });
    });
}

function populateFiltroTurmas() {
    filtroTurma.innerHTML = '<option value="">Todas as Turmas</option>';
    DB.listarTurmas().forEach(function(turma) {
        var opt = document.createElement('option');
        opt.value = turma.id;
        opt.innerText = turma.nome;
        filtroTurma.appendChild(opt);
    });
}

function updateMetrics() {
    var turmaId = filtroTurma.value;

    // === MÉTRICAS REAIS ===
    var progressos;
    if (turmaId) {
        progressos = DB.getProgressoTurma(turmaId);
    } else {
        progressos = DB._raw().progresso;
    }

    if (progressos.length > 0) {
        var somaPct = 0;
        progressos.forEach(function(p) { somaPct += p.pct; });
        var mediaAcertos = Math.round(somaPct / progressos.length);
        document.getElementById('metric-acertos').innerText = mediaAcertos + '%';
        document.getElementById('metric-quizzes').innerText = progressos.length;

        // Taxa de engajamento: percentual de quizzes com pelo menos 50% de acerto
        var engajados = progressos.filter(function(p) { return p.pct >= 50; }).length;
        var taxaEngajamento = Math.round((engajados / progressos.length) * 100);
        document.getElementById('metric-engajamento').innerText = taxaEngajamento + '%';
    } else {
        document.getElementById('metric-acertos').innerText = '--%';
        document.getElementById('metric-quizzes').innerText = '0';
        document.getElementById('metric-engajamento').innerText = '--%';
    }

    // === RANKING REAL (do sistema de XP) ===
    var rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';

    var ranking;
    if (typeof XPSystem !== 'undefined') {
        if (turmaId) {
            ranking = XPSystem.getRankingPorTurma(turmaId);
        } else {
            ranking = XPSystem.getRanking();
        }
    } else {
        ranking = [];
    }

    if (ranking.length === 0) {
        rankingList.innerHTML = '<tr><td colspan="3" style="text-align:center; color: #636E72;">Nenhum aluno pontuou ainda. Peça para os alunos jogarem o quiz!</td></tr>';
        return;
    }

    ranking.forEach(function(item, index) {
        var medalha = '';
        if (index === 0) medalha = ' 🥇';
        else if (index === 1) medalha = ' 🥈';
        else if (index === 2) medalha = ' 🥉';

        var tr = document.createElement('tr');
        if (index === 0) tr.style.backgroundColor = '#FFFDE7';
        else if (index === 1) tr.style.backgroundColor = '#F5F5F5';
        else if (index === 2) tr.style.backgroundColor = '#FFF3E0';

        tr.innerHTML = '' +
            '<td style="font-weight: 900;">#' + (index + 1) + medalha + '</td>' +
            '<td>' + item.avatar_url + ' ' + escaparHTML(item.nome) + '</td>' +
            '<td style="font-weight: bold; color: var(--secondary-color);">' + item.xp + ' XP (Nv. ' + item.level + ')</td>';

        rankingList.appendChild(tr);
    });

    updateCharts();
}

function setupCharts() {
    try {
        var ctxOps = document.getElementById('chart-operacoes').getContext('2d');
        chartOperacoes = new Chart(ctxOps, {
            type: 'bar',
            data: {
                labels: ['Adição', 'Subtração', 'Multiplicação', 'Divisão'],
                datasets: [{
                    label: 'Média de Acertos (%)',
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#4ECDC4', '#4ECDC4', '#FF6B6B', '#FF6B6B'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    } catch (e) {
        console.warn('Erro ao criar gráfico de operações:', e.message);
    }

    try {
        var ctxEvolucao = document.getElementById('chart-evolucao').getContext('2d');
        chartEvolucao = new Chart(ctxEvolucao, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Pontuação Média',
                    data: [],
                    borderColor: '#FFE66D',
                    backgroundColor: 'rgba(255, 230, 109, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    } catch (e) {
        console.warn('Erro ao criar gráfico de evolução:', e.message);
    }
}

function updateCharts() {
    var turmaId = filtroTurma.value;

    var progressos;
    if (turmaId) {
        progressos = DB.getProgressoTurma(turmaId);
    } else {
        progressos = DB._raw().progresso;
    }

    // === GRÁFICO DE OPERAÇÕES (barras) ===
    if (chartOperacoes) {
        var porCategoria = { 'Adição': [], 'Subtração': [], 'Multiplicação': [], 'Divisão': [] };
        progressos.forEach(function(p) {
            var cat = p.categoria || '';
            if (cat === 'Adição' || cat === 'Adicao') porCategoria['Adição'].push(p.pct);
            else if (cat === 'Subtração' || cat === 'Subtracao') porCategoria['Subtração'].push(p.pct);
            else if (cat === 'Multiplicação' || cat === 'Multiplicacao') porCategoria['Multiplicação'].push(p.pct);
            else if (cat === 'Divisão' || cat === 'Divisao') porCategoria['Divisão'].push(p.pct);
        });

        var mediasOps = ['Adição', 'Subtração', 'Multiplicação', 'Divisão'].map(function(op) {
            var vals = porCategoria[op];
            if (vals.length === 0) return 0;
            var soma = 0;
            vals.forEach(function(v) { soma += v; });
            return Math.round(soma / vals.length);
        });

        chartOperacoes.data.datasets[0].data = mediasOps;
        chartOperacoes.update();
    }

    // === GRÁFICO DE EVOLUÇÃO SEMANAL (linha) ===
    if (chartEvolucao) {
        // Agrupa por semana (usa timestamp)
        var semanas = {};
        progressos.forEach(function(p) {
            if (!p.timestamp) return;
            var d = new Date(p.timestamp);
            // Chave: ano + semana do ano
            var semanaKey = d.getFullYear() + '-W' + getWeekNumber(d);
            if (!semanas[semanaKey]) {
                semanas[semanaKey] = { soma: 0, count: 0 };
            }
            semanas[semanaKey].soma += p.pct;
            semanas[semanaKey].count += 1;
        });

        var chaves = Object.keys(semanas).sort();
        var labelsEvol = chaves.map(function(k) {
            var partes = k.split('-W');
            return partes[1] + 'ª sem';
        });
        var dataEvol = chaves.map(function(k) {
            return Math.round(semanas[k].soma / semanas[k].count);
        });

        chartEvolucao.data.labels = labelsEvol;
        chartEvolucao.data.datasets[0].data = dataEvol;
        chartEvolucao.update();
    }
}

// ==================== DETALHES DO ALUNO (Relatório Individual) ====================

function abrirDetalhesAluno(alunoId) {
    var modal = document.getElementById('modal-detalhes-aluno');
    if (!modal) return;

    var aluno = DB.getAluno(alunoId);
    if (!aluno) {
        alert('Aluno não encontrado.');
        return;
    }

    // Cabeçalho
    document.getElementById('detalhes-aluno-avatar').textContent = aluno.avatar_url;
    document.getElementById('detalhes-aluno-nome').textContent = aluno.nome;
    var turma = DB.getTurma(aluno.turma_id);
    document.getElementById('detalhes-aluno-turma').textContent = 'Turma: ' + (turma ? turma.nome : 'N/A');

    // Busca progresso do aluno
    var progresso = DB.getProgressoAluno(alunoId);

    // XP e Nível
    var xpData = null;
    if (typeof XPSystem !== 'undefined') {
        var allXP = XPSystem.getAllData();
        if (allXP && allXP[alunoId]) {
            xpData = allXP[alunoId];
        }
    }

    document.getElementById('det-xp').textContent = xpData ? xpData.xp : '0';
    document.getElementById('det-nivel').textContent = xpData ? ('Nv. ' + xpData.level) : 'Nv. 1';
    document.getElementById('det-quizzes').textContent = progresso.length;

    if (progresso.length > 0) {
        var somaPct = 0;
        progresso.forEach(function(p) { somaPct += p.pct; });
        document.getElementById('det-media').textContent = Math.round(somaPct / progresso.length) + '%';
    } else {
        document.getElementById('det-media').textContent = '--%';
    }

    // Histórico
    renderHistoricoAluno(progresso);

    // Gráfico de evolução
    renderGraficoAluno(progresso);

    modal.style.display = 'flex';
}

function renderHistoricoAluno(progresso) {
    var tbody = document.getElementById('det-historico-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (progresso.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#636E72;">Nenhum quiz realizado ainda.</td></tr>';
        return;
    }

    // Ordena do mais recente
    var ordenado = progresso.slice().sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    ordenado.forEach(function(p) {
        var data = new Date(p.timestamp);
        var dataStr = data.toLocaleDateString('pt-BR');
        var tr = document.createElement('tr');
        tr.innerHTML = '' +
            '<td>' + dataStr + '</td>' +
            '<td>' + (p.categoria || 'Quiz') + '</td>' +
            '<td>' + p.acertos + '/' + p.total + '</td>' +
            '<td style="font-weight: 700; color: ' + (p.pct >= 70 ? 'var(--success-color)' : 'var(--primary-color)') + ';">' + p.pct + '%</td>' +
            '<td>⭐ ' + (p.xp_ganho || 0) + '</td>';
        tbody.appendChild(tr);
    });
}

function renderGraficoAluno(progresso) {
    var canvas = document.getElementById('chart-aluno-evolucao');
    if (!canvas) return;

    // Destroi gráfico anterior
    if (chartAlunoEvolucao) {
        chartAlunoEvolucao.destroy();
        chartAlunoEvolucao = null;
    }

    if (progresso.length === 0) return;

    // Ordena por timestamp
    var ordenado = progresso.slice().sort(function(a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    // Pega últimos 10 quizzes
    var recentes = ordenado.slice(-10);

    var labels = recentes.map(function(p, i) { return 'Q' + (i + 1); });
    var dataPct = recentes.map(function(p) { return p.pct; });

    try {
        var ctx = canvas.getContext('2d');
        chartAlunoEvolucao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Acertos (%)',
                    data: dataPct,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B6B',
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Acertos (%)' } },
                    x: { title: { display: true, text: 'Quizzes (ordem cronológica)' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } catch (e) {
        console.warn('Erro ao criar gráfico do aluno:', e.message);
    }
}

// ==================== UTILITÁRIOS ====================

function escaparHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
