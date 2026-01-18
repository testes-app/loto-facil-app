require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'concursos.json');

app.use(cors());
app.use(express.json());

// Memória local para os concursos
let cacheConcursos = [];

// Carregar dados iniciais do arquivo se existir
if (fs.existsSync(DATA_FILE)) {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        cacheConcursos = JSON.parse(data);
        console.log(`[BACKEND] ${cacheConcursos.length} concursos carregados do disco.`);
    } catch (err) {
        console.error('[BACKEND] Erro ao ler concursos.json:', err);
    }
}

// Função para buscar dados da API externa e atualizar localmente
async function atualizarDados() {
    console.log('[BACKEND] Verificando novos concursos...');
    try {
        const response = await axios.get(`${process.env.API_EXTERNA}/ultimo`);
        const ultimoConcursoApi = response.data;

        const ultimoLocal = cacheConcursos.length > 0
            ? Math.max(...cacheConcursos.map(c => c.numero))
            : 0;

        if (ultimoConcursoApi.numero > ultimoLocal) {
            console.log(`[BACKEND] Novo concurso detectado: ${ultimoConcursoApi.numero}. Sincronizando...`);

            // Aqui poderíamos buscar todos os que faltam. 
            // Para simplificar, vamos adicionar o último e salvar.
            // Em uma implementação real, faríamos um loop do ultimoLocal + 1 até ultimoConcursoApi.numero

            const novosConcursos = [];
            for (let i = ultimoLocal + 1; i <= ultimoConcursoApi.numero; i++) {
                try {
                    const res = await axios.get(`${process.env.API_EXTERNA}/${i}`);
                    if (res.data && res.data.numero) {
                        novosConcursos.push(res.data);
                    }
                    // Pequeno delay para não sobrecarregar a API externa
                    await new Promise(r => setTimeout(r, 200));
                } catch (e) {
                    console.error(`[BACKEND] Erro ao buscar concurso ${i}:`, e.message);
                }
            }

            if (novosConcursos.length > 0) {
                cacheConcursos = [...cacheConcursos, ...novosConcursos].sort((a, b) => b.numero - a.numero);
                fs.writeFileSync(DATA_FILE, JSON.stringify(cacheConcursos, null, 2));
                console.log(`[BACKEND] ${novosConcursos.length} novos concursos adicionados.`);
            }
        } else {
            console.log('[BACKEND] O banco de dados já está atualizado.');
        }
    } catch (error) {
        console.error('[BACKEND] Erro na rotina de atualização:', error.message);
    }
}

// Rotas da API
app.get('/api/ultimo', (req, res) => {
    if (cacheConcursos.length === 0) {
        return res.status(404).json({ error: 'Nenhum dado disponível. Sincronize primeiro.' });
    }
    res.json(cacheConcursos[0]);
});

app.get('/api/concursos', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json(cacheConcursos.slice(0, limit));
});

app.get('/api/concurso/:numero', (req, res) => {
    const numero = parseInt(req.params.numero);
    const concurso = cacheConcursos.find(c => c.numero === numero);
    if (concurso) {
        res.json(concurso);
    } else {
        res.status(404).json({ error: 'Concurso não encontrado' });
    }
});

// Forçar atualização manual
app.post('/api/sync', async (req, res) => {
    atualizarDados();
    res.json({ message: 'Sincronização iniciada em segundo plano' });
});

// Agendar tarefa para rodar a cada 1 hora
cron.schedule('0 * * * *', () => {
    atualizarDados();
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 BACKEND LOTOFÁCIL RODANDO NA PORTA ${PORT}`);
    console.log(`🏠 http://localhost:${PORT}`);
    console.log(`=========================================`);

    // Tenta atualizar ao iniciar
    atualizarDados();
});
