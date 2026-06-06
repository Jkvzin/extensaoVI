// js/quiz.js

let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false; // Impede duplo clique

document.addEventListener("DOMContentLoaded", () => {
    if (typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA.length > 0) {
        loadQuestion();
        
        // Event listeners dos botões de próxima
        document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
        document.getElementById('successNextBtn').addEventListener('click', nextQuestion);
    } else {
        document.getElementById('questionText').innerText = "Nenhuma pergunta encontrada no banco de dados. Verifique js/data.js";
    }
});

function loadQuestion() {
    isAnswered = false;
    const question = QUIZ_DATA[currentQuestionIndex];
    
    // Atualiza Progresso
    document.getElementById('quizProgress').innerText = `Pergunta ${currentQuestionIndex + 1} de ${QUIZ_DATA.length}`;
    
    // Atualiza Texto da Pergunta
    document.getElementById('questionText').innerText = question.pergunta;
    
    // Esconde feedback cards
    document.getElementById('resolutionCard').classList.remove('show');
    document.getElementById('successNextBtn').style.display = 'none';
    
    // Limpa e gera botões de opção
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = "";
    optionsGrid.style.display = 'grid'; // Volta a mostrar se estava escondido
    
    question.opcoes.forEach((opcaoText, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opcaoText;
        btn.onclick = () => checkAnswer(index, btn);
        optionsGrid.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, clickedBtn) {
    if (isAnswered) return;
    isAnswered = true;
    
    const question = QUIZ_DATA[currentQuestionIndex];
    const isCorrect = selectedIndex === question.respostaCorretaIndex;
    
    // Identifica o botão correto real
    const allBtns = document.querySelectorAll('.option-btn');
    const correctBtn = allBtns[question.respostaCorretaIndex];
    
    if (isCorrect) {
        // Acertou!
        clickedBtn.classList.add('correct');
        score++;
        
        // Efeito visual de confete (se importado no HTML)
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        
        // Mostra botão de próxima
        document.getElementById('successNextBtn').style.display = 'block';
        
    } else {
        // Errou
        clickedBtn.classList.add('wrong');
        correctBtn.classList.add('correct'); // Mostra a resposta certa
        
        // Mostra resolução
        document.getElementById('resolutionText').innerText = question.resolucaoPassoAPasso;
        document.getElementById('resolutionCard').classList.add('show');
    }
    
    // Desabilita botões
    allBtns.forEach(btn => {
        btn.style.cursor = 'default';
        if (!btn.classList.contains('correct') && !btn.classList.contains('wrong')) {
            btn.style.opacity = '0.5'; // Diminui opacidade dos errados não clicados
        }
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < QUIZ_DATA.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizContainer').style.display = 'none';
    const resultContainer = document.getElementById('quizResult');
    resultContainer.style.display = 'block';
    
    document.getElementById('finalScore').innerText = `Você acertou ${score} de ${QUIZ_DATA.length} perguntas.`;
    
    // Muito confete para comemorar o fim
    if (typeof confetti === 'function') {
        const duration = 3000;
        const end = Date.now() + duration;

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
