/**
 * js/xp.js
 * Sistema de Experiencia (XP) e Progressao de Nivel
 * Armazena XP por aluno em localStorage (multi-usuario).
 * Barra de XP mostra o progresso do usuario logado atualmente.
 */
var XPSystem = (function() {
    'use strict';

    var STORAGE_KEY = 'matematica_caic_xp';

    // --- DEFINICAO DE NIVEIS ---
    var LEVELS = [
        { level: 1, xpRequired: 0,    title: 'Visitante' },
        { level: 2, xpRequired: 100,  title: 'Aprendiz' },
        { level: 3, xpRequired: 250,  title: 'Estudante' },
        { level: 4, xpRequired: 500,  title: 'Sabido' },
        { level: 5, xpRequired: 1000, title: 'Mestre' },
        { level: 6, xpRequired: 2000, title: 'Genio da Matematica' }
    ];

    // --- RECOMPENSAS DE XP ---
    var REWARDS = {
        quizComplete: 25,
        quizPerfect: 25,
        videoWatched: 15,
        multiplayerWin: 30,
        multiplayerParticipate: 10
    };

    // --- ESTADO ---
    // Formato: { users: { 'aluno-id': { xp, level, nome, avatar_url, turma_id } } }
    var _data = null;
    var _activeId = null;
    var _levelUpCallback = null;

    // ==================== INICIALIZACAO ====================

    function init() {
        _data = loadAll();
        _activeId = _getActiveStudentId();
        renderXPBar();
    }

    function loadAll() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                // Migracao: se for o formato antigo { xp, level }, converte
                if (typeof parsed.xp === 'number') {
                    return { users: {} };
                }
                if (parsed && parsed.users && typeof parsed.users === 'object') {
                    return parsed;
                }
            }
        } catch (e) { /* localStorage corrompido */ }
        return { users: {} };
    }

    function saveAll() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
        } catch (e) { /* localStorage cheio */ }
    }

    function _getActiveStudentId() {
        try {
            var raw = localStorage.getItem('currentStudent');
            if (raw) {
                var student = JSON.parse(raw);
                if (student && student.id && student.id !== 'visitante') {
                    return student.id;
                }
            }
        } catch (e) {}
        return null;
    }

    function _getActiveUser() {
        if (!_data) { init(); }
        if (!_activeId) return null;
        if (!_data.users[_activeId]) {
            // Busca info do aluno no DB
            var nome = _activeId;
            var avatar_url = '👤';
            var turma_id = null;
            if (typeof DB !== 'undefined') {
                var aluno = DB.getAluno(_activeId);
                if (aluno) {
                    nome = aluno.nome;
                    avatar_url = aluno.avatar_url;
                    turma_id = aluno.turma_id;
                }
            }
            _data.users[_activeId] = { xp: 0, level: 1, nome: nome, avatar_url: avatar_url, turma_id: turma_id };
            saveAll();
        }
        return _data.users[_activeId];
    }

    // ==================== XP E NIVEL ====================

    function getCurrentLevel() {
        var user = _getActiveUser();
        return user ? user.level : 1;
    }

    function getCurrentXP() {
        var user = _getActiveUser();
        return user ? user.xp : 0;
    }

    function getLevelInfo(level) {
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (LEVELS[i].level === level) return LEVELS[i];
        }
        return LEVELS[LEVELS.length - 1];
    }

    function addXP(amount, source) {
        if (!_data) { init(); }
        if (amount <= 0) return;

        _activeId = _getActiveStudentId();
        if (!_activeId || _activeId === 'visitante') return;

        var user = _getActiveUser();
        if (!user) return;

        var oldLevel = user.level;
        user.xp += amount;

        var newLevel = oldLevel;
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (user.xp >= LEVELS[i].xpRequired) {
                newLevel = LEVELS[i].level;
                break;
            }
        }

        user.level = newLevel;
        saveAll();
        renderXPBar();

        if (newLevel > oldLevel) {
            showLevelUp(newLevel);
        }

        if (_levelUpCallback) {
            _levelUpCallback({ xp: user.xp, level: newLevel, source: source, amount: amount });
        }
    }

    function onXPChanged(callback) {
        _levelUpCallback = callback;
    }

    function xpForNextLevel() {
        var user = _getActiveUser();
        if (!user) return null;
        var next = getLevelInfo(user.level + 1);
        if (!next) return null;
        return next.xpRequired;
    }

    function xpProgress() {
        var user = _getActiveUser();
        if (!user) return 0;
        var currentInfo = getLevelInfo(user.level);
        var nextXP = xpForNextLevel();
        if (!nextXP) return 100;
        var xpInLevel = user.xp - currentInfo.xpRequired;
        var xpNeeded = nextXP - currentInfo.xpRequired;
        return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
    }

    // ==================== MULTI-USUARIO (DASHBOARD) ====================

    function getAllData() {
        if (!_data) { init(); }
        return _data.users;
    }

    function getRanking() {
        if (!_data) { init(); }
        var users = [];
        for (var id in _data.users) {
            if (_data.users.hasOwnProperty(id)) {
                users.push({
                    id: id,
                    xp: _data.users[id].xp || 0,
                    level: _data.users[id].level || 1,
                    nome: _data.users[id].nome || id,
                    avatar_url: _data.users[id].avatar_url || '👤',
                    turma_id: _data.users[id].turma_id || null
                });
            }
        }
        users.sort(function(a, b) { return b.xp - a.xp; });
        return users;
    }

    function getRankingPorTurma(turmaId) {
        return getRanking().filter(function(u) { return u.turma_id === turmaId; });
    }

    // ==================== RENDERIZACAO DA BARRA ====================

    function renderXPBar() {
        var containers = document.querySelectorAll('#xpBarContainer');
        if (containers.length === 0) return;

        var user = _getActiveUser();
        if (!user) {
            for (var i = 0; i < containers.length; i++) {
                containers[i].innerHTML = '';
            }
            return;
        }

        var level = user.level;
        var levelInfo = getLevelInfo(level);
        var progress = xpProgress();
        var nextXP = xpForNextLevel();
        var levelTitle = levelInfo.title;
        var xpText = 'Nv. ' + level + ' · ';

        if (nextXP) {
            var currentInfo = getLevelInfo(level);
            var xpInLevel = user.xp - currentInfo.xpRequired;
            var xpNeeded = nextXP - currentInfo.xpRequired;
            xpText += xpInLevel + '/' + xpNeeded + ' XP';
        } else {
            xpText += user.xp + ' XP (Maximo!)';
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

        for (var j = 0; j < containers.length; j++) {
            containers[j].innerHTML = html;
        }
    }

    // ==================== ANIMACAO DE LEVEL UP ====================

    function showLevelUp(newLevel) {
        var levelInfo = getLevelInfo(newLevel);

        var overlay = document.createElement('div');
        overlay.className = 'levelup-overlay';

        overlay.innerHTML = '' +
            '<div class="levelup-card">' +
                '<div class="levelup-icon">🎉</div>' +
                '<div class="levelup-title">Subiu de Nivel!</div>' +
                '<div class="levelup-level">Nivel ' + newLevel + '</div>' +
                '<div class="levelup-rank">' + levelInfo.title + '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        if (typeof AudioFeedback !== 'undefined') {
            AudioFeedback.playLevelUp();
        }

        overlay.offsetHeight;
        overlay.classList.add('show');

        setTimeout(function() {
            overlay.classList.remove('show');
            setTimeout(function() {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }, 2800);
    }

    // ==================== API PUBLICA ====================

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
        refresh: renderXPBar,
        getAllData: getAllData,
        getRanking: getRanking,
        getRankingPorTurma: getRankingPorTurma
    };

})();
