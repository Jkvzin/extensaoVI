/**
 * Arquivo de Dados do Portal Interativo de Matemática
 * 
 * Este arquivo foi criado para facilitar a manutenção. 
 * Para adicionar novos vídeos, jogos ou perguntas do quiz, 
 * basta adicionar um novo item nas listas (arrays) abaixo.
 */

// ==========================================
// 1. LISTA DE VÍDEOS
// ==========================================
const VIDEOS_DATA = [
    {
        id: "video_1",
        titulo: "Aprendendo a Somar - Aula 1",
        topico: "Adicao",
        youtubeUrl: "https://www.youtube.com/embed/BnF_z176qyk"
    },
    {
        id: "video_2",
        titulo: "Aprendendo a Somar - Aula 2",
        topico: "Adicao",
        youtubeUrl: "https://www.youtube.com/embed/ZhvxctjdzY4"
    },
    {
        id: "video_3",
        titulo: "Aprendendo a Subtrair - Aula 1",
        topico: "Subtracao",
        youtubeUrl: "https://www.youtube.com/embed/3_WFdppEp_U"
    },
    {
        id: "video_4",
        titulo: "Aprendendo a Subtrair - Aula 2",
        topico: "Subtracao",
        youtubeUrl: "https://www.youtube.com/embed/oSzh7TjIsjs"
    },
    {
        id: "video_5",
        titulo: "Aprendendo a Subtrair - Aula 3",
        topico: "Subtracao",
        youtubeUrl: "https://www.youtube.com/embed/8Q6FnKNq4OU"
    },
    {
        id: "video_6",
        titulo: "Aprendendo a Multiplicar - Aula 1",
        topico: "Multiplicacao",
        youtubeUrl: "https://www.youtube.com/embed/kBy586VyJGw"
    },
    {
        id: "video_7",
        titulo: "Aprendendo a Multiplicar - Aula 2",
        topico: "Multiplicacao",
        youtubeUrl: "https://www.youtube.com/embed/gvQ_qWQiGHE"
    },
    {
        id: "video_8",
        titulo: "Aprendendo a Multiplicar - Aula 3",
        topico: "Multiplicacao",
        youtubeUrl: "https://www.youtube.com/embed/BetgRvNQEC0"
    },
    {
        id: "video_9",
        titulo: "Aprendendo a Multiplicar - Aula 4",
        topico: "Multiplicacao",
        youtubeUrl: "https://www.youtube.com/embed/_IYxfahKDZE"
    },
    {
        id: "video_10",
        titulo: "Aprendendo a Dividir - Aula 1",
        topico: "Divisao",
        youtubeUrl: "https://www.youtube.com/embed/nmXZiVVLRkk"
    },
    {
        id: "video_11",
        titulo: "Aprendendo a Dividir - Aula 2",
        topico: "Divisao",
        youtubeUrl: "https://www.youtube.com/embed/ezsGCxF6pQI"
    },
    {
        id: "video_12",
        titulo: "Aprendendo a Dividir - Aula 3",
        topico: "Divisao",
        youtubeUrl: "https://www.youtube.com/embed/GpnfZHB3Rpw"
    }
];

// ==========================================
// 2. LISTA DE JOGOS
// ==========================================
const JOGOS_DATA = [
    {
        id: "jogo_1",
        titulo: "Cobras e Escadas",
        icone: "\uD83D\uDC0D",
        url: "https://grouwber.github.io/trabalhoandre/",
        corHover: "#4ECDC4",
        descricao: "Jogo de tabuleiro educativo — suba pelas escadas e cuidado com as cobras!",
        categoria: "geral"
    },
    {
        id: "jogo_4",
        titulo: "Hit the Button",
        icone: "\uD83C\uDFAF",
        url: "https://www.topmarks.co.uk/maths-games/hit-the-button",
        corHover: "#FFE66D",
        descricao: "Acerte o botao com a resposta certa — adicao, subtracao, multiplicacao e divisao",
        categoria: "geral"
    },
    {
        id: "jogo_11",
        titulo: "Fruit Splat - Adicao",
        icone: "\uD83C\uDF4E",
        url: "https://www.sheppardsoftware.com/math/addition/fruit-splat-game/",
        corHover: "#FF6B6B",
        descricao: "Estoure as frutas com a soma correta — varios niveis de dificuldade",
        categoria: "adicao"
    },
    {
        id: "jogo_12",
        titulo: "Fruit Splat - Subtracao",
        icone: "\uD83C\uDF4C",
        url: "https://www.sheppardsoftware.com/math/subtraction/fruit-splat-game/",
        corHover: "#4ECDC4",
        descricao: "Estoure as frutas com o resultado correto da subtracao",
        categoria: "subtracao"
    }
];

