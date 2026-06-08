/**
 * js/distratores.js
 * Motor de Geração de Distratores — gera respostas falsas plausíveis
 * que confundem didaticamente, baseadas em erros comuns de raciocínio.
 * 
 * Uso:
 *   var engine = new DistratorEngine();
 *   var opcoes = engine.gerarOpcoes({
 *       resposta: 15,
 *       operandos: { a: 8, b: 7 },
 *       operacao: 'adicao',
 *       nivel: 'facil'
 *   });
 *   // opcoes = { opcoes: ['14', '22', '15', '16'], corretoIndex: 2 }
 */

var DistratorEngine = (function() {
    'use strict';

    // --- CONFIGURAÇÃO POR NÍVEL ---
    var NIVEL_SPREAD = {
        facil:   5,
        medio:   10,
        dificil: 15
    };

    // ==================== ESTRATÉGIAS POR OPERAÇÃO ====================
    var ESTRATEGIAS = {};

    // --- ADIÇÃO (a + b = r) ---
    ESTRATEGIAS.adicao = function(a, b, r, spread) {
        var cand = [];
        cand.push(r + 1);
        cand.push(r - 1);
        cand.push(r + 2);
        cand.push(r - 2);

        var multErr = a * b;
        if (multErr !== r) cand.push(multErr);

        var subErr = Math.abs(a - b);
        if (subErr !== r) cand.push(subErr);

        if (r >= 10 && r < 100) {
            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
            if (invertido !== r) cand.push(invertido);
        }

        for (var i = 3; i <= spread; i++) {
            cand.push(r + i);
            cand.push(r - i);
        }
        return cand;
    };

    // --- SUBTRAÇÃO (a - b = r) ---
    ESTRATEGIAS.subtracao = function(a, b, r, spread) {
        var cand = [];
        cand.push(r + 1);
        cand.push(r - 1);
        cand.push(r + 2);
        cand.push(r - 2);

        var inv = b - a;
        if (inv !== r && inv > 0) cand.push(inv);

        var addErr = a + b;
        if (addErr !== r) cand.push(addErr);

        var multErr = a * b;
        if (multErr !== r) cand.push(multErr);

        if (a !== r) cand.push(a);
        if (b !== r) cand.push(b);

        if (r >= 10 && r < 100) {
            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
            if (invertido !== r) cand.push(invertido);
        }

        for (var i = 3; i <= spread; i++) {
            cand.push(r + i);
            cand.push(r - i);
        }
        return cand;
    };

    // --- MULTIPLICAÇÃO (a × b = r) ---
    ESTRATEGIAS.multiplicacao = function(a, b, r, spread) {
        var cand = [];
        cand.push(r + 1);
        cand.push(r - 1);
        cand.push((a + 1) * b);
        cand.push((a - 1) * b);
        cand.push(a * (b + 1));
        cand.push(a * (b - 1));

        var addErr = a + b;
        if (addErr !== r) cand.push(addErr);

        if (b <= 5) {
            var pow = Math.pow(a, b);
            if (pow !== r && pow < 1000) cand.push(pow);
        }

        cand.push((a + 1) * (b + 1));

        if (r >= 10 && r < 100) {
            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
            if (invertido !== r) cand.push(invertido);
        }

        for (var i = 3; i <= spread; i++) {
            cand.push(r + i);
            cand.push(r - i);
        }
        return cand;
    };

    // --- DIVISÃO (a ÷ b = r) ---
    ESTRATEGIAS.divisao = function(a, b, r, spread) {
        var cand = [];
        cand.push(r + 1);
        cand.push(r - 1);
        cand.push(r + 2);
        cand.push(r - 2);

        var inv = b / a;
        if (inv !== r && inv === Math.floor(inv) && inv > 0) cand.push(inv);

        var multErr = a * b;
        if (multErr !== r) cand.push(multErr);

        var subErr = a - b;
        if (subErr !== r && subErr > 0) cand.push(subErr);

        var addErr = a + b;
        if (addErr !== r) cand.push(addErr);

        var div1 = Math.floor(a / (b + 1));
        if (div1 !== r && div1 > 0) cand.push(div1);
        if (b > 1) {
            var div2 = Math.floor(a / (b - 1));
            if (div2 !== r && div2 > 0) cand.push(div2);
        }

        if (r >= 10 && r < 100) {
            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
            if (invertido !== r) cand.push(invertido);
        }

        for (var i = 3; i <= spread; i++) {
            cand.push(r + i);
            cand.push(r - i);
        }
        return cand;
    };

    // ==================== FUNÇÕES AUXILIARES ====================
    function shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    function isPositiveInteger(n) {
        return typeof n === 'number' && isFinite(n) && n > 0 && Math.floor(n) === n;
    }

    // ==================== CONSTRUTOR ====================
    function DistratorEngine() {}

    // ==================== MÉTODO PRINCIPAL ====================
    DistratorEngine.prototype.gerarOpcoes = function(params) {
        var resposta = params.resposta;
        var a = params.operandos.a;
        var b = params.operandos.b;
        var operacao = params.operacao;
        var nivel = params.nivel || 'facil';

        var spread = NIVEL_SPREAD[nivel] || 5;

        var estrategia = ESTRATEGIAS[operacao];
        var candidatos = [];

        if (estrategia) {
            candidatos = estrategia(a, b, resposta, spread);
        } else {
            for (var i = 1; i <= spread; i++) {
                candidatos.push(resposta + i);
                candidatos.push(resposta - i);
            }
        }

        var filtrados = [];
        var vistos = {};
        vistos[resposta] = true;

        for (var j = 0; j < candidatos.length; j++) {
            var c = candidatos[j];
            if (isPositiveInteger(c) && c !== resposta && !vistos[c]) {
                filtrados.push(c);
                vistos[c] = true;
            }
            if (filtrados.length >= 3) break;
        }

        var offset = 1;
        while (filtrados.length < 3) {
            var c1 = resposta + offset;
            var c2 = resposta - offset;
            if (isPositiveInteger(c1) && c1 !== resposta && !vistos[c1]) {
                filtrados.push(c1);
                vistos[c1] = true;
            }
            if (filtrados.length >= 3) break;
            if (isPositiveInteger(c2) && c2 !== resposta && !vistos[c2]) {
                filtrados.push(c2);
                vistos[c2] = true;
            }
            offset++;
        }

        var opcoes = [resposta].concat(filtrados.slice(0, 3));
        opcoes = shuffleArray(opcoes);
        var corretoIndex = opcoes.indexOf(resposta);

        return {
            opcoes: opcoes.map(String),
            corretoIndex: corretoIndex
        };
    };

    return DistratorEngine;
})();
