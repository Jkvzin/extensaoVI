/**
 * js/xp.js
 * Sistema de Experiência (XP) e Progressão de Nível
 * Salva o progresso no localStorage do navegador.
 */

var XPSystem = (function() {
    'use strict';

    var STORAGE_KEY = 'matematica_caic_xp';

    // --- DEFINIÇÃO DE NÍVEIS ---
    var LEVELS = [
        { level: 1, xpRequired: 0,    title: 'Visitante' },
        { level: 2, xpRequired: 100,  title: 'Aprendiz' },
        { level: 3, xpRequired: 250,  title: 'Estudante' },
        { level: 4, xpRequired: 500,  title: 'Sabido' },
        { level: 5, xpRequired: 1000, title: 'Mestre' },
        { level: 6, xpRequired: 2000, title: 'Gênio da Matemática' }
    ];

    // --- RECOMPENSAS DE XP ---
    var REWARDS = {
        quizComplete: 25,
        quizPerfect: 25,  // bonus adicional
        videoWatched: 15,
        multiplayerWin: 30,
        multiplayerParticipate: 10
    };

    // --- ESTADO ---
    var _state = null;
    var _levelUpCallback = null;

    // ==================== INICIALIZAÇÃO ====================

    function init() {
        _state = loadState();
        renderXPBar();
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (typeof parsed.xp === 'number' && typeof parsed.level === 'number') {
                    return parsed;
                }
            }
        } catch (e) {
            // localStorage corrompido ou indisponível
        }
        return { xp: 0, level: 1 };
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
        } catch (e) {
            // localStorage cheio ou indisponível
        }
    }

    // ==================== XP E NÍVEL ====================

    function getCurrentLevel() {
        if (!_state) { init(); }
        return _state.level;
    }

    function getCurrentXP() {
        if (!_state) { init(); }
        return _state.xp;
    }

    function getLevelInfo(level) {
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (LEVELS[i].level === level) return LEVELS[i];
        }
        return LEVELS[LEVELS.length - 1];
    }

    /**
     * Adiciona XP e verifica se subiu de nível.
     * @param {number} amount - quantidade de XP
     * @param {string} source - 'quiz' | 'video' (para futura Issue #5)
     */
    function addXP(amount, source) {
        if (!_state) { init(); }
        if (amount <= 0) return;

        var oldLevel = _state.level;
        _state.xp += amount;

        // Verifica nível
        var newLevel = oldLevel;
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (_state.xp >= LEVELS[i].xpRequired) {
                newLevel = LEVELS[i].level;
                break;
            }
        }

        _state.level = newLevel;
        saveState();
        renderXPBar();

        // Notifica subida de nível
        if (newLevel > oldLevel) {
            showLevelUp(newLevel);
        }

        // Callback para Issue #5 (badges)
        if (_levelUpCallback) {
            _levelUpCallback({ xp: _state.xp, level: newLevel, source: source, amount: amount });
        }
    }

    /**
     * Registra callback chamado sempre que XP é adicionado.
     */
    function onXPChanged(callback) {
        _levelUpCallback = callback;
    }

    function xpForNextLevel() {
        if (!_state) { init(); }
        var next = getLevelInfo(_state.level + 1);
        if (!next) return null; // nível máximo
        return next.xpRequired;
    }

    function xpProgress() {
        if (!_state) { init(); }
        var currentInfo = getLevelInfo(_state.level);
        var nextXP = xpForNextLevel();
        if (!nextXP) return 100; // nível máximo
        var xpInLevel = _state.xp - currentInfo.xpRequired;
        var xpNeeded = nextXP - currentInfo.xpRequired;
        return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
    }

    // ==================== RENDERIZAÇÃO DA BARRA ====================

    function renderXPBar() {
        var containers = document.querySelectorAll('#xpBarContainer');
        if (containers.length === 0) return;

        var level = getCurrentLevel();
        var levelInfo = getLevelInfo(level);
        var progress = xpProgress();
        var nextXP = xpForNextLevel();
        var levelTitle = levelInfo.title;
        var xpText = 'Nv. ' + level + ' · ';

        if (nextXP) {
            var currentInfo = getLevelInfo(level);
            var xpInLevel = _state.xp - currentInfo.xpRequired;
            var xpNeeded = nextXP - currentInfo.xpRequired;
            xpText += xpInLevel + '/' + xpNeeded + ' XP';
        } else {
            xpText += _state.xp + ' XP (Máximo!)';
        }

        var html = '' +
            '<div class="xp-bar-wrapper">' +
                '<div class="xp-bar-info">' +
                    '<span class="xp-bar-level">⭐ ' + xpText + '</span>' +
                    '<span class="xp-bar-title">' + levelTitle + '</span>' +
                '</div>' +
                '<div class="xp-bar-track">' +
                    '<div class="xp-bar-fill" style="width: ' + progress + '%;"></div>' +
                '</div>' +
            '</div>';

        for (var i = 0; i < containers.length; i++) {
            containers[i].innerHTML = html;
        }
    }

    // ==================== ANIMAÇÃO DE LEVEL UP ====================

    function showLevelUp(newLevel) {
        var levelInfo = getLevelInfo(newLevel);

        // Cria overlay
        var overlay = document.createElement('div');
        overlay.className = 'levelup-overlay';

        overlay.innerHTML = '' +
            '<div class="levelup-card">' +
                '<div class="levelup-icon">🎉</div>' +
                '<div class="levelup-title">Subiu de Nível!</div>' +
                '<div class="levelup-level">Nível ' + newLevel + '</div>' +
                '<div class="levelup-rank">' + levelInfo.title + '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Força reflow para a animação
        overlay.offsetHeight;
        overlay.classList.add('show');

        // Remove após 3 segundos
        setTimeout(function() {
            overlay.classList.remove('show');
            setTimeout(function() {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }, 2800);
    }

    // ==================== API PÚBLICA ====================

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        addXP: addXP,
        getLevel: getCurrentLevel,
        getXP: getCurrentXP,
        getProgress: xpProgress,
        getLevelInfo: getLevelInfo,
        onXPChanged: onXPChanged,
        rewards: REWARDS,
        // Força re-render (útil após navegação SPA-like)
        refresh: renderXPBar
    };

})();
