/* js/conquistas.js */

// TODO: Implementar desbloqueio automático baseado na propriedade 'req' de cada badge
const badges = [
    { id: 'b1', icone: '🧮', nome: 'Mestre da Tabuada', desc: 'Acertou 100 questões', req: 100 },
    { id: 'b2', icone: '🎬', nome: 'Explorador de Vídeos', desc: 'Assistiu 10 vídeos', req: 10 },
    { id: 'b3', icone: '🏆', nome: 'Perfeccionista', desc: '3 quizzes com 100%', req: 3 },
    { id: 'b4', icone: '🔥', nome: 'Fogo nos Números', desc: 'Ofensiva de 7 dias', req: 7 },
    { id: 'b5', icone: '🚀', nome: 'Astronauta', desc: 'Concluiu o módulo 1', req: 1 },
    { id: 'b6', icone: '🧠', nome: 'Cérebro de Einstein', desc: '500 acertos no total', req: 500 }
];

const avataresLoja = [
    { id: 'a1', img: '👦', preco: 0 }, // Grátis inicial
    { id: 'a2', img: '👧', preco: 0 },
    { id: 'a3', img: '🐶', preco: 50 },
    { id: 'a4', img: '🐱', preco: 50 },
    { id: 'a5', img: '🦊', preco: 100 },
    { id: 'a6', img: '🐸', preco: 100 },
    { id: 'a7', img: '👽', preco: 250 },
    { id: 'a8', img: '🤖', preco: 500 }
];

// Estado local mockado (Seria do backend/Supabase futuramente)
// TODO: Integrar com XPSystem.onXPChanged() para ganhar moedas (Issue #21)
let storedMoedas = localStorage.getItem('moedas');
let moedas = storedMoedas !== null ? parseInt(storedMoedas) : 300; // Começa com 300 para testar
let badgesDesbloqueados = JSON.parse(localStorage.getItem('badgesDesbloqueados')) || ['b1', 'b2'];
let avataresComprados = JSON.parse(localStorage.getItem('avataresComprados')) || ['a1', 'a2'];
let avatarSelecionado = localStorage.getItem('avatarSelecionado') || 'a1';

// Elementos
const moedasSaldo = document.getElementById('moedas-saldo');
const badgesContainer = document.getElementById('badges-container');
const avataresContainer = document.getElementById('avatares-container');

function atualizarSaldo() {
    moedasSaldo.innerText = moedas;
    localStorage.setItem('moedas', moedas);
}

function renderBadges() {
    badgesContainer.innerHTML = '';
    badges.forEach(badge => {
        const desbloqueado = badgesDesbloqueados.includes(badge.id);
        
        const card = document.createElement('div');
        card.className = `badge-card ${desbloqueado ? '' : 'badge-bloqueado'}`;
        card.title = badge.desc; // Tooltip simples
        
        card.innerHTML = `
            <div class="badge-icone">${badge.icone}</div>
            <div class="badge-nome">${badge.nome}</div>
            <div class="badge-desc">${badge.desc}</div>
        `;
        badgesContainer.appendChild(card);
    });
}

function renderAvatares() {
    avataresContainer.innerHTML = '';
    avataresLoja.forEach(avatar => {
        const comprado = avataresComprados.includes(avatar.id);
        const selecionado = avatarSelecionado === avatar.id;
        
        const card = document.createElement('div');
        card.className = `avatar-card ${comprado ? 'comprado' : ''} ${selecionado ? 'selecionado' : ''}`;
        
        let botaoHTML = '';
        if (selecionado) {
            botaoHTML = `<button class="btn-usar" disabled style="background-color:#A0AEC0;">Em Uso</button>`;
        } else if (comprado) {
            botaoHTML = `<button class="btn-usar btn-action">Usar</button>`;
        } else {
            botaoHTML = `<button class="btn-comprar btn-action">Comprar</button>`;
        }

        card.innerHTML = `
            <div class="avatar-img">${avatar.img}</div>
            <div class="avatar-preco">${avatar.preco > 0 ? `🪙 ${avatar.preco}` : 'Grátis'}</div>
            ${botaoHTML}
        `;
        
        if (!selecionado) {
            const btn = card.querySelector('.btn-action');
            if (comprado) {
                btn.addEventListener('click', () => selecionarAvatar(avatar.id));
            } else {
                btn.addEventListener('click', () => comprarAvatar(avatar.id, avatar.preco));
            }
        }
        
        avataresContainer.appendChild(card);
    });
}

function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '15px 25px';
    toast.style.backgroundColor = isError ? 'var(--primary-color)' : 'var(--success-color)';
    toast.style.color = 'white';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.zIndex = '1000';
    toast.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function comprarAvatar(id, preco) {
    if (moedas >= preco) {
        moedas -= preco;
        avataresComprados.push(id);
        localStorage.setItem('avataresComprados', JSON.stringify(avataresComprados));
        atualizarSaldo();
        selecionarAvatar(id); // Já seleciona automaticamente ao comprar
    } else {
        showToast('Moedas insuficientes para comprar este avatar!', true);
    }
}

function selecionarAvatar(id) {
    avatarSelecionado = id;
    localStorage.setItem('avatarSelecionado', id);
    renderAvatares();
    showToast('Avatar atualizado com sucesso!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    atualizarSaldo();
    renderBadges();
    renderAvatares();
});
