<script>
    import { onMount } from 'svelte';

    export async function fetchTentativas(alunoId) {
        const response = await fetch(`http://localhost:3000/api/tentativas?aluno=${alunoId}`);
        if (!response.ok) throw new Error('Erro ao buscar tentativas');
        return await response.json();
    }

    export async function fetchTurmaDoUsuario(alunoId) {
        const response = await fetch(`http://localhost:3000/api/turma-do-usuario/${alunoId}`);
        if (!response.ok) throw new Error('Erro ao buscar turma');
        return await response.json();
    }


    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    let tentativas = [];
    let quantidadeJogos = 0;
    let turma = null;
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let vitoriasPorQuestao = []; // Para debug ou exibir

    onMount(async () => {
        if (usuarioLogado && usuarioLogado._id){
            turma = await fetchTurmaDoUsuario(usuarioLogado._id);
            console.log(turma);
            tentativas = await fetchTentativas(usuarioLogado._id);
            tentativas.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
            quantidadeJogos = tentativas.filter((tentativa, index, self) => {return index === self.findIndex(t =>  t.questaoDiaria === tentativa.questaoDiaria && t.tipo === tentativa.tipo);}).length;
            calcularSequenciasDeVitorias();
        }
    });

    function calcularSequenciasDeVitorias() {
        // Agrupar tentativas por questaoDiaria
        const agrupado = {};
        for (const tentativa of tentativas) {
            const qid = tentativa.questaoDiaria._id;
            if (!agrupado[qid]) agrupado[qid] = [];
            agrupado[qid].push(tentativa);
        }

        const resultados = [];
        for (const [questaoId, tentativasDaQuestao] of Object.entries(agrupado)) {
            const tiposComSucesso = new Set();
            for (const tentativa of tentativasDaQuestao)
                if (tentativa.acertos === 3) tiposComSucesso.add(tentativa.tipo);

            const venceu = [1, 2, 3, 4].every(tipo => tiposComSucesso.has(tipo));
            const dataMaisRecente = Math.max(
                ...tentativasDaQuestao.map(t => new Date(t.dataHora).getTime())
            );

            resultados.push({
                questaoId,
                venceu,
                data: dataMaisRecente
            });
        }

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

    function avaliarStatusDoDia(questaoId) {
        const tentativasDoDia = tentativas.filter(t => t.questaoDiaria._id === questaoId);
        const tentativasPorTipo = {};

        for (const tentativa of tentativasDoDia) {
            if (!tentativasPorTipo[tentativa.tipo]) tentativasPorTipo[tentativa.tipo] = [];
            tentativasPorTipo[tentativa.tipo].push(tentativa);
        }
        const tipos = [1, 2, 3, 4];
        const todosTemUmaTentativaPerfeita = tipos.every(tipo => {
            return tentativasPorTipo[tipo]?.some(t => t.acertos === 3);
        });

        if (!todosTemUmaTentativaPerfeita) return "incompleto";
        const todosFizeramUmaTentativaPerfeitaDireta = tipos.every(tipo => {
            const tentativas = tentativasPorTipo[tipo] || [];
            return (tentativas.length === 1 && tentativas[0].acertos === 3);
        });

        if (todosFizeramUmaTentativaPerfeitaDireta) return "concluido com unica tentativa";
        return "concluido";
    }
    $: statusPorQuestao = vitoriasPorQuestao.map(q => ({
        questaoId: q.questaoId,
        data: new Date(q.data),
        status: avaliarStatusDoDia(q.questaoId)
    }));
</script>


<style>
    /* Estilos para a página do aluno */
    h1 {
        color: #333;
        font-size: 2em;
    }
    p {
        font-size: 1.2em;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        margin: 10px 0;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 5px;
    }
</style>

<div>
        <h1>Olá, {usuarioLogado.nome}</h1>
        <p>Turma: {turma ? turma.nome : "Não matriculado em nenhuma turma"}</p>
        <p>Quantidade de Jogos: {quantidadeJogos}</p>
        <p>Maior Sequência de Jogos: {maiorSequencia}</p>
        <p>Sua Sequência Atual: {sequenciaAtual}</p>
        <!-- <h2>Tentativas Recentes</h2>
        <ul>
            {#each tentativas as tentativa}
                <li>{tentativa.dataHora}: {tentativa.acertos} acertos - tipo {tentativa.tipo}</li>
            {/each}
        </ul> -->
        <h2>Status por Questão</h2>
        <ul>
            {#each statusPorQuestao as q}
                <li> {q.data.toLocaleDateString()}: {q.status}</li>
            {/each}
        </ul>

    </div>