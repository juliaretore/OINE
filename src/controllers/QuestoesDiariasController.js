export default function simplificarFracao(numerador, denominador) {
    const mdc = (a, b) => b === 0 ? a : mdc(b, a % b);
    const divisor = mdc(Math.abs(numerador), Math.abs(denominador));

    return {
        num: numerador / divisor,
        den: denominador / divisor
    };
}

export async function carregarTurma(usuarioLogado) {
    const res = await fetch(`http://localhost:3000/api/turma-do-usuario/${usuarioLogado._id}`);
    return await res.json();
}

export async function carregarQuestao() {
    const res = await fetch('http://localhost:3000/api/questaoDiaria');
    const questoes = await res.json();
    return questoes[questoes.length - 1];
}

export async function carregarTentativas(tipo, usuarioLogado, questao) {
    const res = await fetch(`http://localhost:3000/api/tentativas?aluno=${usuarioLogado._id}&questao=${questao._id}`);
    const todas = await res.json();
    return todas.filter(t => t.tipo === tipo).length;
}

export async function salvarTentativa(acertos, tipo, questao, usuarioLogado) {
    await fetch('http://localhost:3000/api/tentativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            aluno: usuarioLogado._id,
            questaoDiaria: questao._id,
            acertos: acertos,
            dataHora: new Date(),
            tipo: tipo
        })
    });
}