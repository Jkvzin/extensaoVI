/**
 * js/supabase-client.js
 * Camada de sincronizacao Supabase para o Portal de Matematica CAIC
 * 
 * LOCAL-FIRST: localStorage e a fonte primaria (leitura instantanea).
 * Supabase sincroniza em background (escrita bidirecional).
 * Se Supabase estiver offline, o app continua funcionando normalmente.
 * 
 * Carregar DEPOIS de mock-data.js e DEPOIS do SDK Supabase.
 */
(function () {
    'use strict';

    var SUPABASE_URL = 'https://llyrodahdmwzdoceaoyw.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseXJvZGFoZG13emRvY2Vhb3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDA0NzUsImV4cCI6MjA5NzM3NjQ3NX0.yOuHIqXBQdK4a0YV9SPxhUJFDIDkNzxRv1uHymU_mxs';

    var _client = null;
    var _ready = false;
    var SYNC_FLAG = 'matematica_caic_supabase_sync';

    // ==================== INIT ====================

    function _init() {
        if (typeof supabase === 'undefined') {
            console.log('[Supabase] SDK nao carregado — usando apenas localStorage.');
            return;
        }
        try {
            _client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            _ready = true;
            console.log('[Supabase] Conectado! Sincronizacao ativa.');
        } catch (e) {
            console.warn('[Supabase] Falha ao inicializar:', e.message);
        }
    }

    // ==================== HELPERS DE MERGE ====================

    /**
     * Faz merge de arrays por ID: itens do Supabase substituem itens locais
     * com mesmo ID, itens locais novos sao mantidos, itens removidos do
     * Supabase sao mantidos localmente (local-first: nada se perde).
     */
    function _mergeById(localArray, remoteArray, idField) {
        idField = idField || 'id';
        var merged = {};
        // Primeiro poe todos os locais
        for (var i = 0; i < localArray.length; i++) {
            merged[localArray[i][idField]] = localArray[i];
        }
        // Depois sobrescreve com os do Supabase (que tem prioridade)
        for (var j = 0; j < remoteArray.length; j++) {
            merged[remoteArray[j][idField]] = remoteArray[j];
        }
        // Converte de volta pra array
        var result = [];
        for (var key in merged) {
            if (merged.hasOwnProperty(key)) {
                result.push(merged[key]);
            }
        }
        return result;
    }

    // ==================== SYNC: PULL (Supabase -> localStorage) ====================

    async function _pullUsuarios() {
        if (!_client) return;
        try {
            var result = await _client.from('usuarios').select('*');
            if (result.error) {
                // Tabela pode nao existir ainda — ignora silenciosamente
                if (result.error.code !== '42P01') {
                    console.warn('[Supabase] Pull usuarios:', result.error.message);
                }
                return;
            }
            var data = result.data;
            if (data && data.length > 0) {
                var local = DB._raw();
                var adminLocal = local.usuarios.filter(function (u) { return u.role === 'admin'; });
                data = data.filter(function (u) { return u.role !== 'admin'; });
                // MERGE em vez de replace: preserva usuarios locais
                local.usuarios = adminLocal.concat(_mergeById(
                    local.usuarios.filter(function (u) { return u.role !== 'admin'; }),
                    data
                ));
                DB._save();
                console.log('[Supabase] Pull: ' + data.length + ' usuarios sincronizados.');
            }
        } catch (e) {
            console.warn('[Supabase] Pull usuarios:', e.message);
        }
    }

    async function _pullTurmas() {
        if (!_client) return;
        try {
            var result = await _client.from('turmas').select('*');
            if (result.error) {
                if (result.error.code !== '42P01') {
                    console.warn('[Supabase] Pull turmas:', result.error.message);
                }
                return;
            }
            var data = result.data;
            if (data && data.length > 0) {
                var local = DB._raw();
                // MERGE: preserva turmas locais que nao estao no Supabase
                local.turmas = _mergeById(local.turmas, data);
                DB._save();
                console.log('[Supabase] Pull: ' + data.length + ' turmas sincronizadas.');
            }
        } catch (e) {
            console.warn('[Supabase] Pull turmas:', e.message);
        }
    }

    async function _pullAlunos() {
        if (!_client) return;
        try {
            var result = await _client.from('alunos').select('*');
            if (result.error) {
                if (result.error.code !== '42P01') {
                    console.warn('[Supabase] Pull alunos:', result.error.message);
                }
                return;
            }
            var data = result.data;
            if (data && data.length > 0) {
                var local = DB._raw();
                // MERGE: preserva alunos locais
                local.alunos = _mergeById(local.alunos, data);
                DB._save();
                console.log('[Supabase] Pull: ' + data.length + ' alunos sincronizados.');
            }
        } catch (e) {
            console.warn('[Supabase] Pull alunos:', e.message);
        }
    }

    async function _pullProgresso() {
        if (!_client) return;
        try {
            var result = await _client.from('progresso').select('*');
            if (result.error) {
                if (result.error.code !== '42P01') {
                    console.warn('[Supabase] Pull progresso:', result.error.message);
                }
                return;
            }
            var data = result.data;
            if (data && data.length > 0) {
                var local = DB._raw();
                // MERGE: preserva progresso local
                local.progresso = _mergeById(local.progresso, data);
                DB._save();
                console.log('[Supabase] Pull: ' + data.length + ' registros de progresso.');
            }
        } catch (e) {
            console.warn('[Supabase] Pull progresso:', e.message);
        }
    }

    // ==================== SYNC: PUSH (localStorage -> Supabase) ====================

    async function _pushUsuarios() {
        if (!_client) return;
        var usuarios = DB._raw().usuarios.filter(function (u) { return u.role === 'professor'; });
        for (var i = 0; i < usuarios.length; i++) {
            try {
                var res = await _client.from('usuarios').upsert(usuarios[i], { onConflict: 'id' });
                if (res.error && res.error.code !== '42P01') {
                    console.warn('[Supabase] Push usuario falhou:', res.error.message);
                }
            } catch (e) {
                console.warn('[Supabase] Push usuario erro:', e.message);
            }
        }
    }

    async function _pushTurmas() {
        if (!_client) return;
        var turmas = DB._raw().turmas;
        for (var i = 0; i < turmas.length; i++) {
            try {
                var res = await _client.from('turmas').upsert(turmas[i], { onConflict: 'id' });
                if (res.error && res.error.code !== '42P01') {
                    console.warn('[Supabase] Push turma falhou:', res.error.message);
                }
            } catch (e) {
                console.warn('[Supabase] Push turma erro:', e.message);
            }
        }
    }

    async function _pushAlunos() {
        if (!_client) return;
        var alunos = DB._raw().alunos;
        for (var i = 0; i < alunos.length; i++) {
            try {
                var res = await _client.from('alunos').upsert(alunos[i], { onConflict: 'id' });
                if (res.error && res.error.code !== '42P01') {
                    console.warn('[Supabase] Push aluno falhou:', res.error.message);
                }
            } catch (e) {
                console.warn('[Supabase] Push aluno erro:', e.message);
            }
        }
    }

    async function _pushProgresso() {
        if (!_client) return;
        var progresso = DB._raw().progresso;
        for (var i = 0; i < progresso.length; i++) {
            try {
                var res = await _client.from('progresso').upsert(progresso[i], { onConflict: 'id' });
                if (res.error && res.error.code !== '42P01') {
                    console.warn('[Supabase] Push progresso falhou:', res.error.message);
                }
            } catch (e) {
                console.warn('[Supabase] Push progresso erro:', e.message);
            }
        }
    }

    // ==================== SYNC COMPLETO ====================

    async function syncPull() {
        if (!_client) return;
        console.log('[Supabase] Iniciando pull...');
        await _pullUsuarios();
        await _pullTurmas();
        await _pullAlunos();
        await _pullProgresso();
        localStorage.setItem(SYNC_FLAG, Date.now().toString());
        console.log('[Supabase] Pull concluido.');
    }

    async function syncPush() {
        if (!_client) return;
        console.log('[Supabase] Iniciando push...');
        await _pushUsuarios();
        await _pushTurmas();
        await _pushAlunos();
        await _pushProgresso();
        console.log('[Supabase] Push concluido.');
    }

    // Chamado apos cada escrita no localStorage
    var _originalSave = DB._save;
    DB._save = function () {
        _originalSave();
        // Push em background (fire-and-forget)
        syncPush().catch(function (e) {
            console.warn('[Supabase] Push em background falhou:', e.message);
        });
    };

    // ==================== PUBLIC API ====================

    window.SupabaseSync = {
        ready: function () { return _ready; },
        pull: syncPull,
        push: syncPush,
        getClient: function () { return _client; }
    };

    // ==================== BOOT ====================

    _init();

    if (_ready) {
        // Pull inicial: sempre puxa do Supabase ao carregar a pagina
        // se nunca sincronizou ou faz mais de 2 minutos
        var lastSync = localStorage.getItem(SYNC_FLAG);
        var agora = Date.now();
        if (!lastSync || (agora - parseInt(lastSync)) > 120000) {
            syncPull().catch(function (e) {
                console.warn('[Supabase] Pull inicial falhou:', e.message);
            });
        }
    }

})();
