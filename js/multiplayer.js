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
 * 
 * Usa QuestaoDinamica + DistratorEngine para gerar perguntas frescas a cada partida.
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
const TOTAL_ROUNDS = 5;

// ==========================================
// INSTÂNCIAS DO MOTOR DINÂMICO
// ==========================================
var mpMotorDinamico = null;
var mpDistratorEngine = null;

if (typeof QuestaoDinamica !== 'undefined') {
    mpMotorDinamico = new QuestaoDinamica();
}
if (typeof DistratorEngine !== 'undefined') {
    mpDistratorEngine = new DistratorEngine();
}

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
    categoria: null,
    nivel: null,
    questoesGeradas: [],

    iniciar() {
        // Valida se o motor dinâmico está disponível
        if (!mpMotorDinamico) {
            console.error('Multiplayer: QuestaoDinamica não disponível.');
            // Fallback: usa QUIZ_DATA estático
            if (typeof QUIZ_DATA === 'undefined' || QUIZ_DATA.length === 0) {
                console.error('Multiplayer: QUIZ_DATA também não encontrado.');
                return;
            }
            this._iniciarEstatico();
            return;
        }

        // Valida categoria e nível selecionados
        if (!this.categoria) {
            console.error('Multiplayer: categoria não selecionada.');
            return;
        }
        if (!this.nivel) {
            this.nivel = 'facil';
        }

        // Lê nomes dos inputs
        const nome1 = document.getElementById('mpNome1');
        const nome2 = document.getElementById('mpNome2');
        this.playerNames[1] = (nome1 && nome1.value.trim()) ? nome1.value.trim() : 'Jogador 1';
        this.playerNames[2] = (nome2 && nome2.value.trim()) ? nome2.value.trim() : 'Jogador 2';

        // Gera questões dinâmicas
        var questoesCruas = mpMotorDinamico.gerarConjunto(this.categoria, this.nivel, TOTAL_ROUNDS);
        this.questoesGeradas = [];

        for (var i = 0; i < questoesCruas.length; i++) {
            var q = questoesCruas[i];
            var item = mpMotorDinamico.paraFormatoQuiz(q);

            // Gera opções com DistratorEngine
            if (mpDistratorEngine) {
                var opcoesInfo = mpDistratorEngine.gerarOpcoes({
                    resposta: q.resposta,
                    operandos: q.operandos,
                    operacao: q.operacao,
                    nivel: this.nivel
                });
                item.opcoes = opcoesInfo.opcoes;
                item.corretoIndex = opcoesInfo.corretoIndex;
            } else {
                // Fallback sem distratores: opções genéricas
                var resp = q.resposta;
                item.opcoes = [String(resp), String(resp + 1), String(resp - 1), String(resp + 2)];
                item.corretoIndex = 0;
            }

            this.questoesGeradas.push(item);
        }

        this.currentQuestionIndex = 0;
        this.scores = { 1: 0, 2: 0 };
        this.totalQuestions = this.questoesGeradas.length;
        this.gameStarted = true;
        this.lastWinner = null;

        this._esconderOverlay();
        this._mostrarQuizArea();
        this._atualizarNomes();
        this._atualizarPlacar();
        this._carregarPergunta();
        this._ativarTeclado();
    },

    /**
     * Fallback: usa QUIZ_DATA estático quando o motor dinâmico não está disponível.
     */
    _iniciarEstatico() {
        if (typeof QUIZ_DATA === 'undefined' || QUIZ_DATA.length === 0) {
            console.error('Multiplayer: QUIZ_DATA não encontrado. Verifique js/data.js.');
            return;
        }

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

        // Usa questões dinâmicas se disponíveis, senão fallback estático
        var question;
        if (this.questoesGeradas.length > 0) {
            question = this.questoesGeradas[this.currentQuestionIndex];
        } else {
            question = QUIZ_DATA[this.currentQuestionIndex];
        }

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

        // Determina se acertou — usa corretoIndex (dinâmico) ou respostaCorretaIndex (estático)
        var question;
        if (this.questoesGeradas.length > 0) {
            question = this.questoesGeradas[this.currentQuestionIndex];
        } else {
            question = QUIZ_DATA[this.currentQuestionIndex];
        }

        var correctIndex = (question.corretoIndex !== undefined) ? question.corretoIndex : question.respostaCorretaIndex;
        const isCorrect = optionIndex === correctIndex;

        // TRAVA a rodada IMEDIATAMENTE
        this.roundLocked = true;
        this.lastWinner = isCorrect ? player : null;

        if (isCorrect) {
            this.scores[player]++;
            this._feedbackAcerto(player, optionIndex, correctIndex);
        } else {
            this._feedbackErro(player, optionIndex, correctIndex);
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
        [1, 2].forEach(player => {
            const container = document.getElementById('mpOpcoes' + player);
            if (!container) return;
            // Botões já estão coloridos via _colorirOpcoes
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
// INICIALIZAÇÃO DA SELEÇÃO DE CATEGORIA
// ==========================================
function mpRenderCategoryCards() {
    if (typeof CATEGORIAS_QUIZ === 'undefined') return;

    var grid = document.getElementById('mpCategoryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    CATEGORIAS_QUIZ.forEach(function(cat) {
        var card = document.createElement('div');
        card.className = 'category-card';
        card.style.borderColor = cat.cor;
        card.onclick = function() { mpSelectCategory(cat); };

        card.innerHTML =
            '<div class="category-card-icon">' + cat.icone + '</div>' +
            '<div class="category-card-title" style="color: ' + cat.cor + ';">' + cat.nome + '</div>' +
            '<div class="category-card-desc">' + cat.descricao + '</div>';

        grid.appendChild(card);
    });
}

function mpSelectCategory(cat) {
    Multiplayer.categoria = cat.id;

    if (mpMotorDinamico) {
        mpShowDifficultySelection(cat);
    } else {
        // Sem motor dinâmico, vai direto (usará fallback estático)
        Multiplayer.nivel = 'facil';
        Multiplayer.iniciar();
    }
}

function mpShowDifficultySelection(cat) {
    document.getElementById('mpCategoryGrid').style.display = 'none';
    document.querySelector('#mpCategorySelection h2').textContent = cat.icone + ' ' + cat.nome;

    var diffDiv = document.getElementById('mpDifficultySelection');
    diffDiv.style.display = 'block';

    var diffGrid = document.getElementById('mpDifficultyGrid');
    diffGrid.innerHTML = '';

    var niveis = mpMotorDinamico.getNiveis();

    niveis.forEach(function(nivel) {
        var btn = document.createElement('button');
        btn.className = 'difficulty-btn';
        btn.style.borderColor = cat.cor;
        btn.onclick = function() {
            Multiplayer.nivel = nivel.id;
            Multiplayer.iniciar();
        };

        btn.innerHTML =
            '<span class="difficulty-btn-name">' + nivel.nome + '</span>' +
            '<span class="difficulty-btn-range">Números de ' + nivel.range + '</span>';

        diffGrid.appendChild(btn);
    });
}

// ==========================================
// DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Renderiza categorias no overlay
    mpRenderCategoryCards();

    // Botão voltar para categorias
    var backBtn = document.getElementById('mpBackToCategories');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.getElementById('mpCategoryGrid').style.display = '';
            document.querySelector('#mpCategorySelection h2').textContent = 'Escolha a Operação 🧠';
            document.getElementById('mpDifficultySelection').style.display = 'none';
            Multiplayer.categoria = null;
            Multiplayer.nivel = null;
        });
    }

    // Botão iniciar
    const startBtn = document.getElementById('mpStartBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!mpMotorDinamico) {
                // Fallback para estático se motor não existe
                Multiplayer._iniciarEstatico();
                return;
            }
            // Se o motor existe mas categoria não foi selecionada, avisa
            if (!Multiplayer.categoria) {
                alert('Selecione uma categoria e um nível de dificuldade antes de começar! 🧠');
            }
            // Se categoria já foi selecionada mas dificuldade não (motor existe),
            // também avisa (o fluxo normal é via mpShowDifficultySelection)
        });
    }

    const nextBtn = document.getElementById('mpNextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => Multiplayer.proximaPergunta());
    }
});
