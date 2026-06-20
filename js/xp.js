/**
 * js/xp.js
 * Sistema de Experiência (XP) e Progressão de Nível — por aluno.
 * Salva o progresso no localStorage sob chave 'matematica_caic_xp'.
 * 
 * Estrutura: { "aluno-id": { xp: 0, level: 1 }, ... }
 */

var XPSystem = (function() {
    'use strict';

    var STORAGE_KEY = 'matematica_caic_xp';
    var CURRENT_STUDENT_KEY = 'currentStudent';

    // --- DEFINIÇÃO DE NÍVEIS ---
    var LEVELS = [
        { level: 1, xpRequired: 0,    title: 'Iniciante' },
        { level: 2, xpRequired: 100,  title: 'Aprendiz' },
        { level: 3, xpRequired: 250,  title: 'Estudante' },
        { level: 4, xpRequired: 500,  title: 'Sabido' },
        { level: 5, xpRequired: 1000, title: 'Mestre' },
        { level: 6, xpRequired: 2000, title: 'Gênio da Matemática' }
    ];

    // --- RECOMPENSAS DE XP ---
    var REWARDS = {
        quizComplete: 25,
        quizPerfect: 25,  // bônus adicional
        videoWatched: 15,
        multiplayerWin: 30,
        multiplayerPlay: 10
    };

    // --- ESTADO ---
    var _state = null;
    var _levelUpCallback = null;

    // ==================== OBTÉM ID DO ALUNO ATUAL ====================

    function _getCurrentStudentId() {
        try {
            var raw = localStorage.getItem(CURRENT_STUDENT_KEY);
            if (raw) {
                var student = JSON.parse(raw);
                return student.id || null;
            }
        } catch (e) {}
        return null;
    }

    // ==================== INICIALIZAÇÃO ====================

    function init() {
        _state = loadState();
        renderXPBar();
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {}
        return {};
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
        } catch (e) {
            console.error('XP: Erro ao salvar:', e.message);
        }
    }

    function _getStudentState() {
        if (!_state) { init(); }
        var sid = _getCurrentStudentId();
        if (!sid) return { xp: 0, level: 1 };

        if (!_state[sid]) {
            _state[sid] = { xp: 0, level: 1 };
            saveState();
        }
        return _state[sid];
    }

    // ==================== XP E NÍVEL ====================

    function getCurrentLevel() {
        return _getStudentState().level;
    }

    function getCurrentXP() {
        return _getStudentState().xp;
    }

    function getLevelInfo(level) {
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (LEVELS[i].level === level) return LEVELS[i];
        }
        return LEVELS[LEVELS.length - 1];
    }

    /**
     * Adiciona XP ao aluno atual e verifica se subiu de nível.
     */
    function addXP(amount, source) {
        if (!amount || amount <= 0) return;

        var sid = _getCurrentStudentId();
        if (!sid) return; // sem aluno logado, não acumula XP

        if (!_state) { init(); }
        if (!_state[sid]) {
            _state[sid] = { xp: 0, level: 1 };
        }

        var ss = _state[sid];
        var oldLevel = ss.level;
        ss.xp += amount;

        // Verifica novo nível
        var newLevel = oldLevel;
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (ss.xp >= LEVELS[i].xpRequired) {
                newLevel = LEVELS[i].level;
                break;
            }
        }
        ss.level = newLevel;
        saveState();
        renderXPBar();

        if (newLevel > oldLevel) {
            showLevelUp(newLevel);
        }

        if (_levelUpCallback) {
            _levelUpCallback({ xp: ss.xp, level: newLevel, source: source, amount: amount });
        }
    }

    function onXPChanged(callback) {
        _levelUpCallback = callback;
    }

    function _getStudentSS() {
        if (!_state) { init(); }
        var sid = _getCurrentStudentId();
        if (!sid || !_state[sid]) return { xp: 0, level: 1 };
        return _state[sid];
    }

    function xpForNextLevel() {
        var ss = _getStudentSS();
        var next = getLevelInfo(ss.level + 1);
        // Se o próximo nível não existe ou é o mesmo, estamos no máximo
        if (!next || next.level <= ss.level) return null;
        return next.xpRequired;
    }

    function xpProgress() {
        var ss = _getStudentSS();
        var currentInfo = getLevelInfo(ss.level);
        var nextXP = xpForNextLevel();
        if (!nextXP) return 100;
        var xpInLevel = ss.xp - currentInfo.xpRequired;
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
        var ss = _getStudentSS();
        var xpText = 'Nv. ' + level + ' · ';

        if (nextXP) {
            var currentInfo = getLevelInfo(level);
            var xpInLevel = ss.xp - currentInfo.xpRequired;
            var xpNeeded = nextXP - currentInfo.xpRequired;
            xpText += xpInLevel + '/' + xpNeeded + ' XP';
        } else {
            xpText += ss.xp + ' XP (Máximo!)';
        }

        var html = '' +
            '<div class="xp-bar-wrapper">' +
                '<div class="xp-bar-info">' +
                    '<span class="xp-bar-level">⭐ ' + xpText + '</span>' +
                    '<span class="xp-bar-title">' + levelInfo.title + '</span>' +
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

    // ==================== RANKING (todos os alunos) ====================

    /**
     * Retorna ranking global de todos os alunos com XP.
     * [{ alunoId, nome, avatar_url, turma_id, xp, level }, ...]
     */
    function getRanking() {
        if (!_state) { init(); }
        var ranking = [];

        for (var sid in _state) {
            if (!_state.hasOwnProperty(sid)) continue;
            var ss = _state[sid];

            // Busca dados do aluno no DB (se disponível)
            var aluno = null;
            if (typeof DB !== 'undefined') {
                aluno = DB.getAluno(sid);
            }

            ranking.push({
                alunoId: sid,
                nome: aluno ? aluno.nome : ('Aluno ' + sid.substring(0, 6)),
                avatar_url: aluno ? aluno.avatar_url : '👤',
                turma_id: aluno ? aluno.turma_id : null,
                xp: ss.xp,
                level: ss.level
            });
        }

        // Ordena por XP decrescente
        ranking.sort(function(a, b) { return b.xp - a.xp; });
        return ranking;
    }

    /**
     * Retorna ranking filtrado por turma.
     */
    function getRankingPorTurma(turmaId) {
        return getRanking().filter(function(r) { return r.turma_id === turmaId; });
    }

    // ==================== API PÚBLICA ====================

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
        getRanking: getRanking,
        getRankingPorTurma: getRankingPorTurma,
        // acesso a todos os dados para dashboard
        getAllData: function() { return _state; },
        _getStudentId: _getCurrentStudentId
    };
})();
