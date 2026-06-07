/* js/dashboard.js */

// Mock Database (Fallback while Supabase is not configured)
const MockDB = {
    turmas: [
        { id: '1', nome: '3º Ano A', ano_letivo: 2026, created_at: new Date().toISOString() },
        { id: '2', nome: '4º Ano B', ano_letivo: 2026, created_at: new Date().toISOString() }
    ],
    alunos: [
        { id: '101', nome: 'Joãozinho', turma_id: '1', avatar_url: '👦' },
        { id: '102', nome: 'Mariazinha', turma_id: '1', avatar_url: '👧' },
        { id: '103', nome: 'Pedrinho', turma_id: '2', avatar_url: '👦' }
    ],
    progresso: []
};

// State
let currentUser = null;
let currentTurmaId = null;
let chartOperacoes = null;
let chartEvolucao = null;

// Initialize Supabase (Optional for now)
const SUPABASE_URL = ''; // To be filled in PR #8
const SUPABASE_KEY = ''; // To be filled in PR #8
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const authError = document.getElementById('auth-error');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const turmasList = document.getElementById('turmas-list');
const btnNovaTurma = document.getElementById('btn-nova-turma');
const modalTurma = document.getElementById('modal-turma');
const formTurma = document.getElementById('form-turma');

const alunosContainer = document.getElementById('alunos-container');
const btnNovoAluno = document.getElementById('btn-novo-aluno');
const btnVoltarTurmas = document.getElementById('btn-voltar-turmas');
const modalAluno = document.getElementById('modal-aluno');
const formAluno = document.getElementById('form-aluno');
const alunosList = document.getElementById('alunos-list');
const turmaSelecionadaNome = document.getElementById('turma-selecionada-nome');

const filtroTurma = document.getElementById('filtro-turma');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupTabs();
    setupModals();
    setupCharts();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Mock Auth
    if (email && password) {
        currentUser = { email, id: 'prof-1' };
        localStorage.setItem('profUser', JSON.stringify(currentUser));
        showDashboard();
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('profUser');
    showAuth();
});

btnVoltarTurmas.addEventListener('click', () => {
    currentTurmaId = null;
    alunosContainer.style.display = 'none';
    turmasList.style.display = 'grid';
});

// Setup Tabs
function setupTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            
            if (btn.dataset.tab === 'metricas') {
                updateMetrics();
            }
        });
    });
}

// Setup Modals
function setupModals() {
    // Turma Modal
    btnNovaTurma.addEventListener('click', () => {
        modalTurma.style.display = 'flex';
    });
    
    formTurma.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-turma').value;
        const ano = document.getElementById('ano-letivo').value;
        
        MockDB.turmas.push({
            id: Date.now().toString(),
            nome,
            ano_letivo: ano,
            created_at: new Date().toISOString()
        });
        
        modalTurma.style.display = 'none';
        formTurma.reset();
        renderTurmas();
    });

    // Aluno Modal
    btnNovoAluno.addEventListener('click', () => {
        modalAluno.style.display = 'flex';
    });

    formAluno.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-aluno').value;
        
        MockDB.alunos.push({
            id: Date.now().toString(),
            nome,
            turma_id: currentTurmaId,
            avatar_url: ['👦', '👧', '👽', '🤖'][Math.floor(Math.random() * 4)]
        });
        
        modalAluno.style.display = 'none';
        formAluno.reset();
        renderAlunos(currentTurmaId);
    });

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
}

