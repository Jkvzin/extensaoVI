1|/* js/conquistas.js */
2|
3|const badges = [
4|    { id: 'b1', icone: '🧮', nome: 'Mestre da Tabuada', desc: 'Acertou 100 questões', req: 100 },
5|    { id: 'b2', icone: '🎬', nome: 'Explorador de Vídeos', desc: 'Assistiu 10 vídeos', req: 10 },
6|    { id: 'b3', icone: '🏆', nome: 'Perfeccionista', desc: '3 quizzes com 100%', req: 3 },
7|    { id: 'b4', icone: '🔥', nome: 'Fogo nos Números', desc: 'Ofensiva de 7 dias', req: 7 },
8|    { id: 'b5', icone: '🚀', nome: 'Astronauta', desc: 'Concluiu o módulo 1', req: 1 },
9|    { id: 'b6', icone: '🧠', nome: 'Cérebro de Einstein', desc: '500 acertos no total', req: 500 }
10|];
11|
12|const avataresLoja = [
13|    { id: 'a1', img: '👦', preco: 0 }, // Grátis inicial
14|    { id: 'a2', img: '👧', preco: 0 },
15|    { id: 'a3', img: '🐶', preco: 50 },
16|    { id: 'a4', img: '🐱', preco: 50 },
17|    { id: 'a5', img: '🦊', preco: 100 },
18|    { id: 'a6', img: '🐸', preco: 100 },
19|    { id: 'a7', img: '👽', preco: 250 },
20|    { id: 'a8', img: '🤖', preco: 500 }
21|];
22|
23|// Estado local mockado (Seria do backend/Supabase futuramente)
24|let storedMoedas = localStorage.getItem('moedas');
25|let moedas = storedMoedas !== null ? parseInt(storedMoedas) : 300; // Começa com 300 para testar
26|let badgesDesbloqueados = JSON.parse(localStorage.getItem('badgesDesbloqueados')) || ['b1', 'b2'];
27|let avataresComprados = JSON.parse(localStorage.getItem('avataresComprados')) || ['a1', 'a2'];
28|let avatarSelecionado = localStorage.getItem('avatarSelecionado') || 'a1';
29|
30|// Elementos
31|const moedasSaldo = document.getElementById('moedas-saldo');
32|const badgesContainer = document.getElementById('badges-container');
33|const avataresContainer = document.getElementById('avatares-container');
34|
35|function atualizarSaldo() {
36|    moedasSaldo.innerText = moedas;
37|    localStorage.setItem('moedas', moedas);
38|}
39|
40|function renderBadges() {
41|    badgesContainer.innerHTML = '';
42|    badges.forEach(badge => {
43|        const desbloqueado = badgesDesbloqueados.includes(badge.id);
44|        
45|        const card = document.createElement('div');
46|        card.className = `badge-card ${desbloqueado ? '' : 'badge-bloqueado'}`;
47|        card.title = badge.desc; // Tooltip simples
48|        
49|        card.innerHTML = `
50|            <div class="badge-icone">${badge.icone}</div>
51|            <div class="badge-nome">${badge.nome}</div>
52|            <div class="badge-desc">${badge.desc}</div>
53|        `;
54|        badgesContainer.appendChild(card);
55|    });
56|}
57|
58|function renderAvatares() {
59|    avataresContainer.innerHTML = '';
60|    avataresLoja.forEach(avatar => {
61|        const comprado = avataresComprados.includes(avatar.id);
62|        const selecionado = avatarSelecionado === avatar.id;
63|        
64|        const card = document.createElement('div');
65|        card.className = `avatar-card ${comprado ? 'comprado' : ''} ${selecionado ? 'selecionado' : ''}`;
66|        
67|        let botaoHTML = '';
68|        if (selecionado) {
69|            botaoHTML = `<button class="btn-usar" disabled style="background-color:#A0AEC0;">Em Uso</button>`;
70|        } else if (comprado) {
71|            botaoHTML = `<button class="btn-usar" onclick="selecionarAvatar('${avatar.id}')">Usar</button>`;
72|        } else {
73|            botaoHTML = `<button class="btn-comprar" onclick="comprarAvatar('${avatar.id}', ${avatar.preco})">Comprar</button>`;
74|        }
75|
76|        card.innerHTML = `
77|            <div class="avatar-img">${avatar.img}</div>
78|            <div class="avatar-preco">${avatar.preco > 0 ? `🪙 ${avatar.preco}` : 'Grátis'}</div>
79|            ${botaoHTML}
80|        `;
81|        avataresContainer.appendChild(card);
82|    });
83|}
84|
85|function comprarAvatar(id, preco) {
86|    if (moedas >= preco) {
87|        moedas -= preco;
88|        avataresComprados.push(id);
89|        localStorage.setItem('avataresComprados', JSON.stringify(avataresComprados));
90|        atualizarSaldo();
91|        selecionarAvatar(id); // Já seleciona automaticamente ao comprar
92|    } else {
93|        mostrarNotificacao('Moedas insuficientes! Continue jogando para ganhar mais.');
94|    }
95|};
96|
97|function selecionarAvatar(id) {
98|    avatarSelecionado = id;
99|    localStorage.setItem('avatarSelecionado', id);
100|    renderAvatares();
101|    mostrarNotificacao('Avatar atualizado com sucesso!');
102|};
103|
104|// Initialize
105|document.addEventListener('DOMContentLoaded', () => {
106|    atualizarSaldo();
107|    renderBadges();
108|    renderAvatares();
109|});
110|