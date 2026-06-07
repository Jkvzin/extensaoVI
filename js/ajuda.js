/**
 * js/ajuda.js — Sistema de Ajuda e Documentação do Painel do Professor
 * 
 * Carrega docs/guia-uso.md, converte Markdown para HTML e exibe em um modal.
 * Inclui opção de download/impressão como PDF.
 */

// ==========================================
// PARSER MARKDOWN → HTML (leve, sem dependências)
// ==========================================
function parseMarkdown(md) {
    let html = md;

    const codeBlocks = [];
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
        codeBlocks.push('<pre><code>' + escapeHtml(code.trim()) + '</code></pre>');
        return '%%CODEBLOCK_' + (codeBlocks.length - 1) + '%%';
    });

    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    html = html.replace(/^---$/gm, '<hr>');

    html = html.replace(/^(\s*)- (.+)$/gm, '<li>$2</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    html = html.replace(/^(\s+)\d+\. (.+)$/gm, '<li class="sub">$2</li>');
    html = html.replace(/((?:<li class="sub">.*<\/li>\n?)+)/g, '<ol>$1</ol>');

    html = html.replace(/^(?!<[houlp]|<\/?[houlp]|<hr|<li|%%CODEBLOCK)(.+)$/gm, '<p>$1</p>');

    html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[parseInt(i)]);

    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ==========================================
// MODAL DE AJUDA
// ==========================================
const AjudaModal = {
    _modal: null,
    _overlay: null,
    _contentEl: null,
    _loadingEl: null,
    _loadedHtml: null,

    _criarDOM() {
        this._overlay = document.createElement('div');
        this._overlay.className = 'ajuda-overlay';
        this._overlay.setAttribute('role', 'dialog');
        this._overlay.setAttribute('aria-modal', 'true');
        this._overlay.setAttribute('aria-label', 'Guia de Uso do Portal');

        this._modal = document.createElement('div');
        this._modal.className = 'ajuda-modal';

        const header = document.createElement('div');
        header.className = 'ajuda-header';
        header.innerHTML = '<h2>📖 Como Funciona</h2>' +
            '<div class="ajuda-header-botoes">' +
            '<button class="ajuda-btn ajuda-btn-print" title="Imprimir / Salvar como PDF" aria-label="Imprimir documentação">🖨️ PDF</button>' +
            '<button class="ajuda-btn ajuda-btn-close" title="Fechar" aria-label="Fechar guia">✕</button>' +
            '</div>';

        this._loadingEl = document.createElement('div');
        this._loadingEl.className = 'ajuda-loading';
        this._loadingEl.innerHTML = '<span class="ajuda-spinner"></span><p>Carregando documentação...</p>';

        this._contentEl = document.createElement('div');
        this._contentEl.className = 'ajuda-conteudo';

        const footer = document.createElement('div');
        footer.className = 'ajuda-footer';
        footer.innerHTML = '<p>Equipe CAIC — Portal Interativo de Matemática</p>' +
            '<button class="ajuda-btn ajuda-btn-fechar-footer">Fechar</button>';

        this._modal.appendChild(header);
        this._modal.appendChild(this._loadingEl);
        this._modal.appendChild(this._contentEl);
        this._modal.appendChild(footer);
        this._overlay.appendChild(this._modal);
        document.body.appendChild(this._overlay);

        this._bindEventos(header);
    },

    _bindEventos(header) {
        const closeBtns = this._overlay.querySelectorAll('.ajuda-btn-close, .ajuda-btn-fechar-footer');
        closeBtns.forEach(btn => btn.addEventListener('click', () => this.fechar()));

        const printBtn = header.querySelector('.ajuda-btn-print');
        printBtn.addEventListener('click', () => this._imprimirPDF());

        this._overlay.addEventListener('click', (e) => {
            if (e.target === this._overlay) this.fechar();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._overlay.style.display === 'flex') {
                this.fechar();
            }
        });
    },

    abrir() {
        if (!this._modal) this._criarDOM();

        this._overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (this._loadedHtml) {
            this._mostrarConteudo();
        } else {
            this._carregarDocumentacao();
        }
    },

    fechar() {
        if (this._overlay) {
            this._overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    async _carregarDocumentacao() {
        this._loadingEl.style.display = 'flex';
        this._contentEl.style.display = 'none';

        try {
            const response = await fetch('docs/guia-uso.md');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const md = await response.text();
            this._loadedHtml = parseMarkdown(md);
            this._mostrarConteudo();
        } catch (err) {
            this._loadedHtml = '<div class="ajuda-erro">' +
                '<h3>😕 Não foi possível carregar a documentação</h3>' +
                '<p>Erro: ' + escapeHtml(err.message) + '</p>' +
                '<p>Verifique se o arquivo <code>docs/guia-uso.md</code> existe.</p>' +
                '</div>';
            this._mostrarConteudo();
        }
    },

    _mostrarConteudo() {
        this._loadingEl.style.display = 'none';
        this._contentEl.innerHTML = this._loadedHtml;
        this._contentEl.style.display = 'block';
    },

    _imprimirPDF() {
        if (!this._loadedHtml) return;

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            alert('Permita pop-ups para gerar o PDF.');
            return;
        }

        printWindow.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Guia de Uso — Portal de Matemática CAIC</title>');
        printWindow.document.write('<style>@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap");');
        printWindow.document.write('body{font-family:"Nunito",sans-serif;font-size:14pt;line-height:1.7;color:#2D3436;max-width:800px;margin:40px auto;padding:20px}');
        printWindow.document.write('h1{color:#FF6B6B;font-size:24pt;border-bottom:3px solid #4ECDC4;padding-bottom:10px}');
        printWindow.document.write('h2{color:#4ECDC4;font-size:18pt;margin-top:30px}h3{color:#2D3436;font-size:14pt}');
        printWindow.document.write('hr{border:1px solid #E2E8F0;margin:20px 0}ul,ol{padding-left:24px}li{margin-bottom:6px}');
        printWindow.document.write('pre{background:#F0F0F0;padding:12px;border-radius:8px;font-size:11pt}');
        printWindow.document.write('code{background:#F0F0F0;padding:2px 6px;border-radius:4px}strong{color:#FF6B6B}');
        printWindow.document.write('@media print{body{margin:0;padding:0}}</style></head><body>');
        printWindow.document.write(this._loadedHtml);
        printWindow.document.write('<p style="margin-top:40px;color:#999;font-size:10pt;text-align:center">Portal de Matemática CAIC — Equipe de Desenvolvimento</p>');
        printWindow.document.write('<script>window.onload=function(){window.print()}</script></body></html>');
        printWindow.document.close();
    }
};

