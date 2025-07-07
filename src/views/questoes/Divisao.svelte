<script>
    import { onMount } from 'svelte';
    import { link } from "svelte-routing";
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
        tentativas = await carregarTentativas(4, usuarioLogado, questao);
        todasAsTentativas = await carregarTentativasPorUsuarioTipo(4, usuarioLogado);
        concluido = tentativas.filter(t => t.acertos === 3).length > 0;
        iniciarRespostas();
    });

    $: console.log('Resultados atualizados:', resultados);
    $: console.log('Concluído:', concluido);

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

    async function conferir() {
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
        if(acertos === 3) {
            await salvarTentativa(acertos, 4, questao, usuarioLogado);
            tentativas = await carregarTentativas(4, usuarioLogado, questao);
            todasAsTentativas = await carregarTentativasPorUsuarioTipo(4, usuarioLogado);
            await tick(); 
            concluido = true;
        } else {
            await salvarTentativa(acertos, 4, questao, usuarioLogado);
            tentativas = [...tentativas, {acertos}];
        }
        resultados = [...resultados];
    }
</script>

<header class="app-header">
    <div class="logo-container">
        <a href="/" use:link>
            <img src="/images/fracionando.png" alt="Logo Fracionando" class="logo" />
        </a>
    </div>
    
    <div class="nav-options">
        <a href="/home-aluno" use:link>Home</a>
        <a href="/adicao" use:link>Adição</a>
        <a href="/subtracao" use:link>Subtração</a>
        <a href="/multiplicacao" use:link>Multiplicação</a>
        <a href="/divisao" use:link class="active">Divisão</a>
        <button class="btn-sair">Sair</button>
    </div>
</header>

<div class="container">

    <div class="info-boxes">
        {#if turma}
            <div class="info-oval turma-oval">
                Turma: {turma.nome}
            </div>
        {/if}
        
        <div class="info-oval tentativas-oval">
            Tentativas: {tentativas.length}
        </div>
    </div>

    <div class="content">
        {#if concluido}
        <Feedback 
            {tentativas} 
            {todasAsTentativas} 
            onClose={() => concluido = false}
        />
        {:else}
            <div class="questao-container">
                {#each resultados as r, index}
                    <div class="questao-item">
                        <div class="linha-completa">

                            <div class="operacao-container">

                                <div class="fracao-display">
                                    <div class="fracao-num-den">{r.num1}</div>
                                    <div class="fracao-line"></div>
                                    <div class="fracao-num-den">{r.den1}</div>
                                </div>
                                
                                <span class="operador">÷</span>
                                
                                <div class="fracao-display">
                                    <div class="fracao-num-den">{r.num2}</div>
                                    <div class="fracao-line"></div>
                                    <div class="fracao-num-den">{r.den2}</div>
                                </div>
                                
                                <span class="operador">=</span>
                                
                                <div class="resposta-container">
                                    <div class="fracao-input">
                                        <input
                                            type="number"
                                            bind:value={r.respNum}
                                            placeholder=""
                                            class:correto={r.correto === true}
                                            class:incorreto={r.correto === false}
                                        />
                                        <div class="fracao-line"></div>
                                        <input
                                            type="number"
                                            bind:value={r.respDen}
                                            placeholder=""
                                            class:correto={r.correto === true}
                                            class:incorreto={r.correto === false}
                                        />
                                    </div>
                                    
                                    {#if r.correto === true}
                                        <span class="feedback-icon">✅</span>
                                    {:else if r.correto === false}
                                        <span class="feedback-icon">❌</span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
                
                <div class="btn-container">
                    <button 
                        class="btn-tentar" 
                        on:click={conferir}
                        disabled={concluido || tentativas.some(t => t.acertos === 3)}
                    >
                        {concluido ? 'Concluído!' : 'Tentar'}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    :global(body, html) {
        background-color: #EBF4F2;
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
    }

    .home-container {
        background-color: transparent; 
    }

    .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .logo-container {
        display: flex;
        align-items: center;
    }

    .logo {
        height: 50px;
    }

    .nav-options {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .nav-options a {
        color: #303030;
        text-decoration: none;
        font-weight: 600;
        font-size: 1.1rem;
        padding: 0.5rem 0;
        position: relative;
        font-family: 'Baloo 2', sans-serif;
        cursor: pointer;
    }

    .nav-options a.active {
        color: #67B8F0;
    }

    .nav-options a.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #67B8F0;
    }

    .nav-options a:hover {
        color: #67B8F0;
    }

    .btn-sair {
        padding: 0.5rem 1.5rem;
        background-color: #67B8F0;
        color: white;
        border: none;
        border-radius: 20px;
        font-family: 'Baloo 2', sans-serif;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-sair:hover {
        background-color: #5aa8e0;
    }

    .container {
        position: relative;
        width: 100%;
        margin: 0 auto;
        padding: 0;
        background-color: #EBF4F2;
        display: flex;
        flex-direction: column;
        align-items: center;
    }  

    .content {
        width: 100%;
        max-width: 100vw; 
        padding: 20px;
        margin-top: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden; 
    }

    .questao-container {
        width: 100%;
        max-width: 600px;
        padding: 40px;
        box-sizing: border-box;
        margin: 0 auto;
    }

    .questao-item {
        margin-bottom: 40px;
        width: 100%;
    }

    .linha-completa {
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: 15px;
    }

    .operacao-container {
        display: flex;
        align-items: center;
        justify-content: center; 
        flex-grow: 1;
    }

    .fracao-display {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .fracao-num-den {
        font-size: 1.8rem;
        text-align: center;
        width: 60px;
    }

    .fracao-line {
        width: 60px;
        height: 2px;
        background-color: #303030;
        margin: 5px 0;
    }

    .operador {
        font-size: 1.8rem;
        margin: 0 10px;
    }

    .resposta-container {
        display: flex;
        align-items: center;
        margin-left: 20px;
    }

    .fracao-input input {
        max-width: 100%;
        box-sizing: border-box;
    }

    input {
        width: 60px;
        padding: 8px;
        border: 2px solid #ccc;
        border-radius: 6px;
        text-align: center;
        font-size: 1.2em;
        transition: all 0.3s;
    }

    input:focus {
        outline: none;
        border-color: #67B8F0;
        box-shadow: 0 0 5px rgba(103, 184, 240, 0.5);
    }

    input.correto {
        border-color: #70CF97;
        background-color: #E8F5E9;
    }

    input.incorreto {
        border-color: #F8B4B4;
        background-color: #FFEBEE;
    }

    .feedback-icon {
        margin-left: 15px;
        font-size: 1.5em;
    }

    .btn-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .btn-tentar {
        padding: 12px 30px;
        background-color: #67B8F0;
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
    }

    .btn-tentar:hover {
        background-color: #5aa8e0;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .info-boxes {
        position: absolute;
        top: 50px;
        left: 50px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 10;
    }

    .info-oval {
        background-color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 20px;
        font-weight: 600;
        color: #5B5C65;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: inline-block;
        margin-bottom: 1.5rem;
        float: right;
    }
    
    .turma-oval {
        background-color: white;
    }

    .tentativas-oval {
        background-color: white;
    }

    * {
        box-sizing: border-box;
        max-width: 100%;
    }
    @media (max-width: 768px) {
        .info-boxes {
            flex-direction: row;
            top: 5px;
            right: 10px;
        }
        
        .info-oval {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        
        .content {
            margin-top: 70px;
        }
    }
</style>