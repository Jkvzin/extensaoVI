// js/main.js

// Lógica para o módulo de feedback na tela inicial
function registerFeedback(type) {
    const feedbackMessage = document.getElementById('feedbackMessage');
    
    if (feedbackMessage) {
        if (type === 'feliz') {
            feedbackMessage.innerText = "Que legal! Ficamos muito felizes que você gostou! 🌟";
            feedbackMessage.style.color = "var(--success-color)";
        } else if (type === 'normal') {
            feedbackMessage.innerText = "Obrigado! Vamos continuar melhorando para você! 👍";
            feedbackMessage.style.color = "var(--secondary-color)";
        } else {
            feedbackMessage.innerText = "Poxa... Vamos trabalhar duro para deixar mais divertido! 💪";
            feedbackMessage.style.color = "var(--primary-color)";
        }
        
        feedbackMessage.style.display = 'block';
        feedbackMessage.style.animation = 'pop 0.3s ease';
    }
}

// Pequeno script para destacar a página atual no menu
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll("nav ul li a");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath || (currentPath === "" && href === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});
