/**
 * js/multiplayer.js — Modo Multiplayer Local (X1) — Split-Screen
 * 
 * Tela dividida: Jogador 1 (Vermelho, esquerda) vs Jogador 2 (Azul, direita).
 * 
 * Mapeamento de teclas:
 *   P1: A→A, S→B, D→C, W→D
 *   P2: ←→A, ↓→B, →→C, ↑→D
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
    'w': { player: 1, optionIndex: 3 },
    'ArrowLeft':  { player: 2, optionIndex: 0 },
    'ArrowDown':  { player: 2, optionIndex: 1 },
    'ArrowRight': { player: 2, optionIndex: 2 },
    'ArrowUp':    { player: 2, optionIndex: 3 }
};

const PLAYER_COLORS = {
    1: { name: 'Vermelho', color: '#FF6B6B', bg: '#FFF0F0', emoji: '🔴', keys: ['A', 'S', 'D', 'W'] },
    2: { name: 'Azul',     color: '#4ECDC4', bg: '#F0FFFC', emoji: '🔵', keys: ['←', '↓', '→', '↑'] }
};

const KEY_LABELS = ['A', 'B', 'C', 'D'];

// ==========================================
// ESTADO DO JOGO
// ==========================================
const Multiplayer = {
    currentQuestionIndex: 0,
    scores: { 1: 0, 2: 0 },
    roundLocked: false,
    totalQuestions: 0,
    gameStarted: false,
    playerNames: { 1: 'Jogador 1', 2: 'Jogador 2' },
    lastWinner: null, // quem respondeu a última rodada

    iniciar() {
        if (typeof QUIZ_DATA === 'undefined' || QUIZ_DATA.length === 0) {
            console.error('Multiplayer: Nenhuma pergunta encontrada. Verifique js/data.js.');
            return;
        }

        // Lê nomes dos inputs
        const nome1 = document.getElementById('mpNome1');
        const nome2 = document.getElementById('mpNome2');
        this.playerNames[1] = (nome1 && nome1.value.trim()) ? nome1.value.trim() : 'Jogador 1';
        this.playerNames[2] = (nome2 && nome2.value.trim()) ? nome2.value.trim() : 'Jogador 2';

        this.currentQuestionIndex = 0;
        this.scores = { 1: 0, 2: 0 };
        this.totalQuestions = QUIZ_DATA.length;
        this.gameStarted = true;
        this.lastWinner = null;

        this._esconderOverlay();
        this._mostrarQuizArea();
        this._atualizarNomes();
        this._atualizarPlacar();
        this._carregarPergunta();
        this._ativarTeclado();
    },

    _carregarPergunta() {
        this.roundLocked = false;
        this.lastWinner = null;
        const question = QUIZ_DATA[this.currentQuestionIndex];

        // Atualiza round indicator
        const roundEl = document.getElementById('mpRound');
        if (roundEl) {
            roundEl.innerText = 'Pergunta ' + (this.currentQuestionIndex + 1) + ' de ' + this.totalQuestions;
        }

        // Pergunta central
        const perguntaEl = document.getElementById('mpPerguntaCentral');
        if (perguntaEl) perguntaEl.innerText = question.pergunta;

        // Limpa feedback dos painéis
        this._limparFeedback();

        // Gera opções para cada jogador
        this._gerarOpcoes(1, question);
        this._gerarOpcoes(2, question);

        // Esconde botão próximo
        const nextBtn = document.getElementById('mpNextBtn');
        if (nextBtn) nextBtn.style.display = 'none';

        // Feedback central
        const fbCentral = document.getElementById('mpFeedbackCentral');
        if (fbCentral) fbCentral.className = 'mp-feedback-central';
    },

    _gerarOpcoes(player, question) {
        const container = document.getElementById('mpOpcoes' + player);
        if (!container) return;
        container.innerHTML = '';

        question.opcoes.forEach((opcao, index) => {
            const btn = document.createElement('button');
            btn.className = 'mp-split-option';
            btn.setAttribute('data-index', index);

            const letra = KEY_LABELS[index];
            const pKeys = PLAYER_COLORS[player].keys;
            const keyClass = player === 1 ? 'mp-split-key-p1' : 'mp-split-key-p2';

            btn.innerHTML = '<span class="mp-split-letter">' + letra + '</span>' +
                '<span class="mp-split-text">' + opcao + '</span>' +
                '<span class="mp-split-key ' + keyClass + '">' + pKeys[index] + '</span>';

            container.appendChild(btn);
        });
    },

    _onKeyDown(e) {
        if (!this.gameStarted || this.roundLocked) return;

        const mapping = KEY_MAP[e.key];
        if (!mapping) return;

        e.preventDefault();

        const { player, optionIndex } = mapping;
        const question = QUIZ_DATA[this.currentQuestionIndex];
        const isCorrect = optionIndex === question.respostaCorretaIndex;

        // TRAVA a rodada IMEDIATAMENTE
        this.roundLocked = true;
        this.lastWinner = isCorrect ? player : null;

        if (isCorrect) {
            this.scores[player]++;
            this._feedbackAcerto(player, optionIndex, question.respostaCorretaIndex);
        } else {
            this._feedbackErro(player, optionIndex, question.respostaCorretaIndex);
        }

        this._atualizarPlacar();
        this._mostrarBotaoProximo();
        this._desabilitarOpcoes();
    },

    _feedbackAcerto(player, optionIndex, correctIndex) {
        // Painel do jogador pisca verde
        const panel = document.getElementById('mpPanel' + player);
        if (panel) {
            panel.classList.add('mp-panel-acerto');
            setTimeout(() => panel.classList.remove('mp-panel-acerto'), 1200);
        }

        // Destaca nos DOIS lados: o correto verde e os outros opacos
        [1, 2].forEach(p => this._colorirOpcoes(p, optionIndex, correctIndex, player));

        // Feedback central
        const fb = document.getElementById('mpFeedbackCentral');
        if (fb) {
            fb.innerHTML = '<span style="color:' + PLAYER_COLORS[player].color + '">' +
                this.playerNames[player] + ' acertou! 🎉</span>';
            fb.className = 'mp-feedback-central mp-feedback-show';
        }

        // Indicador de quem respondeu
        this._mostrarQuemRespondeu(player, true);

        // Confete do lado do vencedor
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 40,
                origin: { x: player === 1 ? 0.2 : 0.8, y: 0.5 }
            });
        }
    },

    _feedbackErro(player, optionIndex, correctIndex) {
        // Painel do jogador pisca vermelho
        const panel = document.getElementById('mpPanel' + player);
        if (panel) {
            panel.classList.add('mp-panel-erro');
            setTimeout(() => panel.classList.remove('mp-panel-erro'), 1200);
        }

        // Destaca nos DOIS lados
        [1, 2].forEach(p => this._colorirOpcoes(p, optionIndex, correctIndex, player));

        // Feedback central
        const fb = document.getElementById('mpFeedbackCentral');
        if (fb) {
            fb.innerHTML = '<span style="color:' + PLAYER_COLORS[player].color + '">' +
                this.playerNames[player] + ' errou! ❌</span>';
            fb.className = 'mp-feedback-central mp-feedback-show';
        }

        // Indicador de quem respondeu
        this._mostrarQuemRespondeu(player, false);
    },

    _colorirOpcoes(player, chosenIndex, correctIndex, whoAnswered) {
        const container = document.getElementById('mpOpcoes' + player);
        if (!container) return;

        const botoes = container.querySelectorAll('.mp-split-option');
        botoes.forEach((btn, i) => {
            btn.classList.remove('mp-option-correct', 'mp-option-wrong', 'mp-option-dimmed');
            if (i === correctIndex) {
                btn.classList.add('mp-option-correct');
            } else if (i === chosenIndex && chosenIndex !== correctIndex) {
                btn.classList.add('mp-option-wrong');
            } else {
                btn.classList.add('mp-option-dimmed');
            }
        });
    },

    _mostrarQuemRespondeu(player, acertou) {
        // Limpa indicadores anteriores
        ['mpWho1', 'mpWho2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.className = 'mp-who-indicator';
            }
        });

        const whoEl = document.getElementById('mpWho' + player);
        if (whoEl) {
            whoEl.style.display = 'block';
            whoEl.innerText = acertou ? '✅ Respondeu!' : '❌ Respondeu...';
            whoEl.className = 'mp-who-indicator ' + (acertou ? 'mp-who-acerto' : 'mp-who-erro');
        }
    },

    _desabilitarOpcoes() {
        [1, 2].forEach(function(player) {
            var container = document.getElementById('mpOpcoes' + player);
            if (!container) return;
            var botoes = container.querySelectorAll('.mp-split-option');
            botoes.forEach(function(btn) { btn.style.pointerEvents = 'none'; });
        });
    },

    _limparFeedback() {
        [1, 2].forEach(player => {
            const panel = document.getElementById('mpPanel' + player);
            if (panel) panel.classList.remove('mp-panel-acerto', 'mp-panel-erro');

            const whoEl = document.getElementById('mpWho' + player);
            if (whoEl) { whoEl.style.display = 'none'; whoEl.className = 'mp-who-indicator'; }

            const container = document.getElementById('mpOpcoes' + player);
            if (container) {
                container.querySelectorAll('.mp-split-option').forEach(btn => {
                    btn.classList.remove('mp-option-correct', 'mp-option-wrong', 'mp-option-dimmed');
                });
            }
        });

        const fb = document.getElementById('mpFeedbackCentral');
        if (fb) fb.className = 'mp-feedback-central';
    },

    _mostrarBotaoProximo() {
        const nextBtn = document.getElementById('mpNextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.focus();
        }
    },

    _atualizarPlacar() {
        const s1 = document.getElementById('mpScore1');
        const s2 = document.getElementById('mpScore2');
        if (s1) s1.innerText = this.scores[1];
        if (s2) s2.innerText = this.scores[2];
    },

    _atualizarNomes() {
        const n1 = document.getElementById('mpDisplayName1');
        const n2 = document.getElementById('mpDisplayName2');
        if (n1) n1.innerText = this.playerNames[1];
        if (n2) n2.innerText = this.playerNames[2];
    },

    _esconderOverlay() {
        const overlay = document.getElementById('mpOverlay');
        if (overlay) overlay.style.display = 'none';
    },

    _mostrarQuizArea() {
        const quizArea = document.getElementById('mpQuizArea');
        if (quizArea) quizArea.style.display = 'block';
    },

    proximaPergunta() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.totalQuestions) {
            this._carregarPergunta();
        } else {
            this._finalizarJogo();
        }
    },

    _finalizarJogo() {
        this.gameStarted = false;
        this._desativarTeclado();

        const quizArea = document.getElementById('mpQuizArea');
        const resultado = document.getElementById('mpResultado');

        if (quizArea) quizArea.style.display = 'none';
        if (resultado) {
            resultado.style.display = 'flex';

            const p1Name = this.playerNames[1];
            const p2Name = this.playerNames[2];
            let vencedorHTML = '';
            let winnerPlayer = null;

            if (this.scores[1] > this.scores[2]) {
                vencedorHTML = '<h2 style="color:#FF6B6B">🏆 ' + p1Name + ' venceu!</h2>';
                winnerPlayer = 1;
            } else if (this.scores[2] > this.scores[1]) {
                vencedorHTML = '<h2 style="color:#4ECDC4">🏆 ' + p2Name + ' venceu!</h2>';
                winnerPlayer = 2;
            } else {
                vencedorHTML = '<h2 style="color:#FFE66D">🤝 Empate!</h2>';
            }

            resultado.innerHTML = '<div class="mp-result-card">' +
                vencedorHTML +
                '<div class="mp-result-scores">' +
                '<div class="mp-result-player" style="color:#FF6B6B"><div class="mp-result-score-num">' + this.scores[1] + '</div><div>' + p1Name + '</div></div>' +
                '<div class="mp-result-vs">×</div>' +
                '<div class="mp-result-player" style="color:#4ECDC4"><div class="mp-result-score-num">' + this.scores[2] + '</div><div>' + p2Name + '</div></div>' +
                '</div>' +
                '<button class="next-btn" onclick="location.reload()" style="max-width:300px;margin:20px auto;font-size:1.2rem">Jogar Novamente 🔄</button>' +
                '</div>';

            // Confete
            if (typeof confetti === 'function') {
                const originX = winnerPlayer === 1 ? 0.15 : winnerPlayer === 2 ? 0.85 : 0.5;
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
    }
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('mpStartBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => Multiplayer.iniciar());
    }

    const nextBtn = document.getElementById('mpNextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => Multiplayer.proximaPergunta());
    }
});
