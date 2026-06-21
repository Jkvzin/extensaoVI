/**
 * js/tour-config.js — Configuração dos passos do Tour Guiado por página
 *
 * Cada página do portal define seus próprios passos.
 * O TourGuide persiste o estado entre páginas via sessionStorage,
 * permitindo que o tour comece em login.html e continue em index.html.
 */

(function () {
    'use strict';

    var pageId = (window.location.pathname.split('/').pop() || 'index.html');

    // Se o tour já foi concluído nesta sessão, não reexibir
    // (exceto se o usuário clicar em "Tour" manualmente)

    // ==================== CONFIGURAÇÃO POR PÁGINA ====================

    var stepConfigs = {

        'login.html': [
            {
                target: '.login-container h1',
                position: 'bottom',
                title: '🌟 Bem-vindo ao Portal!',
                text: 'Oi! Vamos te guiar rapidinho para você começar a aprender matemática de um jeito divertido. É só seguir os passos!'
            },
            {
                target: '#step-turma',
                position: 'bottom',
                title: '📚 Escolha sua Turma',
                text: 'Aqui você escolhe a sua turma. Clique no nome da sua sala para continuar!'
            },
            {
                target: '#step-aluno',
                position: 'bottom',
                title: '🙋 Quem é Você?',
                text: 'Agora é só clicar no seu nome. Seus pontos e conquistas ficam salvos no seu perfil!',
                crossPage: true,  // Tour continua em index.html após login
                when: function () {
                    // Só mostra este passo quando step-aluno estiver visível
                    var el = document.getElementById('step-aluno');
                    return el && el.style.display !== 'none';
                }
            }
        ],

        'index.html': [
            {
                target: '.hero',
                position: 'bottom',
                title: '🏠 Página Inicial',
                text: 'Pronto! Agora você já está no portal. Aqui você pode ver tudo o que temos: jogos, vídeos, quiz e muito mais!'
            },
            {
                target: 'nav ul',
                position: 'bottom',
                title: '🧭 Navegação',
                text: 'Use este menu para explorar o portal. Cada página tem uma atividade diferente. Clique em "Quiz" para começar a praticar!'
            },
            {
                target: '.feedback-module',
                position: 'top',
                title: '💬 Sua Opinião',
                text: 'No final da página, você pode dizer o que achou do portal. Sua opinião ajuda a gente a melhorar sempre!'
            }
        ],

        'quiz.html': [
            {
                target: '#categoryGrid',
                position: 'bottom',
                title: '🧠 Escolha seu Desafio',
                text: 'Aqui você escolhe qual operação matemática quer praticar: adição, subtração, multiplicação ou divisão. Depois é só escolher o nível!'
            },
            {
                target: '#difficultySelection',
                position: 'bottom',
                title: '🎯 Nível de Dificuldade',
                text: 'Depois de escolher a operação, selecione o nível: Fácil, Médio ou Difícil. Cada nível tem números diferentes!',
                when: function () {
                    var el = document.getElementById('difficultySelection');
                    return el && el.style.display !== 'none';
                }
            }
        ],

        'jogos.html': [
            {
                target: '.grid-container',
                position: 'bottom',
                title: '🎮 Jogos Educativos',
                text: 'Aqui você encontra jogos criados para aprender matemática brincando. Clique em qualquer jogo para começar!'
            }
        ],

        'videos.html': [
            {
                target: '.grid-container',
                position: 'bottom',
                title: '📺 Vídeos Explicativos',
                text: 'Assista a vídeos que explicam os conceitos matemáticos de forma simples e divertida!'
            }
        ],

        'conquistas.html': [
            {
                target: 'main',
                position: 'bottom',
                title: '🏆 Suas Conquistas',
                text: 'Conforme você joga e aprende, você ganha conquistas e sobe de nível! Apareça aqui para ver tudo que já conseguiu.'
            }
        ],

        'multiplayer.html': [
            {
                target: '.mp-overlay-card',
                position: 'bottom',
                title: '⚔️ Modo Versus',
                text: 'Desafie um amigo no modo X1! Cada jogador usa teclas diferentes para responder mais rápido.'
            }
        ]

    };

    // ==================== INICIALIZAÇÃO ====================

    var steps = stepConfigs[pageId];

    if (steps && steps.length > 0) {
        TourGuide.init({
            steps: steps,
            onComplete: function () {
                // Tour concluído: opcionalmente, mostrar uma mensagem
                console.log('[Tour] Tour guiado concluído pelo usuário.');
            }
        });
    }

})();
