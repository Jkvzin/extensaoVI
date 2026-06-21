// js/quiz.js

var currentCategory = null;
var currentNivel = null;
var filteredQuestions = [];
var currentQuestionIndex = 0;
var score = 0;
var isAnswered = false;
var usandoDinamico = false;

// Instâncias globais
var motorDinamico = null;
var distratorEngine = null;

if (typeof QuestaoDinamica !== 'undefined') {
    motorDinamico = new QuestaoDinamica();
}
if (typeof DistratorEngine !== 'undefined') {
    distratorEngine = new DistratorEngine();
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof CATEGORIAS_QUIZ !== 'undefined' && CATEGORIAS_QUIZ.length > 0) {
        renderCategoryCards();
    } else {
        document.getElementById('categorySelection').style.display = 'none';
        document.getElementById('quizScreen').style.display = 'block';
        startQuiz(null);
    }

    var nextBtn = document.getElementById('nextQuestionBtn');
    var successBtn = document.getElementById('successNextBtn');
    var backBtn = document.getElementById('backToCategoriesBtn');
    var replayBtn = document.getElementById('replayBtn');
    var backFromDiff = document.getElementById('backToCategoriesFromDiff');

    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (successBtn) successBtn.addEventListener('click', nextQuestion);
    if (backBtn) backBtn.addEventListener('click', backToCategories);
    if (replayBtn) replayBtn.addEventListener('click', replayQuiz);
    if (backFromDiff) backFromDiff.addEventListener('click', backToCategories);
});

// ==================== TELA DE CATEGORIAS ====================

function renderCategoryCards() {
    var grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    CATEGORIAS_QUIZ.forEach(function(cat) {
        var card = document.createElement('div');
        card.className = 'category-card';
        card.style.borderColor = cat.cor;
        card.onclick = function() { selectCategory(cat); };

        card.innerHTML =
            '<div class="category-card-icon">' + cat.icone + '</div>' +
            '<div class="category-card-title" style="color: ' + cat.cor + ';">' + cat.nome + '</div>' +
            '<div class="category-card-desc">' + cat.descricao + '</div>';

        grid.appendChild(card);
    });
}

function selectCategory(cat) {
    currentCategory = cat;
    if (motorDinamico) {
        showDifficultySelection(cat);
    } else {
        startWithStaticQuestions(cat);
    }
}

// ==================== SELEÇÃO DE DIFICULDADE ====================

function showDifficultySelection(cat) {
    document.getElementById('categoryGrid').style.display = 'none';
    document.querySelector('#categorySelection h1').textContent = cat.icone + ' ' + cat.nome;
    document.querySelector('#categorySelection p').textContent = 'Escolha o nível de dificuldade:';

    var diffDiv = document.getElementById('difficultySelection');
    diffDiv.style.display = 'block';

    var diffGrid = document.getElementById('difficultyGrid');
    diffGrid.innerHTML = '';

    var niveis = motorDinamico.getNiveis();

    niveis.forEach(function(nivel) {
        var btn = document.createElement('button');
        btn.className = 'difficulty-btn';
        btn.style.borderColor = cat.cor;
        btn.onclick = function() { startWithDifficulty(cat, nivel.id); };

        btn.innerHTML =
            '<span class="difficulty-btn-name">' + nivel.nome + '</span>' +
            '<span class="difficulty-btn-range">Números de ' + nivel.range + '</span>';

        diffGrid.appendChild(btn);
    });
}

function startWithDifficulty(cat, nivel) {
    currentNivel = nivel;

    var questoesGeradas = motorDinamico.gerarConjunto(cat.id, nivel, 5);

    filteredQuestions = questoesGeradas.map(function(q) {
        var item = motorDinamico.paraFormatoQuiz(q);

        // Usa DistratorEngine se disponível
        if (distratorEngine) {
            var opcoesInfo = distratorEngine.gerarOpcoes({
                resposta: q.resposta,
                operandos: q.operandos,
                operacao: q.operacao,
                nivel: nivel
            });
            item.opcoes = opcoesInfo.opcoes;
            item.respostaCorretaIndex = opcoesInfo.corretoIndex;
        } else {
            // Fallback básico
            var fb = gerarOpcoesBasicas(q.resposta, q.operacao);
            item.opcoes = fb.opcoes;
            item.respostaCorretaIndex = fb.corretoIndex;
        }

        item.resolucaoPassoAPasso = gerarResolucao(q);
        return item;
    });

    usandoDinamico = true;
    iniciarQuizScreen(cat, nivel);
}

function startWithStaticQuestions(cat) {
    currentNivel = null;

    filteredQuestions = QUIZ_DATA.filter(function(q) {
        return q.categoria === cat.id;
    });

    shuffleArray(filteredQuestions);

    if (filteredQuestions.length === 0) {
        alert('Ops! Ainda não temos perguntas de ' + cat.nome + '. Escolha outra categoria!');
        return;
    }

    usandoDinamico = false;
    iniciarQuizScreen(cat, null);
}

