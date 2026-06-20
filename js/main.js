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

// Pequeno script para destacar a página atual no menu e checar autenticação
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['login.html', 'dashboard.html'];
    
    // Auth Check
    if (!publicPages.includes(currentPath)) {
        const currentStudent = localStorage.getItem('currentStudent');
        if (!currentStudent) {
            window.location.href = 'login.html';
            return; // Stop execution
        }

        // Render Profile
        var student;
        try {
            student = JSON.parse(currentStudent);
        } catch (e) {
            localStorage.removeItem('currentStudent');
            window.location.href = 'login.html';
            return;
        }

        // Valida se o aluno ainda existe no banco (Issue #34)
        if (student.id !== 'visitante' && typeof DB !== 'undefined') {
            var alunoNoDB = DB.getAluno(student.id);
            if (!alunoNoDB) {
                // Aluno foi removido pelo professor — limpa e redireciona
                localStorage.removeItem('currentStudent');
                window.location.href = 'login.html';
                return;
            }
            // Atualiza dados do localStorage com versão mais recente do DB
            student = alunoNoDB;
            localStorage.setItem('currentStudent', JSON.stringify(alunoNoDB));
        }

        const header = document.querySelector('header');
        
        if (header) {
            const profileDiv = document.createElement('div');
            profileDiv.className = 'user-profile';
            profileDiv.style.display = 'flex';
            profileDiv.style.alignItems = 'center';
            const avatarSpan = document.createElement('span');
            avatarSpan.style.fontSize = '1.5rem';
            avatarSpan.style.marginRight = '10px';
            avatarSpan.textContent = student.avatar_url;

            const nameSpan = document.createElement('span');
            nameSpan.style.fontWeight = 'bold';
            nameSpan.style.marginRight = '15px';
            nameSpan.textContent = student.nome;
            
            if (student.id === 'visitante') {
                const visitBadge = document.createElement('span');
                visitBadge.textContent = ' (Visitante)';
                visitBadge.style.fontSize = '0.8rem';
                visitBadge.style.color = 'var(--primary-color)';
                visitBadge.style.fontWeight = 'normal';
                nameSpan.appendChild(visitBadge);
            }

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.id = 'logout-student';
            logoutLink.style.fontSize = '0.9rem';
            logoutLink.style.color = 'var(--primary-color)';
            logoutLink.style.textDecoration = 'underline';
            logoutLink.textContent = 'Trocar de aluno';
            
            profileDiv.appendChild(avatarSpan);
            profileDiv.appendChild(nameSpan);
            profileDiv.appendChild(logoutLink);
            
            header.appendChild(profileDiv);

            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentStudent');
                window.location.href = 'login.html';
            });
        }
    }

    // Highlight current page
    const navLinks = document.querySelectorAll("nav ul li a");
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath || (currentPath === "index.html" && href === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});
