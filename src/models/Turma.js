import mongoose from 'mongoose';

const turmaSchema = new mongoose.Schema({
    serie: Number,
    idProfessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    alunos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    nome: String
}, { collection: 'turma' });
export const Turma = mongoose.model("Turma", turmaSchema);

export default Turma;
