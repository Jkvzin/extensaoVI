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
            cardLink.style.textDecoration = "none";
            
            // Define a cor de hover customizada para este jogo
            cardLink.addEventListener('mouseenter', () => {
                cardLink.style.borderColor = jogo.corHover;
            });
            cardLink.addEventListener('mouseleave', () => {
                cardLink.style.borderColor = "transparent";
            });

            // Tag de categoria
            const tagCategoria = document.createElement("span");
            tagCategoria.style.cssText = "display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700;background:#F0F0F0;color:#636E72;margin-bottom:8px;";
            const nomesCategorias = {
                "geral": "Geral",
                "adicao": "Adição",
                "subtracao": "Subtração",
                "multiplicacao": "Multiplicação",
                "divisao": "Divisão",
                "fracoes": "Frações",
                "raciocinio": "Raciocínio"
            };
            tagCategoria.innerText = nomesCategorias[jogo.categoria] || jogo.categoria;

            // Ícone do jogo
            const icone = document.createElement("div");
            icone.className = "card-icon";
            icone.innerHTML = jogo.icone;

            // Título do jogo
            const titulo = document.createElement("div");
            titulo.className = "card-title";
            titulo.innerText = jogo.titulo;

            // Descrição
            const descricao = document.createElement("p");
            descricao.style.cssText = "font-size:0.95rem;color:#636E72;margin:8px 0;text-align:center;line-height:1.4;";
            descricao.innerText = jogo.descricao;

            // Monta o card
            cardLink.appendChild(tagCategoria);
            cardLink.appendChild(icone);
            cardLink.appendChild(titulo);
            cardLink.appendChild(descricao);
            
            container.appendChild(cardLink);
        });
    } else {
        console.error("Dados dos jogos não encontrados. Verifique js/data.js");
    }
});
