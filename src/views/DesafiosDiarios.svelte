<script>
    import { onMount } from 'svelte';
    import { carregarQuestao,  simplificarFracao } from '../controllers/QuestoesDiariasController.js';

    let questao = null;
    let soma = [];
    let sub = [];
    let mult = [];
    let div = [];

    onMount(async () => {
        questao = await carregarQuestao();
        iniciarRespostas();
    });


    function iniciarRespostas() {
        
        soma = [
            { num1: questao.somaNumeradores[0], den1: questao.somaDenominadores[0],
              num2: questao.somaNumeradores[1], den2: questao.somaDenominadores[1],
              respNum: simplificarFracao( questao.somaNumeradores[0] * questao.somaDenominadores[1] + questao.somaNumeradores[1] * questao.somaDenominadores[0], questao.somaDenominadores[0] * questao.somaDenominadores[1]).num,
              respDen: simplificarFracao( questao.somaNumeradores[0] * questao.somaDenominadores[1] + questao.somaNumeradores[1] * questao.somaDenominadores[0], questao.somaDenominadores[0] * questao.somaDenominadores[1]).den
            },

            { num1: questao.somaNumeradores[2], den1: questao.somaDenominadores[2],
              num2: questao.somaNumeradores[0], den2: questao.somaDenominadores[0],
              respNum: simplificarFracao( questao.somaNumeradores[2] * questao.somaDenominadores[0] + questao.somaNumeradores[0] * questao.somaDenominadores[2],  questao.somaDenominadores[2] * questao.somaDenominadores[0]).num,
              respDen: simplificarFracao( questao.somaNumeradores[2] * questao.somaDenominadores[0] + questao.somaNumeradores[0] * questao.somaDenominadores[2],  questao.somaDenominadores[2] * questao.somaDenominadores[0]).den
            },

            { num1: questao.somaNumeradores[1], den1: questao.somaDenominadores[1],
              num2: questao.somaNumeradores[2], den2: questao.somaDenominadores[2],
              respNum: simplificarFracao( questao.somaNumeradores[1] * questao.somaDenominadores[2] + questao.somaNumeradores[2] * questao.somaDenominadores[1], questao.somaDenominadores[1] * questao.somaDenominadores[2]).num,
              respDen: simplificarFracao( questao.somaNumeradores[1] * questao.somaDenominadores[2] + questao.somaNumeradores[2] * questao.somaDenominadores[1], questao.somaDenominadores[1] * questao.somaDenominadores[2]).den
            }
        ];

        sub = [
            { num1: questao.subNumeradores[0], den1: questao.subDenominadores[0],
              num2: questao.subNumeradores[1], den2: questao.subDenominadores[1],
              respNum: simplificarFracao(questao.subNumeradores[0] * questao.subDenominadores[1] - questao.subNumeradores[1] * questao.subDenominadores[0],  questao.subDenominadores[0] * questao.subDenominadores[1]).num,
              respDen: simplificarFracao(questao.subNumeradores[0] * questao.subDenominadores[1] - questao.subNumeradores[1] * questao.subDenominadores[0],  questao.subDenominadores[0] * questao.subDenominadores[1]).den},
            
              { num1: questao.subNumeradores[2], den1: questao.subDenominadores[2],
              num2: questao.subNumeradores[0], den2: questao.subDenominadores[0],
              respNum: simplificarFracao(questao.subNumeradores[2] * questao.subDenominadores[0] - questao.subNumeradores[0] * questao.subDenominadores[2],  questao.subDenominadores[2] * questao.subDenominadores[0]).num,
              respDen: simplificarFracao(questao.subNumeradores[2] * questao.subDenominadores[0] - questao.subNumeradores[0] * questao.subDenominadores[2],  questao.subDenominadores[2] * questao.subDenominadores[0]).den
            },

            { num1: questao.subNumeradores[1], den1: questao.subDenominadores[1],
              num2: questao.subNumeradores[2], den2: questao.subDenominadores[2],
              respNum: simplificarFracao(questao.subNumeradores[1] * questao.subDenominadores[2] - questao.subNumeradores[2] * questao.subDenominadores[1], questao.subDenominadores[1] * questao.subDenominadores[2]).num,
              respDen: simplificarFracao(questao.subNumeradores[1] * questao.subDenominadores[2] - questao.subNumeradores[2] * questao.subDenominadores[1], questao.subDenominadores[1] * questao.subDenominadores[2]).den
            }
        ];

        mult = [
            { num1: questao.multNumeradores[0], den1: questao.multDenominadores[0],
              num2: questao.multNumeradores[1], den2: questao.multDenominadores[1],
              respNum: simplificarFracao(questao.multNumeradores[0] * questao.multNumeradores[1], questao.multDenominadores[0] * questao.multDenominadores[1]).num,
              respDen: simplificarFracao(questao.multNumeradores[0] * questao.multNumeradores[1], questao.multDenominadores[0] * questao.multDenominadores[1]).den
            },

            { num1: questao.multNumeradores[2], den1: questao.multDenominadores[2],
              num2: questao.multNumeradores[0], den2: questao.multDenominadores[0],
              respNum: simplificarFracao(questao.multNumeradores[2] * questao.multNumeradores[0], questao.multDenominadores[2] * questao.multDenominadores[0]).num,
              respDen: simplificarFracao(questao.multNumeradores[2] * questao.multNumeradores[0], questao.multDenominadores[2] * questao.multDenominadores[0]).den
            },

            { num1: questao.multNumeradores[1], den1: questao.multDenominadores[1],
              num2: questao.multNumeradores[2], den2: questao.multDenominadores[2],
              respNum: simplificarFracao(questao.multNumeradores[1] * questao.multNumeradores[2], questao.multDenominadores[1] * questao.multDenominadores[2]).num,
              respDen: simplificarFracao(questao.multNumeradores[1] * questao.multNumeradores[2], questao.multDenominadores[1] * questao.multDenominadores[2]).den
            }
        ];

        div = [
            { num1: questao.divNumeradores[0], den1: questao.divDenominadores[0],
              num2: questao.divNumeradores[1], den2: questao.divDenominadores[1],
              respNum: simplificarFracao(questao.divNumeradores[0] * questao.divDenominadores[1], questao.divDenominadores[0] * questao.divNumeradores[1]).num,
              respDen: simplificarFracao(questao.divNumeradores[0] * questao.divDenominadores[1], questao.divDenominadores[0] * questao.divNumeradores[1]).den
            },

            { num1: questao.divNumeradores[2], den1: questao.divDenominadores[2],
              num2: questao.divNumeradores[0], den2: questao.divDenominadores[0],
              respNum: simplificarFracao(questao.divNumeradores[2] * questao.divDenominadores[0], questao.divDenominadores[2] * questao.divNumeradores[0]).num,
              respDen: simplificarFracao(questao.divNumeradores[2] * questao.divDenominadores[0], questao.divDenominadores[2] * questao.divNumeradores[0]).den
            },

            { num1: questao.divNumeradores[1], den1: questao.divDenominadores[1],
              num2: questao.divNumeradores[2], den2: questao.divDenominadores[2],
              respNum: simplificarFracao(questao.divNumeradores[1] * questao.divDenominadores[2], questao.divDenominadores[1] * questao.divDenominadores[2]).num,
              respDen: simplificarFracao(questao.divNumeradores[1] * questao.divDenominadores[2], questao.divDenominadores[1] * questao.divDenominadores[2]).den
            }
        ];
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
</style>


<h1>Desafios Diários</h1>
{#if soma.length > 0}
<p>Soma:</p>
{#each soma as r}
    <div class="questao">
        <p>{r.num1} / {r.den1} + {r.num2} / {r.den2} =</p>
        <div class="resposta">
            <input bind:value={r.respNum}/>
            <span>/</span>
            <input bind:value={r.respDen}/>
        </div>
    </div>
{/each}

<p>Subtração:</p>
{#each sub as r}
    <div class="questao">
        <p>{r.num1} / {r.den1} - {r.num2} / {r.den2} =</p>
        <div class="resposta">
            <input bind:value={r.respNum}/>
            <span>/</span>
            <input bind:value={r.respDen}/>
        </div>
    </div>
{/each}

<p>Multiplicação:</p>
{#each mult as r}
    <div class="questao">
        <p>{r.num1} / {r.den1} * {r.num2} / {r.den2} =</p>
        <div class="resposta">
            <input bind:value={r.respNum}/>
            <span>/</span>
            <input bind:value={r.respDen}/>
        </div>
    </div>
{/each}

<p>Divisão:</p>
{#each div as r}
    <div class="questao">
        <p>{r.num1} / {r.den1} ÷ {r.num2} / {r.den2} =</p>
        <div class="resposta">
            <input bind:value={r.respNum}/>
            <span>/</span>
            <input bind:value={r.respDen}/>
        </div>
    </div>
{/each}

{/if}