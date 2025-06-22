import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nome: String,
    email: String,
    senha: String,
    tipo: String, // 'professor' ou 'aluno'
    cpf: String,
    matricula: String // só para alunos
}, { collection: 'usuario' });

const Usuario = mongoose.model('Usuario', userSchema);

export default Usuario;
