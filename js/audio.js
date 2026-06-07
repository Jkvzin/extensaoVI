/**
 * js/audio.js — Sistema de Feedback Sonoro com Web Audio API
 *
 * Gera efeitos sonoros programaticamente (sem arquivos externos).
 * Sons curtos (< 1s), preload automático via AudioContext.
 * Controle de mudo via localStorage.
 */

var AudioFeedback = (function () {
    'use strict';

    var STORAGE_KEY_MUTED = 'matematica_caic_audio_muted';

    var _ctx = null;
    var _muted = false;
    var _initialized = false;

    // ==================== INICIALIZAÇÃO ====================

    function _initCtx() {
        if (_ctx) return;
        try {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            _ctx = new AudioCtx();
        } catch (e) {
            // Web Audio API não disponível
        }
    }

    function init() {
        if (_initialized) return;
        _initialized = true;

        // Carrega preferência de mudo
        try {
            _muted = localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
        } catch (e) {
            _muted = false;
        }

        // Inicializa AudioContext no primeiro clique do usuário
        // (política de autoplay dos navegadores)
        document.addEventListener('click', function wakeAudio() {
            _initCtx();
            if (_ctx && _ctx.state === 'suspended') {
                _ctx.resume();
            }
        }, { once: true });

        document.addEventListener('touchstart', function wakeAudioTouch() {
            _initCtx();
            if (_ctx && _ctx.state === 'suspended') {
                _ctx.resume();
            }
        }, { once: true });

        // Feedback sonoro global em botões (delegado no document)
        document.addEventListener('click', function (e) {
            var el = e.target;
            // Procura o botão mais próximo (pode ter clicado num span dentro)
            while (el && el !== document.body) {
                if (el.tagName === 'BUTTON' ||
                    (el.tagName === 'A' && el.classList.contains('cta-button')) ||
                    (el.tagName === 'A' && el.getAttribute('role') === 'button') ||
                    el.classList.contains('card-selecao') ||
                    el.classList.contains('category-card') ||
                    el.classList.contains('difficulty-btn')) {
                    playClick();
                    return;
                }
                el = el.parentElement;
            }
        });

        // Feedback sonoro em hover (apenas em botões)
        document.addEventListener('mouseover', function (e) {
            var el = e.target;
            while (el && el !== document.body) {
                if (el.tagName === 'BUTTON' || el.classList.contains('card')) {
                    playHover();
                    return;
                }
                el = el.parentElement;
            }
        });
    }

    // ==================== GERADORES DE SOM ====================

    /**
     * Toca uma nota com envoltória (attack/decay/sustain/release).
     */
    function _playTone(freq, duration, type, volume, detune) {
        if (_muted || !_ctx) return;
        type = type || 'sine';
        volume = (volume !== undefined) ? volume : 0.3;
        detune = detune || 0;

        try {
            var now = _ctx.currentTime;

            var osc = _ctx.createOscillator();
            var gain = _ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (detune) {
                osc.detune.setValueAtTime(detune, now);
            }

            // Envoltória simples
            var attack = 0.01;
            var decay = duration * 0.2;
            var sustain = volume * 0.7;
            var release = duration * 0.3;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volume, now + attack);
            gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
            gain.gain.setValueAtTime(sustain, now + duration - release);
            gain.gain.linearRampToValueAtTime(0, now + duration);

            osc.connect(gain);
            gain.connect(_ctx.destination);

            osc.start(now);
            osc.stop(now + duration + 0.05);
        } catch (e) {
            // Ignora erros de áudio silenciosamente
        }
    }

    /**
     * Som de acerto — "pling" positivo, duas notas ascendentes.
     */
    function playAcerto() {
        if (_muted || !_ctx) return;
        var now = _ctx.currentTime;
        // Primeira nota
        _playTone(523.25, 0.15, 'sine', 0.25);      // C5
        // Segunda nota (delay)
        setTimeout(function () {
            _playTone(659.25, 0.2, 'sine', 0.25);    // E5
        }, 100);
        // Terceira nota (mais aguda)
        setTimeout(function () {
            _playTone(783.99, 0.25, 'sine', 0.2);    // G5
        }, 180);
    }

    /**
     * Som de erro — "boing" suave, descendente.
     */
    function playErro() {
        if (_muted || !_ctx) return;
        var now = _ctx.currentTime;

        try {
            var osc = _ctx.createOscillator();
            var gain = _ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.3);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.35);

            osc.connect(gain);
            gain.connect(_ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {
            // Ignora erros de áudio
        }
    }

    /**
     * Som de clique em botão — "tick" curto.
     */
    function playClick() {
        _playTone(800, 0.06, 'sine', 0.12);
    }

    /**
     * Som de hover — "pop" muito sutil.
     */
    function playHover() {
        _playTone(600, 0.04, 'sine', 0.06);
    }

    /**
     * Som de conclusão de quiz — fanfarra curta com 4 notas.
     */
    function playConclusao() {
        if (_muted || !_ctx) return;
        var notes = [
            { freq: 523.25, delay: 0,    dur: 0.18 },   // C5
            { freq: 659.25, delay: 120,  dur: 0.18 },   // E5
            { freq: 783.99, delay: 240,  dur: 0.18 },   // G5
            { freq: 1046.5, delay: 360,  dur: 0.35 }    // C6
        ];

        notes.forEach(function (note) {
            setTimeout(function () {
                _playTone(note.freq, note.dur, 'sine', 0.22);
            }, note.delay);
        });
    }

    /**
     * Som de subida de nível — arpejo ascendente.
     */
    function playLevelUp() {
        if (_muted || !_ctx) return;
        var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach(function (freq, i) {
            setTimeout(function () {
                _playTone(freq, 0.2, 'triangle', 0.18);
            }, i * 100);
        });
    }

    // ==================== CONTROLE DE MUDO ====================

    function toggleMute() {
        _muted = !_muted;
        try {
            localStorage.setItem(STORAGE_KEY_MUTED, _muted ? 'true' : 'false');
        } catch (e) {
            // localStorage indisponível
        }
        return _muted;
    }

    function isMuted() {
        return _muted;
    }

    function setMuted(val) {
        _muted = !!val;
        try {
            localStorage.setItem(STORAGE_KEY_MUTED, _muted ? 'true' : 'false');
        } catch (e) { /* localStorage indisponível */ }
    }

    // ==================== API PÚBLICA ====================

    // Inicialização automática
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        playAcerto: playAcerto,
        playErro: playErro,
        playClick: playClick,
        playHover: playHover,
        playConclusao: playConclusao,
        playLevelUp: playLevelUp,
        toggleMute: toggleMute,
        isMuted: isMuted,
        setMuted: setMuted
    };

})();
