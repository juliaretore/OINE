<script>
    import { navigate } from 'svelte-routing';
    
    let email = '';
    let senha = '';
    let manterConectado = false;
    let errorMessage = '';
    let isLoading = false;

    async function handleLogin(e) {
        e.preventDefault();
        isLoading = true;
        errorMessage = '';
        
        try {
            // requisição API de login
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            // login bem-sucedido
            if (response.ok) {
                // Salva os dados do usuário no localStorage
                localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
                
                // login por tipo de usuário
                if (data.user.tipo === 'professor') {
                    navigate('/home-professor');
                } else if (data.user.tipo === 'aluno') {
                    navigate('/home-aluno');
                } else {
                    errorMessage = 'Tipo de usuário desconhecido.';
                }
            } else {
                errorMessage = data.message || 'Erro ao fazer login. Verifique suas credenciais.';
            }
        } catch (err) {
            console.error('Erro no login:', err);
            errorMessage = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="login-container">
    <!-- Barra superior com logo clicável -->
    <header class="app-header">
        <div class="logo-container" on:click={() => navigate('/')} style="cursor: pointer;">
            <img src="/images/fracionando.png" alt="Logo Fracionando" class="logo" />
        </div>
        <div class="auth-options">
            <button class="btn-login active">Login</button>
            <button class="btn-cadastro" on:click={() => navigate('/cadastro')}>Cadastro</button>
        </div>
    </header>

    <main class="login-content">
        <h1 class="login-title">Login</h1>
        
        {#if errorMessage}
            <div class:error-message={errorMessage.includes('❌')} class:success-message={errorMessage.includes('✅')}>
                {errorMessage}
            </div>
        {/if}
        
        <form on:submit|preventDefault={handleLogin}>
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
                <label for="senha">Senha:</label>
                <input 
                    type="password" 
                    id="senha" 
                    bind:value={senha}
                    required
                    disabled={isLoading}
                />
            </div>
            
            <div class="remember-me">
                <input 
                    type="checkbox" 
                    id="manterConectado"
                    bind:checked={manterConectado}
                    disabled={isLoading}
                />
                <label for="manterConectado">Manter conectado</label>
            </div>
            
            <button type="submit" class="submit-btn" disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Login'}
            </button>
            
            <div class="login-links">
                <a href="/esqueci-senha" on:click|preventDefault={() => navigate('/esqueci-senha')}>
                    Esqueceu a senha?
                </a>
                <a href="/cadastro" on:click|preventDefault={() => navigate('/cadastro')}>
                    Não possui cadastro?
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
    
    /* principal */
    .login-container {
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
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .logo-container:hover {
        transform: scale(1.03);
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
    
    .btn-login.active {
        background-color: #3a9de0;
    }
    
    .btn-login:hover {
        background-color: #5aa8e0;
    }
    
    .btn-cadastro {
        background-color: #66F0CE;
        color: #5B5C65;
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
    
    .form-group input {
        width: 100%;
        padding: 0.85rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1.05rem;
        transition: border-color 0.3s;
    }
    
    .form-group input:focus {
        border-color: #67B8F0;
        outline: none;
    }
    
    .remember-me {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 1rem 0;
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
    }
    
    .submit-btn:hover {
        background-color: #5aa8e0;
    }
    
    .submit-btn:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
    
    /* links */
    .login-links {
        display: flex;
        justify-content: space-between;
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

    /* responsividade */
    @media (max-width: 768px) {
        .login-content {
            padding: 2rem;
            margin: 1rem;
            max-width: 95%;
        }
        
        .login-title {
            font-size: 2.2rem;
        }
        
        .form-group input {
            padding: 0.75rem;
        }
        
        .app-header {
            padding: 1rem;
        }
    }
</style>