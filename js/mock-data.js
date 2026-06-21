/**
 * js/mock-data.js
 * Banco de Dados Unificado — fonte única de verdade para todo o sistema.
 * Persiste tudo no localStorage (chave 'matematica_caic_db').
 * 
 * Estrutura:
 *   DB.usuarios[]   — admin, professores
 *   DB.turmas[]     — turmas cadastradas
 *   DB.alunos[]     — alunos (cada um com senha, turma_id)
 *   DB.progresso[]  — registros de quizzes/atividades
 * 
 * Roles: 'admin' (diretor), 'professor', 'aluno'
 * Apenas admin pode cadastrar professores.
 * Professores cadastram turmas e alunos.
 */

var DB = (function() {
    'use strict';

    var STORAGE_KEY = 'matematica_caic_db';
    var _data = null;

    // ==================== ESTRUTURA PADRÃO ====================
    function _defaultData() {
        var senhaAdmin = 'diretorDoCaiC2026';
        console.log('==========================================');
        console.log('CREDENCIAIS DO DIRETOR');
        console.log('Email: admin@caic.com.br');
        console.log('Senha: diretorDoCaiC2026');
        console.log('Para trocar: DB.trocarSenhaAdmin("nova-senha")');
        console.log('==========================================');
        return {
            usuarios: [
                {
                    id: 'admin-1',
                    nome: 'Diretor',
                    email: 'admin@caic.com.br',
                    senha: senhaAdmin,
                    role: 'admin',
                    avatar_url: '👑'
                }
            ],
            turmas: [
                { id: '1', nome: '3º Ano A', icone: '🏫', ano_letivo: 2026, professor_id: null, created_at: new Date().toISOString() },
                { id: '2', nome: '4º Ano B', icone: '🎒', ano_letivo: 2026, professor_id: null, created_at: new Date().toISOString() },
                { id: '3', nome: '5º Ano C', icone: '🎓', ano_letivo: 2026, professor_id: null, created_at: new Date().toISOString() }
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
    }

    // ==================== CARREGAR / SALVAR ====================
    function _load() {
        if (_data) return _data;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                var def = _defaultData();
                for (var key in def) {
                    if (!(key in parsed)) {
                        parsed[key] = def[key];
                    }
                }
                _data = parsed;
                // Migracao: garante que a senha do admin seja a fixa
                _migrarSenhaAdmin();
            } else {
                _data = _defaultData();
                _save();
            }
        } catch (e) {
            _data = _defaultData();
            _save();
        }
        return _data;
    }

    function _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
        } catch (e) {
            console.error('DB: Erro ao salvar no localStorage:', e.message);
        }
    }

    function _reset() {
        localStorage.removeItem(STORAGE_KEY);
        _data = null;
        _load();
    }

    // Migracao: força a senha do admin pra fixa (resolve cache antigo)
    function _migrarSenhaAdmin() {
        for (var i = 0; i < _data.usuarios.length; i++) {
            if (_data.usuarios[i].role === 'admin') {
                _data.usuarios[i].senha = 'diretorDoCaiC2026';
                _save();
                return;
            }
        }
    }

    // ==================== INICIALIZAÇÃO ====================
    _load();

    // ==================== API DE USUÁRIOS (Professores/Admin) ====================

    function authUsuario(email, senha) {
        var usuarios = _data.usuarios;
        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email === email && usuarios[i].senha === senha) {
                return _clone(usuarios[i]);
            }
        }
        return null;
    }

    function cadastrarProfessor(nome, email, senha) {
        for (var i = 0; i < _data.usuarios.length; i++) {
            if (_data.usuarios[i].email === email) {
                return { erro: 'Este e-mail já está cadastrado.' };
            }
        }

        var novo = {
            id: 'prof-' + Date.now(),
            nome: nome,
            email: email,
            senha: senha,
            role: 'professor',
            avatar_url: '👨‍🏫'
        };

        _data.usuarios.push(novo);
        _save();
        return { sucesso: true, usuario: _clone(novo) };
    }

    function listarProfessores() {
        return _data.usuarios.filter(function(u) { return u.role === 'professor'; }).map(_clone);
    }

    function removerProfessor(id) {
        _data.usuarios = _data.usuarios.filter(function(u) { return u.id !== id; });
        _save();
    }

    // ==================== API DE TURMAS ====================

    function listarTurmas() {
        return _data.turmas.map(_clone);
    }

    function getTurma(id) {
        for (var i = 0; i < _data.turmas.length; i++) {
            if (_data.turmas[i].id === id) return _clone(_data.turmas[i]);
        }
        return null;
    }

    function criarTurma(nome, anoLetivo, professorId) {
        var nova = {
            id: 'turma-' + Date.now(),
            nome: nome,
            icone: ['🏫', '🎒', '🎓', '📚', '✏️'][Math.floor(Math.random() * 5)],
            ano_letivo: anoLetivo || 2026,
            professor_id: professorId || null,
            created_at: new Date().toISOString()
        };
        _data.turmas.push(nova);
        _save();
        return _clone(nova);
    }

    function excluirTurma(id) {
        _data.turmas = _data.turmas.filter(function(t) { return t.id !== id; });
        _data.alunos = _data.alunos.filter(function(a) { return a.turma_id !== id; });
        _save();
    }

    // ==================== API DE ALUNOS ====================

    function listarAlunos(turmaId) {
        if (turmaId) {
            return _data.alunos.filter(function(a) { return a.turma_id === turmaId; }).map(_clone);
        }
        return _data.alunos.map(_clone);
    }

    function getAluno(id) {
        for (var i = 0; i < _data.alunos.length; i++) {
            if (_data.alunos[i].id === id) return _clone(_data.alunos[i]);
        }
        return null;
    }

    function criarAluno(nome, turmaId) {
        var avatares = ['👦', '👧', '👽', '🤖', '🐱', '🐶', '🦊', '🐸'];
        var novo = {
            id: 'aluno-' + Date.now(),
            nome: nome,
            turma_id: turmaId,
            avatar_url: avatares[Math.floor(Math.random() * avatares.length)],
            senha: gerarSenha()
        };
        _data.alunos.push(novo);
        _save();
        return _clone(novo);
    }

    function excluirAluno(id) {
        _data.alunos = _data.alunos.filter(function(a) { return a.id !== id; });
        _save();
    }

    function contarAlunosPorTurma(turmaId) {
        return _data.alunos.filter(function(a) { return a.turma_id === turmaId; }).length;
    }

    // ==================== API DE PROGRESSO ====================

    function registrarProgresso(registro) {
        registro.timestamp = registro.timestamp || new Date().toISOString();
        _data.progresso.push(registro);
        _save();
    }

    function getProgressoAluno(alunoId) {
        return _data.progresso.filter(function(p) { return p.aluno_id === alunoId; });
    }

    function getProgressoTurma(turmaId) {
        var alunosDaTurma = _data.alunos.filter(function(a) { return a.turma_id === turmaId; });
        var ids = alunosDaTurma.map(function(a) { return a.id; });
        return _data.progresso.filter(function(p) { return ids.indexOf(p.aluno_id) !== -1; });
    }

    // ==================== UTILITÁRIOS ====================

    function _gerarSenhaForte() {
        var chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
        var senha = '';
        for (var i = 0; i < 10; i++) {
            senha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return senha;
    }

    function gerarSenha() {
        var palavras = ['gato', 'cachorro', 'flor', 'estrela', 'lua', 'sol', 'rio', 'nuvem',
            'bola', 'casa', 'arvore', 'livro', 'peixe', 'passaro', 'fogo', 'agua'];
        var palavra = palavras[Math.floor(Math.random() * palavras.length)];
        var numero = Math.floor(Math.random() * 900) + 100;
        return palavra + numero;
    }

    function _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function resetDB() {
        _reset();
    }

    // ==================== API PÚBLICA ====================
    return {
        authUsuario: authUsuario,
        cadastrarProfessor: cadastrarProfessor,
        listarProfessores: listarProfessores,
        removerProfessor: removerProfessor,

        listarTurmas: listarTurmas,
        getTurma: getTurma,
        criarTurma: criarTurma,
        excluirTurma: excluirTurma,

        listarAlunos: listarAlunos,
        getAluno: getAluno,
        criarAluno: criarAluno,
        excluirAluno: excluirAluno,
        contarAlunosPorTurma: contarAlunosPorTurma,

        registrarProgresso: registrarProgresso,
        getProgressoAluno: getProgressoAluno,
        getProgressoTurma: getProgressoTurma,

        trocarSenhaAdmin: function(novaSenha) {
            for (var i = 0; i < _data.usuarios.length; i++) {
                if (_data.usuarios[i].role === 'admin') {
                    _data.usuarios[i].senha = novaSenha;
                    _save();
                    return true;
                }
            }
            return false;
        },

        resetDB: resetDB,
        _raw: function() { return _data; },
        _save: function() { _save(); }
    };
})();
