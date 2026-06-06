/**
 * js/multiplayer.js — Modo Multiplayer Local (X1)
 * 
 * Jogador 1 (Vermelho): A, S, D  → opções A, B, C
 * Jogador 2 (Azul):      ←, ↓, →   → opções A, B, C
 * 
 * Primeiro keydown válido trava a rodada.
 */

// ==========================================
// MAPEAMENTO DE TECLAS
// ==========================================
const KEY_MAP = {
    'a': { player: 1, optionIndex: 0 },
    's': { player: 1, optionIndex: 1 },
    'd': { player: 1, optionIndex: 2 },
    'ArrowLeft':  { player: 2, optionIndex: 0 },
    'ArrowDown':  { player: 2, optionIndex: 1 },
    'ArrowRight': { player: 2, optionIndex: 2 }
};

const PLAYER_COLORS = {
    1: { name: 'Vermelho', color: '#FF6B6B', bg: '#FFF0F0', keys: ['A', 'S', 'D'] },
    2: { name: 'Azul',     color: '#4ECDC4', bg: '#F0FFFC', keys: ['←', '↓', '→'] }
};

const KEY_SYMBOLS = ['A', 'B', 'C'];

// ==========================================
// ESTADO DO JOGO
// ==========================================
const Multiplayer = {
    currentQuestionIndex: 0,
    scores: { 1: 0, 2: 0 },
    roundLocked: false,
    totalQuestions: 0,
    gameStarted: false,

    /**
     * Inicializa o jogo multiplayer.
     */
    iniciar() {
        if (typeof QUIZ_DATA === 'undefined' || QUIZ_DATA.length === 0) {
            this._mostrarErro('Nenhuma pergunta encontrada. Verifique js/data.js.');
            return;
        }

        this.currentQuestionIndex = 0;
        this.scores = { 1: 0, 2: 0 };
        this.totalQuestions = QUIZ_DATA.length;
        this.gameStarted = true;
        this._atualizarPlacar();
        this._esconderOverlay();
        this._carregarPergunta();
        this._ativarTeclado();
    },

    /**
     * Carrega a pergunta atual e exibe na tela.
     */
    _carregarPergunta() {
        this.roundLocked = false;
        const question = QUIZ_DATA[this.currentQuestionIndex];

        // Progresso
        const progresso = document.getElementById('mpProgresso');
        if (progresso) {
            progresso.innerText = 'Pergunta ' + (this.currentQuestionIndex + 1) + ' de ' + this.totalQuestions;
        }

        // Texto da pergunta
        const perguntaEl = document.getElementById('mpPergunta');
        if (perguntaEl) perguntaEl.innerText = question.pergunta;

        // Limpa feedback visual dos painéis
        this._limparFeedback();

        // Gera botões de opção com indicadores de tecla
        const opcoesEl = document.getElementById('mpOpcoes');
        if (!opcoesEl) return;
        opcoesEl.innerHTML = '';

        question.opcoes.forEach((opcao, index) => {
            const btn = document.createElement('button');
            btn.className = 'mp-option-btn';
            btn.setAttribute('data-index', index);

            // Label da opção (letra A/B/C)
            const letra = KEY_SYMBOLS[index];

            // Indicadores de tecla para cada jogador
            btn.innerHTML = '<div class="mp-option-content">' +
                '<span class="mp-option-letter">' + letra + '</span>' +
                '<span class="mp-option-text">' + opcao + '</span>' +
                '</div>' +
                '<div class="mp-option-keys">' +
                '<span class="mp-key mp-key-p1">A</span>' +
                '<span class="mp-key mp-key-p2">←</span>' +
                '</div>';

            opcoesEl.appendChild(btn);

            // Atualiza as teclas corretas conforme a posição
            const keyP1 = btn.querySelector('.mp-key-p1');
            const keyP2 = btn.querySelector('.mp-key-p2');
            const p1Keys = PLAYER_COLORS[1].keys;
            const p2Keys = PLAYER_COLORS[2].keys;
            if (keyP1) keyP1.innerText = p1Keys[index];
            if (keyP2) keyP2.innerText = p2Keys[index];
        });

        // Botão próximo (escondido até a rodada resolver)
        const nextBtn = document.getElementById('mpNextBtn');
        if (nextBtn) nextBtn.style.display = 'none';
    },

    /**
     * Processa um keydown de um jogador.
     */
    _onKeyDown(e) {
        if (!this.gameStarted || this.roundLocked) return;

        const mapping = KEY_MAP[e.key];
        if (!mapping) return;

        e.preventDefault();

        const { player, optionIndex } = mapping;
        const question = QUIZ_DATA[this.currentQuestionIndex];
        const isCorrect = optionIndex === question.respostaCorretaIndex;

        // Trava a rodada IMEDIATAMENTE
        this.roundLocked = true;

        if (isCorrect) {
            this.scores[player]++;
            this._feedbackAcerto(player, optionIndex);
        } else {
            this._feedbackErro(player, optionIndex, question.respostaCorretaIndex);
        }

        this._atualizarPlacar();
        this._mostrarBotaoProximo();

        // Desabilita visualmente os botões
        this._desabilitarOpcoes();
    },

    /**
     * Feedback visual de acerto — painel do jogador acende verde.
     */
    _feedbackAcerto(player, optionIndex) {
        const panel = document.getElementById('mpPanel' + player);
        if (panel) {
            panel.classList.add('mp-acerto');
            setTimeout(() => panel.classList.remove('mp-acerto'), 1000);
        }

        // Destaca o botão correto
        const botoes = document.querySelectorAll('.mp-option-btn');
        botoes.forEach((btn, i) => {
            if (i === optionIndex) {
                btn.classList.add('mp-option-correct');
            }
        });

        // Feedback textual
        const feedback = document.getElementById('mpFeedback');
        if (feedback) {
            const playerColor = PLAYER_COLORS[player];
            feedback.innerHTML = '<span style="color:' + playerColor.color + ';font-weight:900">Jogador ' + player +
                ' (' + playerColor.name + ') acertou! 🎉</span>';
            feedback.className = 'mp-feedback mp-feedback-show';
        }

        // Confete
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 60,
                spread: 50,
                origin: { x: player === 1 ? 0.25 : 0.75, y: 0.5 }
            });
        }
    },

    /**
     * Feedback visual de erro — painel do jogador acende vermelho.
     */
    _feedbackErro(player, optionIndex, correctIndex) {
        const panel = document.getElementById('mpPanel' + player);
        if (panel) {
            panel.classList.add('mp-erro');
            setTimeout(() => panel.classList.remove('mp-erro'), 1000);
        }

        // Destaca: errado vermelho, certo verde
        const botoes = document.querySelectorAll('.mp-option-btn');
        botoes.forEach((btn, i) => {
            if (i === optionIndex) btn.classList.add('mp-option-wrong');
            if (i === correctIndex) btn.classList.add('mp-option-correct');
        });

        const feedback = document.getElementById('mpFeedback');
        if (feedback) {
            const playerColor = PLAYER_COLORS[player];
            feedback.innerHTML = '<span style="color:' + playerColor.color + ';font-weight:900">Jogador ' + player +
                ' (' + playerColor.name + ') errou! ❌</span>';
            feedback.className = 'mp-feedback mp-feedback-show';
        }
    },

    /**
     * Limpa classes de feedback dos painéis e botões.
     */
    _limparFeedback() {
        ['mpPanel1', 'mpPanel2'].forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                panel.classList.remove('mp-acerto', 'mp-erro');
            }
        });

        const feedback = document.getElementById('mpFeedback');
        if (feedback) feedback.className = 'mp-feedback';
    },

    /**
     * Desabilita opções visualmente após o round travar.
     */
    _desabilitarOpcoes() {
        const botoes = document.querySelectorAll('.mp-option-btn');
        botoes.forEach(btn => {
            if (!btn.classList.contains('mp-option-correct') && !btn.classList.contains('mp-option-wrong')) {
                btn.style.opacity = '0.4';
            }
        });
    },

    /**
     * Mostra o botão "próxima pergunta".
     */
    _mostrarBotaoProximo() {
        const nextBtn = document.getElementById('mpNextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.focus();
        }
    },

    /**
     * Atualiza o placar na tela.
     */
    _atualizarPlacar() {
        const score1 = document.getElementById('mpScore1');
        const score2 = document.getElementById('mpScore2');
        if (score1) score1.innerText = this.scores[1];
        if (score2) score2.innerText = this.scores[2];
    },

    /**
     * Avança para a próxima pergunta ou finaliza.
     */
    proximaPergunta() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.totalQuestions) {
            this._carregarPergunta();
        } else {
            this._finalizarJogo();
        }
    },

    /**
     * Finaliza o jogo e mostra o resultado.
     */
    _finalizarJogo() {
        this.gameStarted = false;
        this._desativarTeclado();

        const quizArea = document.getElementById('mpQuizArea');
        const resultado = document.getElementById('mpResultado');

        if (quizArea) quizArea.style.display = 'none';
        if (resultado) {
            resultado.style.display = 'block';

            let vencedorHTML = '';
            if (this.scores[1] > this.scores[2]) {
                vencedorHTML = '<h2 style="color:#FF6B6B">🏆 Jogador 1 (Vermelho) venceu!</h2>';
            } else if (this.scores[2] > this.scores[1]) {
                vencedorHTML = '<h2 style="color:#4ECDC4">🏆 Jogador 2 (Azul) venceu!</h2>';
            } else {
                vencedorHTML = '<h2 style="color:#FFE66D">🤝 Empate!</h2>';
            }

            resultado.innerHTML = vencedorHTML +
                '<div style="display:flex;justify-content:center;gap:60px;margin:30px 0">' +
                '<div style="text-align:center"><div style="font-size:3rem;color:#FF6B6B;font-weight:900">' + this.scores[1] + '</div><div>Jogador 1</div></div>' +
                '<div style="text-align:center"><div style="font-size:3rem;color:#4ECDC4;font-weight:900">' + this.scores[2] + '</div><div>Jogador 2</div></div>' +
                '</div>' +
                '<button class="next-btn" onclick="location.reload()" style="max-width:300px;margin:20px auto">Jogar Novamente 🔄</button>';

            // Confete de vitória
            if (typeof confetti === 'function') {
                const duration = 3000;
                const end = Date.now() + duration;
                (function frame() {
                    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
                    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            }
        }
    },

    _ativarTeclado() {
        this._keyHandler = this._onKeyDown.bind(this);
        document.addEventListener('keydown', this._keyHandler);
    },

    _desativarTeclado() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    },

    _mostrarErro(msg) {
        const perguntaEl = document.getElementById('mpPergunta');
        if (perguntaEl) perguntaEl.innerText = msg;
    },

    _esconderOverlay() {
        const overlay = document.getElementById('mpOverlay');
        if (overlay) overlay.style.display = 'none';
    }
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Botão "Começar" no overlay de instruções
    const startBtn = document.getElementById('mpStartBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => Multiplayer.iniciar());
    }

    // Botão "Próxima Pergunta"
    const nextBtn = document.getElementById('mpNextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => Multiplayer.proximaPergunta());
    }

    // Tecla Enter para avançar (atalho de conveniência)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !Multiplayer.roundLocked === false) {
            // Se o round está travado (já responderam), Enter = próximo
            // Mas não atrapalha o jogo ativo
        }
    });
});
