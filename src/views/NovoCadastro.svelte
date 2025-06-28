<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';

    let nome = '';
    let email = '';
    let senha = '';
    let confirmarSenha = '';
    let tipo = '';
    let turmaSelecionada = '';
    let turmas = [];
    let mensagem = '';
    let carregando = false;

    onMount(async () => {
        const res = await fetch('http://localhost:3000/api/turmas');
        turmas = await res.json();
    });

    async function cadastrar() {
        mensagem = '';

        if (!nome || !email || !senha || !confirmarSenha) {
            mensagem = 'Preencha todos os campos.';
            return;
        }

        if (tipo !== 'aluno' && tipo !== 'professor') {
            mensagem = 'Selecione se é Aluno ou Professor.';
            return;
        }

        if (senha !== confirmarSenha) {
            mensagem = 'As senhas não conferem.';
            return;
        }

        carregando = true;

        const usuario = { nome, email, senha, tipo };

        try {
            const res = await fetch('http://localhost:3000/api/usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });

            if (!res.ok) {
                const erro = await res.json();
                mensagem = erro.message || 'Erro ao cadastrar.';
                carregando = false;
                return;
            }

            const { user } = await res.json();

            if (tipo === 'aluno' && turmaSelecionada) {
                const turma = turmas.find(t => t._id === turmaSelecionada);
                if (turma) {
                    turma.alunos.push(user._id);
                    await fetch('http://localhost:3000/api/turma', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            serie: turma.serie,
                            idProfessor: turma.idProfessor._id,
                            alunos: turma.alunos
                        })
                    });
                }
            }

            mensagem = '✅ Usuário cadastrado com sucesso!';
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            console.error(err);
            mensagem = '❌ Erro na requisição.';
        } finally {
            carregando = false;
        }
    }
</script>

