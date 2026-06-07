1|/**
2| * js/multiplayer.js — Modo Multiplayer Local (X1) — Split-Screen
3| * 
4| * Tela dividida: Jogador 1 (Vermelho, esquerda) vs Jogador 2 (Azul, direita).
5| * 
6| * Mapeamento de teclas:
7| *   P1: A→A, S→B, D→C, W→D
8| *   P2: ←→A, ↓→B, →→C, ↑→D
9| * 
10| * Primeiro keydown válido trava a rodada.
11| */
12|
13|// ==========================================
14|// MAPEAMENTO DE TECLAS
15|// ==========================================
16|const KEY_MAP = {
17|    'a': { player: 1, optionIndex: 0 },
18|    's': { player: 1, optionIndex: 1 },
19|    'd': { player: 1, optionIndex: 2 },
20|    'w': { player: 1, optionIndex: 3 },
21|    'ArrowLeft':  { player: 2, optionIndex: 0 },
22|    'ArrowDown':  { player: 2, optionIndex: 1 },
23|    'ArrowRight': { player: 2, optionIndex: 2 },
24|    'ArrowUp':    { player: 2, optionIndex: 3 }
25|};
26|
27|const PLAYER_COLORS = {
28|    1: { name: 'Vermelho', color: '#FF6B6B', bg: '#FFF0F0', emoji: '🔴', keys: ['A', 'S', 'D', 'W'] },
29|    2: { name: 'Azul',     color: '#4ECDC4', bg: '#F0FFFC', emoji: '🔵', keys: ['←', '↓', '→', '↑'] }
30|};
31|
32|const KEY_LABELS = ['A', 'B', 'C', 'D'];
33|
34|// ==========================================
35|// ESTADO DO JOGO
36|// ==========================================
37|const Multiplayer = {
38|    currentQuestionIndex: 0,
39|    scores: { 1: 0, 2: 0 },
40|    roundLocked: false,
41|    totalQuestions: 0,
42|    gameStarted: false,
43|    playerNames: { 1: 'Jogador 1', 2: 'Jogador 2' },
44|    lastWinner: null, // quem respondeu a última rodada
45|
46|    iniciar() {
47|        if (typeof QUIZ_DATA === 'undefined' || QUIZ_DATA.length === 0) {
48|            console.error('Multiplayer: QUIZ_DATA não encontrado. Verifique js/data.js.');
49|            return;
50|        }
51|
52|        // Lê nomes dos inputs
53|        const nome1 = document.getElementById('mpNome1');
54|        const nome2 = document.getElementById('mpNome2');
55|        this.playerNames[1] = (nome1 && nome1.value.trim()) ? nome1.value.trim() : 'Jogador 1';
56|        this.playerNames[2] = (nome2 && nome2.value.trim()) ? nome2.value.trim() : 'Jogador 2';
57|
58|        this.currentQuestionIndex = 0;
59|        this.scores = { 1: 0, 2: 0 };
60|        this.totalQuestions = QUIZ_DATA.length;
61|        this.gameStarted = true;
62|        this.lastWinner = null;
63|
64|        this._esconderOverlay();
65|        this._mostrarQuizArea();
66|        this._atualizarNomes();
67|        this._atualizarPlacar();
68|        this._carregarPergunta();
69|        this._ativarTeclado();
70|    },
71|
72|    _carregarPergunta() {
73|        this.roundLocked = false;
74|        this.lastWinner = null;
75|        const question = QUIZ_DATA[this.currentQuestionIndex];
76|
77|        // Atualiza round indicator
78|        const roundEl = document.getElementById('mpRound');
79|        if (roundEl) {
80|            roundEl.innerText = 'Pergunta ' + (this.currentQuestionIndex + 1) + ' de ' + this.totalQuestions;
81|        }
82|
83|        // Pergunta central
84|        const perguntaEl = document.getElementById('mpPerguntaCentral');
85|        if (perguntaEl) perguntaEl.innerText = question.pergunta;
86|
87|        // Limpa feedback dos painéis
88|        this._limparFeedback();
89|
90|        // Gera opções para cada jogador
91|        this._gerarOpcoes(1, question);
92|        this._gerarOpcoes(2, question);
93|
94|        // Esconde botão próximo
95|        const nextBtn = document.getElementById('mpNextBtn');
96|        if (nextBtn) nextBtn.style.display = 'none';
97|
98|        // Feedback central
99|        const fbCentral = document.getElementById('mpFeedbackCentral');
100|        if (fbCentral) fbCentral.className = 'mp-feedback-central';
101|    },
102|
103|    _gerarOpcoes(player, question) {
104|        const container = document.getElementById('mpOpcoes' + player);
105|        if (!container) return;
106|        container.innerHTML = '';
107|
108|        question.opcoes.forEach((opcao, index) => {
109|            const btn = document.createElement('button');
110|            btn.className = 'mp-split-option';
111|            btn.setAttribute('data-index', index);
112|
113|            const letra = KEY_LABELS[index];
114|            const pKeys = PLAYER_COLORS[player].keys;
115|            const keyClass = player === 1 ? 'mp-split-key-p1' : 'mp-split-key-p2';
116|
117|            btn.innerHTML = '<span class="mp-split-letter">' + letra + '</span>' +
118|                '<span class="mp-split-text">' + opcao + '</span>' +
119|                '<span class="mp-split-key ' + keyClass + '">' + pKeys[index] + '</span>';
120|
121|            container.appendChild(btn);
122|        });
123|    },
124|
125|    _onKeyDown(e) {
126|        if (!this.gameStarted || this.roundLocked) return;
127|
128|        const mapping = KEY_MAP[e.key];
129|        if (!mapping) return;
130|
131|        e.preventDefault();
132|
133|        const { player, optionIndex } = mapping;
134|        const question = QUIZ_DATA[this.currentQuestionIndex];
135|        const isCorrect = optionIndex === question.respostaCorretaIndex;
136|
137|        // TRAVA a rodada IMEDIATAMENTE
138|        this.roundLocked = true;
139|        this.lastWinner = isCorrect ? player : null;
140|
141|        if (isCorrect) {
142|            this.scores[player]++;
143|            this._feedbackAcerto(player, optionIndex, question.respostaCorretaIndex);
144|        } else {
145|            this._feedbackErro(player, optionIndex, question.respostaCorretaIndex);
146|        }
147|
148|        this._atualizarPlacar();
149|        this._mostrarBotaoProximo();
150|        this._desabilitarOpcoes();
151|    },
152|
153|    _feedbackAcerto(player, optionIndex, correctIndex) {
154|        // Painel do jogador pisca verde
155|        const panel = document.getElementById('mpPanel' + player);
156|        if (panel) {
157|            panel.classList.add('mp-panel-acerto');
158|            setTimeout(() => panel.classList.remove('mp-panel-acerto'), 1200);
159|        }
160|
161|        // Destaca nos DOIS lados: o correto verde e os outros opacos
162|        [1, 2].forEach(p => this._colorirOpcoes(p, optionIndex, correctIndex, player));
163|
164|        // Feedback central
165|        const fb = document.getElementById('mpFeedbackCentral');
166|        if (fb) {
167|            fb.innerHTML = '<span style="color:' + PLAYER_COLORS[player].color + '">' +
168|                this.playerNames[player] + ' acertou! 🎉</span>';
169|            fb.className = 'mp-feedback-central mp-feedback-show';
170|        }
171|
172|        // Indicador de quem respondeu
173|        this._mostrarQuemRespondeu(player, true);
174|
175|        // Confete do lado do vencedor
176|        if (typeof confetti === 'function') {
177|            confetti({
178|                particleCount: 50,
179|                spread: 40,
180|                origin: { x: player === 1 ? 0.2 : 0.8, y: 0.5 }
181|            });
182|        }
183|    },
184|
185|    _feedbackErro(player, optionIndex, correctIndex) {
186|        // Painel do jogador pisca vermelho
187|        const panel = document.getElementById('mpPanel' + player);
188|        if (panel) {
189|            panel.classList.add('mp-panel-erro');
190|            setTimeout(() => panel.classList.remove('mp-panel-erro'), 1200);
191|        }
192|
193|        // Destaca nos DOIS lados
194|        [1, 2].forEach(p => this._colorirOpcoes(p, optionIndex, correctIndex, player));
195|
196|        // Feedback central
197|        const fb = document.getElementById('mpFeedbackCentral');
198|        if (fb) {
199|            fb.innerHTML = '<span style="color:' + PLAYER_COLORS[player].color + '">' +
200|                this.playerNames[player] + ' errou! ❌</span>';
201|            fb.className = 'mp-feedback-central mp-feedback-show';
202|        }
203|
204|        // Indicador de quem respondeu
205|        this._mostrarQuemRespondeu(player, false);
206|    },
207|
208|    _colorirOpcoes(player, chosenIndex, correctIndex, whoAnswered) {
209|        const container = document.getElementById('mpOpcoes' + player);
210|        if (!container) return;
211|
212|        const botoes = container.querySelectorAll('.mp-split-option');
213|        botoes.forEach((btn, i) => {
214|            btn.classList.remove('mp-option-correct', 'mp-option-wrong', 'mp-option-dimmed');
215|            if (i === correctIndex) {
216|                btn.classList.add('mp-option-correct');
217|            } else if (i === chosenIndex && chosenIndex !== correctIndex) {
218|                btn.classList.add('mp-option-wrong');
219|            } else {
220|                btn.classList.add('mp-option-dimmed');
221|            }
222|        });
223|    },
224|
225|    _mostrarQuemRespondeu(player, acertou) {
226|        // Limpa indicadores anteriores
227|        ['mpWho1', 'mpWho2'].forEach(id => {
228|            const el = document.getElementById(id);
229|            if (el) {
230|                el.style.display = 'none';
231|                el.className = 'mp-who-indicator';
232|            }
233|        });
234|
235|        const whoEl = document.getElementById('mpWho' + player);
236|        if (whoEl) {
237|            whoEl.style.display = 'block';
238|            whoEl.innerText = acertou ? '✅ Respondeu!' : '❌ Respondeu...';
239|            whoEl.className = 'mp-who-indicator ' + (acertou ? 'mp-who-acerto' : 'mp-who-erro');
240|        }
241|    },
242|
243|    _desabilitarOpcoes() {
244|        [1, 2].forEach(player => {
245|            const container = document.getElementById('mpOpcoes' + player);
246|            if (!container) return;
247|            // Botões já estão coloridos via _colorirOpcoes
248|        });
249|    },
250|
251|    _limparFeedback() {
252|        [1, 2].forEach(player => {
253|            const panel = document.getElementById('mpPanel' + player);
254|            if (panel) panel.classList.remove('mp-panel-acerto', 'mp-panel-erro');
255|
256|            const whoEl = document.getElementById('mpWho' + player);
257|            if (whoEl) { whoEl.style.display = 'none'; whoEl.className = 'mp-who-indicator'; }
258|
259|            const container = document.getElementById('mpOpcoes' + player);
260|            if (container) {
261|                container.querySelectorAll('.mp-split-option').forEach(btn => {
262|                    btn.classList.remove('mp-option-correct', 'mp-option-wrong', 'mp-option-dimmed');
263|                });
264|            }
265|        });
266|
267|        const fb = document.getElementById('mpFeedbackCentral');
268|        if (fb) fb.className = 'mp-feedback-central';
269|    },
270|
271|    _mostrarBotaoProximo() {
272|        const nextBtn = document.getElementById('mpNextBtn');
273|        if (nextBtn) {
274|            nextBtn.style.display = 'block';
275|            nextBtn.focus();
276|        }
277|    },
278|
279|    _atualizarPlacar() {
280|        const s1 = document.getElementById('mpScore1');
281|        const s2 = document.getElementById('mpScore2');
282|        if (s1) s1.innerText = this.scores[1];
283|        if (s2) s2.innerText = this.scores[2];
284|    },
285|
286|    _atualizarNomes() {
287|        const n1 = document.getElementById('mpDisplayName1');
288|        const n2 = document.getElementById('mpDisplayName2');
289|        if (n1) n1.innerText = this.playerNames[1];
290|        if (n2) n2.innerText = this.playerNames[2];
291|    },
292|
293|    _esconderOverlay() {
294|        const overlay = document.getElementById('mpOverlay');
295|        if (overlay) overlay.style.display = 'none';
296|    },
297|
298|    _mostrarQuizArea() {
299|        const quizArea = document.getElementById('mpQuizArea');
300|        if (quizArea) quizArea.style.display = 'block';
301|    },
302|
303|    proximaPergunta() {
304|        this.currentQuestionIndex++;
305|        if (this.currentQuestionIndex < this.totalQuestions) {
306|            this._carregarPergunta();
307|        } else {
308|            this._finalizarJogo();
309|        }
310|    },
311|
312|    _finalizarJogo() {
313|        this.gameStarted = false;
314|        this._desativarTeclado();
315|
316|        const quizArea = document.getElementById('mpQuizArea');
317|        const resultado = document.getElementById('mpResultado');
318|
319|        if (quizArea) quizArea.style.display = 'none';
320|        if (resultado) {
321|            resultado.style.display = 'flex';
322|
323|            const p1Name = this.playerNames[1];
324|            const p2Name = this.playerNames[2];
325|            let vencedorHTML = '';
326|            let winnerPlayer = null;
327|
328|            if (this.scores[1] > this.scores[2]) {
329|                vencedorHTML = '<h2 style="color:#FF6B6B">🏆 ' + p1Name + ' venceu!</h2>';
330|                winnerPlayer = 1;
331|            } else if (this.scores[2] > this.scores[1]) {
332|                vencedorHTML = '<h2 style="color:#4ECDC4">🏆 ' + p2Name + ' venceu!</h2>';
333|                winnerPlayer = 2;
334|            } else {
335|                vencedorHTML = '<h2 style="color:#FFE66D">🤝 Empate!</h2>';
336|            }
337|
338|            resultado.innerHTML = '<div class="mp-result-card">' +
339|                vencedorHTML +
340|                '<div class="mp-result-scores">' +
341|                '<div class="mp-result-player" style="color:#FF6B6B"><div class="mp-result-score-num">' + this.scores[1] + '</div><div>' + p1Name + '</div></div>' +
342|                '<div class="mp-result-vs">×</div>' +
343|                '<div class="mp-result-player" style="color:#4ECDC4"><div class="mp-result-score-num">' + this.scores[2] + '</div><div>' + p2Name + '</div></div>' +
344|                '</div>' +
345|                '<button class="next-btn" onclick="location.reload()" style="max-width:300px;margin:20px auto;font-size:1.2rem">Jogar Novamente 🔄</button>' +
346|                '</div>';
347|
348|            // Confete
349|            if (typeof confetti === 'function') {
350|                const originX = winnerPlayer === 1 ? 0.15 : winnerPlayer === 2 ? 0.85 : 0.5;
351|                const duration = 3000;
352|                const end = Date.now() + duration;
353|                (function frame() {
354|                    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
355|                    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
356|                    if (Date.now() < end) requestAnimationFrame(frame);
357|                }());
358|            }
359|        }
360|    },
361|
362|    _ativarTeclado() {
363|        this._keyHandler = this._onKeyDown.bind(this);
364|        document.addEventListener('keydown', this._keyHandler);
365|    },
366|
367|    _desativarTeclado() {
368|        if (this._keyHandler) {
369|            document.removeEventListener('keydown', this._keyHandler);
370|            this._keyHandler = null;
371|        }
372|    }
373|};
374|
375|// ==========================================
376|// INICIALIZAÇÃO
377|// ==========================================
378|document.addEventListener('DOMContentLoaded', () => {
379|    const startBtn = document.getElementById('mpStartBtn');
380|    if (startBtn) {
381|        startBtn.addEventListener('click', () => Multiplayer.iniciar());
382|    }
383|
384|    const nextBtn = document.getElementById('mpNextBtn');
385|    if (nextBtn) {
386|        nextBtn.addEventListener('click', () => Multiplayer.proximaPergunta());
387|    }
388|});
389|