// ==========================================
// INICIALIZAÇÃO: Botão de Ajuda no Header
// ==========================================
function initAjuda() {
    var header = document.querySelector('body > header');
    if (!header) {
        console.warn('ajuda.js: header não encontrado.');
        return;
    }

    if (document.getElementById('btnAjuda')) return;

    // Container para os botões de ajuda
    var btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '8px';
    btnContainer.style.alignItems = 'center';

    // Botão "Como Funciona"
    var btn = document.createElement('button');
    btn.id = 'btnAjuda';
    btn.className = 'ajuda-trigger';
    btn.setAttribute('aria-label', 'Abrir guia de uso');
    btn.setAttribute('title', 'Como Funciona');
    btn.innerHTML = '<span class="ajuda-icon">?</span><span class="ajuda-label">Como Funciona</span>';
    btn.addEventListener('click', function () { AjudaModal.abrir(); });
    btnContainer.appendChild(btn);

    // Botão "Tour" (reiniciar tour guiado)
    if (typeof TourGuide !== 'undefined' && TourGuide.reiniciar) {
        var btnTour = document.createElement('button');
        btnTour.id = 'btnTour';
        btnTour.className = 'ajuda-trigger';
        btnTour.style.backgroundColor = '#4ECDC4';
        btnTour.style.color = '#FFFFFF';
        btnTour.setAttribute('aria-label', 'Reiniciar tour guiado');
        btnTour.setAttribute('title', 'Tour Guiado');
        btnTour.innerHTML = '<span class="ajuda-icon" style="background-color:#FFFFFF;color:#4ECDC4;">🗺️</span><span class="ajuda-label">Tour</span>';
        btnTour.addEventListener('click', function () { TourGuide.reiniciar(); });
        btnTour.addEventListener('mouseenter', function () {
            btnTour.style.backgroundColor = '#38B2AC';
        });
        btnTour.addEventListener('mouseleave', function () {
            btnTour.style.backgroundColor = '#4ECDC4';
        });
        btnContainer.appendChild(btnTour);
    }

    var nav = header.querySelector('nav');
    if (nav) {
        header.insertBefore(btnContainer, nav);
    } else {
        header.appendChild(btnContainer);
    }
}

document.addEventListener('DOMContentLoaded', initAjuda);
