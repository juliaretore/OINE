import mongoose from 'mongoose';

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

export default QuestaoDiaria;
