<script>
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { link } from "svelte-routing";

    async function fetchTentativas(alunoId) {
        const response = await fetch(`http://localhost:3000/api/tentativas?aluno=${alunoId}`);
        if (!response.ok) throw new Error('Erro ao buscar tentativas');
        return await response.json();
    }

    async function fetchTurmaDoUsuario(alunoId) {
        const response = await fetch(`http://localhost:3000/api/turma-do-usuario/${alunoId}`);
        if (!response.ok) throw new Error('Erro ao buscar turma');
        return await response.json();
    }
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    let turma = null;
    let diasDaSemana = []; // Array para guardar os dados dos últimos 7 dias
    let tentativas = []; // Array para guardar as tentativas do usuário

    let quantidadeJogos = 0;
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let vitoriasPorQuestao = []; // Para debug ou exibir

    onMount(async () => {
        if (usuarioLogado && usuarioLogado._id){
            try {
                turma = await fetchTurmaDoUsuario(usuarioLogado._id);
                tentativas = await fetchTentativas(usuarioLogado._id);
                quantidadeJogos = tentativas.filter((tentativa, index, self) => {return index === self.findIndex(t =>  t.questaoDiaria === tentativa.questaoDiaria && t.tipo === tentativa.tipo);});
                console.log("quantidadeJogos:", quantidadeJogos);
                const todasAsTentativas = await fetchTentativas(usuarioLogado._id);
                calcularSequenciasDeVitorias();
                processarDiasDaSemana(todasAsTentativas);
            } catch (error) {
                console.error("Falha ao carregar dados:", error);
            }
        }
    });

     function calcularSequenciasDeVitorias() {
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
        let atual = 0;
        let max = 0;

        for (const resultado of resultados) {
            if (resultado.venceu) {
                atual++;
                if (atual > max) max = atual;
            } else atual = 0;
        }
        maiorSequencia = max;
        sequenciaAtual = 0;
        console.log("resultados:", resultados);
        for (let i = resultados.length - 1; i >= 0; i--) {

            console.log("resultado:", resultados[i]);
            if (resultados[i].venceu) {
                sequenciaAtual++;
            } else break;
        }
    }



    function calcularStatusParaODia(tentativasDoDia) {
        if (!tentativasDoDia || tentativasDoDia.length === 0) {
            return "incompleto";
        }
        const tiposComSucesso = new Set();
        for (const tent of tentativasDoDia) {
            if (tent.acertos === 3) {
                tiposComSucesso.add(tent.tipo);
            }
        }

        const venceu = [1, 2, 3, 4].every(tipo => tiposComSucesso.has(tipo));

        if (!venceu) {
            return "incompleto";
        }

        const perfeito = [1, 2, 3, 4].every(tipo => {
            const tentativasDoTipo = tentativasDoDia.filter(t => t.tipo === tipo);
            return tentativasDoTipo.length === 1 && tentativasDoTipo[0].acertos === 3;
        });

        return perfeito ? "concluido-com-unica-tentativa" : "concluido";
    }

    function processarDiasDaSemana(todasAsTentativas) {
        const dias = [];
        const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        
        for (let i = 0; i < 7; i++) {
            const dataRef = new Date();
            dataRef.setDate(dataRef.getDate() - i);
            dataRef.setHours(0, 0, 0, 0);

            const tentativasDoDia = todasAsTentativas.filter(t => {
                const dataTentativa = new Date(t.dataHora);
                dataTentativa.setHours(0, 0, 0, 0);
                return dataTentativa.getTime() === dataRef.getTime();
            });
            const status = calcularStatusParaODia(tentativasDoDia);
            dias.push({
                data: dataRef,
                nome: nomesDias[dataRef.getDay()],
                status: status
            });
        }
        diasDaSemana = dias.reverse();
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
                    <div class="stat-label">Quantidade de Jogos</div>
                    <div class="stat-value">{quantidadeJogos.length}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">Sequência de Vitórias</div>
                    <div class="stat-value">{sequenciaAtual}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">Maior Sequência de Vitórias</div>
                    <div class="stat-value">{maiorSequencia}</div>
                </div>
            </div>
        </div>
        
        <div class="content-box">
            <h2 class="section-title">Minha Semana</h2>
            
            <div class="jogos-grid">
                {#each diasDaSemana as dia}
                    <div class="dia-container">
                        <div class="dia-texto">{dia.nome}</div>
                        <div class="jogo-item {dia.status}">
                            </div>
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
    .dia-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px; /* Espaço entre o texto e a estrela */
    }

    .dia-texto {
        color: #5B5C65;
        font-weight: 600;
        font-size: 1rem;
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

    /* Estrela padrão (não jogado ou não existe) - cor verde */
    .jogo-item::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2370CF97'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .jogo-item.incompleto::before {
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%23F8B4B4'/%3E%3C/svg%3E");
    }

    .jogo-item.concluido-com-unica-tentativa::before {
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2366F0CE'/%3E%3C/svg%3E");
    }
    .jogo-item.concluido::before {
         background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L30.9 18.1H49.5L34.3 29.3L40.2 47.4L25 36.2L9.8 47.4L15.7 29.3L0.5 18.1H19.1L25 0Z' fill='%2370CF97'/%3E%3C/svg%3E");
    }

    .jogo-item:hover {
        transform: scale(1.1);
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
        .stats-container {
            flex-direction: column;
            gap: 1.5rem;
        }
        .main-container {
            padding: 1rem;
        }
    }
</style>