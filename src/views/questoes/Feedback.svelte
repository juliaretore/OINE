<script>
import { onMount } from 'svelte';

let tempoRestante = '';
export let tentativas = [];
export let todasAsTentativas = [];
let sequenciaAtual = 0;
let vitoriasPorQuestao = [];
let maiorSequencia = 0;

function atualizarCronometro() {
    const agora = new Date();
    const proximoDia = new Date();
    proximoDia.setHours(24, 0, 0, 0);

    const diff = proximoDia - agora;

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    tempoRestante = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

setInterval(atualizarCronometro, 1000);
onMount(() => {
    atualizarCronometro();
    calcularSequenciasDeVitorias();
});
$:console.log('Tentativas:', tentativas);
$:console.log('Todas as tentativas:', todasAsTentativas);



$: if (todasAsTentativas.length > 0) calcularSequenciasDeVitorias();

function calcularSequenciasDeVitorias() {
    console.log('calcularSequenciasDeVitorias');
    // Agrupar tentativas por questaoDiaria
    const agrupado = {};
    for (const tentativa of todasAsTentativas) {
        const qid = tentativa.questaoDiaria._id;
        if (!agrupado[qid]) agrupado[qid] = [];
        agrupado[qid].push(tentativa);
    }

    console.log("agrupado: ", agrupado);

    const resultados = [];
    for (const [questaoId, tentativasDaQuestao] of Object.entries(agrupado)) {
        let venceu = false;
        for (const tentativa of tentativasDaQuestao)
            if (tentativa.acertos === 3) venceu = true;

        const dataMaisRecente = Math.max( ...tentativasDaQuestao.map(t => new Date(t.dataHora).getTime()));
        resultados.push({questaoId, venceu, data: dataMaisRecente});
    }

    console.log(resultados)

    resultados.sort((a, b) => a.data - b.data);
    vitoriasPorQuestao = resultados;
    // Calcular maior sequência histórica
    let atual = 0;
    let max = 0;

    for (const resultado of resultados) {
        if (resultado.venceu) {
            atual++;
            if (atual > max) max = atual;
        } else atual = 0;
    }
    maiorSequencia = max;
    // Calcular sequência atual (do fim para o começo)
    sequenciaAtual = 0;
    for (let i = resultados.length - 1; i >= 0; i--) {
        if (resultados[i].venceu) {
            sequenciaAtual++;
        } else break;
    }
}

</script>

<div class="resumo">
    <h2>✅ Desafio concluído!</h2>
    <p>Quantidade de tentativas realizadas hoje para essa operação: {tentativas.length}</p>
    <p>Sequência atual de vitórias para essa operação: {sequenciaAtual}</p>
    <p>Melhor sequência para essa operação: {maiorSequencia}</p>
    <p>Próximo jogo em: {tempoRestante}</p>
</div>
