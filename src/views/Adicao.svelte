<script>
    import { onMount } from 'svelte';
    import simplificarFracao, {carregarTurma, carregarQuestao, carregarTentativas, salvarTentativa } from '../controllers/QuestoesDiariasController.js';

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    let turma = null;
    let questao = null;
    let tentativas = 0;
    let resultados = [];

    onMount(async () => {
        turma = await carregarTurma(usuarioLogado);
        questao = await carregarQuestao();
        tentativas = await carregarTentativas(1, usuarioLogado, questao);
        iniciarRespostas();
    });

    function iniciarRespostas() {
        resultados = [
            { num1: questao.somaNumeradores[0], den1: questao.somaDenominadores[0],
              num2: questao.somaNumeradores[1], den2: questao.somaDenominadores[1],
              respNum: '', respDen: '', correto: null },

            { num1: questao.somaNumeradores[2], den1: questao.somaDenominadores[2],
              num2: questao.somaNumeradores[0], den2: questao.somaDenominadores[0],
              respNum: '', respDen: '', correto: null },

            { num1: questao.somaNumeradores[1], den1: questao.somaDenominadores[1],
              num2: questao.somaNumeradores[2], den2: questao.somaDenominadores[2],
              respNum: '', respDen: '', correto: null }
        ];
    }

    function conferir() {
        resultados.forEach(r => {
            const resultadoNum = r.num1 * r.den2 + r.num2 * r.den1;
            const resultadoDen = r.den1 * r.den2;

            const resultadoSimplificado = simplificarFracao(resultadoNum, resultadoDen);
            const respostaSimplificada = simplificarFracao(Number(r.respNum), Number(r.respDen));

            r.correto = (
                respostaSimplificada.num === resultadoSimplificado.num &&
                respostaSimplificada.den === resultadoSimplificado.den
            );
        });
        const acertos = resultados.filter(r => r.correto).length;
        salvarTentativa(acertos, 1, questao, usuarioLogado);
        tentativas += 1;
        resultados = [...resultados];
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
        <p>{r.num1} / {r.den1} + {r.num2} / {r.den2} =</p>
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


<div>
    <button on:click={conferir}>Tentar</button>
</div>
