/**
 * js/tts.js — Text-to-Speech com Web Speech API
 *
 * Lê textos em voz alta usando a SpeechSynthesis nativa do navegador.
 * Botão "Ouvir Pergunta" para os cards do quiz.
 * Fallback silencioso se a API não estiver disponível.
 * Suporte a velocidade ajustável e interrupção.
 */

var TTSReader = (function () {
    'use strict';

    var _supported = false;
    var _utterance = null;
    var _isSpeaking = false;
    var _speed = 1.0; // normal
    var _onEnd = null;

    // ==================== DETECÇÃO ====================

    function _detectSupport() {
        _supported = typeof window !== 'undefined' &&
            window.speechSynthesis &&
            typeof window.SpeechSynthesisUtterance !== 'undefined';
        return _supported;
    }

    // ==================== LEITURA ====================

    /**
     * Lê um texto em voz alta.
     * @param {string} text - Texto a ser lido
     * @param {Object} [options]
     * @param {number} [options.rate] - Velocidade (0.5 = lento, 1.0 = normal)
     * @param {Function} [options.onEnd] - Callback ao finalizar
     * @returns {boolean} - true se iniciou a leitura
     */
    function speak(text, options) {
        options = options || {};

        if (!_supported) {
            _detectSupport();
            if (!_supported) return false;
        }

        // Se já está falando, interrompe
        if (_isSpeaking) {
            stop();
            return false;
        }

        if (!text || text.trim() === '') return false;

        var rate = options.rate !== undefined ? options.rate : _speed;
        _onEnd = options.onEnd || null;

        try {
            _utterance = new SpeechSynthesisUtterance(text);
            _utterance.lang = 'pt-BR';
            _utterance.rate = rate;
            _utterance.pitch = 1.0;
            _utterance.volume = 1.0;

            // Tenta encontrar voz em português
            var voices = window.speechSynthesis.getVoices();
            var ptVoice = voices.find(function (v) {
                return v.lang && v.lang.startsWith('pt');
            });
            if (ptVoice) {
                _utterance.voice = ptVoice;
            }

            _utterance.onstart = function () {
                _isSpeaking = true;
            };

            _utterance.onend = function () {
                _isSpeaking = false;
                _utterance = null;
                if (typeof _onEnd === 'function') _onEnd();
            };

            _utterance.onerror = function () {
                _isSpeaking = false;
                _utterance = null;
                if (typeof _onEnd === 'function') _onEnd();
            };

            window.speechSynthesis.speak(_utterance);
            return true;
        } catch (e) {
            _isSpeaking = false;
            return false;
        }
    }

    /**
     * Interrompe a leitura atual.
     */
    function stop() {
        if (_supported && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        _isSpeaking = false;
        _utterance = null;
    }

    /**
     * Alterna entre ler e parar (toggle).
     * @param {string} text - Texto para ler
     * @param {Object} [options]
     * @returns {boolean} - true se iniciou a leitura
     */
    function toggle(text, options) {
        if (_isSpeaking) {
            stop();
            return false;
        }
        return speak(text, options);
    }

    // ==================== VELOCIDADE ====================

    function setSpeed(rate) {
        _speed = Math.max(0.3, Math.min(2.0, rate));
    }

    function getSpeed() {
        return _speed;
    }

    function isSupported() {
        if (!_supported) _detectSupport();
        return _supported;
    }

    function isSpeaking() {
        return _isSpeaking;
    }

    // ==================== INICIALIZAÇÃO ====================

    // Detecta suporte
    _detectSupport();

    // Alguns navegadores carregam vozes async
    if (_supported && window.speechSynthesis) {
        window.speechSynthesis.getVoices(); // Inicia carregamento
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = function () {
                // Vozes carregadas
            };
        }
    }

    // ==================== API PÚBLICA ====================

    return {
        speak: speak,
        stop: stop,
        toggle: toggle,
        setSpeed: setSpeed,
        getSpeed: getSpeed,
        isSupported: isSupported,
        isSpeaking: isSpeaking
    };

})();
