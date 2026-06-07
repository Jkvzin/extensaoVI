1|1|// js/quiz.js
2|2|
3|3|var currentCategory = null;
4|4|var currentNivel = null;
5|5|var filteredQuestions = [];
6|6|var currentQuestionIndex = 0;
7|7|var score = 0;
8|8|var isAnswered = false;
9|9|var usandoDinamico = false;
10|10|
11|11|// Instâncias globais
12|12|var motorDinamico = null;
13|13|var distratorEngine = null;
14|14|
15|15|if (typeof QuestaoDinamica !== 'undefined') {
16|16|    motorDinamico = new QuestaoDinamica();
17|17|}
18|18|if (typeof DistratorEngine !== 'undefined') {
19|19|    distratorEngine = new DistratorEngine();
20|20|}
21|21|
22|22|document.addEventListener('DOMContentLoaded', function() {
23|23|    if (typeof CATEGORIAS_QUIZ !== 'undefined' && CATEGORIAS_QUIZ.length > 0) {
24|24|        renderCategoryCards();
25|25|    } else {
26|26|        document.getElementById('categorySelection').style.display = 'none';
27|27|        document.getElementById('quizScreen').style.display = 'block';
28|28|        startQuiz(null);
29|29|    }
30|30|
31|31|    var nextBtn = document.getElementById('nextQuestionBtn');
32|32|    var successBtn = document.getElementById('successNextBtn');
33|33|    var backBtn = document.getElementById('backToCategoriesBtn');
34|34|    var replayBtn = document.getElementById('replayBtn');
35|35|    var backFromDiff = document.getElementById('backToCategoriesFromDiff');
36|36|
37|37|    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
38|38|    if (successBtn) successBtn.addEventListener('click', nextQuestion);
39|39|    if (backBtn) backBtn.addEventListener('click', backToCategories);
40|40|    if (replayBtn) replayBtn.addEventListener('click', replayQuiz);
41|41|    if (backFromDiff) backFromDiff.addEventListener('click', backToCategories);
42|42|});
43|43|
44|44|// ==================== TELA DE CATEGORIAS ====================
45|45|
46|46|function renderCategoryCards() {
47|47|    var grid = document.getElementById('categoryGrid');
48|48|    if (!grid) return;
49|49|    grid.innerHTML = '';
50|50|
51|51|    CATEGORIAS_QUIZ.forEach(function(cat) {
52|52|        var card = document.createElement('div');
53|53|        card.className = 'category-card';
54|54|        card.style.borderColor = cat.cor;
55|55|        card.onclick = function() { selectCategory(cat); };
56|56|
57|57|        card.innerHTML =
58|58|            '<div class="category-card-icon">' + cat.icone + '</div>' +
59|59|            '<div class="category-card-title" style="color: ' + cat.cor + ';">' + cat.nome + '</div>' +
60|60|            '<div class="category-card-desc">' + cat.descricao + '</div>';
61|61|
62|62|        grid.appendChild(card);
63|63|    });
64|64|}
65|65|
66|66|function selectCategory(cat) {
67|67|    currentCategory = cat;
68|68|    if (motorDinamico) {
69|69|        showDifficultySelection(cat);
70|70|    } else {
71|71|        startWithStaticQuestions(cat);
72|72|    }
73|73|}
74|74|
75|75|// ==================== SELEÇÃO DE DIFICULDADE ====================
76|76|
77|77|function showDifficultySelection(cat) {
78|78|    document.getElementById('categoryGrid').style.display = 'none';
79|79|    document.querySelector('#categorySelection h1').textContent = cat.icone + ' ' + cat.nome;
80|80|    document.querySelector('#categorySelection p').textContent = 'Escolha o nível de dificuldade:';
81|81|
82|82|    var diffDiv = document.getElementById('difficultySelection');
83|83|    diffDiv.style.display = 'block';
84|84|
85|85|    var diffGrid = document.getElementById('difficultyGrid');
86|86|    diffGrid.innerHTML = '';
87|87|
88|88|    var niveis = motorDinamico.getNiveis();
89|89|
90|90|    niveis.forEach(function(nivel) {
91|91|        var btn = document.createElement('button');
92|92|        btn.className = 'difficulty-btn';
93|93|        btn.style.borderColor = cat.cor;
94|94|        btn.onclick = function() { startWithDifficulty(cat, nivel.id); };
95|95|
96|96|        btn.innerHTML =
97|97|            '<span class="difficulty-btn-name">' + nivel.nome + '</span>' +
98|98|            '<span class="difficulty-btn-range">Números de ' + nivel.range + '</span>';
99|99|
100|100|        diffGrid.appendChild(btn);
101|101|    });
102|102|}
103|103|
104|104|function startWithDifficulty(cat, nivel) {
105|105|    currentNivel = nivel;
106|106|
107|107|    var questoesGeradas = motorDinamico.gerarConjunto(cat.id, nivel, 5);
108|108|
109|109|    filteredQuestions = questoesGeradas.map(function(q) {
110|110|        var item = motorDinamico.paraFormatoQuiz(q);
111|111|
112|112|        // Usa DistratorEngine se disponível
113|113|        if (distratorEngine) {
114|114|            var opcoesInfo = distratorEngine.gerarOpcoes({
115|115|                resposta: q.resposta,
116|116|                operandos: q.operandos,
117|117|                operacao: q.operacao,
118|118|                nivel: nivel
119|119|            });
120|120|            item.opcoes = opcoesInfo.opcoes;
121|121|            item.respostaCorretaIndex = opcoesInfo.corretoIndex;
122|122|        } else {
123|123|            // Fallback básico
124|124|            var fb = gerarOpcoesBasicas(q.resposta, q.operacao);
125|125|            item.opcoes = fb.opcoes;
126|126|            item.respostaCorretaIndex = fb.corretoIndex;
127|127|        }
128|128|
129|129|        item.resolucaoPassoAPasso = gerarResolucao(q);
130|130|        return item;
131|131|    });
132|132|
133|133|    usandoDinamico = true;
134|134|    iniciarQuizScreen(cat, nivel);
135|135|}
136|136|
137|137|function startWithStaticQuestions(cat) {
138|138|    currentNivel = null;
139|139|
140|140|    filteredQuestions = QUIZ_DATA.filter(function(q) {
141|141|        return q.categoria === cat.id;
142|142|    });
143|143|
144|144|    shuffleArray(filteredQuestions);
145|145|
146|146|    if (filteredQuestions.length === 0) {
147|147|        alert('Ops! Ainda não temos perguntas de ' + cat.nome + '. Escolha outra categoria!');
148|148|        return;
149|149|    }
150|150|
151|151|    usandoDinamico = false;
152|152|    iniciarQuizScreen(cat, null);
153|153|}
154|154|
155|155|function iniciarQuizScreen(cat, nivel) {
156|156|    document.getElementById('categorySelection').style.display = 'none';
157|157|    document.getElementById('quizScreen').style.display = 'block';
158|158|
159|159|    var badge = document.getElementById('categoryBadge');
160|160|    var texto = cat.icone + ' ' + cat.nome;
161|161|    if (nivel) {
162|162|        var nomeNivel = nivel === 'facil' ? 'Fácil' : (nivel === 'medio' ? 'Médio' : 'Difícil');
163|163|        texto += ' · ' + nomeNivel;
164|164|    }
165|165|    badge.textContent = texto;
166|166|    badge.style.backgroundColor = cat.cor;
167|167|
168|168|    startQuiz(cat);
169|169|}
170|170|
171|171|// ==================== QUIZ ====================
172|172|
173|173|function startQuiz(cat) {
174|174|    currentQuestionIndex = 0;
175|175|    score = 0;
176|176|    if (cat) {
177|177|        document.querySelector('#quizScreen h1').textContent = 'Desafio de ' + cat.nome + '! 🧠';
178|178|    }
179|179|    loadQuestion();
180|180|}
181|181|
182|182|function loadQuestion() {
183|183|    isAnswered = false;
184|184|
185|185|    if (filteredQuestions.length === 0) {
186|186|        document.getElementById('questionText').innerText = 'Nenhuma pergunta encontrada.';
187|187|        return;
188|188|    }
189|189|
190|190|    var question = filteredQuestions[currentQuestionIndex];
191|191|
192|192|    document.getElementById('quizProgress').innerText =
193|193|        'Pergunta ' + (currentQuestionIndex + 1) + ' de ' + filteredQuestions.length;
194|194|
195|195|    document.getElementById('questionText').innerText = question.pergunta;
196|196|
197|197|    document.getElementById('resolutionCard').classList.remove('show');
198|198|    document.getElementById('successNextBtn').style.display = 'none';
199|199|
200|200|    var optionsGrid = document.getElementById('optionsGrid');
201|201|    optionsGrid.innerHTML = '';
202|202|    optionsGrid.style.display = 'grid';
203|203|
204|204|    question.opcoes.forEach(function(opcaoText, index) {
205|205|        var btn = document.createElement('button');
206|206|        btn.className = 'option-btn';
207|207|        btn.innerText = opcaoText;
208|208|        btn.onclick = function() { checkAnswer(index, btn); };
209|209|        optionsGrid.appendChild(btn);
210|210|    });
211|211|}
212|212|
213|213|function checkAnswer(selectedIndex, clickedBtn) {
214|214|    if (isAnswered) return;
215|215|    isAnswered = true;
216|216|
217|217|    var question = filteredQuestions[currentQuestionIndex];
218|218|    var isCorrect = selectedIndex === question.respostaCorretaIndex;
219|219|
220|220|    var allBtns = document.querySelectorAll('.option-btn');
221|221|    var correctBtn = allBtns[question.respostaCorretaIndex];
222|222|
223|223|    if (isCorrect) {
224|224|        clickedBtn.classList.add('correct');
225|225|        score++;
226|226|
227|227|        if (typeof confetti === 'function') {
228|228|            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
229|229|        }
230|230|        document.getElementById('successNextBtn').style.display = 'block';
231|231|    } else {
232|232|        clickedBtn.classList.add('wrong');
233|233|        correctBtn.classList.add('correct');
234|234|        document.getElementById('resolutionText').innerText = question.resolucaoPassoAPasso;
235|235|        document.getElementById('resolutionCard').classList.add('show');
236|236|    }
237|237|
238|238|    allBtns.forEach(function(btn) {
239|239|        btn.style.cursor = 'default';
240|240|        if (!btn.classList.contains('correct') && !btn.classList.contains('wrong')) {
241|241|            btn.style.opacity = '0.5';
242|242|        }
243|243|    });
244|244|}
245|245|
246|246|function nextQuestion() {
247|247|    currentQuestionIndex++;
248|248|    if (currentQuestionIndex < filteredQuestions.length) {
249|249|        loadQuestion();
250|250|    } else {
251|251|        showResults();
252|252|    }
253|253|}
254|254|
255|255|function showResults() {
256|256|    document.getElementById('quizContainer').style.display = 'none';
257|257|    var resultContainer = document.getElementById('quizResult');
258|258|    resultContainer.style.display = 'block';
259|259|<<<<<<< HEAD
260|260|    
261|261|    document.getElementById('finalScore').innerText = 'Você acertou ' + score + ' de ' + filteredQuestions.length + ' perguntas.';
262|262|
263|263|    // --- SISTEMA DE XP ---
264|264|    var xpGanho = 0;
265|265|    if (typeof XPSystem !== 'undefined') {
266|266|        xpGanho = XPSystem.rewards.quizComplete;
267|267|        if (score === filteredQuestions.length) {
268|268|            xpGanho += XPSystem.rewards.quizPerfect;
269|269|        }
270|270|        XPSystem.addXP(xpGanho, 'quiz');
271|271|        XPSystem.refresh();
272|272|    }
273|273|    // Mostra XP ganho
274|274|    if (xpGanho > 0) {
275|275|        var xpMsg = document.createElement('p');
276|276|        xpMsg.style.cssText = 'font-size: 1.1rem; color: var(--secondary-color); margin-top: 8px; animation: pop 0.4s ease;';
277|277|        xpMsg.textContent = '⭐ +' + xpGanho + ' XP';
278|278|        resultContainer.appendChild(xpMsg);
279|279|    }
280|280|    
281|281|    // Muito confete para comemorar o fim
282|282|=======
283|283|
284|284|    var pct = Math.round((score / filteredQuestions.length) * 100);
285|285|    var mensagem = 'Você acertou ' + score + ' de ' + filteredQuestions.length + ' perguntas (' + pct + '%).';
286|286|
287|287|    if (pct === 100) {
288|288|        mensagem = '🎉 Perfeito! ' + mensagem + ' Você é um gênio da ' + currentCategory.nome + '!';
289|289|    } else if (pct >= 75) {
290|290|        mensagem = '👏 Muito bem! ' + mensagem + ' Continue praticando!';
291|291|    } else if (pct >= 50) {
292|292|        mensagem = '👍 Bom trabalho! ' + mensagem + ' Dá pra melhorar!';
293|293|    } else {
294|294|        mensagem = '💪 ' + mensagem + ' Não desanime, tente de novo!';
295|295|    }
296|296|
297|297|    document.getElementById('finalScore').innerText = mensagem;
298|298|
299|299|>>>>>>> dev
300|300|    if (typeof confetti === 'function') {
301|301|        var duration = 3000;
302|302|        var end = Date.now() + duration;
303|303|        (function frame() {
304|304|            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
305|305|            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
306|306|            if (Date.now() < end) { requestAnimationFrame(frame); }
307|307|        }());
308|308|    }
309|309|}
310|310|
311|311|// ==================== NAVEGAÇÃO ====================
312|312|
313|313|function backToCategories() {
314|314|    document.getElementById('quizScreen').style.display = 'none';
315|315|    document.getElementById('quizResult').style.display = 'none';
316|316|    document.getElementById('quizContainer').style.display = 'block';
317|317|    document.getElementById('categorySelection').style.display = 'block';
318|318|    document.getElementById('difficultySelection').style.display = 'none';
319|319|    document.getElementById('categoryGrid').style.display = 'grid';
320|320|    document.querySelector('#categorySelection h1').textContent = 'Escolha seu Desafio! 🧠';
321|321|    document.querySelector('#categorySelection p').textContent = 'Qual operação você quer treinar hoje?';
322|322|    currentCategory = null;
323|323|    currentNivel = null;
324|324|    filteredQuestions = [];
325|325|}
326|326|
327|327|function replayQuiz() {
328|328|    document.getElementById('quizResult').style.display = 'none';
329|329|    document.getElementById('quizContainer').style.display = 'block';
330|330|
331|331|    if (usandoDinamico && motorDinamico && currentCategory && currentNivel) {
332|332|        var questoesGeradas = motorDinamico.gerarConjunto(currentCategory.id, currentNivel, 5);
333|333|        filteredQuestions = questoesGeradas.map(function(q) {
334|334|            var item = motorDinamico.paraFormatoQuiz(q);
335|335|            if (distratorEngine) {
336|336|                var opcoesInfo = distratorEngine.gerarOpcoes({
337|337|                    resposta: q.resposta,
338|338|                    operandos: q.operandos,
339|339|                    operacao: q.operacao,
340|340|                    nivel: currentNivel
341|341|                });
342|342|                item.opcoes = opcoesInfo.opcoes;
343|343|                item.respostaCorretaIndex = opcoesInfo.corretoIndex;
344|344|            } else {
345|345|                var fb = gerarOpcoesBasicas(q.resposta, q.operacao);
346|346|                item.opcoes = fb.opcoes;
347|347|                item.respostaCorretaIndex = fb.corretoIndex;
348|348|            }
349|349|            item.resolucaoPassoAPasso = gerarResolucao(q);
350|350|            return item;
351|351|        });
352|352|    } else {
353|353|        shuffleArray(filteredQuestions);
354|354|    }
355|355|
356|356|    startQuiz(currentCategory);
357|357|}
358|358|
359|359|// ==================== FALLBACK (se DistratorEngine não disponível) ====================
360|360|
361|361|function gerarOpcoesBasicas(resposta, operacao) {
362|362|    var opcoesSet = {};
363|363|    opcoesSet[resposta] = true;
364|364|    var offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
365|365|    var tentativas = 0;
366|366|    while (Object.keys(opcoesSet).length < 4 && tentativas < offsets.length) {
367|367|        var candidato = resposta + offsets[tentativas];
368|368|        if (candidato > 0 && !opcoesSet[candidato]) {
369|369|            opcoesSet[candidato] = true;
370|370|        }
371|371|        tentativas++;
372|372|    }
373|373|    var opcoes = Object.keys(opcoesSet).map(Number);
374|374|    opcoes = shuffleArray(opcoes);
375|375|    var corretoIndex = opcoes.indexOf(resposta);
376|376|    return { opcoes: opcoes.map(String), corretoIndex: corretoIndex };
377|377|}
378|378|
379|379|// ==================== GERAÇÃO DE RESOLUÇÃO ====================
380|380|
381|381|function gerarResolucao(q) {
382|382|    var a = q.operandos.a;
383|383|    var b = q.operandos.b;
384|384|    var resp = q.resposta;
385|385|
386|386|    switch (q.operacao) {
387|387|        case 'adicao':
388|388|            return 'Para somar ' + a + ' + ' + b + ', conte a partir do ' + a + ' mais ' + b + ' dedos. ' +
389|389|                   'Resultado: ' + resp + '.';
390|390|        case 'subtracao':
391|391|            return 'Para subtrair ' + a + ' - ' + b + ', pense: quanto falta do ' + b + ' para chegar ao ' + a + '? ' +
392|392|                   'A resposta é ' + resp + '.';
393|393|        case 'multiplicacao':
394|394|            return a + ' x ' + b + ' = somar ' + b + ' repetido ' + a + ' vezes. O resultado é ' + resp + '.';
395|395|        case 'divisao':
396|396|            return a + ' ÷ ' + b + ' = quantas vezes o ' + b + ' cabe no ' + a + '? A resposta é ' + resp + '.';
397|397|        default:
398|398|            return 'A resposta correta é ' + resp + '.';
399|399|    }
400|400|}
401|401|
402|402|// ==================== UTILITÁRIOS ====================
403|403|
404|404|function shuffleArray(arr) {
405|405|    for (var i = arr.length - 1; i > 0; i--) {
406|406|        var j = Math.floor(Math.random() * (i + 1));
407|407|        var temp = arr[i];
408|408|        arr[i] = arr[j];
409|409|        arr[j] = temp;
410|410|    }
411|411|    return arr;
412|412|}
413|413|