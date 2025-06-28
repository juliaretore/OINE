<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { slide } from 'svelte/transition';

    let nome = '';
    let email = '';
    let senha = '';
    let confirmarSenha = '';
    let tipo = '';
    let cpf = '';
    let matricula = '';
    let turmaSelecionada = '';
    let turmas = [];
    let errorMessage = '';
    let isLoading = false;
    let showNotification = false;
    let carregandoTurmas = true;

    onMount(async () => {
        try {
            console.log("Iniciando carregamento de turmas...");
            const res = await fetch('http://localhost:3000/api/turmas');
            if (!res.ok) throw new Error('Erro ao carregar turmas');
            turmas = await res.json();
            console.log("Turmas recebidas:", turmas); // ← Adicione esta linha
        } catch (error) {
            console.error("Erro detalhado:", error); // ← Log mais detalhado
            showError('❌ Erro ao carregar turmas disponíveis');
        } finally {
            carregandoTurmas = false;
        }
    });

    function showError(message) {
        errorMessage = message;
        showNotification = true;
        
        const timer = setTimeout(() => {
            if (showNotification) showNotification = false;
        }, message.includes('✅') ? 2000 : 5000);

        return () => clearTimeout(timer);
    }

    async function cadastrar() {
        // Validação dos campos
        if (!nome || !email || !senha || !confirmarSenha) {
            showError('Preencha todos os campos obrigatórios');
            return;
        }

        if (tipo !== 'aluno' && tipo !== 'professor') {
            showError('Selecione o tipo de usuário');
            return;
        }

        if (senha !== confirmarSenha) {
            showError('As senhas não conferem');
            return;
        }

        if (tipo === 'aluno' && !turmaSelecionada) {
            showError('Selecione uma turma para o aluno');
            return;
        }

        isLoading = true;
        showNotification = false;

        const usuario = { 
            nome, 
            email, 
            senha, 
            tipo, 
            cpf,
            matricula: tipo === 'aluno' ? matricula : undefined 
        };

        try {
            // 1. Cadastro do usuário
            const resUsuario = await fetch('http://localhost:3000/api/usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });

            if (!resUsuario.ok) {
                const erro = await resUsuario.json();
                throw new Error(erro.message || 'Erro ao cadastrar usuário');
            }

            const { user } = await resUsuario.json();

            // 2. Se for aluno, adiciona à turma selecionada
            if (tipo === 'aluno' && turmaSelecionada) {
                const resTurma = await fetch(`http://localhost:3000/api/turmas/${turmaSelecionada}/adicionar-aluno`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idAluno: user._id })
                });

                if (!resTurma.ok) {
                    const erro = await resTurma.json();
                    throw new Error(erro.message || 'Erro ao associar aluno à turma');
                }
            }

            // Sucesso - mostra notificação e redireciona
            showError('✅ Cadastro realizado com sucesso!');
            localStorage.setItem("usuarioLogado", JSON.stringify(user));
            
            setTimeout(() => {
                navigate(user.tipo === 'professor' ? '/home-professor' : '/home-aluno');
            }, 2000);

        } catch (err) {
            console.error(err);
            showError(`❌ ${err.message}`);
        } finally {
            isLoading = false;
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
            <button class="btn-cadastro active">Cadastro</button>
        </div>
    </header>

    <!-- Notificação -->
    {#if showNotification}
        <div class="notification-container">
            <div transition:slide={{ duration: 300 }}
                 class="notification {errorMessage.includes('✅') ? 'success' : 'error'}">
                <span class="message-text">{errorMessage}</span>
                <button class="close-btn" on:click={() => showNotification = false}>
                    <span class="close-icon">×</span>
                </button>
            </div>
        </div>
    {/if}

    <!-- Formulário de Cadastro -->
    <main class="login-content">
        <h1 class="login-title">Cadastro</h1>
        
        <form on:submit|preventDefault={cadastrar}>
            <!-- Campos básicos -->
            <div class="form-group">
                <label for="nome">Nome Completo:</label>
                <input 
                    type="text" 
                    id="nome" 
                    bind:value={nome}
                    placeholder="Digite seu nome completo"
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
                />
            </div>
            
            <div class="form-group">
                <label for="cpf">CPF:</label>
                <input 
                    type="text" 
                    id="cpf" 
                    bind:value={cpf}
                    placeholder="Digite seu CPF"
                    required
                    disabled={isLoading}
                />
            </div>
            
            <div class="form-group">
                <label for="senha">Senha:</label>
                <input 
                    type="password" 
                    id="senha" 
                    bind:value={senha}
                    placeholder="Crie uma senha"
                    required
                    disabled={isLoading}
                />
            </div>
            
            <div class="form-group">
                <label for="confirmarSenha">Confirmar Senha:</label>
                <input 
                    type="password" 
                    id="confirmarSenha" 
                    bind:value={confirmarSenha}
                    placeholder="Repita sua senha"
                    required
                    disabled={isLoading}
                />
            </div>
            
            <!-- Tipo de usuário -->
            <div class="radio-group">
                <p>Tipo de usuário:</p>
                <div class="radio-options">
                    <label>
                        <input 
                            type="radio" 
                            name="tipo" 
                            value="aluno" 
                            bind:group={tipo}
                            on:click={() => {
                                tipo = 'aluno';
                                console.log('Tipo definido como aluno, turmas:', turmas);
                            }}
                        />
                        Aluno
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="tipo" 
                            value="professor" 
                            bind:group={tipo} 
                            disabled={isLoading} 
                        />
                        Professor
                    </label>
                </div>
            </div>
            
            <!-- Campos específicos para ALUNOS -->
            {#if tipo === 'aluno'}
                <div class="form-group" style="border: 1px solid blue; padding: 1rem;">
                    <label>Turmas disponíveis ({turmas.length}):</label>
                    {#if turmas.length === 0}
                        <p>Nenhuma turma disponível</p>
                    {:else}
                        <select bind:value={turmaSelecionada}>
                            <option value="">Selecione uma turma</option>
                            {#each turmas as turma}
                                <option value={turma._id}>
                                    {turma.nome || `Turma ${turma._id}`}
                                </option>
                            {/each}
                        </select>
                    {/if}
                </div>
            {/if}
            
            <!-- Botão de submit -->
            <button type="submit" class="submit-btn" disabled={isLoading}>
                {#if isLoading}
                    <span class="spinner"></span> Cadastrando...
                {:else}
                    Cadastrar
                {/if}
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
    :global(body, html) {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: 'Baloo 2', sans-serif;
    }

    .login-container {
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
        transition: all 0.2s;
    }

    .btn-login {
        background-color: #67B8F0;
        color: white;
    }

    .btn-login:hover {
        background-color: #5aa8e0;
    }

    .btn-cadastro {
        background-color: #66F0CE;
        color: #5B5C65;
    }

    .btn-cadastro.active {
        background-color: #4ad1b0;
    }

    .btn-cadastro:hover {
        background-color: #4ad1b0;
    }

    .login-content {
        max-width: 700px;
        width: 90%;
        margin: 2rem auto;
        padding: 2.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 3rem;
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
        transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group select:focus {
        border-color: #67B8F0;
        outline: none;
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
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .submit-btn:hover {
        background-color: #5aa8e0;
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
        transition: color 0.2s;
    }

    .login-links a:hover {
        color: #67B8F0;
        text-decoration: underline;
    }

    select {
        width: 100%;
        padding: 0.85rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1.05rem;
        background-color: white;
        cursor: pointer;
    }

    select:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }

    .placeholder-option {
        color: #999;
    }

    .error-text {
        color: #e74c3c;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }

    .notification-container {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1000;
        max-width: 350px;
    }

    .notification {
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        opacity: 0.96;
        backdrop-filter: blur(3px);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .notification.error {
        background: rgba(231, 76, 60, 0.92);
    }

    .notification.success {
        background: rgba(39, 174, 96, 0.92);
    }

    .message-text {
        flex-grow: 1;
        padding-right: 1rem;
    }

    .close-btn {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    .close-icon {
        font-size: 1.1rem;
        line-height: 1;
        margin-top: -1px;
    }

    /* Spinner */
    .spinner {
        width: 18px;
        height: 18px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Responsividade */
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
            gap: 0.5rem;
        }
        
        .form-group input,
        .form-group select {
            padding: 0.75rem;
        }
        
        .notification-container {
            top: 80px;
            right: 10px;
            max-width: calc(100% - 20px);
        }
    }
</style>