// ==========================================
// 3. CATEGORIAS DO QUIZ
// ==========================================
const CATEGORIAS_QUIZ = [
    {
        id: "adicao",
        nome: "Adição",
        icone: "➕",
        descricao: "Some frutas, animais e objetos!",
        cor: "#FF6B6B"
    },
    {
        id: "subtracao",
        nome: "Subtração",
        icone: "➖",
        descricao: "Descubra quanto sobrou!",
        cor: "#4ECDC4"
    },
    {
        id: "multiplicacao",
        nome: "Multiplicação",
        icone: "✖️",
        descricao: "Conte as caixas e os objetos!",
        cor: "#FFE66D"
    },
    {
        id: "divisao",
        nome: "Divisão",
        icone: "➗",
        descricao: "Divida igualmente entre os amigos!",
        cor: "#95D5B2"
    }
];

// ==========================================
// 4. PERGUNTAS DO QUIZ
// ==========================================
const QUIZ_DATA = [
    // --- ADIÇÃO ---
    {
        categoria: "adicao",
        pergunta: "Quanto é 5 + 7?",
        opcoes: ["10", "11", "12", "13"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "Para somar 5 + 7, você pode pensar em pegar 5 unidades e adicionar mais 7. Uma dica é pegar o número maior (7) e contar mais 5 nos dedos: 8, 9, 10, 11, 12! Portanto, a resposta é 12."
    },
    {
        categoria: "adicao",
        pergunta: "Maria tem 8 balas e ganhou mais 6 do seu amigo. Com quantas balas ela ficou?",
        opcoes: ["13", "14", "15", "16"],
        respostaCorretaIndex: 1,
        resolucaoPassoAPasso: "Maria começou com 8 balas e ganhou mais 6. Some 8 + 6: conte a partir do 8 mais 6 dedos — 9, 10, 11, 12, 13, 14. Ela ficou com 14 balas!"
    },
    {
        categoria: "adicao",
        pergunta: "Em uma árvore havia 9 passarinhos. Chegaram mais 4. Quantos passarinhos estão na árvore agora?",
        opcoes: ["11", "12", "13", "14"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "Comece com 9 e conte mais 4: 10, 11, 12, 13. Agora tem 13 passarinhos na árvore!"
    },
    {
        categoria: "adicao",
        pergunta: "João tem 15 figurinhas e ganhou mais 8 de seu primo. Quantas figurinhas ele tem agora?",
        opcoes: ["21", "22", "23", "24"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "Some 15 + 8: pense em 15 + 5 = 20, e depois + 3 = 23. Ou conte a partir do 15 mais 8 dedos!"
    },

    // --- SUBTRAÇÃO ---
    {
        categoria: "subtracao",
        pergunta: "Pedro tinha 12 maçãs e comeu 5. Quantas maçãs sobraram?",
        opcoes: ["5", "6", "7", "8"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "Pedro começou com 12 maçãs. Se ele comeu 5, é só subtrair: 12 - 5 = 7. Pense: do 5 para o 12 faltam 7 unidades!"
    },
    {
        categoria: "subtracao",
        pergunta: "Em um aquário havia 20 peixinhos. O gato pescou 6. Quantos sobraram?",
        opcoes: ["13", "14", "15", "16"],
        respostaCorretaIndex: 1,
        resolucaoPassoAPasso: "Havia 20 peixinhos, o gato tirou 6: 20 - 6 = 14. Uma forma fácil: 20 - 10 = 10, e + 4 = 14!"
    },
    {
        categoria: "subtracao",
        pergunta: "Luísa tem 18 reais e gastou 9 na cantina. Com quanto ela ficou?",
        opcoes: ["7", "8", "9", "10"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "Subtraia 18 - 9. Se 9 + 9 = 18, então 18 - 9 = 9. Ela ficou com 9 reais!"
    },
    {
        categoria: "subtracao",
        pergunta: "Numa caixa havia 25 bombons. A turma comeu 13. Quantos bombons sobraram?",
        opcoes: ["10", "11", "12", "13"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "25 - 13: subtraia primeiro 10 (25 - 10 = 15), depois subtraia 3 (15 - 3 = 12). Sobraram 12 bombons!"
    },

    // --- MULTIPLICAÇÃO ---
    {
        categoria: "multiplicacao",
        pergunta: "Se você tem 3 caixas e cada caixa tem 4 maçãs, quantas maçãs você tem no total?",
        opcoes: ["7", "12", "10", "15"],
        respostaCorretaIndex: 1,
        resolucaoPassoAPasso: "Isso é uma multiplicação! São 3 caixas vezes 4 maçãs (3 x 4). Se você somar 4 + 4 + 4, o resultado será 12."
    },
    {
        categoria: "multiplicacao",
        pergunta: "Em uma sala há 5 mesas. Cada mesa tem 3 livros. Quantos livros há no total?",
        opcoes: ["12", "13", "14", "15"],
        respostaCorretaIndex: 3,
        resolucaoPassoAPasso: "Multiplique 5 mesas x 3 livros = 15 livros. Ou some: 3 + 3 + 3 + 3 + 3 = 15."
    },
    {
        categoria: "multiplicacao",
        pergunta: "Tenho 4 pacotes de figurinhas. Cada pacote vem com 5 figurinhas. Quantas figurinhas eu tenho?",
        opcoes: ["15", "18", "20", "25"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "4 pacotes x 5 figurinhas = 20. Se 2 x 5 = 10, então 4 x 5 é o dobro: 20!"
    },
    {
        categoria: "multiplicacao",
        pergunta: "Em uma banda há 6 fileiras de cadeiras com 4 cadeiras cada. Quantas cadeiras há na banda?",
        opcoes: ["20", "22", "24", "26"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "6 fileiras x 4 cadeiras = 24. Uma dica: 6 x 4 é o mesmo que 4 x 6. Pense em 4 + 4 + 4 + 4 + 4 + 4 = 24."
    },

    // --- DIVISÃO ---
    {
        categoria: "divisao",
        pergunta: "Quanto é 20 dividido por 4?",
        opcoes: ["4", "5", "6", "10"],
        respostaCorretaIndex: 1,
        resolucaoPassoAPasso: "Imagine que você tem 20 balas e quer dividir igualmente entre 4 amigos. Se você for distribuindo uma a uma, cada amigo vai acabar recebendo exatamente 5 balas. Logo, 20 ÷ 4 = 5."
    },
    {
        categoria: "divisao",
        pergunta: "A professora tem 15 lápis para distribuir igualmente entre 3 alunos. Quantos lápis cada aluno recebe?",
        opcoes: ["3", "4", "5", "6"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "Divida 15 lápis entre 3 alunos: 15 ÷ 3 = 5. Se 3 x 5 = 15, então 15 ÷ 3 = 5. Cada aluno recebe 5 lápis!"
    },
    {
        categoria: "divisao",
        pergunta: "Há 24 biscoitos e 6 crianças. Quantos biscoitos cada criança recebe se forem divididos igualmente?",
        opcoes: ["3", "4", "5", "6"],
        respostaCorretaIndex: 1,
        resolucaoPassoAPasso: "24 biscoitos ÷ 6 crianças = 4 biscoitos para cada. Confira: 6 x 4 = 24. Certinho!"
    },
    {
        categoria: "divisao",
        pergunta: "Gabriel tem 18 carrinhos e quer guardar em 3 caixas com a mesma quantidade. Quantos carrinhos em cada caixa?",
        opcoes: ["4", "5", "6", "7"],
        respostaCorretaIndex: 2,
        resolucaoPassoAPasso: "18 ÷ 3 = 6. Pense: se 3 caixas x 6 carrinhos = 18, então cada caixa terá 6 carrinhos!"
    }
];
