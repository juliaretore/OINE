<script>
    import { onMount } from 'svelte';
    import { link } from "svelte-routing";
    import { carregarQuestao, simplificarFracao, carregarTurma } from '../controllers/QuestoesDiariasController.js';

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    let questao = null;
    let soma = [];
    let sub = [];
    let mult = [];
    let div = [];

    onMount(async () => {
        questao = await carregarQuestao();
        if (questao) {
            iniciarRespostas();
        }
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
              respNum: simplificarFracao(questao.divNumeradores[1] * questao.divDenominadores[2], questao.divDenominadores[1] * questao.divNumeradores[2]).num,  // Corrigido aqui
              respDen: simplificarFracao(questao.divNumeradores[1] * questao.divDenominadores[2], questao.divDenominadores[1] * questao.divNumeradores[2]).den   // Corrigido aqui
            }
        ];
    }
</script>
<header class="app-header">
    <div class="logo-container">
        <a href="/" use:link>
            <img src="/images/fracionando.png" alt="Logo Fracionando" class="logo" />
        </a>
    </div>
    
    <div class="nav-options">
        <a href="/home-professor" use:link>Home</a>
        <a href="/desafios-diarios" use:link class="active">Desafios Diários</a>
        <a href="/dashboard" use:link>Dashboard</a>
        <button class="btn-sair">Sair</button>
    </div>
</header>

<div class="container">
    <div class="content">
        
        {#if questao}
            <div class="operacoes-grid">
                <!-- Linha 1: Soma e Subtração -->
                <div class="operacao-col">
                    <h2 class="operacao-title">Adição</h2>
                    {#each soma as r}
                        <div class="questao-item">
                            <div class="linha-completa">
                                <div class="operacao-container">
                                    <div class="fracao-display">
                                        <div class="fracao-num-den">{r.num1}</div>
                                        <div class="fracao-line"></div>
                                        <div class="fracao-num-den">{r.den1}</div>
                                    </div>
                                    <span class="operador">+</span>
                                    <div class="fracao-display">
                                        <div class="fracao-num-den">{r.num2}</div>
                                        <div class="fracao-line"></div>
                                        <div class="fracao-num-den">{r.den2}</div>
                                    </div>
                                    <span class="operador">=</span>
                                    <div class="fracao-display">
                                        <input class="fracao-num-den resposta" bind:value={r.respNum} readonly/>
                                        <div class="fracao-line"></div>
                                        <input class="fracao-num-den resposta" bind:value={r.respDen} readonly/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="operacao-col">
                    <h2 class="operacao-title">Subtração</h2>
                    {#each sub as r}
                        <div class="questao-item">
                            <div class="linha-completa">
                                <div class="operacao-container">
                                    <div class="fracao-display">
                                        <div class="fracao-num-den">{r.num1}</div>
                                        <div class="fracao-line"></div>
                                        <div class="fracao-num-den">{r.den1}</div>
                                    </div>
                                    <span class="operador">-</span>
                                    <div class="fracao-display">
                                        <div class="fracao-num-den">{r.num2}</div>
                                        <div class="fracao-line"></div>
                                        <div class="fracao-num-den">{r.den2}</div>
                                    </div>
                                    <span class="operador">=</span>
                                    <div class="fracao-display">
                                        <input class="fracao-num-den resposta" bind:value={r.respNum} readonly/>
                                        <div class="fracao-line"></div>
                                        <input class="fracao-num-den resposta" bind:value={r.respDen} readonly/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Linha 2: Multiplicação e Divisão -->
                <div class="operacao-col">
                    <h2 class="operacao-title">Multiplicação</h2>
                    {#each mult as r}
                        <div class="questao-item">
                            <div class="linha-completa">
                                <div class="operacao-container">
                                    <div class="fracao-display">
                                        <div class="fracao-num-den">{r.num1}</div>
                                        <div class="fracao-line"></div>
                                        <div class="fracao-num-den">{r.den1}</div>
                                    </div>
                                    <span class="operador">×</span>
                                    <div class="fracao-display">
                                        <div class="fracao-num-den">{r.num2}</div>
                                        <div class="fracao-line"></div>
                                        <div class="fracao-num-den">{r.den2}</div>
                                    </div>
                                    <span class="operador">=</span>
                                    <div class="fracao-display">
                                        <input class="fracao-num-den resposta" bind:value={r.respNum} readonly/>
                                        <div class="fracao-line"></div>
                                        <input class="fracao-num-den resposta" bind:value={r.respDen} readonly/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="operacao-col">
                    <h2 class="operacao-title">Divisão</h2>
                    {#each div as r}
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
                                    <div class="fracao-display">
                                        <input class="fracao-num-den resposta" bind:value={r.respNum} readonly/>
                                        <div class="fracao-line"></div>
                                        <input class="fracao-num-den resposta" bind:value={r.respDen} readonly/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <p>Carregando questões...</p>
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
        min-width: 100vw;
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

    .operacoes-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        width: 100%;
        max-width: 1000px;
        align-items: stretch;
    }


    .operacao-title {
        color: #303030;
        font-size: 1.5rem;
        margin: 0 0 1rem;
        text-align: center;
    }

    .questao-item {
        margin-bottom: 30px;
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .linha-completa {
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: 10px;
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

    .fracao-display input.resposta {
        background: transparent;
        border: none;
        text-align: center;
        font-weight: bold;
        color: #303030;
        font-size: 1.8rem;
        width: 60px;
        pointer-events: none;
    }

    @media (max-width: 768px) {
        .operacoes-grid {
            grid-template-columns: 1fr;
        }
        
        .content {
            margin-top: 20px;
        }
        
        .fracao-num-den {
            font-size: 1.2rem;
            width: 40px;
        }
        
        .fracao-line {
            width: 40px;
        }
        
        .fracao-display input.resposta {
            font-size: 1.2rem;
            width: 40px;
        }
    }
</style>