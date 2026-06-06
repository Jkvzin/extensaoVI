/**
 * js/questaoDinamica.js
 * Motor de Questões Dinâmicas — gera perguntas matemáticas com valores aleatórios.
 * 
 * Uso:
 *   const motor = new QuestaoDinamica();
 *   const q = motor.gerar('adicao', 'facil');
 *   // q = { pergunta, resposta, operandos: {a, b}, operacao }
 * 
 * Ou para gerar várias de uma vez:
 *   const perguntas = motor.gerarConjunto('multiplicacao', 'medio', 5);
 */

var QuestaoDinamica = (function() {
    'use strict';

    // --- NÍVEIS DE DIFICULDADE ---
    var NIVEL_CONFIG = {
        facil:   { min: 1,  max: 10  },
        medio:   { min: 1,  max: 50  },
        dificil: { min: 1,  max: 100 }
    };

    // --- NOMES PARA PERSONALIZAR OS ENUNCIADOS ---
    var NOMES = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Júlia', 'Miguel', 'Sofia'];

    // --- TEMPLATES POR OPERAÇÃO ---
    // Cada template tem:
    //   texto: string com placeholders {NOME}, {A}, {B}
    //   calc(a, b): função que retorna a resposta correta
    //   geraValores(min, max): função que gera {a, b} garantindo resultado válido

    var TEMPLATES = {};

    // ==================== ADIÇÃO ====================
    TEMPLATES.adicao = [
        {
            texto: '{NOME} tem {A} maçãs e ganhou mais {B}. Com quantas maçãs {NOME} ficou?',
            calc: function(a, b) { return a + b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, max), b: sorteia(min, max) };
            }
        },
        {
            texto: 'Em uma árvore havia {A} passarinhos. Chegaram mais {B}. Quantos passarinhos estão na árvore agora?',
            calc: function(a, b) { return a + b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, max), b: sorteia(min, max) };
            }
        },
        {
            texto: '{NOME} tinha {A} figurinhas e ganhou mais {B} do seu primo. Quantas figurinhas {NOME} tem agora?',
            calc: function(a, b) { return a + b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, max), b: sorteia(min, max) };
            }
        },
        {
            texto: 'Em uma caixa havia {A} bombons. {NOME} colocou mais {B}. Quantos bombons há na caixa?',
            calc: function(a, b) { return a + b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, max), b: sorteia(min, max) };
            }
        }
    ];

    // ==================== SUBTRAÇÃO ====================
    TEMPLATES.subtracao = [
        {
            texto: '{NOME} tinha {A} balas e comeu {B}. Quantas balas sobraram?',
            calc: function(a, b) { return a - b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.floor(max / 2));
                var a = sorteia(b, max);
                return { a: a, b: b };
            }
        },
        {
            texto: 'Em um aquário havia {A} peixinhos. O gato pescou {B}. Quantos sobraram?',
            calc: function(a, b) { return a - b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.floor(max / 2));
                var a = sorteia(b, max);
                return { a: a, b: b };
            }
        },
        {
            texto: '{NOME} tem {A} reais e gastou {B} na cantina. Com quanto dinheiro {NOME} ficou?',
            calc: function(a, b) { return a - b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.floor(max / 2));
                var a = sorteia(b, max);
                return { a: a, b: b };
            }
        },
        {
            texto: 'Numa caixa havia {A} lápis. {NOME} usou {B} para desenhar. Quantos lápis sobraram?',
            calc: function(a, b) { return a - b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.floor(max / 2));
                var a = sorteia(b, max);
                return { a: a, b: b };
            }
        }
    ];

    // ==================== MULTIPLICAÇÃO ====================
    TEMPLATES.multiplicacao = [
        {
            texto: '{NOME} tem {A} caixas com {B} maçãs em cada uma. Quantas maçãs {NOME} tem no total?',
            calc: function(a, b) { return a * b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, Math.min(max, 12)), b: sorteia(min, Math.min(max, 12)) };
            }
        },
        {
            texto: 'Em uma sala há {A} mesas. Cada mesa tem {B} livros. Quantos livros há no total?',
            calc: function(a, b) { return a * b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, Math.min(max, 12)), b: sorteia(min, Math.min(max, 12)) };
            }
        },
        {
            texto: '{NOME} comprou {A} pacotes de figurinhas. Cada pacote vem com {B} figurinhas. Quantas figurinhas ele tem?',
            calc: function(a, b) { return a * b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, Math.min(max, 12)), b: sorteia(min, Math.min(max, 12)) };
            }
        },
        {
            texto: 'Em uma banda há {A} fileiras com {B} cadeiras cada. Quantas cadeiras há na banda?',
            calc: function(a, b) { return a * b; },
            geraValores: function(min, max) {
                return { a: sorteia(min, Math.min(max, 12)), b: sorteia(min, Math.min(max, 12)) };
            }
        }
    ];

    // ==================== DIVISÃO ====================
    TEMPLATES.divisao = [
        {
            texto: '{NOME} tem {A} balas para dividir igualmente entre {B} amigos. Quantas balas cada amigo recebe?',
            calc: function(a, b) { return a / b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.min(max, 10));
                var a = b * sorteia(1, Math.floor(max / b));
                return { a: a, b: b };
            }
        },
        {
            texto: 'A professora tem {A} lápis para distribuir igualmente entre {B} alunos. Quantos lápis cada aluno recebe?',
            calc: function(a, b) { return a / b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.min(max, 10));
                var a = b * sorteia(1, Math.floor(max / b));
                return { a: a, b: b };
            }
        },
        {
            texto: 'Há {A} biscoitos e {B} crianças. Quantos biscoitos cada criança recebe se forem divididos igualmente?',
            calc: function(a, b) { return a / b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.min(max, 10));
                var a = b * sorteia(1, Math.floor(max / b));
                return { a: a, b: b };
            }
        },
        {
            texto: '{NOME} tem {A} carrinhos e quer guardar em {B} caixas com a mesma quantidade. Quantos carrinhos em cada caixa?',
            calc: function(a, b) { return a / b; },
            geraValores: function(min, max) {
                var b = sorteia(min, Math.min(max, 10));
                var a = b * sorteia(1, Math.floor(max / b));
                return { a: a, b: b };
            }
        }
    ];

    // ==================== FUNÇÕES AUXILIARES ====================

    function sorteia(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function pegaNomeAleatorio() {
        return NOMES[Math.floor(Math.random() * NOMES.length)];
    }

    function shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    // ==================== CONSTRUTOR ====================
    function QuestaoDinamica() {
        // Histórico para evitar repetições na mesma sessão
        this._historico = {};
    }

    // ==================== MÉTODOS ====================

    /**
     * Gera uma única questão dinâmica.
     * 
     * @param {string} categoria - 'adicao' | 'subtracao' | 'multiplicacao' | 'divisao'
     * @param {string} nivel - 'facil' | 'medio' | 'dificil'
     * @returns {object} { pergunta, resposta, operandos: {a, b}, operacao, template }
     * @returns {null} se categoria inválida
     */
    QuestaoDinamica.prototype.gerar = function(categoria, nivel) {
        nivel = nivel || 'facil';
        var config = NIVEL_CONFIG[nivel];
        if (!config) { config = NIVEL_CONFIG.facil; }

        var templates = TEMPLATES[categoria];
        if (!templates || templates.length === 0) { return null; }

        // Escolhe template aleatório
        var template = templates[Math.floor(Math.random() * templates.length)];

        // Gera valores
        var valores = template.geraValores(config.min, config.max);
        var a = valores.a;
        var b = valores.b;

        // Calcula resposta
        var resposta = template.calc(a, b);

        // Preenche o texto
        var nome = pegaNomeAleatorio();
        var pergunta = template.texto
            .replace(/\{NOME\}/g, nome)
            .replace(/\{A\}/g, a)
            .replace(/\{B\}/g, b);

        // Evita repetições na mesma sessão
        var chave = categoria + '|' + pergunta;
        if (!this._historico[categoria]) {
            this._historico[categoria] = {};
        }
        if (this._historico[categoria][chave]) {
            // Tenta de novo (recursão limitada)
            var tentativas = this._historico[categoria]._tentativas || 0;
            if (tentativas < 20) {
                this._historico[categoria]._tentativas = tentativas + 1;
                return this.gerar(categoria, nivel);
            }
        }
        this._historico[categoria][chave] = true;
        this._historico[categoria]._tentativas = 0;

        return {
            pergunta: pergunta,
            resposta: resposta,
            operandos: { a: a, b: b },
            operacao: categoria,
            template: template
        };
    };

    /**
     * Gera um conjunto de N questões dinâmicas.
     * 
     * @param {string} categoria
     * @param {string} nivel
     * @param {number} quantidade - número de questões (default: 5)
     * @returns {Array} array de objetos de questão
     */
    QuestaoDinamica.prototype.gerarConjunto = function(categoria, nivel, quantidade) {
        quantidade = quantidade || 5;
        // Reseta histórico para esta categoria antes de gerar o conjunto
        this._historico[categoria] = {};
        this._historico[categoria]._tentativas = 0;

        var questoes = [];
        for (var i = 0; i < quantidade; i++) {
            var q = this.gerar(categoria, nivel);
            if (q) {
                questoes.push(q);
            }
        }
        return questoes;
    };

    /**
     * Converte uma questão gerada dinamicamente para o formato QUIZ_DATA.
     * Deixa as opções vazias — a Issue #3 preencherá com distratores.
     */
    QuestaoDinamica.prototype.paraFormatoQuiz = function(questao) {
        return {
            pergunta: questao.pergunta,
            resposta: questao.resposta,
            operandos: questao.operandos,
            operacao: questao.operacao,
            // Placeholder — Issue #3 gera os distratores
            opcoes: [],
            respostaCorretaIndex: null
        };
    };

    /**
     * Retorna os níveis disponíveis com seus ranges.
     */
    QuestaoDinamica.prototype.getNiveis = function() {
        return [
            { id: 'facil',   nome: 'Fácil 🌱',   range: '1 a 10'   },
            { id: 'medio',   nome: 'Médio 🌿',   range: '1 a 50'   },
            { id: 'dificil', nome: 'Difícil 🌳', range: '1 a 100'  }
        ];
    };

    return QuestaoDinamica;
})();
