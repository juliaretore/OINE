import express from 'express';
import mongoose from 'mongoose';
const app = express();
app.use(express.json());
import cors from 'cors';
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));

import Usuario from '../src/models/Usuario.js';
import Turma from '../src/models/Turma.js';
import QuestaoDiaria from '../src/models/QuestaoDiaria.js';
import Tentativa from '../src/models/Tentativa.js';

// Configurações do MongoDB
const MONGO_URI = "mongodb://localhost:27017/Fracionando"; 
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

app.post("/api/login", async (req, res) => {
    const { email, senha } = req.body;
    console.log("Login attempt:", email);

    if (!email || !senha) {
        return res.status(400).json({ message: "Email ou senha não fornecidos" });
    }

    try {
        const user = await Usuario.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        const isPasswordValid = senha === user.senha;  // Comparação simples (use bcrypt para segurança)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        res.json({ message: "Login realizado com sucesso", user });
    } catch (err) {
        console.error("Erro na autenticação:", err);
        res.status(500).json({ message: "Erro no servidor" });
    }
});

app.post("/api/usuario", async (req, res) => {
    const { nome, email, senha, tipo, cpf, matricula } = req.body;

    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
    }

    const user = new Usuario({ nome, email, senha, tipo, cpf, matricula });
    await user.save();
    res.status(201).json({ message: "Usuário cadastrado", user });
});

app.post("/api/turma", async (req, res) => {
    const { serie, idProfessor, alunos, nome } = req.body;

    const turma = new Turma({ serie, idProfessor, alunos, nome });
    await turma.save();
    res.status(201).json({ message: "Turma criada", turma });
});

app.get("/api/turmas", async (req, res) => {
    console.log("Fetching turmas");
    const turmas = await Turma.find()
        .populate('idProfessor', 'nome email')
        .populate('alunos', 'nome email');
    res.json(turmas);
})

app.post("/api/questaoDiaria", async (req, res) => {
    const questao = new QuestaoDiaria(req.body);
    await questao.save();
    res.status(201).json({ message: "Questão diária criada", questao });
});

app.get("/api/questaoDiaria", async (req, res) => {
    const questoes = await QuestaoDiaria.find();
    res.json(questoes);
});

app.post("/api/tentativa", async (req, res) => {
    const tentativa = new Tentativa(req.body);
    await tentativa.save();
    res.status(201).json({ message: "Tentativa registrada", tentativa });
});

app.get("/api/tentativas", async (req, res) => {
    const { aluno, questao } = req.query;
    const filtro = {};
    if (aluno) filtro.aluno = aluno;
    if (questao) filtro.questaoDiaria = questao;

    const tentativas = await Tentativa.find(filtro)
        .populate('aluno', 'nome email')
        .populate('questaoDiaria');

    res.json(tentativas);
});

app.get("/api/turma-do-usuario/:usuarioId", async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const turma = await Turma.findOne({ alunos: usuarioId })
            .populate('idProfessor', 'nome email')
            .populate('alunos', 'nome email');
        
        if (!turma) {
            return res.status(404).json({ message: "Turma não encontrada para este usuário" });
        }

        res.json(turma);
    } catch (err) {
        console.error("Erro ao buscar turma:", err);
        res.status(500).json({ message: "Erro no servidor" });
    }
});

// GET /api/progresso-turma/:turmaId
app.get("/api/progresso-turma/:turmaId", async (req, res) => {
    const { turmaId } = req.params;
    try {
        const turma = await Turma.findById(turmaId).populate('alunos', 'nome');
        if (!turma) return res.status(404).json({ message: "Turma não encontrada" });
        const alunos = turma.alunos;
        console.log("Calculando progresso para a turma:", turma.nome);
        

        const progresso = await Promise.all(alunos.map(async (aluno) => {
            const tentativas = await Tentativa.find({ aluno: aluno._id });

            const frequenciaDias = new Set(
                tentativas.map(t => new Date(t.data).toISOString().split("T")[0])
            );

            const pontuacaoTotal = tentativas.reduce((acc, t) => acc + (t.pontuacao || 0), 0);

            return {
                nome: aluno.nome,
                frequencia: frequenciaDias.size,
                pontuacao: pontuacaoTotal,
            };
        }));

        res.json({
            turma: turma.nome,
            quantidadeAlunos: alunos.length,
            progresso: progresso.sort((a, b) => b.frequencia - a.frequencia), // ordenado por frequência (opcional)
        });
    } catch (err) {
        console.error("Erro ao calcular progresso:", err);
        res.status(500).json({ message: "Erro ao calcular progresso da turma" });
    }
});


// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
