// js/videos.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("videosContainer");

    if (container && typeof VIDEOS_DATA !== 'undefined') {
        container.innerHTML = ""; // Limpa antes de renderizar
        
        VIDEOS_DATA.forEach(video => {
            // Cria o elemento pai do card de vídeo
            const card = document.createElement("div");
            card.className = "video-card";
            
            // Container do iFrame (YouTube Embed) para manter a proporção (16:9)
            const videoWrapper = document.createElement("div");
            videoWrapper.className = "video-container";
            
            const iframe = document.createElement("iframe");
            iframe.src = video.youtubeUrl;
            iframe.title = video.titulo;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            
            videoWrapper.appendChild(iframe);
            
            // Container das informações de texto
            const infoWrapper = document.createElement("div");
            infoWrapper.className = "video-info";
            
            const topicoTag = document.createElement("div");
            topicoTag.className = "video-topic";
            topicoTag.innerText = video.topico;
            
            const tituloText = document.createElement("h3");
            tituloText.style.fontSize = "1.4rem";
            tituloText.style.color = "var(--primary-color)";
            tituloText.innerText = video.titulo;
            
            infoWrapper.appendChild(topicoTag);
            infoWrapper.appendChild(tituloText);
            
            // Monta o card
            card.appendChild(videoWrapper);
            card.appendChild(infoWrapper);
            
            container.appendChild(card);
        });
    } else {
        console.error("Dados dos vídeos não encontrados. Verifique js/data.js");
    }
});
