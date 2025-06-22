
<script>
    import { onMount } from 'svelte';
    import {simplificarFracao, carregarTurma, carregarQuestao, carregarTentativas, salvarTentativa, carregarTentativasPorUsuarioTipo } from '../../controllers/QuestoesDiariasController.js';
    import Feedback from './Feedback.svelte';

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    let turma = null;
    let questao = null;
    let tentativas = [];
    let resultados = [];
    let todasAsTentativas = [];
    let concluido = false;

    onMount(async () => {
        turma = await carregarTurma(usuarioLogado);
        questao = await carregarQuestao();
        tentativas = await carregarTentativas(2, usuarioLogado, questao);
        todasAsTentativas = await carregarTentativasPorUsuarioTipo(2, usuarioLogado);
        concluido = tentativas.filter(t => t.acertos === 3).length > 0;
        iniciarRespostas();
    });

    function iniciarRespostas() {
        resultados = [
            { num1: questao.subNumeradores[0], den1: questao.subDenominadores[0],
              num2: questao.subNumeradores[1], den2: questao.subDenominadores[1],
              respNum: '', respDen: '', correto: null },

            { num1: questao.subNumeradores[2], den1: questao.subDenominadores[2],
              num2: questao.subNumeradores[0], den2: questao.subDenominadores[0],
              respNum: '', respDen: '', correto: null },

            { num1: questao.subNumeradores[1], den1: questao.subDenominadores[1],
              num2: questao.subNumeradores[2], den2: questao.subDenominadores[2],
              respNum: '', respDen: '', correto: null }
        ];
    }

    function conferir() {
        resultados.forEach(r => {
            const resultadoNum = r.num1 * r.den2 - r.num2 * r.den1;
            const resultadoDen = r.den1 * r.den2;

            const resultadoSimplificado = simplificarFracao(resultadoNum, resultadoDen);
            const respostaSimplificada = simplificarFracao(Number(r.respNum), Number(r.respDen));

            r.correto = (
                respostaSimplificada.num === resultadoSimplificado.num &&
                respostaSimplificada.den === resultadoSimplificado.den
            );
        });

        const acertos = resultados.filter(r => r.correto).length;
        if(acertos === 3)  concluido = true;
        salvarTentativa(acertos, 2, questao, usuarioLogado);
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
    <p>Tentativas: {tentativas.length}</p>
</div>

{#if concluido}
     <Feedback {tentativas} {todasAsTentativas} />
{:else}
    {#each resultados as r, index}
        <div class="questao">
            <p>{r.num1}/{r.den1} - {r.num2}/{r.den2} =</p>
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
{/if}
