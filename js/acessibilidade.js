/**
 * js/acessibilidade.js — Controles de Acessibilidade
 *
 * - Modo Alto Contraste (toggle com persistência em localStorage)
 * - Botão de som (mudo/ativado) sincronizado com AudioFeedback
 * - Injetados no header de todas as páginas
 */

var Acessibilidade = (function () {
    'use strict';

    var STORAGE_KEY_CONTRAST = 'matematica_caic_alto_contraste';

    var _altoContraste = false;

    // ==================== INICIALIZAÇÃO ====================

    function init() {
        // Carrega preferência de alto contraste
        try {
            _altoContraste = localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true';
        } catch (e) {
            _altoContraste = false;
        }

        if (_altoContraste) {
            document.body.classList.add('alto-contraste');
        }

        _criarControles();
    }

    // ==================== UI DOS CONTROLES ====================

    function _criarControles() {
        var header = document.querySelector('body > header');
        if (!header) {
            // Tenta novamente quando o DOM estiver pronto
            setTimeout(function () {
                var h = document.querySelector('body > header');
                if (h) _inserirControles(h);
            }, 500);
            return;
        }
        _inserirControles(header);
    }

    function _inserirControles(header) {
        // Container de controles de acessibilidade
        var container = document.createElement('div');
        container.className = 'a11y-controls';
        container.setAttribute('aria-label', 'Controles de acessibilidade');

        // Botão Alto Contraste
        var btnContraste = document.createElement('button');
        btnContraste.id = 'btnAltoContraste';
        btnContraste.className = 'a11y-btn';
        btnContraste.setAttribute('aria-label', 'Ativar alto contraste');
        btnContraste.setAttribute('title', 'Alto Contraste');
        btnContraste.innerHTML = '<span class="a11y-icon">◐</span>';
        btnContraste.addEventListener('click', toggleContraste);
        _atualizarLabelContraste(btnContraste);
        container.appendChild(btnContraste);

        // Botão Som (mudo/ativado)
        if (typeof AudioFeedback !== 'undefined') {
            var btnSom = document.createElement('button');
            btnSom.id = 'btnSom';
            btnSom.className = 'a11y-btn';
            btnSom.setAttribute('aria-label', 'Ativar/desativar som');
            btnSom.setAttribute('title', 'Som');
            btnSom.addEventListener('click', function () {
                AudioFeedback.toggleMute();
                _atualizarLabelSom(btnSom);
            });
            _atualizarLabelSom(btnSom);
            container.appendChild(btnSom);
        }

        // Insere após a logo ou no início do header
        var logo = header.querySelector('.logo-container');
        if (logo) {
            logo.insertAdjacentElement('afterend', container);
        } else {
            header.insertBefore(container, header.firstChild);
        }
    }

    function _atualizarLabelContraste(btn) {
        if (_altoContraste) {
            btn.innerHTML = '<span class="a11y-icon">◉</span>';
            btn.classList.add('a11y-active');
            btn.setAttribute('aria-label', 'Desativar alto contraste');
        } else {
            btn.innerHTML = '<span class="a11y-icon">◐</span>';
            btn.classList.remove('a11y-active');
            btn.setAttribute('aria-label', 'Ativar alto contraste');
        }
    }

    function _atualizarLabelSom(btn) {
        if (AudioFeedback && AudioFeedback.isMuted()) {
            btn.innerHTML = '<span class="a11y-icon">🔇</span>';
            btn.classList.add('a11y-active');
            btn.setAttribute('aria-label', 'Ativar som');
        } else {
            btn.innerHTML = '<span class="a11y-icon">🔊</span>';
            btn.classList.remove('a11y-active');
            btn.setAttribute('aria-label', 'Desativar som');
        }
    }

    // ==================== ALTO CONTRASTE ====================

    function toggleContraste() {
        _altoContraste = !_altoContraste;
        document.body.classList.toggle('alto-contraste', _altoContraste);

        try {
            localStorage.setItem(STORAGE_KEY_CONTRAST, _altoContraste ? 'true' : 'false');
        } catch (e) {
            // localStorage indisponível
        }

        var btn = document.getElementById('btnAltoContraste');
        if (btn) _atualizarLabelContraste(btn);
    }

    function isAltoContraste() {
        return _altoContraste;
    }

    // ==================== API PÚBLICA ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        toggleContraste: toggleContraste,
        isAltoContraste: isAltoContraste
    };

})();
