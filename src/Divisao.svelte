<script>
    import { onMount } from 'svelte';

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    let turma = null;
    let questao = null;

    let tentativas = 0;
    let resultados = [];

    onMount(async () => {
        await carregarTurma();
        await carregarQuestao();
        await carregarTentativas();
        iniciarRespostas();
    });

    async function carregarTurma() {
        const res = await fetch(`http://localhost:3000/api/turma-do-usuario/${usuarioLogado._id}`);
        turma = await res.json();
    }

    async function carregarQuestao() {
        const res = await fetch('http://localhost:3000/api/questaoDiaria');
        const questoes = await res.json();
        questao = questoes[questoes.length - 1];
    }

    function iniciarRespostas() {
        resultados = [
            { num1: questao.divNumeradores[0], den1: questao.divDenominadores[0],
              num2: questao.divNumeradores[1], den2: questao.divDenominadores[1],
              respNum: '', respDen: '', correto: null },

            { num1: questao.divNumeradores[2], den1: questao.divDenominadores[2],
              num2: questao.divNumeradores[0], den2: questao.divDenominadores[0],
              respNum: '', respDen: '', correto: null },

            { num1: questao.divNumeradores[1], den1: questao.divDenominadores[1],
              num2: questao.divNumeradores[2], den2: questao.divDenominadores[2],
              respNum: '', respDen: '', correto: null }
        ];
    }

    function simplificarFracao(numerador, denominador) {
        const mdc = (a, b) => b === 0 ? a : mdc(b, a % b);
        const divisor = mdc(Math.abs(numerador), Math.abs(denominador));

        return {
            num: numerador / divisor,
            den: denominador / divisor
        };
    }

    function conferir() {
        resultados.forEach(r => {
            const resultadoNum = r.num1 * r.den2;
            const resultadoDen = r.den1 * r.num2;

            const resultadoSimplificado = simplificarFracao(resultadoNum, resultadoDen);
            const respostaSimplificada = simplificarFracao(Number(r.respNum), Number(r.respDen));

            r.correto = (
                respostaSimplificada.num === resultadoSimplificado.num &&
                respostaSimplificada.den === resultadoSimplificado.den
            );
        });

        const acertos = resultados.filter(r => r.correto).length;
        salvarTentativa(acertos);
        tentativas += 1;
        resultados = [...resultados];
    }


    async function salvarTentativa(acertos) {
        await fetch('http://localhost:3000/api/tentativa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aluno: usuarioLogado._id,
                questaoDiaria: questao._id,
                acertos: acertos,
                dataHora: new Date(),
                tipo: 4
            })
        });
    }
    async function carregarTentativas() {
        const res = await fetch(`http://localhost:3000/api/tentativas?aluno=${usuarioLogado._id}&questao=${questao._id}`);
        const todas = await res.json();
        tentativas = todas.filter(t => t.tipo === 4).length;
    }
</script>
<style>
   input {
        width: 60px;
        padding: 8px;
        border: 2px solid #ccc;
        border-radius: 6px;
        text-align: center;
        font-size: 1.2em;
        transition: border-color 0.3s, background-color 0.3s;
    }

    input:focus {
        outline: none;
        border-color: #2196F3;
        background-color: #e3f2fd;
    }

    input.r-correto {
        border-color: #4CAF50;
        background-color: #e8f5e9;
    }

    input.r-incorreto {
        border-color: #F44336;
        background-color: #ffebee;
    }
</style>

<div>
    <p>Turma: {turma ? turma.nome : 'Carregando...'}</p>
    <p>Tentativas: {tentativas}</p>
</div>

    {#each resultados as r, index}
    <div class="questao">
        <p>{r.num1}/{r.den1} ÷ {r.num2}/{r.den2} =</p>
        <div class="resposta">
            <input 
                type="number" 
                bind:value={r.respNum} 
                placeholder="Numerador"
                class:r-correto={r.correto == true}
                class:r-incorreto={r.correto == false}
            />
            <span>/</span>
            <input 
                type="number" 
                bind:value={r.respDen} 
                placeholder="Denominador"
                class:r-correto={r.correto == true}
                class:r-incorreto={r.correto == false}
            />
            {#if r.correto == true}
                ✅
            {:else if r.correto == false}
                ❌
            {/if}
        </div>
    </div>
{/each}


<button on:click={conferir}>Conferir Respostas</button>
