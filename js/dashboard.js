1|1|/* js/dashboard.js */
2|2|
3|3|// MockDB agora é carregado de js/mock-data.js
4|4|
5|5|// State
6|6|let currentUser = null;
7|7|let currentTurmaId = null;
8|8|let chartOperacoes = null;
9|9|let chartEvolucao = null;
10|10|
11|11|// Initialize Supabase (Optional for now)
12|12|const SUPABASE_URL = ''; // To be filled in PR #8
13|13|const SUPABASE_KEY = ''; // To be filled in PR #8 (Use APENAS a chave anon. NUNCA a service_role!)
14|14|let supabase = null;
15|15|if (SUPABASE_URL && SUPABASE_KEY) {
16|16|    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
17|17|}
18|18|
19|19|// DOM Elements
20|20|const authView = document.getElementById('auth-view');
21|21|const dashboardView = document.getElementById('dashboard-view');
22|22|const loginForm = document.getElementById('login-form');
23|23|const logoutBtn = document.getElementById('logout-btn');
24|24|const authError = document.getElementById('auth-error');
25|25|
26|26|const tabBtns = document.querySelectorAll('.tab-btn');
27|27|const tabContents = document.querySelectorAll('.tab-content');
28|28|
29|29|const turmasList = document.getElementById('turmas-list');
30|30|const btnNovaTurma = document.getElementById('btn-nova-turma');
31|31|const modalTurma = document.getElementById('modal-turma');
32|32|const formTurma = document.getElementById('form-turma');
33|33|
34|34|const alunosContainer = document.getElementById('alunos-container');
35|35|const btnNovoAluno = document.getElementById('btn-novo-aluno');
36|36|const btnVoltarTurmas = document.getElementById('btn-voltar-turmas');
37|37|const modalAluno = document.getElementById('modal-aluno');
38|38|const formAluno = document.getElementById('form-aluno');
39|39|const alunosList = document.getElementById('alunos-list');
40|40|const turmaSelecionadaNome = document.getElementById('turma-selecionada-nome');
41|41|
42|42|const filtroTurma = document.getElementById('filtro-turma');
43|43|
44|44|// Event Listeners
45|45|document.addEventListener('DOMContentLoaded', () => {
46|46|    checkAuth();
47|47|    setupTabs();
48|48|    setupModals();
49|49|    setupCharts();
50|50|});
51|51|
52|52|loginForm.addEventListener('submit', async (e) => {
53|53|    e.preventDefault();
54|54|    const email = document.getElementById('email').value;
55|55|    const password = document.getElementById('password').value;
56|56|    
57|57|    // Mock Auth
58|58|    if (email && password) {
59|59|        currentUser = { email, id: 'prof-1' };
60|60|        localStorage.setItem('profUser', JSON.stringify(currentUser));
61|61|        showDashboard();
62|62|    }
63|63|});
64|64|
65|65|logoutBtn.addEventListener('click', () => {
66|66|    currentUser = null;
67|67|    localStorage.removeItem('profUser');
68|68|    showAuth();
69|69|});
70|70|
71|71|btnVoltarTurmas.addEventListener('click', () => {
72|72|    currentTurmaId = null;
73|73|    alunosContainer.style.display = 'none';
74|74|    turmasList.style.display = 'grid';
75|75|});
76|76|
77|77|// Setup Tabs
78|78|function setupTabs() {
79|79|    tabBtns.forEach(btn => {
80|80|        btn.addEventListener('click', () => {
81|81|            tabBtns.forEach(b => b.classList.remove('active'));
82|82|            tabContents.forEach(c => c.classList.remove('active'));
83|83|            
84|84|            btn.classList.add('active');
85|85|            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
86|86|            
87|87|            if (btn.dataset.tab === 'metricas') {
88|88|                updateMetrics();
89|89|            }
90|90|        });
91|91|    });
92|92|}
93|93|
94|94|// Setup Modals
95|95|function setupModals() {
96|96|    // Turma Modal
97|97|    btnNovaTurma.addEventListener('click', () => {
98|98|        modalTurma.style.display = 'flex';
99|99|    });
100|100|    
101|101|    formTurma.addEventListener('submit', (e) => {
102|102|        e.preventDefault();
103|103|        const nome = document.getElementById('nome-turma').value;
104|104|        const ano = document.getElementById('ano-letivo').value;
105|105|        
106|106|        MockDB.turmas.push({
107|107|            id: crypto.randomUUID(),
108|108|            nome,
109|109|            ano_letivo: ano,
110|110|            created_at: new Date().toISOString()
111|111|        });
112|112|        
113|113|        modalTurma.style.display = 'none';
114|114|        formTurma.reset();
115|115|        renderTurmas();
116|116|    });
117|117|
118|118|    // Aluno Modal
119|119|    btnNovoAluno.addEventListener('click', () => {
120|120|        modalAluno.style.display = 'flex';
121|121|    });
122|122|
123|123|    formAluno.addEventListener('submit', (e) => {
124|124|        e.preventDefault();
125|125|        const nome = document.getElementById('nome-aluno').value;
126|126|        
127|127|        MockDB.alunos.push({
128|128|            id: crypto.randomUUID(),
129|129|            nome,
130|130|            turma_id: currentTurmaId,
131|131|            avatar_url: ['👦', '👧', '👽', '🤖'][Math.floor(Math.random() * 4)]
132|132|        });
133|133|        
134|134|        modalAluno.style.display = 'none';
135|135|        formAluno.reset();
136|136|        renderAlunos(currentTurmaId);
137|137|    });
138|138|
139|139|    // Close Modals
140|140|    document.querySelectorAll('.close-modal').forEach(btn => {
141|141|        btn.addEventListener('click', (e) => {
142|142|            e.target.closest('.modal').style.display = 'none';
143|143|        });
144|144|    });
145|145|}
146|146|
147|147|// Functions
148|148|function checkAuth() {
149|149|    const savedUser = localStorage.getItem('profUser');
150|150|    if (savedUser) {
151|151|        try {
152|152|            currentUser = JSON.parse(savedUser);
153|153|            showDashboard();
154|154|        } catch (e) {
155|155|            showAuth();
156|156|        }
157|157|    } else {
158|158|        showAuth();
159|159|    }
160|160|}
161|161|
162|162|function showAuth() {
163|163|    authView.style.display = 'block';
164|164|    dashboardView.style.display = 'none';
165|165|}
166|166|
167|167|function showDashboard() {
168|168|    authView.style.display = 'none';
169|169|    dashboardView.style.display = 'block';
170|170|    renderTurmas();
171|171|    populateFiltroTurmas();
172|172|}
173|173|
174|174|function renderTurmas() {
175|175|    turmasList.innerHTML = '';
176|176|    MockDB.turmas.forEach(turma => {
177|177|        const alunosCount = MockDB.alunos.filter(a => a.turma_id === turma.id).length;
178|178|        
179|179|        const card = document.createElement('div');
180|180|        card.className = 'card';
181|181|        card.innerHTML = `
182|182|            <div class="card-icon">🏫</div>
183|183|            <h3 class="card-title"></h3>
184|184|            <p class="turma-ano"></p>
185|185|            <p style="font-size: 0.9rem; color: #718096;" class="turma-count"></p>
186|186|            <button class="btn-secondary btn-ver-alunos" style="margin-top: 15px;">Ver Alunos</button>
187|187|            <button class="btn-secondary btn-excluir" style="margin-top: 10px; background-color: var(--primary-color);">Excluir</button>
188|188|        `;
189|189|        card.querySelector('.card-title').textContent = turma.nome;
190|190|        card.querySelector('.turma-ano').textContent = turma.ano_letivo;
191|191|        card.querySelector('.turma-count').textContent = alunosCount + ' alunos';
192|192|        card.querySelector('.btn-ver-alunos').addEventListener('click', () => abrirTurma(turma.id, turma.nome));
193|193|        card.querySelector('.btn-excluir').addEventListener('click', () => excluirTurma(turma.id));
194|194|        turmasList.appendChild(card);
195|195|    });
196|196|}
197|197|
198|198|function abrirTurma(id, nome) {
199|199|    currentTurmaId = id;
200|200|    turmaSelecionadaNome.innerText = `Turma: ${nome}`;
201|201|    turmasList.style.display = 'none';
202|202|    alunosContainer.style.display = 'block';
203|203|    renderAlunos(id);
204|204|};
205|205|
206|206|function excluirTurma(id) {
207|207|    if (confirm("Tem certeza que deseja excluir esta turma? Todos os dados dos alunos serão perdidos!")) {
208|208|        MockDB.turmas = MockDB.turmas.filter(t => t.id !== id);
209|209|        MockDB.alunos = MockDB.alunos.filter(a => a.turma_id !== id);
210|210|        renderTurmas();
211|211|        populateFiltroTurmas();
212|212|    }
213|213|};
214|214|
215|215|function renderAlunos(turmaId) {
216|216|    alunosList.innerHTML = '';
217|217|    const alunos = MockDB.alunos.filter(a => a.turma_id === turmaId);
218|218|    
219|219|    if (alunos.length === 0) {
220|220|        alunosList.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhum aluno cadastrado.</td></tr>`;
221|221|        return;
222|222|    }
223|223|    
224|224|    alunos.forEach(aluno => {
225|225|        const tr = document.createElement('tr');
226|226|        tr.innerHTML = `
227|227|            <td style="font-size: 2rem;" class="aluno-avatar"></td>
228|228|            <td style="font-weight: bold;" class="aluno-nome"></td>
229|229|            <td>
230|230|                <button class="btn-secondary btn-remover" style="padding: 6px 12px; background-color: var(--primary-color);">Remover</button>
231|231|            </td>
232|232|        `;
233|233|        tr.querySelector('.aluno-avatar').textContent = aluno.avatar_url;
234|234|        tr.querySelector('.aluno-nome').textContent = aluno.nome;
235|235|        tr.querySelector('.btn-remover').addEventListener('click', () => excluirAluno(aluno.id));
236|236|        alunosList.appendChild(tr);
237|237|    });
238|238|}
239|239|
240|240|function excluirAluno(id) {
241|241|    if (confirm("Remover este aluno?")) {
242|242|        MockDB.alunos = MockDB.alunos.filter(a => a.id !== id);
243|243|        renderAlunos(currentTurmaId);
244|244|    }
245|245|};
246|246|
247|247|function populateFiltroTurmas() {
248|248|    filtroTurma.innerHTML = '<option value="">Todas as Turmas</option>';
249|249|    MockDB.turmas.forEach(turma => {
250|250|        const opt = document.createElement('option');
251|251|        opt.value = turma.id;
252|252|        opt.innerText = turma.nome;
253|253|        filtroTurma.appendChild(opt);
254|254|    });
255|255|}
256|256|
257|257|function updateMetrics() {
258|258|    // Mock data for metrics
259|259|    document.getElementById('metric-acertos').innerText = '78%';
260|260|    document.getElementById('metric-quizzes').innerText = '142';
261|261|    document.getElementById('metric-engajamento').innerText = '92%';
262|262|    
263|263|    // Mock ranking
264|264|    const rankingList = document.getElementById('ranking-list');
265|265|    rankingList.innerHTML = '';
266|266|    const topAlunos = MockDB.alunos.slice(0, 3);
267|267|    topAlunos.forEach((aluno, index) => {
268|268|        const tr = document.createElement('tr');
269|269|        tr.innerHTML = `
270|270|            <td>#${index + 1}</td>
271|271|            <td class="ranking-nome"></td>
272|272|            <td style="font-weight: bold; color: var(--secondary-color);">${1500 - (index * 200)} XP</td>
273|273|        `;
274|274|        tr.querySelector('.ranking-nome').textContent = aluno.avatar_url + ' ' + aluno.nome;
275|275|        rankingList.appendChild(tr);
276|276|    });
277|277|    
278|278|    updateCharts();
279|279|}
280|280|
281|281|function setupCharts() {
282|282|    const canvasOps = document.getElementById('chart-operacoes');
283|283|    if (!canvasOps) return;
284|284|    const ctxOps = canvasOps.getContext('2d');
285|285|    chartOperacoes = new Chart(ctxOps, {
286|286|        type: 'bar',
287|287|        data: {
288|288|            labels: ['Adição', 'Subtração', 'Multiplicação', 'Divisão'],
289|289|            datasets: [{
290|290|                label: 'Média de Acertos (%)',
291|291|                data: [90, 85, 60, 45],
292|292|                backgroundColor: ['#4ECDC4', '#4ECDC4', '#FF6B6B', '#FF6B6B'],
293|293|                borderRadius: 8
294|294|            }]
295|295|        },
296|296|        options: {
297|297|            responsive: true,
298|298|            scales: { y: { beginAtZero: true, max: 100 } }
299|299|        }
300|300|    });
301|301|
302|302|    const canvasEvolucao = document.getElementById('chart-evolucao');
303|303|    if (!canvasEvolucao) return;
304|304|    const ctxEvolucao = canvasEvolucao.getContext('2d');
305|305|    chartEvolucao = new Chart(ctxEvolucao, {
306|306|        type: 'line',
307|307|        data: {
308|308|            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
309|309|            datasets: [{
310|310|                label: 'Pontuação Média',
311|311|                data: [300, 450, 600, 850],
312|312|                borderColor: '#FFE66D',
313|313|                backgroundColor: 'rgba(255, 230, 109, 0.2)',
314|314|                fill: true,
315|315|                tension: 0.4
316|316|            }]
317|317|        },
318|318|        options: {
319|319|            responsive: true,
320|320|            scales: { y: { beginAtZero: true } }
321|321|        }
322|322|    });
323|323|}
324|324|
325|325|function updateCharts() {
326|326|    // In a real app, we would fetch data based on filtroTurma.value and update charts
327|327|    // chartOperacoes.data.datasets[0].data = newData;
328|328|    // chartOperacoes.update();
329|329|}
330|330|
331|331|filtroTurma.addEventListener('change', updateMetrics);
332|332|
333|333|// Export PDF mock
334|334|document.getElementById('btn-export-pdf').addEventListener('click', () => {
335|335|    alert("Exportação de PDF iniciada! (Simulação)");
336|336|});
337|337|