function iniciarQuizScreen(cat, nivel) {
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    var badge = document.getElementById('categoryBadge');
    var texto = cat.icone + ' ' + cat.nome;
    if (nivel) {
        var nomeNivel = nivel === 'facil' ? 'Fácil' : (nivel === 'medio' ? 'Médio' : 'Difícil');
        texto += ' · ' + nomeNivel;
    }
    badge.textContent = texto;
    badge.style.backgroundColor = cat.cor;

    startQuiz(cat);
}

// ==================== QUIZ ====================

function startQuiz(cat) {
    currentQuestionIndex = 0;
    score = 0;
    if (cat) {
        document.querySelector('#quizScreen h1').textContent = 'Desafio de ' + cat.nome + '! 🧠';
    }
    loadQuestion();
}

function loadQuestion() {
    isAnswered = false;

    // Para TTS se estiver falando
    if (typeof TTSReader !== 'undefined' && TTSReader.isSpeaking()) {
        TTSReader.stop();
    }

    if (filteredQuestions.length === 0) {
        document.getElementById('questionText').innerText = 'Nenhuma pergunta encontrada.';
        return;
    }

    var question = filteredQuestions[currentQuestionIndex];

    document.getElementById('quizProgress').innerText =
        'Pergunta ' + (currentQuestionIndex + 1) + ' de ' + filteredQuestions.length;

    document.getElementById('questionText').innerText = question.pergunta;

    // Botão TTS - Ouvir Pergunta
    var ttsBtn = document.getElementById('ttsQuestionBtn');
    if (ttsBtn) {
        ttsBtn.onclick = function(e) {
            e.stopPropagation();
            if (TTSReader.isSpeaking()) {
                TTSReader.stop();
                ttsBtn.classList.remove('speaking');
                return;
            }
            ttsBtn.classList.add('speaking');
            TTSReader.speak(question.pergunta, {
                rate: TTSReader.getSpeed(),
                onEnd: function() { ttsBtn.classList.remove('speaking'); }
            });
        };
    }

    document.getElementById('resolutionCard').classList.remove('show');
    document.getElementById('successNextBtn').style.display = 'none';

    var optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    optionsGrid.style.display = 'grid';

    question.opcoes.forEach(function(opcaoText, index) {
        var btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opcaoText;
        btn.onclick = function() { checkAnswer(index, btn); };
        optionsGrid.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, clickedBtn) {
    if (isAnswered) return;
    isAnswered = true;

    var question = filteredQuestions[currentQuestionIndex];
    var isCorrect = selectedIndex === question.respostaCorretaIndex;

    var allBtns = document.querySelectorAll('.option-btn');
    var correctBtn = allBtns[question.respostaCorretaIndex];

    if (isCorrect) {
        clickedBtn.classList.add('correct');
        score++;

        // Feedback sonoro de acerto
        if (typeof AudioFeedback !== 'undefined') { AudioFeedback.playAcerto(); }

        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        document.getElementById('successNextBtn').style.display = 'block';
    } else {
        clickedBtn.classList.add('wrong');
        correctBtn.classList.add('correct');

        // Feedback sonoro de erro
        if (typeof AudioFeedback !== 'undefined') { AudioFeedback.playErro(); }

        document.getElementById('resolutionText').innerText = question.resolucaoPassoAPasso;
        document.getElementById('resolutionCard').classList.add('show');

        // TTS para a resolução
        var ttsResBtn = document.getElementById('ttsResolutionBtn');
        if (ttsResBtn) {
            ttsResBtn.onclick = function(e) {
                e.stopPropagation();
                if (TTSReader.isSpeaking()) {
                    TTSReader.stop();
                    ttsResBtn.classList.remove('speaking');
                    return;
                }
                ttsResBtn.classList.add('speaking');
                TTSReader.speak(question.resolucaoPassoAPasso, {
                    rate: TTSReader.getSpeed(),
                    onEnd: function() { ttsResBtn.classList.remove('speaking'); }
                });
            };
        }
    }

    allBtns.forEach(function(btn) {
        btn.style.cursor = 'default';
        if (!btn.classList.contains('correct') && !btn.classList.contains('wrong')) {
            btn.style.opacity = '0.5';
        }
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizContainer').style.display = 'none';
    var resultContainer = document.getElementById('quizResult');
    resultContainer.style.display = 'block';
    
    var pct = Math.round((score / filteredQuestions.length) * 100);
    var mensagem = "Você acertou " + score + " de " + filteredQuestions.length + " perguntas (" + pct + "%).";

    if (pct === 100) {
        mensagem = "🎉 Perfeito! " + mensagem + " Você é um gênio da " + currentCategory.nome + "!";
    } else if (pct >= 75) {
        mensagem = "👏 Muito bem! " + mensagem + " Continue praticando!";
    } else if (pct >= 50) {
        mensagem = "👍 Bom trabalho! " + mensagem + " Dá pra melhorar!";
    } else {
        mensagem = "💪 " + mensagem + " Não desanime, tente de novo!";
    }

    document.getElementById('finalScore').innerText = mensagem;

    // --- SISTEMA DE XP ---
    var xpGanho = 0;
    if (typeof XPSystem !== 'undefined') {
        xpGanho = XPSystem.rewards.quizComplete;
        if (score === filteredQuestions.length) {
            xpGanho += XPSystem.rewards.quizPerfect;
        }
        XPSystem.addXP(xpGanho, 'quiz');
        XPSystem.refresh();
    }
    // Mostra XP ganho
    if (xpGanho > 0) {
        var xpMsg = document.createElement('p');
        xpMsg.style.cssText = 'font-size: 1.1rem; color: var(--secondary-color); margin-top: 8px; animation: pop 0.4s ease;';
        xpMsg.textContent = "⭐ +" + xpGanho + " XP";
        resultContainer.appendChild(xpMsg);
    }

    // Feedback sonoro de conclusao
    if (typeof AudioFeedback !== 'undefined') {
        AudioFeedback.playConclusao();
    }

    // TTS para o resultado
    var ttsResultBtn = document.getElementById('ttsResultBtn');
    if (ttsResultBtn) {
        ttsResultBtn.onclick = function(e) {
            e.stopPropagation();
            if (TTSReader.isSpeaking()) {
                TTSReader.stop();
                ttsResultBtn.classList.remove('speaking');
                return;
            }
            ttsResultBtn.classList.add('speaking');
            TTSReader.speak(mensagem, {
                rate: TTSReader.getSpeed(),
                onEnd: function() { ttsResultBtn.classList.remove('speaking'); }
            });
        };
    }

    if (typeof confetti === 'function') {
        var duration = 3000;
        var end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });
            if (Date.now() < end) { requestAnimationFrame(frame); }
        }());
    }
}