<div class="login-container">
    <!-- Barra superior -->
    <header class="app-header">
        <div class="logo-container" on:click={() => navigate('/')} style="cursor: pointer;">
            <img src="/images/fracionando.png" alt="Logo" class="logo" />
        </div>
        <div class="auth-options">
            <button class="btn-login" on:click={() => navigate('/login')}>Login</button>
            <button class="btn-cadastro" on:click={() => navigate('/cadastro')}>Cadastro</button>
        </div>
    </header>

    <!-- Formulário de Cadastro -->
    <main class="login-content">
        <h1 class="login-title">Cadastro</h1>
        
        {#if mensagem}
            <div class:error-message={mensagem.includes('❌')} class:success-message={mensagem.includes('✅')}>
                {mensagem}
            </div>
        {/if}
        
        <form on:submit|preventDefault={cadastrar}>
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input 
                    type="text" 
                    id="nome" 
                    bind:value={nome}
                    placeholder="Seu nome completo"
                    required
                    disabled={carregando}
                />
            </div>
            
            <div class="form-group">
                <label for="email">E-mail:</label>
                <input 
                    type="email" 
                    id="email" 
                    bind:value={email}
                    placeholder="seu@email.com"
                    required
                    disabled={carregando}
                />
            </div>
            
            <div class="form-group">
                <label for="senha">Senha:</label>
                <input 
                    type="password" 
                    id="senha" 
                    bind:value={senha}
                    required
                    disabled={carregando}
                />
            </div>
            
            <div class="form-group">
                <label for="confirmarSenha">Confirmar Senha:</label>
                <input 
                    type="password" 
                    id="confirmarSenha" 
                    bind:value={confirmarSenha}
                    required
                    disabled={carregando}
                />
            </div>
            
            <div class="radio-group">
                <p>Tipo de usuário:</p>
                <div class="radio-options">
                    <label>
                        <input
                            type="radio"
                            name="tipo"
                            value="aluno"
                            checked={tipo === 'aluno'}
                            on:change={() => tipo = 'aluno'}
                            disabled={carregando} />
                        Aluno
                    </label>
                    
                    <label>
                        <input
                            type="radio"
                            name="tipo"
                            value="professor"
                            checked={tipo === 'professor'}
                            on:change={() => tipo = 'professor'}
                            disabled={carregando} />
                        Professor
                    </label>
                </div>
            </div>
            
            {#if tipo === 'aluno'}
                <div class="form-group">
                    <label for="turma">Turma:</label>
                    <select 
                        id="turma" 
                        bind:value={turmaSelecionada} 
                        required
                        disabled={carregando}>
                        <option value="" disabled selected>Selecione uma turma</option>
                        {#each turmas as turma}
                            <option value={turma._id}>
                                {turma.serie}ª série — Professor: {turma.idProfessor.nome}
                            </option>
                        {/each}
                    </select>
                </div>
            {/if}
            
            <button type="submit" class="submit-btn" disabled={carregando}>
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            
            <div class="login-links">
                <a href="/login" on:click|preventDefault={() => navigate('/login')}>
                    Já possui uma conta? Faça login
                </a>
            </div>
        </form>
    </main>
</div>
<style>
    /* CORREÇÕES PRINCIPAIS */
    :global(body, html) {
        margin: 0;
        padding: 0;
        height: 100%;
    }

    .login-container {
        min-height: 100vh; /* Garante que o container ocupe pelo menos a tela toda */
        background: #EBF4F2;
        display: flex;
        flex-direction: column;
    }

    /* FORMULÁRIO MAIS LARGO E COM ESPAÇO NO FINAL */
    .login-content {
        max-width: 700px;
        width: 90%;
        margin: 2rem auto;
        padding: 2.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        flex-grow: 1;
        margin-bottom: 3rem; /* Espaço extra no final */
    }

    /* RESTANTE DO CSS (MANTIDO IGUAL) */
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

    .auth-options {
        display: flex;
        gap: 1rem;
    }

    .btn-login, .btn-cadastro {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 20px;
        font-family: 'Baloo 2', sans-serif;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
    }

    .btn-login {
        background-color: #67B8F0;
        color: white;
    }

    .btn-cadastro {
        background-color: #66F0CE;
        color: #5B5C65;
    }

    .btn-cadastro.active {
        background-color: #4ad1b0;
    }

    .login-title {
        color: #303030;
        font-size: 2.5rem;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 800;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #5B5C65;
        font-size: 1.1rem;
    }

    .form-group input,
    .form-group select {
        width: 100%;
        padding: 0.85rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1.05rem;
    }

    .radio-group {
        margin: 1.5rem 0;
    }

    .radio-group p {
        margin-bottom: 0.5rem;
        color: #5B5C65;
        font-size: 1.1rem;
    }

    .radio-options {
        display: flex;
        gap: 1.5rem;
    }

    .radio-options label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .submit-btn {
        width: 100%;
        padding: 0.85rem;
        background-color: #67B8F0;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        margin: 1.5rem 0;
    }

    .submit-btn:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }

    .login-links {
        text-align: center;
        margin-top: 1.5rem;
    }

    .login-links a {
        color: #5B5C65;
        text-decoration: none;
        font-size: 1.05rem;
    }

    .login-links a:hover {
        text-decoration: underline;
    }

    .error-message {
        color: #e74c3c;
        background-color: #fadbd8;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 1.05rem;
    }

    .success-message {
        color: #27ae60;
        background-color: #d5f5e3;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 1.05rem;
    }

    .footer {
        background: #C4CBCF;
        padding: 1rem;
        text-align: center;
        margin-top: auto; /* Empurra o footer para baixo */
    }

    @media (max-width: 768px) {
        .login-content {
            padding: 2rem;
            margin: 1rem;
            max-width: 95%;
        }
        
        .login-title {
            font-size: 2.2rem;
        }
        
        .radio-options {
            flex-direction: column;
            gap: 0.75rem;
        }

        .form-group input,
        .form-group select {
            padding: 0.75rem;
        }
    }
</style>