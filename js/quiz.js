// js/quiz.js

var currentCategory = null;
var currentNivel = null;
var filteredQuestions = [];
var currentQuestionIndex = 0;
var score = 0;
var isAnswered = false;
var usandoDinamico = false;
var erros = []; // { questionIndex, pergunta, opcoes, respostaCorretaIndex, escolhaAluno }

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
    var refazerErrosBtn = document.getElementById('refazerErrosBtn');

    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (successBtn) successBtn.addEventListener('click', nextQuestion);
    if (backBtn) backBtn.addEventListener('click', backToCategories);
    if (replayBtn) replayBtn.addEventListener('click', replayQuiz);
    if (backFromDiff) backFromDiff.addEventListener('click', backToCategories);
    if (refazerErrosBtn) refazerErrosBtn.addEventListener('click', refazerErros);
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
    erros = [];
    if (cat) {
        document.querySelector('#quizScreen h1').textContent = 'Desafio de ' + cat.nome + '! 🧠';
    }
    loadQuestion();
}

function loadQuestion() {
    isAnswered = false;

    if (filteredQuestions.length === 0) {
        document.getElementById('questionText').innerText = 'Nenhuma pergunta encontrada.';
        return;
    }

    var question = filteredQuestions[currentQuestionIndex];

    document.getElementById('quizProgress').innerText =
        'Pergunta ' + (currentQuestionIndex + 1) + ' de ' + filteredQuestions.length;

    document.getElementById('questionText').innerText = question.pergunta;

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

        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        document.getElementById('successNextBtn').style.display = 'block';
    } else {
        clickedBtn.classList.add('wrong');
        correctBtn.classList.add('correct');
        document.getElementById('resolutionText').innerText = question.resolucaoPassoAPasso;
        document.getElementById('resolutionCard').classList.add('show');

        // Registra o erro para revisão futura
        erros.push({
            questionIndex: currentQuestionIndex,
            pergunta: question.pergunta,
            opcoes: question.opcoes,
            respostaCorretaIndex: question.respostaCorretaIndex,
            escolhaAluno: selectedIndex,
            resolucaoPassoAPasso: question.resolucaoPassoAPasso
        });
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
    var mensagem = 'Você acertou ' + score + ' de ' + filteredQuestions.length + ' perguntas (' + pct + '%).';

    if (pct === 100) {
        mensagem = '🎉 Perfeito! ' + mensagem + ' Você é um gênio da ' + (currentCategory ? currentCategory.nome : 'matemática') + '!';
    } else if (pct >= 75) {
        mensagem = '👏 Muito bem! ' + mensagem + ' Continue praticando!';
    } else if (pct >= 50) {
        mensagem = '👍 Bom trabalho! ' + mensagem + ' Dá pra melhorar!';
    } else {
        mensagem = '💪 ' + mensagem + ' Não desanime, tente de novo!';
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

    // --- REGISTRAR PROGRESSO NO DB ---
    if (typeof DB !== 'undefined') {
        try {
            var raw = localStorage.getItem('currentStudent');
            if (raw) {
                var student = JSON.parse(raw);
                DB.registrarProgresso({
                    aluno_id: student.id,
                    aluno_nome: student.nome,
                    categoria: currentCategory ? currentCategory.nome : 'Quiz',
                    acertos: score,
                    total: filteredQuestions.length,
                    pct: pct,
                    xp_ganho: xpGanho,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {}
    }
    if (xpGanho > 0) {
        var xpMsg = document.createElement('p');
        xpMsg.style.cssText = 'font-size: 1.1rem; color: var(--secondary-color); margin-top: 8px;';
        xpMsg.textContent = '⭐ +' + xpGanho + ' XP';
        resultContainer.appendChild(xpMsg);
    }

    // --- REVISÃO DE ERROS ---
    if (erros.length > 0) {
        renderRevisaoErros();
        document.getElementById('revisaoErros').style.display = 'block';
    } else {
        document.getElementById('revisaoErros').style.display = 'none';
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

// ==================== REVISÃO DE ERROS ====================

function renderRevisaoErros() {
    var lista = document.getElementById('revisaoErrosList');
    if (!lista) return;
    lista.innerHTML = '';

    erros.forEach(function(erro, idx) {
        var escolhaText = erro.opcoes[erro.escolhaAluno];
        var corretaText = erro.opcoes[erro.respostaCorretaIndex];

        var card = document.createElement('div');
        card.style.cssText = 'background: #FFF5F5; border: 2px solid #FFCCCC; border-radius: 16px; padding: 20px; margin-bottom: 16px;';

        card.innerHTML = '' +
            '<div style="display: flex; align-items: flex-start; gap: 12px;">' +
                '<span style="font-size: 1.3rem; font-weight: 900; color: var(--primary-color); min-width: 28px;">' + (idx + 1) + '.</span>' +
                '<div style="flex: 1;">' +
                    '<p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 10px; text-align: left; color: var(--text-color);">' + escaparHTML(erro.pergunta) + '</p>' +
                    '<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">' +
                        '<span style="background: #FFCCCC; color: #C62828; padding: 4px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 700;">❌ Você marcou: ' + escaparHTML(escolhaText) + '</span>' +
                        '<span style="background: #C8E6C9; color: #2E7D32; padding: 4px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 700;">✅ Correto: ' + escaparHTML(corretaText) + '</span>' +
                    '</div>' +
                    '<details style="margin-top: 8px;">' +
                        '<summary style="cursor: pointer; font-weight: 700; color: var(--secondary-color); font-size: 0.95rem;">📖 Ver explicação</summary>' +
                        '<p style="margin-top: 8px; padding: 12px; background: #FFFDE7; border-radius: 8px; font-size: 0.95rem; color: #856404; text-align: left;">' + escaparHTML(erro.resolucaoPassoAPasso) + '</p>' +
                    '</details>' +
                '</div>' +
            '</div>';

        lista.appendChild(card);
    });

    // Scroll suave até a revisão
    document.getElementById('revisaoErros').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function refazerErros() {
    if (erros.length === 0) return;

    // Salva os erros como as novas perguntas
    var questoesParaRefazer = erros.map(function(erro) {
        return {
            pergunta: erro.pergunta,
            opcoes: erro.opcoes,
            respostaCorretaIndex: erro.respostaCorretaIndex,
            resolucaoPassoAPasso: erro.resolucaoPassoAPasso
        };
    });

    // Embaralha
    shuffleArray(questoesParaRefazer);

    // Configura o quiz para rodar só com os erros
    filteredQuestions = questoesParaRefazer;
    usandoDinamico = false;
    currentNivel = null;
    erros = [];

    // Esconde resultado e mostra quiz
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('revisaoErros').style.display = 'none';

    startQuiz(currentCategory);
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

    // Para respostas pequenas (<=5), usar apenas offsets positivos para não gerar negativos
    if (resposta <= 5) {
        var offset = 1;
        while (Object.keys(opcoesSet).length < 4 && offset <= 20) {
            var candidato = resposta + offset;
            if (!opcoesSet[candidato]) {
                opcoesSet[candidato] = true;
            }
            offset++;
        }
    } else {
        var offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10];
        for (var t = 0; t < offsets.length; t++) {
            var candidato = resposta + offsets[t];
            if (candidato > 0 && !opcoesSet[candidato]) {
                opcoesSet[candidato] = true;
            }
            if (Object.keys(opcoesSet).length >= 4) break;
        }
        // Fallback: se ainda não tem 4, continua com positivos
        var fallbackOffset = 6;
        while (Object.keys(opcoesSet).length < 4 && fallbackOffset <= 50) {
            var c = resposta + fallbackOffset;
            if (!opcoesSet[c]) opcoesSet[c] = true;
            fallbackOffset++;
        }
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
