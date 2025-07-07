<script>
    import { onMount } from 'svelte';
    import { link } from "svelte-routing";

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    let turmas = [];
    let quantidadeTurmas = 0;
    let quantidadeAlunos = 0;
    let alunosPorTurma = [];
    let serieNovaTurma = '';
    let nomeNovaTurma = '';
    let mensagem = '';
    let carregando = false;
    let mostrarFormulario = false;

    onMount(async () => {
        if (usuarioLogado && usuarioLogado._id) {
            await carregarTurmas();
        }
    });

async function carregarTurmas() {
    try {
        const response = await fetch('http://localhost:3000/api/turmas');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const todasTurmas = await response.json();
        
        turmas = todasTurmas.filter(t => {
            const professorId = typeof t.idProfessor === 'object' ? t.idProfessor._id : t.idProfessor;
            return professorId === usuarioLogado._id;
        });
        
        quantidadeTurmas = turmas.length;
        quantidadeAlunos = turmas.reduce((total, turma) => total + (turma.alunos?.length || 0), 0);
        
        alunosPorTurma = turmas.map(turma => ({
            nome: turma.nome,
            quantidade: turma.alunos?.length || 0
        }));
        
    } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        mensagem = '❌ Erro ao carregar turmas';
    }
}

    function toggleFormulario() {
        mostrarFormulario = !mostrarFormulario;
        if (!mostrarFormulario) {
            serieNovaTurma = '';
            nomeNovaTurma = '';
            mensagem = '';
        }
    }

    async function cadastrarTurma() {
        if (!serieNovaTurma || !nomeNovaTurma) {
            mensagem = 'Preencha todos os campos';
            return;
        }

        carregando = true;
        mensagem = '';

        try {
            const response = await fetch('http://localhost:3000/api/turma', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serie: Number(serieNovaTurma),
                    idProfessor: usuarioLogado._id,
                    alunos: [],
                    nome: nomeNovaTurma,
                })
            });

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.message || 'Erro ao cadastrar turma');
            }

            mensagem = '✅ Turma cadastrada com sucesso!';
            serieNovaTurma = '';
            nomeNovaTurma = '';
            await carregarTurmas();

        } catch (error) {
            console.error("Erro ao cadastrar turma:", error);
            mensagem = `❌ ${error.message}`;
        } finally {
            carregando = false;
        }
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
            <a href="/home-professor" use:link class="active">Home</a>
            <a href="/desafios-diarios" use:link>Desafio Diário</a>
            <a href="/dashboard" use:link>Dashboard</a>
            <button class="btn-sair">Sair</button>
        </div>
    </header>
    
    <main class="main-container">
        <h1 class="page-title">Olá, {usuarioLogado.nome}!</h1>
        
        <div class="content-box">
            <h2 class="section-title">Visão Geral</h2>
            
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-label">Quantidade de Turmas</div>
                    <div class="stat-value">{quantidadeTurmas}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">Quantidade de Alunos</div>
                    <div class="stat-value">{quantidadeAlunos}</div>
                </div>
            </div>
        </div>
        
        <div class="content-box">
            <div class="form-header">
                <h2 class="section-title">Gerenciar Turmas</h2>
                <button 
                    on:click={toggleFormulario} 
                    class="btn-cadastrar-toggle {mostrarFormulario ? 'ativo' : ''}"
                >
                    {mostrarFormulario ? 'Cancelar' : 'Cadastrar Nova Turma'}
                </button>
            </div>
            
            {#if mostrarFormulario}
                <form on:submit|preventDefault={cadastrarTurma} class="form-turma">
                    <div class="form-group">
                        <label for="serie">Série:</label>
                        <input 
                            type="number" 
                            id="serie" 
                            bind:value={serieNovaTurma}
                            min="1" 
                            max="9" 
                            required 
                            placeholder="Ex: 6"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="nome">Nome da Turma:</label>
                        <input 
                            type="text" 
                            id="nome" 
                            bind:value={nomeNovaTurma}
                            required 
                            placeholder="Ex: Turma A, 6B"
                        />
                    </div>
                    
                    <button type="submit" class="btn-cadastrar" disabled={carregando}>
                        {carregando ? 'Cadastrando...' : 'Confirmar Cadastro'}
                    </button>
                    
                    {#if mensagem}
                        <div class:mensagem-sucesso={mensagem.includes('✅')} class:mensagem-erro={mensagem.includes('❌')} class="mensagem">
                            {mensagem}
                        </div>
                    {/if}
                </form>
            {/if}
        </div>
        
        {#if turmas.length > 0}
            <div class="content-box">
                <h2 class="section-title">Minhas Turmas</h2>
                
                <div class="turmas-grid">
                    {#each alunosPorTurma as turma}
                        <div class="turma-item">
                            <div class="turma-nome">{turma.nome}</div>
                            <div class="turma-quantidade">{turma.quantidade} alunos</div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
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

    .content-box {
        background-color: white;
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
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

    .turmas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .turma-item {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .turma-nome {
        font-weight: 600;
        color: #303030;
        margin-bottom: 0.5rem;
    }

    .turma-quantidade {
        color: #67B8F0;
        font-weight: 700;
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .btn-cadastrar-toggle {
        padding: 0.6rem 1.2rem;
        background-color: #67B8F0;
        color: white;
        border: none;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .btn-cadastrar-toggle:hover {
        background-color: #5aa8e0;
    }
    
    .btn-cadastrar-toggle.ativo {
        background-color: #F8B4B4;
    }
    
    .btn-cadastrar-toggle.ativo:hover {
        background-color: #f0a0a0;
    }
    
    .form-turma {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-group label {
        color: #5B5C65;
        font-weight: 600;
    }
    
    .form-group input {
        padding: 0.8rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #67B8F0;
        box-shadow: 0 0 5px rgba(103, 184, 240, 0.5);
    }
    
    .btn-cadastrar {
        padding: 0.8rem;
        background-color: #67B8F0;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .btn-cadastrar:hover:not(:disabled) {
        background-color: #5aa8e0;
    }
    
    .btn-cadastrar:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    
    .mensagem {
        padding: 0.8rem;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
    }
    
    .mensagem-sucesso {
        background-color: #E8F5E9;
        color: #2E7D32;
    }
    
    .mensagem-erro {
        background-color: #FFEBEE;
        color: #C62828;
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

        .turmas-grid {
            grid-template-columns: 1fr;
        }

        .form-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
    }
</style>