// Functions
function checkAuth() {
    const savedUser = localStorage.getItem('profUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
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
    MockDB.turmas.forEach(turma => {
        const alunosCount = MockDB.alunos.filter(a => a.turma_id === turma.id).length;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon">🏫</div>
            <h3 class="card-title">${turma.nome}</h3>
            <p>${turma.ano_letivo}</p>
            <p style="font-size: 0.9rem; color: #718096;">${alunosCount} alunos</p>
            <button class="btn-secondary" style="margin-top: 15px;" onclick="abrirTurma('${turma.id}', '${turma.nome}')">Ver Alunos</button>
            <button class="btn-secondary" style="margin-top: 10px; background-color: var(--primary-color);" onclick="excluirTurma('${turma.id}')">Excluir</button>
        `;
        turmasList.appendChild(card);
    });
}

function abrirTurma(id, nome) {
    currentTurmaId = id;
    turmaSelecionadaNome.innerText = `Turma: ${nome}`;
    turmasList.style.display = 'none';
    alunosContainer.style.display = 'block';
    renderAlunos(id);
};

function excluirTurma(id) {
    if (confirm("Tem certeza que deseja excluir esta turma? Todos os dados dos alunos serão perdidos!")) {
        MockDB.turmas = MockDB.turmas.filter(t => t.id !== id);
        MockDB.alunos = MockDB.alunos.filter(a => a.turma_id !== id);
        renderTurmas();
        populateFiltroTurmas();
    }
};

function renderAlunos(turmaId) {
    alunosList.innerHTML = '';
    const alunos = MockDB.alunos.filter(a => a.turma_id === turmaId);
    
    if (alunos.length === 0) {
        alunosList.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhum aluno cadastrado.</td></tr>`;
        return;
    }
    
    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size: 2rem;">${aluno.avatar_url}</td>
            <td style="font-weight: bold;">${aluno.nome}</td>
            <td>
                <button class="btn-secondary" style="padding: 6px 12px; background-color: var(--primary-color);" onclick="excluirAluno('${aluno.id}')">Remover</button>
            </td>
        `;
        alunosList.appendChild(tr);
    });
}

function excluirAluno(id) {
    if (confirm("Remover este aluno?")) {
        MockDB.alunos = MockDB.alunos.filter(a => a.id !== id);
        renderAlunos(currentTurmaId);
    }
};

function populateFiltroTurmas() {
    filtroTurma.innerHTML = '<option value="">Todas as Turmas</option>';
    MockDB.turmas.forEach(turma => {
        const opt = document.createElement('option');
        opt.value = turma.id;
        opt.innerText = turma.nome;
        filtroTurma.appendChild(opt);
    });
}

function updateMetrics() {
    // Mock data for metrics
    document.getElementById('metric-acertos').innerText = '78%';
    document.getElementById('metric-quizzes').innerText = '142';
    document.getElementById('metric-engajamento').innerText = '92%';
    
    // Mock ranking
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';
    const topAlunos = MockDB.alunos.slice(0, 3);
    topAlunos.forEach((aluno, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${aluno.avatar_url} ${aluno.nome}</td>
            <td style="font-weight: bold; color: var(--secondary-color);">${1500 - (index * 200)} XP</td>
        `;
        rankingList.appendChild(tr);
    });
    
    updateCharts();
}

function setupCharts() {
    const ctxOps = document.getElementById('chart-operacoes').getContext('2d');
    chartOperacoes = new Chart(ctxOps, {
        type: 'bar',
        data: {
            labels: ['Adição', 'Subtração', 'Multiplicação', 'Divisão'],
            datasets: [{
                label: 'Média de Acertos (%)',
                data: [90, 85, 60, 45],
                backgroundColor: ['#4ECDC4', '#4ECDC4', '#FF6B6B', '#FF6B6B'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    const ctxEvolucao = document.getElementById('chart-evolucao').getContext('2d');
    chartEvolucao = new Chart(ctxEvolucao, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Pontuação Média',
                data: [300, 450, 600, 850],
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
}

function updateCharts() {
    // In a real app, we would fetch data based on filtroTurma.value and update charts
    // chartOperacoes.data.datasets[0].data = newData;
    // chartOperacoes.update();
}

filtroTurma.addEventListener('change', updateMetrics);

// Export PDF mock
document.getElementById('btn-export-pdf').addEventListener('click', () => {
    alert("Exportação de PDF iniciada! (Simulação)");
});
