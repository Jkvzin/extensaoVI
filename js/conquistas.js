/* js/conquistas.js */

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
            botaoHTML = `<button class="btn-usar" onclick="selecionarAvatar('${avatar.id}')">Usar</button>`;
        } else {
            botaoHTML = `<button class="btn-comprar" onclick="comprarAvatar('${avatar.id}', ${avatar.preco})">Comprar</button>`;
        }

        card.innerHTML = `
            <div class="avatar-img">${avatar.img}</div>
            <div class="avatar-preco">${avatar.preco > 0 ? `🪙 ${avatar.preco}` : 'Grátis'}</div>
            ${botaoHTML}
        `;
        avataresContainer.appendChild(card);
    });
}

window.comprarAvatar = function(id, preco) {
    if (moedas >= preco) {
        moedas -= preco;
        avataresComprados.push(id);
        localStorage.setItem('avataresComprados', JSON.stringify(avataresComprados));
        atualizarSaldo();
        selecionarAvatar(id); // Já seleciona automaticamente ao comprar
    } else {
        alert('Moedas insuficientes para comprar este avatar! Continue jogando para ganhar mais.');
    }
};

window.selecionarAvatar = function(id) {
    avatarSelecionado = id;
    localStorage.setItem('avatarSelecionado', id);
    renderAvatares();
    alert('Avatar atualizado com sucesso!');
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    atualizarSaldo();
    renderBadges();
    renderAvatares();
});
