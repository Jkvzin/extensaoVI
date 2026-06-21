// js/videos.js

// Flag para evitar dar XP múltiplas vezes no mesmo vídeo
var videosAssistidos = {};

// Flag para rastrear se o vídeo realmente começou a tocar
var videoTocando = {};

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

            // Div do player
            var playerDiv = document.createElement('div');
            playerDiv.id = playerId;
            playerDiv.style.position = 'absolute';
            playerDiv.style.top = '0';
            playerDiv.style.left = '0';
            playerDiv.style.width = '100%';
            playerDiv.style.height = '100%';
            videoWrapper.appendChild(playerDiv);

            // Spinner de carregamento
            var loadingDiv = document.createElement('div');
            loadingDiv.className = 'video-loading';
            loadingDiv.id = 'ytLoading_' + index;
            var spinner = document.createElement('div');
            spinner.className = 'video-spinner';
            var loadingText = document.createElement('span');
            loadingText.textContent = 'Carregando vídeo...';
            loadingDiv.appendChild(spinner);
            loadingDiv.appendChild(loadingText);
            videoWrapper.appendChild(loadingDiv);

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
 * Cria o player do YouTube e configura os callbacks de estado.
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
                onReady: function(event) {
                    // Esconde o spinner quando o player está pronto
                    onVideoReady(index);
                },
                onStateChange: function(event) {
                    // YT.PlayerState.PLAYING = 1
                    if (event.data === 1) {
                        videoTocando['video_' + index] = true;
                    }
                    // YT.PlayerState.ENDED = 0
                    if (event.data === 0) {
                        onVideoEnded(index, videoData);
                    }
                },
                onError: function(event) {
                    // Erro no player — exibe fallback amigável
                    onVideoError(index);
                }
            }
        });
    } catch (e) {
        console.warn('YouTube Player error:', e.message);
        onVideoError(index);
    }
}

/**
 * Chamado quando o player está pronto — esconde o spinner.
 */
function onVideoReady(index) {
    var loading = document.getElementById('ytLoading_' + index);
    if (loading) {
        loading.style.display = 'none';
    }
}

/**
 * Chamado quando o player encontra um erro.
 * Exibe fallback visual amigável no lugar do player.
 */
function onVideoError(index) {
    // Esconde spinner
    var loading = document.getElementById('ytLoading_' + index);
    if (loading) {
        loading.style.display = 'none';
    }

    // Esconde o player com erro
    var playerDiv = document.getElementById('ytPlayer_' + index);
    if (playerDiv) {
        playerDiv.style.display = 'none';
    }

    // Cria fallback de erro
    var container = playerDiv ? playerDiv.parentNode : null;
    if (!container) return;

    // Remove fallback antigo se existir
    var oldError = document.getElementById('ytError_' + index);
    if (oldError) oldError.remove();

    var errorDiv = document.createElement('div');
    errorDiv.className = 'video-error';
    errorDiv.id = 'ytError_' + index;

    var icon = document.createElement('div');
    icon.className = 'error-icon';
    icon.textContent = '📺';

    var title = document.createElement('div');
    title.className = 'error-title';
    title.textContent = 'Ops! Vídeo indisponível';

    var msg = document.createElement('div');
    msg.className = 'error-msg';
    msg.textContent = 'Este vídeo não está disponível no momento. Pode ter sido removido ou estar bloqueado.';

    var hint = document.createElement('span');
    hint.className = 'error-hint';
    hint.textContent = 'Tente outro vídeo';
    hint.addEventListener('click', function() {
        // Scroll para o próximo vídeo ou para o topo da lista
        var allCards = document.querySelectorAll('.video-card');
        var nextCard = allCards[index + 1];
        if (nextCard) {
            nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (allCards[0]) {
            allCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    errorDiv.appendChild(icon);
    errorDiv.appendChild(title);
    errorDiv.appendChild(msg);
    errorDiv.appendChild(hint);
    container.appendChild(errorDiv);
}

/**
 * Chamado quando um vídeo termina.
 * Só concede XP se o vídeo realmente começou a tocar.
 */
function onVideoEnded(index, videoData) {
    var key = 'video_' + index;

    // Evita dar XP múltiplas vezes no mesmo vídeo
    if (videosAssistidos[key]) return;

    // Só concede XP se o vídeo realmente tocou (não apenas se carregou e deu erro)
    if (!videoTocando[key]) {
        console.log('Video ' + index + ' terminou mas nunca tocou — XP não concedido');
        return;
    }

    videosAssistidos[key] = true;

    // Atualiza indicador visual
    var indicator = document.getElementById('xpIndicator_' + index);
    if (indicator) {
        indicator.textContent = '+ ' + XPSystem.rewards.videoWatched + ' XP';
        indicator.style.color = 'var(--success-color)';
        indicator.style.fontWeight = '700';
    }

    // Adiciona XP
    if (typeof XPSystem !== 'undefined') {
        XPSystem.addXP(XPSystem.rewards.videoWatched, 'video');
        XPSystem.refresh();
    }
}
