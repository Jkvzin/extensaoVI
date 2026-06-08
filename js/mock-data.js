// js/mock-data.js
const MockDB = {
    turmas: [
        { id: '1', nome: '3º Ano A', icone: '🏫', ano_letivo: 2026, created_at: new Date().toISOString() },
        { id: '2', nome: '4º Ano B', icone: '🎒', ano_letivo: 2026, created_at: new Date().toISOString() },
        { id: '3', nome: '5º Ano C', icone: '🎓', ano_letivo: 2026, created_at: new Date().toISOString() }
    ],
    alunos: [
        { id: '101', nome: 'Joãozinho', turma_id: '1', avatar_url: '👦', senha: 'gato123' },
        { id: '102', nome: 'Mariazinha', turma_id: '1', avatar_url: '👧', senha: 'flor456' },
        { id: '103', nome: 'Pedrinho', turma_id: '2', avatar_url: '👦', senha: 'cachorro789' },
        { id: '104', nome: 'Ana', turma_id: '2', avatar_url: '👧', senha: 'estrela321' },
        { id: '105', nome: 'Bia', turma_id: '3', avatar_url: '👧', senha: 'lua654' }
    ],
    progresso: []
};
