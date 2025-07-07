<script lang="ts">
    import { onMount } from 'svelte';
    import { link } from "svelte-routing";

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    let turmas = [];
    let turmaSelecionada = '';
    let progresso = [];
    let todasAsTentativas = [];
    let carregando = false;

    onMount(async () => {
        if (usuarioLogado && usuarioLogado._id) {
            await carregarTentativas();
          await carregarTurmas();
        }
    });

    async function carregarTurmas() {
        try {
            carregando = true;
            const res = await fetch('http://localhost:3000/api/turmas');
            const data = await res.json();
            turmas = data;
            if (data.length > 0) {
                turmaSelecionada = data[0]._id;
                await carregarProgresso();
            }
        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
        } finally {
            carregando = false;
        }
    }

    async function carregarTentativas() {
        try {
            const res = await fetch(`http://localhost:3000/api/tentativas`);
            todasAsTentativas = await res.json();
        } catch (error) {
            console.error("Erro ao carregar tentativas:", error);
        }
    }

    async function carregarProgresso() {
        if (!turmaSelecionada) return;
        
        try {
            const turma = turmas.find(t => t._id === turmaSelecionada);
            if (!turma) return;
            
            progresso = turma.alunos.map(aluno => {
                const tentativasDoAluno = todasAsTentativas.filter(t => t.aluno?._id === aluno._id);
                
                const diasUnicos = new Set();
                tentativasDoAluno.forEach(t => {
                    const dataISO = new Date(t.dataHora).toISOString().split('T')[0];
                    diasUnicos.add(dataISO);
                });
                
                const pontuacaoTotal = tentativasDoAluno.reduce((acc, t) => t.acertos === 3 ? acc + 10 : acc, 0);
                
                return {
                    nome: aluno.nome,
                    frequencia: diasUnicos.size,
                    pontuacao: pontuacaoTotal
                };
            }).sort((a, b) => b.frequencia - a.frequencia);
            
        } catch (error) {
            console.error("Erro ao carregar progresso:", error);
        }
    }

    function onTurmaChange(e) {
        turmaSelecionada = e.target.value;
        carregarProgresso();
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
            <a href="/home-professor" use:link>Home</a>
            <a href="/desafios-diarios" use:link>Desafio Diário</a>
            <a href="/dashboard" use:link class="active">Dashboard</a>
            <button class="btn-sair">Sair</button>
        </div>
    </header>
    
    <main class="main-container">
      <h1 class="page-title">Olá, {usuarioLogado.nome}!</h1>
        <div class="page-header">
            
        </div>
        
        <div class="content-box">
          <h2 class="page-title">Progresso da Turma</h2>
            <div class="header-boxes">
                  <div class="oval-box">
                      <span class="box-label">Selecione a Turma</span>
                      <select on:change={onTurmaChange} class="turma-select">
                          {#each turmas as turma}
                              <option value={turma._id}>{turma.nome}</option>
                          {/each}
                      </select>
                  </div>
                  <div class="oval-box">
                      <span class="box-label">Alunos na Turma</span>
                      <span class="box-value">{turmas.find(t => t._id === turmaSelecionada)?.alunos.length || 0}</span>
                  </div>
              </div>
            {#if carregando}
                <div class="loading">Carregando...</div>
            {:else}
                <div class="progress-grid">
                    <div class="progress-column">
                        <h3 class="column-title">Frequência</h3>
                        <div class="progress-list">
                            {#each progresso as aluno (aluno.nome)}
                                <div class="progress-item">
                                    <span class="aluno-name">{aluno.nome}</span>
                                    <div class="progress-container">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: {(aluno.frequencia/20)*100}%"></div>
                                        </div>
                                        <span class="progress-value">{aluno.frequencia} dias</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    <div class="progress-column">
                        <h3 class="column-title">Pontuação</h3>
                        <div class="progress-list">
                            {#each progresso.sort((a, b) => b.pontuacao - a.pontuacao) as aluno (aluno.nome)}
                                <div class="progress-item">
                                    <span class="aluno-name">{aluno.nome}</span>
                                    <div class="progress-container">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: {(aluno.pontuacao/200)*100}%"></div>
                                        </div>
                                        <span class="progress-value">{aluno.pontuacao} pontos</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
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

    .logo-container h1 {
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

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
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

    .header-boxes {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .oval-box {
        background-color: white;
        border-radius: 20px;
        padding: 0.5rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .box-label {
        font-size: 0.8rem;
        color: #666;
    }

    .box-value {
        font-weight: bold;
        color: #4CAF50;
        font-size: 1.2rem;
    }

    .turma-select {
        border: none;
        background: transparent;
        font-weight: bold;
        text-align: center;
        color: #333;
    }

    .content-box {
        background-color: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }

    .progress-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .progress-column {
        background-color: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
    }

    .column-title {
        color: #5B5C65;
        font-size: 1.3rem;
        margin-top: 0;
        margin-bottom: 1.5rem;
        text-align: center;
        border-bottom: 2px solid #4CAF50;
        padding-bottom: 0.5rem;
    }

    .progress-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .progress-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.8rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .aluno-name {
        font-weight: 600;
        color: #303030;
    }

    .progress-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .progress-bar {
        flex: 1;
        height: 12px;
        background-color: #e0e0e0;
        border-radius: 6px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: #4CAF50;
        border-radius: 6px;
    }

    .progress-value {
        color: #4CAF50;
        font-weight: 700;
        min-width: 80px;
        text-align: right;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #5B5C65;
    }

    @media (max-width: 768px) {
        .progress-grid {
            grid-template-columns: 1fr;
        }
        
        .page-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .header-boxes {
            width: 100%;
            justify-content: space-between;
        }
        
        .main-container {
            padding: 1rem;
        }
        
        .oval-box {
            width: 48%;
        }
    }
</style>