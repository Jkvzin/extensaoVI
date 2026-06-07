1|/**
2| * js/distratores.js
3| * Motor de Geração de Distratores — gera respostas falsas plausíveis
4| * que confundem didaticamente, baseadas em erros comuns de raciocínio.
5| * 
6| * Uso:
7| *   var engine = new DistratorEngine();
8| *   var opcoes = engine.gerarOpcoes({
9| *       resposta: 15,
10| *       operandos: { a: 8, b: 7 },
11| *       operacao: 'adicao',
12| *       nivel: 'facil'
13| *   });
14| *   // opcoes = { opcoes: ['14', '22', '15', '16'], corretoIndex: 2 }
15| */
16|
17|var DistratorEngine = (function() {
18|    'use strict';
19|
20|    // --- CONFIGURAÇÃO POR NÍVEL ---
21|    var NIVEL_SPREAD = {
22|        facil:   5,
23|        medio:   10,
24|        dificil: 15
25|    };
26|
27|    // ==================== ESTRATÉGIAS POR OPERAÇÃO ====================
28|    // Cada estratégia retorna um array de candidatos a distratores.
29|    // O engine depois filtra, deduplica e seleciona os 3 melhores.
30|
31|    var ESTRATEGIAS = {};
32|
33|    // --- ADIÇÃO (a + b = r) ---
34|    ESTRATEGIAS.adicao = function(a, b, r, spread) {
35|        var cand = [];
36|
37|        // Off-by-one
38|        cand.push(r + 1);
39|        cand.push(r - 1);
40|
41|        // Off-by-two
42|        cand.push(r + 2);
43|        cand.push(r - 2);
44|
45|        // Confundir + com × (erro comum)
46|        var multErr = a * b;
47|        if (multErr !== r) cand.push(multErr);
48|
49|        // Confundir + com - (erro comum)
50|        var subErr = Math.abs(a - b);
51|        if (subErr !== r) cand.push(subErr);
52|
53|        // Inverter dígitos (se < 100)
54|        if (r >= 10 && r < 100) {
55|            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
56|            if (invertido !== r) cand.push(invertido);
57|        }
58|
59|        // Valores ao redor dentro do spread
60|        for (var i = 3; i <= spread; i++) {
61|            cand.push(r + i);
62|            cand.push(r - i);
63|        }
64|
65|        return cand;
66|    };
67|
68|    // --- SUBTRAÇÃO (a - b = r) ---
69|    ESTRATEGIAS.subtracao = function(a, b, r, spread) {
70|        var cand = [];
71|
72|        // Off-by-one
73|        cand.push(r + 1);
74|        cand.push(r - 1);
75|
76|        // Off-by-two
77|        cand.push(r + 2);
78|        cand.push(r - 2);
79|
80|        // Operandos invertidos (b - a) — erro muito comum
81|        var inv = b - a;
82|        if (inv !== r && inv > 0) cand.push(inv);
83|
84|        // Confundir - com + 
85|        var addErr = a + b;
86|        if (addErr !== r) cand.push(addErr);
87|
88|        // Confundir - com ×
89|        var multErr = a * b;
90|        if (multErr !== r) cand.push(multErr);
91|
92|        // Usar só um operando (esquecer de subtrair)
93|        if (a !== r) cand.push(a);
94|        if (b !== r) cand.push(b);
95|
96|        // Inverter dígitos
97|        if (r >= 10 && r < 100) {
98|            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
99|            if (invertido !== r) cand.push(invertido);
100|        }
101|
102|        // Spread
103|        for (var i = 3; i <= spread; i++) {
104|            cand.push(r + i);
105|            cand.push(r - i);
106|        }
107|
108|        return cand;
109|    };
110|
111|    // --- MULTIPLICAÇÃO (a × b = r) ---
112|    ESTRATEGIAS.multiplicacao = function(a, b, r, spread) {
113|        var cand = [];
114|
115|        // Off-by-one
116|        cand.push(r + 1);
117|        cand.push(r - 1);
118|
119|        // Off-by-one-factor: (a±1)×b e a×(b±1)
120|        cand.push((a + 1) * b);
121|        cand.push((a - 1) * b);
122|        cand.push(a * (b + 1));
123|        cand.push(a * (b - 1));
124|
125|        // Confundir × com +
126|        var addErr = a + b;
127|        if (addErr !== r) cand.push(addErr);
128|
129|        // Confundir × com potência (a^b) — se pequeno
130|        if (b <= 5) {
131|            var pow = Math.pow(a, b);
132|            if (pow !== r && pow < 1000) cand.push(pow);
133|        }
134|
135|        // Multiplicar errado: (a+1)×(b+1)
136|        cand.push((a + 1) * (b + 1));
137|
138|        // Inverter dígitos
139|        if (r >= 10 && r < 100) {
140|            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
141|            if (invertido !== r) cand.push(invertido);
142|        }
143|
144|        // Spread
145|        for (var i = 3; i <= spread; i++) {
146|            cand.push(r + i);
147|            cand.push(r - i);
148|        }
149|
150|        return cand;
151|    };
152|
153|    // --- DIVISÃO (a ÷ b = r) ---
154|    ESTRATEGIAS.divisao = function(a, b, r, spread) {
155|        var cand = [];
156|
157|        // Off-by-one
158|        cand.push(r + 1);
159|        cand.push(r - 1);
160|
161|        // Off-by-two
162|        cand.push(r + 2);
163|        cand.push(r - 2);
164|
165|        // Divisão invertida (b ÷ a) — erro comum
166|        var inv = b / a;
167|        if (inv !== r && inv === Math.floor(inv) && inv > 0) cand.push(inv);
168|
169|        // Confundir ÷ com ×
170|        var multErr = a * b;
171|        if (multErr !== r) cand.push(multErr);
172|
173|        // Confundir ÷ com -
174|        var subErr = a - b;
175|        if (subErr !== r && subErr > 0) cand.push(subErr);
176|
177|        // Confundir ÷ com +
178|        var addErr = a + b;
179|        if (addErr !== r) cand.push(addErr);
180|
181|        // Dividir por número errado: a ÷ (b±1)
182|        var div1 = Math.floor(a / (b + 1));
183|        if (div1 !== r && div1 > 0) cand.push(div1);
184|        if (b > 1) {
185|            var div2 = Math.floor(a / (b - 1));
186|            if (div2 !== r && div2 > 0) cand.push(div2);
187|        }
188|
189|        // Inverter dígitos
190|        if (r >= 10 && r < 100) {
191|            var invertido = parseInt(String(r).split('').reverse().join(''), 10);
192|            if (invertido !== r) cand.push(invertido);
193|        }
194|
195|        // Spread
196|        for (var i = 3; i <= spread; i++) {
197|            cand.push(r + i);
198|            cand.push(r - i);
199|        }
200|
201|        return cand;
202|    };
203|
204|    // ==================== FUNÇÕES AUXILIARES ====================
205|
206|    function shuffleArray(arr) {
207|        for (var i = arr.length - 1; i > 0; i--) {
208|            var j = Math.floor(Math.random() * (i + 1));
209|            var temp = arr[i];
210|            arr[i] = arr[j];
211|            arr[j] = temp;
212|        }
213|        return arr;
214|    }
215|
216|    function isPositiveInteger(n) {
217|        return typeof n === 'number' && isFinite(n) && n > 0 && Math.floor(n) === n;
218|    }
219|
220|    // ==================== CONSTRUTOR ====================
221|    function DistratorEngine() {}
222|
223|    // ==================== MÉTODO PRINCIPAL ====================
224|
225|    /**
226|     * Gera opções (1 correta + 3 distratores) para uma questão.
227|     * 
228|     * @param {object} params
229|     *   - resposta: número (resposta correta)
230|     *   - operandos: { a, b }
231|     *   - operacao: 'adicao' | 'subtracao' | 'multiplicacao' | 'divisao'
232|     *   - nivel: 'facil' | 'medio' | 'dificil' (default: 'facil')
233|     * @returns {object} { opcoes: [string, ...], corretoIndex: number }
234|     */
235|    DistratorEngine.prototype.gerarOpcoes = function(params) {
236|        var resposta = params.resposta;
237|        var a = params.operandos.a;
238|        var b = params.operandos.b;
239|        var operacao = params.operacao;
240|        var nivel = params.nivel || 'facil';
241|
242|        var spread = NIVEL_SPREAD[nivel] || 5;
243|
244|        // Obtém candidatos usando a estratégia da operação
245|        var estrategia = ESTRATEGIAS[operacao];
246|        var candidatos = [];
247|
248|        if (estrategia) {
249|            candidatos = estrategia(a, b, resposta, spread);
250|        } else {
251|            // Fallback genérico
252|            for (var i = 1; i <= spread; i++) {
253|                candidatos.push(resposta + i);
254|                candidatos.push(resposta - i);
255|            }
256|        }
257|
258|        // Filtra: apenas inteiros positivos, diferentes da resposta
259|        var filtrados = [];
260|        var vistos = {};
261|        vistos[resposta] = true;
262|
263|        for (var j = 0; j < candidatos.length; j++) {
264|            var c = candidatos[j];
265|            if (isPositiveInteger(c) && c !== resposta && !vistos[c]) {
266|                filtrados.push(c);
267|                vistos[c] = true;
268|            }
269|            if (filtrados.length >= 3) break;
270|        }
271|
272|        // Se não conseguiu 3, preenche com fallback
273|        var offset = 1;
274|        while (filtrados.length < 3) {
275|            var c1 = resposta + offset;
276|            var c2 = resposta - offset;
277|            if (isPositiveInteger(c1) && c1 !== resposta && !vistos[c1]) {
278|                filtrados.push(c1);
279|                vistos[c1] = true;
280|            }
281|            if (filtrados.length >= 3) break;
282|            if (isPositiveInteger(c2) && c2 !== resposta && !vistos[c2]) {
283|                filtrados.push(c2);
284|                vistos[c2] = true;
285|            }
286|            offset++;
287|        }
288|
289|        // Monta array final: resposta correta + 3 distratores
290|        var opcoes = [resposta].concat(filtrados.slice(0, 3));
291|
292|        // Embaralha
293|        opcoes = shuffleArray(opcoes);
294|
295|        // Encontra índice da resposta correta
296|        var corretoIndex = opcoes.indexOf(resposta);
297|
298|        return {
299|            opcoes: opcoes.map(String),
300|            corretoIndex: corretoIndex
301|        };
302|    };
303|
304|    return DistratorEngine;
305|})();
306|