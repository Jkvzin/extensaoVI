// js/quiz.js

let currentCategory = null;
let filteredQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;

document.addEventListener("DOMContentLoaded", () => {
    if (typeof CATEGORIAS_QUIZ !== 'undefined' && CATEGORIAS_QUIZ.length > 0) {
        renderCategoryCards();
    } else {
        document.getElementById('categorySelection').style.display = 'none';
        document.getElementById('quizScreen').style.display = 'block';
        startQuiz(null);
    }

    const nextBtn = document.getElementById('nextQuestionBtn');
    const successBtn = document.getElementById('successNextBtn');
    const backBtn = document.getElementById('backToCategoriesBtn');

    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (successBtn) successBtn.addEventListener('click', nextQuestion);
    if (backBtn) backBtn.addEventListener('click', backToCategories);
});

function renderCategoryCards() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;

    grid.innerHTML = '';

    CATEGORIAS_QUIZ.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.borderColor = cat.cor;
        card.onclick = () => selectCategory(cat);

        card.innerHTML =
            '<div class="category-card-icon">' + cat.icone + '</div>' +
            '<div class="category-card-title" style="color: ' + cat.cor + ';">' + cat.nome + '</div>' +
            '<div class="category-card-desc">' + cat.descricao + '</div>';

        grid.appendChild(card);
    });
}

function selectCategory(cat) {
    currentCategory = cat;

    filteredQuestions = QUIZ_DATA.filter(function(q) {
        return q.categoria === cat.id;
    });

    shuffleArray(filteredQuestions);

    if (filteredQuestions.length === 0) {
        alert('Ops! Ainda não temos perguntas de ' + cat.nome + '. Escolha outra categoria!');
        return;
    }

    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    var badge = document.getElementById('categoryBadge');
    badge.textContent = cat.icone + ' ' + cat.nome;
    badge.style.backgroundColor = cat.cor;

    startQuiz(cat);
}

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

    if (filteredQuestions.length === 0) {
        document.getElementById('questionText').innerText = 'Nenhuma pergunta encontrada. Volte e escolha outra categoria!';
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
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        document.getElementById('successNextBtn').style.display = 'block';
    } else {
        clickedBtn.classList.add('wrong');
        correctBtn.classList.add('correct');

        document.getElementById('resolutionText').innerText = question.resolucaoPassoAPasso;
        document.getElementById('resolutionCard').classList.add('show');
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
        mensagem = '🎉 Perfeito! ' + mensagem + ' Você é um gênio da ' + currentCategory.nome + '!';
    } else if (pct >= 75) {
        mensagem = '👏 Muito bem! ' + mensagem + ' Continue praticando!';
    } else if (pct >= 50) {
        mensagem = '👍 Bom trabalho! ' + mensagem + ' Dá pra melhorar!';
    } else {
        mensagem = '💪 ' + mensagem + ' Não desanime, tente de novo!';
    }

    document.getElementById('finalScore').innerText = mensagem;

    if (typeof confetti === 'function') {
        var duration = 3000;
        var end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

function backToCategories() {
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('categorySelection').style.display = 'block';
    currentCategory = null;
    filteredQuestions = [];
}

function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