// ==================== NAVEGAÇÃO ====================

function backToCategories() {
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('categorySelection').style.display = 'block';
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('categoryGrid').style.display = 'grid';
    document.querySelector('#categorySelection h1').textContent = 'Escolha seu Desafio! 🧠';
    document.querySelector('#categorySelection p').textContent = 'Qual operação você quer treinar hoje?';
    currentCategory = null;
    currentNivel = null;
    filteredQuestions = [];
}

function replayQuiz() {
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';

    if (usandoDinamico && motorDinamico && currentCategory && currentNivel) {
        var questoesGeradas = motorDinamico.gerarConjunto(currentCategory.id, currentNivel, 5);
        filteredQuestions = questoesGeradas.map(function(q) {
            var item = motorDinamico.paraFormatoQuiz(q);
            if (distratorEngine) {
                var opcoesInfo = distratorEngine.gerarOpcoes({
                    resposta: q.resposta,
                    operandos: q.operandos,
                    operacao: q.operacao,
                    nivel: currentNivel
                });
                item.opcoes = opcoesInfo.opcoes;
                item.respostaCorretaIndex = opcoesInfo.corretoIndex;
            } else {
                var fb = gerarOpcoesBasicas(q.resposta, q.operacao);
                item.opcoes = fb.opcoes;
                item.respostaCorretaIndex = fb.corretoIndex;
            }
            item.resolucaoPassoAPasso = gerarResolucao(q);
            return item;
        });
    } else {
        shuffleArray(filteredQuestions);
    }

    startQuiz(currentCategory);
}

// ==================== FALLBACK (se DistratorEngine não disponível) ====================

function gerarOpcoesBasicas(resposta, operacao) {
    var opcoesSet = {};
    opcoesSet[resposta] = true;
    var offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
    var tentativas = 0;
    while (Object.keys(opcoesSet).length < 4 && tentativas < offsets.length) {
        var candidato = resposta + offsets[tentativas];
        if (candidato > 0 && !opcoesSet[candidato]) {
            opcoesSet[candidato] = true;
        }
        tentativas++;
    }
    var opcoes = Object.keys(opcoesSet).map(Number);
    opcoes = shuffleArray(opcoes);
    var corretoIndex = opcoes.indexOf(resposta);
    return { opcoes: opcoes.map(String), corretoIndex: corretoIndex };
}

// ==================== GERAÇÃO DE RESOLUÇÃO ====================

function gerarResolucao(q) {
    var a = q.operandos.a;
    var b = q.operandos.b;
    var resp = q.resposta;

    switch (q.operacao) {
        case 'adicao':
            return 'Para somar ' + a + ' + ' + b + ', conte a partir do ' + a + ' mais ' + b + ' dedos. ' +
                   'Resultado: ' + resp + '.';
        case 'subtracao':
            return 'Para subtrair ' + a + ' - ' + b + ', pense: quanto falta do ' + b + ' para chegar ao ' + a + '? ' +
                   'A resposta é ' + resp + '.';
        case 'multiplicacao':
            return a + ' x ' + b + ' = somar ' + b + ' repetido ' + a + ' vezes. O resultado é ' + resp + '.';
        case 'divisao':
            return a + ' ÷ ' + b + ' = quantas vezes o ' + b + ' cabe no ' + a + '? A resposta é ' + resp + '.';
        default:
            return 'A resposta correta é ' + resp + '.';
    }
}

// ==================== UTILITÁRIOS ====================

function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}
