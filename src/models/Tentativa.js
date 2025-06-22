import mongoose from 'mongoose';

const tentativaSchema = new mongoose.Schema({
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    questaoDiaria: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestaoDiaria' },
    acertos: Number,
    dataHora: Date,
    tipo: Number // tipo de tentativa, se quiser categorizar
}, { collection: 'tentativa' });
export const Tentativa = mongoose.model("Tentativa", tentativaSchema);
export default Tentativa;