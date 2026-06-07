1|// js/main.js
2|
3|// Lógica para o módulo de feedback na tela inicial
4|function registerFeedback(type) {
5|    const feedbackMessage = document.getElementById('feedbackMessage');
6|    
7|    if (feedbackMessage) {
8|        if (type === 'feliz') {
9|            feedbackMessage.innerText = "Que legal! Ficamos muito felizes que você gostou! 🌟";
10|            feedbackMessage.style.color = "var(--success-color)";
11|        } else if (type === 'normal') {
12|            feedbackMessage.innerText = "Obrigado! Vamos continuar melhorando para você! 👍";
13|            feedbackMessage.style.color = "var(--secondary-color)";
14|        } else {
15|            feedbackMessage.innerText = "Poxa... Vamos trabalhar duro para deixar mais divertido! 💪";
16|            feedbackMessage.style.color = "var(--primary-color)";
17|        }
18|        
19|        feedbackMessage.style.display = 'block';
20|        feedbackMessage.style.animation = 'pop 0.3s ease';
21|    }
22|}
23|
24|// Pequeno script para destacar a página atual no menu e checar autenticação
25|document.addEventListener("DOMContentLoaded", () => {
26|    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
27|    const publicPages = ['login.html', 'dashboard.html'];
28|    
29|    // Auth Check
30|    if (!publicPages.includes(currentPath)) {
31|        const currentStudent = localStorage.getItem('currentStudent');
32|        if (!currentStudent) {
33|            window.location.href = 'login.html';
34|            return; // Stop execution
35|        }
36|
37|        // Render Profile
38|        const student = JSON.parse(currentStudent);
39|        const header = document.querySelector('header');
40|        
41|        if (header) {
42|            const profileDiv = document.createElement('div');
43|            profileDiv.className = 'user-profile';
44|            profileDiv.style.display = 'flex';
45|            profileDiv.style.alignItems = 'center';
46|            const avatarSpan = document.createElement('span');
47|            avatarSpan.style.fontSize = '1.5rem';
48|            avatarSpan.style.marginRight = '10px';
49|            avatarSpan.textContent = student.avatar_url;
50|
51|            const nameSpan = document.createElement('span');
52|            nameSpan.style.fontWeight = 'bold';
53|            nameSpan.style.marginRight = '15px';
54|            nameSpan.textContent = student.nome;
55|            
56|            if (student.id === 'visitante') {
57|                const visitBadge = document.createElement('span');
58|                visitBadge.textContent = ' (Visitante)';
59|                visitBadge.style.fontSize = '0.8rem';
60|                visitBadge.style.color = 'var(--primary-color)';
61|                visitBadge.style.fontWeight = 'normal';
62|                nameSpan.appendChild(visitBadge);
63|            }
64|
65|            const logoutLink = document.createElement('a');
66|            logoutLink.href = '#';
67|            logoutLink.id = 'logout-student';
68|            logoutLink.style.fontSize = '0.9rem';
69|            logoutLink.style.color = 'var(--primary-color)';
70|            logoutLink.style.textDecoration = 'underline';
71|            logoutLink.textContent = 'Trocar de aluno';
72|            
73|            profileDiv.appendChild(avatarSpan);
74|            profileDiv.appendChild(nameSpan);
75|            profileDiv.appendChild(logoutLink);
76|            
77|            header.appendChild(profileDiv);
78|
79|            logoutLink.addEventListener('click', (e) => {
80|                e.preventDefault();
81|                localStorage.removeItem('currentStudent');
82|                window.location.href = 'login.html';
83|            });
84|        }
85|    }
86|
87|    // Highlight current page
88|    const navLinks = document.querySelectorAll("nav ul li a");
89|    navLinks.forEach(link => {
90|        const href = link.getAttribute("href");
91|        if (href === currentPath || (currentPath === "index.html" && href === "index.html")) {
92|            link.classList.add("active");
93|        } else {
94|            link.classList.remove("active");
95|        }
96|    });
97|});
98|