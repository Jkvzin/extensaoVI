// js/videos.js

// Flag para evitar dar XP múltiplas vezes no mesmo vídeo
var videosAssistidos = {};

document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('videosContainer');

    if (container && typeof VIDEOS_DATA !== 'undefined') {
        container.innerHTML = '';

        VIDEOS_DATA.forEach(function(video, index) {
            var card = document.createElement('div');
            card.className = 'video-card';

            var videoWrapper = document.createElement('div');
            videoWrapper.className = 'video-container';

            // Player ID único
            var playerId = 'ytPlayer_' + index;

            var playerDiv = document.createElement('div');
            playerDiv.id = playerId;
            videoWrapper.appendChild(playerDiv);

            var infoWrapper = document.createElement('div');
            infoWrapper.className = 'video-info';

            var topicoTag = document.createElement('div');
            topicoTag.className = 'video-topic';
            topicoTag.innerText = video.topico;

            var tituloText = document.createElement('h3');
            tituloText.style.fontSize = '1.4rem';
            tituloText.style.color = 'var(--primary-color)';
            tituloText.innerText = video.titulo;

            // Indicador de XP ganho
            var xpIndicator = document.createElement('span');
            xpIndicator.style.cssText = 'font-size: 0.85rem; color: var(--secondary-color); margin-left: 8px;';
            xpIndicator.id = 'xpIndicator_' + index;

            infoWrapper.appendChild(topicoTag);
            infoWrapper.appendChild(tituloText);
            infoWrapper.appendChild(xpIndicator);

            card.appendChild(videoWrapper);
            card.appendChild(infoWrapper);
            container.appendChild(card);

            // Extrai o ID do vídeo do YouTube da URL embed
            var videoId = extrairYouTubeID(video.youtubeUrl);

            // Aguarda a API do YouTube carregar
            criarPlayer(playerId, videoId, index, video);
        });
    } else {
        console.error('Dados dos vídeos não encontrados. Verifique js/data.js');
    }
});

/**
 * Extrai o ID do vídeo de uma URL embed do YouTube.
 */
function extrairYouTubeID(url) {
    // Padrão: youtube.com/embed/VIDEO_ID
    var match = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // Padrão: youtu.be/VIDEO_ID
    match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // Padrão: v=VIDEO_ID
    match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    return null;
}

/**
 * Cria o player do YouTube e configura o callback de estado.
 */
function criarPlayer(playerId, videoId, index, videoData) {
    // A API do YouTube é carregada assincronamente
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        // Carrega a API se ainda não carregada
        if (!document.getElementById('ytApiScript')) {
            var tag = document.createElement('script');
            tag.id = 'ytApiScript';
            tag.src = 'https://www.youtube.com/iframe_api';
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Aguarda a API carregar e tenta de novo
        var checkInterval = setInterval(function() {
            if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
                clearInterval(checkInterval);
                criarPlayerAgora(playerId, videoId, index, videoData);
            }
        }, 200);

        // Timeout de segurança
        setTimeout(function() { clearInterval(checkInterval); }, 10000);
    } else {
        criarPlayerAgora(playerId, videoId, index, videoData);
    }
}

function criarPlayerAgora(playerId, videoId, index, videoData) {
    try {
        new YT.Player(playerId, {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                rel: 0,
                modestbranding: 1
            },
            events: {
                onStateChange: function(event) {
                    // YT.PlayerState.ENDED = 0
                    if (event.data === 0) {
                        onVideoEnded(index, videoData);
                    }
                }
            }
        });
    } catch (e) {
        console.warn('YouTube Player error:', e.message);
    }
}

/**
 * Chamado quando um vídeo termina.
 */
function onVideoEnded(index, videoData) {
    var key = 'video_' + index;

    // Evita dar XP múltiplas vezes no mesmo vídeo na mesma sessão
    if (videosAssistidos[key]) return;
    videosAssistidos[key] = true;

    // Atualiza indicador visual
    var indicator = document.getElementById('xpIndicator_' + index);
    if (indicator) {
        indicator.textContent = '✅ +' + XPSystem.rewards.videoWatched + ' XP';
        indicator.style.color = 'var(--success-color)';
    }

    // Adiciona XP
    if (typeof XPSystem !== 'undefined') {
        XPSystem.addXP(XPSystem.rewards.videoWatched, 'video');
        XPSystem.refresh();
    }
}
