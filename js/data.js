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
        titulo: "Aprendendo a Somar",
        topico: "Adição",
        // Coloque apenas o link de "embed" do YouTube
        youtubeUrl: "https://www.youtube.com/embed/5aLhA_6x9E0" 
    },
    {
        id: "video_2",
        titulo: "Tabuada do 2",
        topico: "Multiplicação",
        youtubeUrl: "https://www.youtube.com/embed/yVwL3P0_xM0"
    },
    {
        id: "video_3",
        titulo: "O que é Fração?",
        topico: "Frações",
        youtubeUrl: "https://www.youtube.com/embed/1v0T4j7b_f8"
    }
];

// ==========================================
// 2. LISTA DE JOGOS
// ==========================================
const JOGOS_DATA = [
    {
        id: "jogo_1",
        titulo: "Cobras e Escadas",
        icone: "🐍", // Pode usar um emoji ou o caminho para uma imagem
        url: "https://grouwber.github.io/trabalhoandre/", // Link do jogo da equipe
        corHover: "#4ECDC4" // Cor da borda ao passar o mouse
    },
    {
        id: "jogo_2",
        titulo: "Batalha Naval da Matemática",
        icone: "🚢",
        url: "#", 
        corHover: "#FF6B6B"
    },
    {
        id: "jogo_3",
        titulo: "Quebra-Cabeça Geométrico",
        icone: "🧩",
        url: "#",
        corHover: "#FFE66D"
    }
];

// ==========================================
// 3. PERGUNTAS DO QUIZ
// ==========================================
const QUIZ_DATA = [
    {
        pergunta: "Quanto é 5 + 7?",
        opcoes: ["10", "11", "12", "13"],
        respostaCorretaIndex: 2, // Lembre-se: começa no zero (0="10", 1="11", 2="12", 3="13")
        resolucaoPassoAPasso: "Para somar 5 + 7, você pode pensar em pegar 5 unidades e adicionar mais 7. Uma dica é pegar o número maior (7) e contar mais 5 nos dedos: 8, 9, 10, 11, 12! Portanto, a resposta é 12."
    },
    {
        pergunta: "Se você tem 3 caixas e cada caixa tem 4 maçãs, quantas maçãs você tem no total?",
        opcoes: ["7", "12", "10", "15"],
        respostaCorretaIndex: 1, // 1="12"
        resolucaoPassoAPasso: "Isso é uma multiplicação! São 3 caixas vezes 4 maçãs (3 x 4). Se você somar 4 + 4 + 4, o resultado será 12."
    },
    {
        pergunta: "Quanto é 20 dividido por 4?",
        opcoes: ["4", "5", "6", "10"],
        respostaCorretaIndex: 1, // 1="5"
        resolucaoPassoAPasso: "Imagine que você tem 20 balas e quer dividir igualmente entre 4 amigos. Se você for distribuindo uma a uma, cada amigo vai acabar recebendo exatamente 5 balas. Logo, 20 ÷ 4 = 5."
    }
];
