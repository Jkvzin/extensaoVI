// js/mock-data.js
const MockDB = {
    turmas: [
        { id: '1', nome: '3º Ano A', icone: '🏫', ano_letivo: 2026, created_at: new Date().toISOString() },
        { id: '2', nome: '4º Ano B', icone: '🎒', ano_letivo: 2026, created_at: new Date().toISOString() },
        { id: '3', nome: '5º Ano C', icone: '🎓', ano_letivo: 2026, created_at: new Date().toISOString() }
    ],
    alunos: [
        { id: '101', nome: 'Joãozinho', turma_id: '1', avatar_url: '👦' },
        { id: '102', nome: 'Mariazinha', turma_id: '1', avatar_url: '👧' },
        { id: '103', nome: 'Pedrinho', turma_id: '2', avatar_url: '👦' },
        { id: '104', nome: 'Ana', turma_id: '2', avatar_url: '👧' },
        { id: '105', nome: 'Bia', turma_id: '3', avatar_url: '👧' }
    ],
    progresso: []
};
