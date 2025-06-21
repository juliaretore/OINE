import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());

// Configurações do MongoDB
const MONGO_URI = "mongodb://localhost:27017/Fracionando"; 
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Esquema do Usuário
const userSchema = new mongoose.Schema({
    nome: String,
    email: String,
    senha: String,
    tipo: String, // 'professor' ou 'aluno'
    cpf: String,
    matricula: String // só para alunos
}, { collection: 'usuario' });
export const Usuario = mongoose.model("Usuario", userSchema);

const turmaSchema = new mongoose.Schema({
    serie: Number,
    idProfessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    alunos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    nome: String
}, { collection: 'turma' });
export const Turma = mongoose.model("Turma", turmaSchema);

const questoesSchema = new mongoose.Schema({
    data: Date,
    somaNumeradores: [Number, Number,  Number],
    somaDenominadores: [Number, Number,  Number],
    subNumeradores: [Number, Number,  Number],
    subDenominadores: [Number, Number,  Number],
    multNumeradores: [Number, Number,  Number],
    multDenominadores: [Number, Number,  Number],
    divNumeradores: [Number, Number,  Number],
    divDenominadores: [Number, Number,  Number],
}, { collection: 'questoes' });
export const QuestaoDiaria = mongoose.model("QuestaoDiaria", questoesSchema);

const tentativaSchema = new mongoose.Schema({
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    questaoDiaria: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestaoDiaria' },
    acertos: Number,
    dataHora: Date,
    tipo: Number // tipo de tentativa, se quiser categorizar
}, { collection: 'tentativa' });
export const Tentativa = mongoose.model("Tentativa", tentativaSchema);

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
    const { serie, idProfessor, alunos } = req.body;

    const turma = new Turma({ serie, idProfessor, alunos });
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



// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
