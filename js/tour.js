/**
 * js/tour.js — Biblioteca de Tour Guiado (Balões de Dica)
 *
 * Exibe um tour interativo com overlay, balões de texto e destaque
 * de elementos, guiando o aluno no primeiro acesso ao portal.
 *
 * Características:
 * - Leve, sem dependências externas (JavaScript puro)
 * - Funciona em navegadores antigos (IE11+)
 * - Suporte a navegação por teclado (Tab, Esc, Enter)
 * - Persiste estado entre páginas via sessionStorage
 * - Flag de primeiro acesso em localStorage
 * - Reaparece ao clicar em "Ajuda / Tour" no menu
 */

var TourGuide = (function () {
    'use strict';

    // ==================== CONSTANTES ====================

    var STORAGE_KEY_TOUR_DONE = 'matematica_caic_tour_done';
    var STORAGE_KEY_TOUR_ACTIVE = 'matematica_caic_tour_active';
    var STORAGE_KEY_TOUR_STEP = 'matematica_caic_tour_step';

    // ==================== ESTADO ====================

    var _steps = [];
    var _currentStep = 0;
    var _isActive = false;
    var _overlay = null;
    var _tooltip = null;
    var _highlight = null;      // "recorte" que destaca o elemento-alvo
    var _spotlight = null;      // overlay semitransparente
    var _pageId = '';
    var _onComplete = null;     // callback ao finalizar o tour

    // ==================== CONSTRUÇÃO DO DOM ====================

    function _criarDOM() {
        // Overlay principal (cobre toda a tela)
        _spotlight = document.createElement('div');
        _spotlight.className = 'tour-spotlight';
        _spotlight.setAttribute('aria-hidden', 'true');

        // Highlight (buraco no overlay para destacar o elemento)
        _highlight = document.createElement('div');
        _highlight.className = 'tour-highlight';
        _highlight.setAttribute('aria-hidden', 'true');
        _spotlight.appendChild(_highlight);

        // Balão de dica (tooltip)
        _tooltip = document.createElement('div');
        _tooltip.className = 'tour-tooltip';
        _tooltip.setAttribute('role', 'dialog');
        _tooltip.setAttribute('aria-modal', 'true');
        _tooltip.setAttribute('aria-label', 'Tour guiado');

        // Conteúdo do balão
        _tooltip.innerHTML = '' +
            '<div class="tour-tooltip-arrow"></div>' +
            '<div class="tour-tooltip-header">' +
                '<h3 class="tour-tooltip-title"></h3>' +
                '<span class="tour-step-counter"></span>' +
            '</div>' +
            '<p class="tour-tooltip-text"></p>' +
            '<div class="tour-tooltip-actions">' +
                '<button class="tour-btn tour-btn-skip" aria-label="Pular tour">Pular Tour</button>' +
                '<button class="tour-btn tour-btn-next" aria-label="Próximo passo">Próximo ➔</button>' +
            '</div>';

        document.body.appendChild(_spotlight);
        document.body.appendChild(_tooltip);

        _bindEventos();
    }

    function _bindEventos() {
        // Botão "Próximo"
        var nextBtn = _tooltip.querySelector('.tour-btn-next');
        nextBtn.addEventListener('click', function () {
            _avancar();
        });

        // Botão "Pular Tour"
        var skipBtn = _tooltip.querySelector('.tour-btn-skip');
        skipBtn.addEventListener('click', function () {
            _pular();
        });

        // Fechar ao clicar no overlay (fora do destaque)
        _spotlight.addEventListener('click', function (e) {
            // Só fecha se clicar fora do highlight
            if (e.target === _spotlight) {
                // Não faz nada — apenas o botão "Pular" fecha
            }
        });

        // Navegação por teclado
        document.addEventListener('keydown', function (e) {
            if (!_isActive) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                _pular();
            } else if (e.key === 'Enter' && document.activeElement === _tooltip.querySelector('.tour-btn-next')) {
                e.preventDefault();
                _avancar();
            } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Seta direita = próximo (se não estiver num input)
                if (document.activeElement === document.body || document.activeElement === _tooltip.querySelector('.tour-btn-next')) {
                    e.preventDefault();
                    _avancar();
                }
            }
        });

        // Redimensionar: reposicionar highlight e tooltip
        window.addEventListener('resize', function () {
            if (_isActive) {
                _posicionarHighlightETooltip();
            }
        });

        // Scroll: reposicionar
        window.addEventListener('scroll', function () {
            if (_isActive) {
                _posicionarHighlightETooltip();
            }
        }, { passive: true });
    }

    // ==================== POSICIONAMENTO ====================

    function _posicionarHighlightETooltip() {
        var step = _steps[_currentStep];
        if (!step) return;

        var targetEl = _obterTarget(step);
        if (!targetEl) {
            // Elemento alvo não encontrado — esconder highlight
            _highlight.style.display = 'none';
            _centralizarTooltip();
            return;
        }

        _highlight.style.display = 'block';

        var rect = targetEl.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Padding ao redor do elemento destacado
        var padding = 12;

        // Posiciona o "buraco" (highlight) sobre o elemento
        _highlight.style.top = (rect.top + scrollTop - padding) + 'px';
        _highlight.style.left = (rect.left + scrollLeft - padding) + 'px';
        _highlight.style.width = (rect.width + padding * 2) + 'px';
        _highlight.style.height = (rect.height + padding * 2) + 'px';

        // Posiciona o balão
        var position = step.position || 'bottom';
        _posicionarTooltip(rect, position, scrollTop, scrollLeft);

        // Scroll suave até o elemento se necessário
        var tooltipRect = _tooltip.getBoundingClientRect();
        if (tooltipRect.bottom > window.innerHeight - 20) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (tooltipRect.top < 10) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function _posicionarTooltip(targetRect, position, scrollTop, scrollLeft) {
        var tooltipW = _tooltip.offsetWidth;
        var tooltipH = _tooltip.offsetHeight;
        var arrow = _tooltip.querySelector('.tour-tooltip-arrow');
        var gap = 20; // distância entre o elemento e o balão

        var left, top;
        var arrowSide = 'bottom'; // padrão: seta em cima (aponta pra baixo)
        var arrowAlign = 'center';

        // Centro do elemento alvo
        var targetCX = targetRect.left + targetRect.width / 2;
        var targetCY = targetRect.top + targetRect.height / 2;

        switch (position) {
            case 'top':
                left = targetCX - tooltipW / 2;
                top = targetRect.top + scrollTop - tooltipH - gap;
                arrowSide = 'bottom';
                break;
            case 'bottom':
                left = targetCX - tooltipW / 2;
                top = targetRect.bottom + scrollTop + gap;
                arrowSide = 'top';
                break;
            case 'left':
                left = targetRect.left + scrollLeft - tooltipW - gap;
                top = targetCY + scrollTop - tooltipH / 2;
                arrowSide = 'right';
                break;
            case 'right':
                left = targetRect.right + scrollLeft + gap;
                top = targetCY + scrollTop - tooltipH / 2;
                arrowSide = 'left';
                break;
            default:
                // 'bottom' como fallback
                left = targetCX - tooltipW / 2;
                top = targetRect.bottom + scrollTop + gap;
                arrowSide = 'top';
        }

        // Ajusta para não sair da tela
        var margin = 16;
        if (left < margin) {
            left = margin;
            arrowAlign = 'start';
        }
        if (left + tooltipW > window.innerWidth - margin) {
            left = window.innerWidth - tooltipW - margin;
            arrowAlign = 'end';
        }
        if (top < margin) {
            top = margin;
        }
        if (top + tooltipH > window.innerHeight - margin) {
            top = window.innerHeight - tooltipH - margin;
        }

        _tooltip.style.left = left + 'px';
        _tooltip.style.top = top + 'px';

        // Posiciona a seta
        arrow.className = 'tour-tooltip-arrow tour-arrow-' + arrowSide;
        if (arrowAlign === 'start') {
            arrow.style.left = '24px';
            arrow.style.right = 'auto';
        } else if (arrowAlign === 'end') {
            arrow.style.left = 'auto';
            arrow.style.right = '24px';
        } else {
            arrow.style.left = '50%';
            arrow.style.right = 'auto';
        }
    }

    function _centralizarTooltip() {
        // Centraliza o tooltip na tela quando não há elemento alvo
        _tooltip.style.left = '50%';
        _tooltip.style.top = '50%';
        _tooltip.style.transform = 'translate(-50%, -50%)';
        var arrow = _tooltip.querySelector('.tour-tooltip-arrow');
        arrow.className = 'tour-tooltip-arrow';
        arrow.style.display = 'none';
    }

    function _obterTarget(step) {
        if (!step.target) return null;
        try {
            return document.querySelector(step.target);
        } catch (e) {
            return null;
        }
    }

    // ==================== NAVEGAÇÃO ====================

    function _avancar() {
        var nextIndex = _currentStep + 1;

        if (nextIndex >= _steps.length) {
            // Último passo
            var currentStep = _steps[_currentStep];
            if (currentStep && currentStep.crossPage) {
                // Tour continua na próxima página — apenas esconde o tooltip
                // sem finalizar. O estado fica salvo em sessionStorage.
                _esconder();
                return;
            }
            // Tour finaliza nesta página
            _finalizar();
            return;
        }

        // Verifica condição do próximo passo
        var nextStep = _steps[nextIndex];
        if (nextStep.when && !nextStep.when()) {
            // Condição não satisfeita — manter neste passo
            // (ex: step-aluno ainda não está visível)
            _balançarTooltip();
            return;
        }

        _currentStep = nextIndex;
        _mostrarPasso(_currentStep);

        // Salva estado para cross-page
        _salvarEstado();
    }

    function _pular() {
        // Marca tour como concluído (não aparece mais automaticamente)
        try {
            localStorage.setItem(STORAGE_KEY_TOUR_DONE, 'true');
        } catch (e) { /* localStorage indisponível */ }
        _limparEstadoSessao();
        _esconder();
    }

    function _finalizar() {
        // Tour concluído com sucesso
        try {
            localStorage.setItem(STORAGE_KEY_TOUR_DONE, 'true');
        } catch (e) { /* localStorage indisponível */ }
        _limparEstadoSessao();
        _esconder();

        if (typeof _onComplete === 'function') {
            _onComplete();
        }
    }

    function _balançarTooltip() {
        // Pequena animação para indicar que precisa fazer algo antes
        _tooltip.style.animation = 'none';
        _tooltip.offsetHeight; // force reflow
        _tooltip.style.animation = 'tourShake 0.4s ease';
        setTimeout(function () {
            _tooltip.style.animation = '';
        }, 400);
    }

    // ==================== EXIBIÇÃO ====================

    function _mostrarPasso(index) {
        if (!_isActive) return;

        var step = _steps[index];
        if (!step) return;

        // Atualiza conteúdo do balão
        _tooltip.querySelector('.tour-tooltip-title').textContent = step.title || '';
        _tooltip.querySelector('.tour-tooltip-text').textContent = step.text || '';

        // Contador de passos
        var counter = _tooltip.querySelector('.tour-step-counter');
        counter.textContent = (index + 1) + ' de ' + _steps.length;

        // Botão "Próximo", "Entendi!" ou "Concluir"
        var nextBtn = _tooltip.querySelector('.tour-btn-next');
        if (index >= _steps.length - 1) {
            if (step.crossPage) {
                nextBtn.textContent = 'Entendi! 👍';
            } else {
                nextBtn.textContent = 'Concluir ✓';
            }
        } else {
            nextBtn.textContent = 'Próximo ➔';
        }

        // Reseta transform
        _tooltip.style.transform = '';

        // Mostra/esconde seta
        var arrow = _tooltip.querySelector('.tour-tooltip-arrow');
        arrow.style.display = '';

        // Posiciona
        _posicionarHighlightETooltip();

        // Foca no botão próximo para acessibilidade
        setTimeout(function () {
            nextBtn.focus();
        }, 300);
    }

    function _mostrar() {
        if (!_spotlight) _criarDOM();

        _isActive = true;
        _currentStep = 0;

        _spotlight.style.display = 'block';
        _tooltip.style.display = 'block';
        document.body.style.overflow = 'hidden';

        _mostrarPasso(0);
        _salvarEstado();
    }

    function _esconder() {
        _isActive = false;
        if (_spotlight) _spotlight.style.display = 'none';
        if (_tooltip) _tooltip.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ==================== PERSISTÊNCIA CROSS-PAGE ====================

    function _salvarEstado() {
        try {
            sessionStorage.setItem(STORAGE_KEY_TOUR_ACTIVE, 'true');
            sessionStorage.setItem(STORAGE_KEY_TOUR_STEP, String(_currentStep));
        } catch (e) { /* sessionStorage indisponível */ }
    }

    function _limparEstadoSessao() {
        try {
            sessionStorage.removeItem(STORAGE_KEY_TOUR_ACTIVE);
            sessionStorage.removeItem(STORAGE_KEY_TOUR_STEP);
        } catch (e) { /* sessionStorage indisponível */ }
    }

    function _restaurarEstado() {
        try {
            var active = sessionStorage.getItem(STORAGE_KEY_TOUR_ACTIVE);
            if (active === 'true') {
                var step = parseInt(sessionStorage.getItem(STORAGE_KEY_TOUR_STEP), 10);
                if (!isNaN(step)) {
                    _currentStep = step;
                }
                return true;
            }
        } catch (e) { /* sessionStorage indisponível */ }
        return false;
    }

    // ==================== VERIFICAÇÃO DE PRIMEIRO ACESSO ====================

    function _isPrimeiroAcesso() {
        try {
            return localStorage.getItem(STORAGE_KEY_TOUR_DONE) !== 'true';
        } catch (e) {
            return true; // se localStorage falhar, assume primeiro acesso
        }
    }

    // ==================== API PÚBLICA ====================

    /**
     * Inicializa o tour com os passos configurados.
     * @param {Object} config
     * @param {Array}  config.steps - Array de passos do tour
     * @param {string} config.steps[].target - Seletor CSS do elemento a destacar
     * @param {string} config.steps[].title - Título do balão
     * @param {string} config.steps[].text - Texto explicativo
     * @param {string} config.steps[].position - 'top' | 'bottom' | 'left' | 'right'
     * @param {Function} [config.steps[].when] - Condição para o passo estar disponível
     * @param {Function} [config.onComplete] - Callback ao concluir o tour
     */
    function init(config) {
        _steps = config.steps || [];
        _onComplete = config.onComplete || null;

        if (_restaurarEstado()) {
            // Tour estava ativo na página anterior — continuar
            // Pequeno delay para garantir que o DOM da nova página carregou
            setTimeout(function () {
                // Ajusta o índice se necessário (pode ter menos passos na nova página)
                if (_currentStep >= _steps.length) {
                    _currentStep = 0;
                }
                _mostrar();
            }, 500);
        } else if (_isPrimeiroAcesso() && _steps.length > 0) {
            // Primeiro acesso — iniciar tour automaticamente
            // Pequeno delay para a página terminar de renderizar
            setTimeout(function () {
                _mostrar();
            }, 800);
        }
    }

    /**
     * Inicia o tour manualmente (ex: ao clicar em "Ajuda / Tour").
     */
    function iniciar() {
        _currentStep = 0;
        _salvarEstado();
        _mostrar();
    }

    /**
     * Verifica se o tour está ativo no momento.
     * @returns {boolean}
     */
    function isAtivo() {
        return _isActive;
    }

    /**
     * Reinicia o tour (remove flag de concluído e inicia).
     */
    function reiniciar() {
        try {
            localStorage.removeItem(STORAGE_KEY_TOUR_DONE);
        } catch (e) { /* localStorage indisponível */ }
        _currentStep = 0;
        _limparEstadoSessao();
        iniciar();
    }

    return {
        init: init,
        iniciar: iniciar,
        reiniciar: reiniciar,
        isAtivo: isAtivo
    };

})();
