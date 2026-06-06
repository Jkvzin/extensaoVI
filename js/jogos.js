// js/jogos.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("jogosContainer");

    if (container && typeof JOGOS_DATA !== 'undefined') {
        container.innerHTML = ""; // Limpa antes de renderizar
        
        JOGOS_DATA.forEach(jogo => {
            // Cria o link que envolve o card (abre em nova aba)
            const cardLink = document.createElement("a");
            cardLink.href = jogo.url;
            cardLink.target = "_blank"; // Requisito: Abre numa nova aba
            cardLink.className = "card";
            
            // Define a cor de hover customizada para este jogo
            cardLink.addEventListener('mouseenter', () => {
                cardLink.style.borderColor = jogo.corHover;
            });
            cardLink.addEventListener('mouseleave', () => {
                cardLink.style.borderColor = "transparent";
            });

            // Ícone do jogo
            const icone = document.createElement("div");
            icone.className = "card-icon";
            icone.innerHTML = jogo.icone;

            // Título do jogo
            const titulo = document.createElement("div");
            titulo.className = "card-title";
            titulo.innerText = jogo.titulo;

            // Dica de ação
            const dica = document.createElement("p");
            dica.style.fontSize = "1rem";
            dica.style.color = "var(--text-color)";
            dica.style.marginBottom = "0";
            dica.innerText = "Clique para jogar";

            // Monta o card
            cardLink.appendChild(icone);
            cardLink.appendChild(titulo);
            cardLink.appendChild(dica);
            
            container.appendChild(cardLink);
        });
    } else {
        console.error("Dados dos jogos não encontrados. Verifique js/data.js");
    }
});
