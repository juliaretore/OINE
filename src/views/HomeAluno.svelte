<script>
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { link } from "svelte-routing";

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

    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 + (week1.getDay() + 6) % 7 - 3) / 7);
    }

    function getYearWeekString(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const week = getWeekNumber(d);
        return `${year}-${week.toString().padStart(2, '0')}`;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    let tentativas = [];
    let quantidadeSemanas = 0;
    let turma = null;
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let vitoriasPorSemana = [];

    onMount(async () => {
        if (usuarioLogado && usuarioLogado._id){
            turma = await fetchTurmaDoUsuario(usuarioLogado._id);
            tentativas = await fetchTentativas(usuarioLogado._id);
            tentativas.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
            calcularProgressoSemanal();
        }
    });

    function calcularProgressoSemanal() {
        const tentativasPorSemana = {};
        
        for (const tentativa of tentativas) {
            const semana = getYearWeekString(tentativa.dataHora);
            if (!tentativasPorSemana[semana]) {
                tentativasPorSemana[semana] = [];
            }
            tentativasPorSemana[semana].push(tentativa);
        }

        const resultados = [];
        
        for (const [semana, tentativasDaSemana] of Object.entries(tentativasPorSemana)) {

            const questoesDaSemana = {};
            
            for (const tentativa of tentativasDaSemana) {
                const qid = tentativa.questaoDiaria._id;
                if (!questoesDaSemana[qid]) questoesDaSemana[qid] = [];
                questoesDaSemana[qid].push(tentativa);
            }

            let todasQuestoesCompletas = true;
            let todasQuestoesPerfeitas = true;
            
            for (const [questaoId, tentativasDaQuestao] of Object.entries(questoesDaSemana)) {
                const tiposComSucesso = new Set();
                for (const tentativa of tentativasDaQuestao) {
                    if (tentativa.acertos === 3) tiposComSucesso.add(tentativa.tipo);
                }

                const venceu = [1, 2, 3, 4].every(tipo => tiposComSucesso.has(tipo));
                if (!venceu) {
                    todasQuestoesCompletas = false;
                    todasQuestoesPerfeitas = false;
                    break;
                }

                const perfeito = [1, 2, 3, 4].every(tipo => {
                    const tentativasDoTipo = tentativasDaQuestao.filter(t => t.tipo === tipo);
                    return tentativasDoTipo.length === 1 && tentativasDoTipo[0].acertos === 3;
                });
                
                if (!perfeito) {
                    todasQuestoesPerfeitas = false;
                }
            }

            const dataMaisRecente = Math.max(
                ...tentativasDaSemana.map(t => new Date(t.dataHora).getTime())
            );

            resultados.push({
                semana,
                completou: todasQuestoesCompletas,
                perfeito: todasQuestoesPerfeitas,
                data: dataMaisRecente
            });
        }

        resultados.sort((a, b) => a.data - b.data);
        vitoriasPorSemana = resultados;
        quantidadeSemanas = resultados.length;
        
        let atual = 0;
        let max = 0;

        for (const resultado of resultados) {
            if (resultado.completou) {
                atual++;
                if (atual > max) max = atual;
            } else {
                atual = 0;
            }
        }
        maiorSequencia = max;
        
        sequenciaAtual = 0;
        for (let i = resultados.length - 1; i >= 0; i--) {
            if (resultados[i].completou) {
                sequenciaAtual++;
            } else {
                break;
            }
        }
    }

    function getStatusDoDia(index) {
        const statusOptions = ["", "incompleto", "concluido", "concluido-com-unica-tentativa"];
        return statusOptions[Math.floor(Math.random() * statusOptions.length)];
    }

</script>

<div class="home-container">
    <header class="app-header">
        <div class="logo-container">
            <a href="/" use:link>
                <img src="/images/fracionando.png" alt="Logo Fracionando" class="logo" />
            </a>
        </div>
        
        <div class="nav-options">
            <a href="/home-aluno" use:link class="active">Home</a>
            <a href="/adicao" use:link>Adição</a>
            <a href="/subtracao" use:link>Subtração</a>
            <a href="/multiplicacao" use:link>Multiplicação</a>
            <a href="/divisao" use:link>Divisão</a>
            <button class="btn-sair">Sair</button>
        </div>
    </header>
    
    <main class="main-container">
        {#if turma}
            <div class="turma-info">
                Turma: {turma.nome}
            </div>
        {/if}
        
        <h1 class="page-title">Olá, {usuarioLogado.nome}!</h1>
        
        <div class="content-box">
            <h2 class="section-title">Progresso</h2>
            
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-label">Semanas de Jogo</div>
                    <div class="stat-value">{quantidadeSemanas}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">Sequência de Semanas</div>
                    <div class="stat-value">{sequenciaAtual}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">Maior Sequência</div>
                    <div class="stat-value">{maiorSequencia}</div>
                </div>
            </div>
        </div>
        
        <div class="content-box">
            <h2 class="section-title">Minha Semana</h2>
            
            <div class="jogos-grid">
                {#each Array(7).fill(0) as _, i}
                    <div class="jogo-item {getStatusDoDia(i)}">
                        <span class="jogo-numero">{(i + 1).toString().padStart(2, '0')}</span>
                    </div>
                {/each}
            </div>
            <div class="legenda-container">
                <div class="legenda-item">
                    <div class="legenda-icone concluido"></div>
                    <span class="legenda-texto">Concluído</span>
                </div>
                <div class="legenda-item">
                    <div class="legenda-icone concluido-com-unica-tentativa"></div>
                    <span class="legenda-texto">Concluído em uma única tentativa</span>
                </div>
                <div class="legenda-item">
                    <div class="legenda-icone incompleto"></div>
                    <span class="legenda-texto">Incompleto</span>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    :global(body, html) {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: 'Baloo 2', sans-serif;
    }

    .home-container {
        width: 100%;
        min-height: 100vh;
        background: #EBF4F2;
        display: flex;
        flex-direction: column;
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

    .main-container {
        flex: 1;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        padding: 2rem;
    }

    .turma-info {
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

    .content-box {
        background-color: white;
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        clear: both;
    }

    .page-title {
        color: #303030;
        font-size: 2rem;
        margin: 0 0 1.5rem 0;
        font-weight: 800;
    }

    .section-title {
        color: #5B5C65;
        font-size: 1.5rem;
        margin: 0 0 1rem 0;
        font-weight: 700;
        text-align: center;
    }

    .stats-container {
        display: flex;
        justify-content: space-around;
        margin: 2rem 0;
    }

    .stat-item {
        text-align: center;
    }

    .stat-label {
        color: #5B5C65;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        color: #67B8F0;
        font-size: 2.5rem;
        font-weight: 800;
    }

    .jogos-grid {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 1.5rem;
        flex-wrap: wrap;
    }

    .jogo-item {
        position: relative;
        height: 60px;
        width: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .jogo-item::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2370CF97'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 0;
    }

    .jogo-item.incompleto::before {
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%23F8B4B4'/%3E%3C/svg%3E");
    }

    .jogo-item.concluido-com-unica-tentativa::before {
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2366F0CE'/%3E%3C/svg%3E");
    }

    .jogo-item:hover {
        transform: scale(1.1);
    }

    .jogo-numero {
        position: relative;
        color: white;
        font-weight: 600;
        font-size: 1.1rem;
        text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        z-index: 1;
    }

        .legenda-container {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 2rem;
        flex-wrap: wrap;
    }

    .legenda-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .legenda-icone {
        width: 20px;
        height: 20px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .legenda-icone.concluido {
        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2370CF97'/%3E%3C/svg%3E");
    }

    .legenda-icone.concluido-com-unica-tentativa {
        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2366F0CE'/%3E%3C/svg%3E");
    }

    .legenda-icone.incompleto {
        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%23F8B4B4'/%3E%3C/svg%3E");
    }

    .legenda-texto {
        color: #5B5C65;
        font-size: 0.9rem;
    }

    @media (max-width: 768px) {
        .app-header {
            padding: 1rem;
        }

        .nav-options {
            gap: 1rem;
        }

        .stats-container {
            flex-direction: column;
            gap: 1.5rem;
        }

        .main-container {
            padding: 1rem;
        }

        .jogos-grid {
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        }

        .legenda-container {
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
    }
</style>