<script>
    import { navigate } from 'svelte-routing';
    import { slide } from 'svelte/transition';
    
    let email = '';
    let senha = '';
    let manterConectado = false;
    let errorMessage = '';
    let isLoading = false;
    let showNotification = false;
    let showSuccess = false;

    async function handleLogin(e) {
        e.preventDefault();
        isLoading = true;
        errorMessage = '';
        showNotification = false;
        showSuccess = false;
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
                showSuccess = true;
                showError('✅ Login realizado com sucesso!', 'success');
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                if (data.user.tipo === 'professor') {
                    navigate('/home-professor');
                } else if (data.user.tipo === 'aluno') {
                    navigate('/home-aluno');
                } else {
                    showError('Tipo de usuário desconhecido.');
                }
            } else {
                showError(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
            }
        } catch (err) {
            console.error('Erro no login:', err);
            showError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            isLoading = false;
        }
    }

    function showError(message, type = 'error') {
        errorMessage = message;
        showNotification = true;
        
        const timer = setTimeout(() => {
            if (showNotification) {
                showNotification = false;
            }
        }, type === 'success' ? 1500 : 5000);

        return () => clearTimeout(timer);
    }
</script>

<div class="login-container">
    <header class="app-header">
        <div class="logo-container" on:click={() => navigate('/')} style="cursor: pointer;">
            <img src="/images/fracionando.png" alt="Logo Fracionando" class="logo" />
        </div>
        <div class="auth-options">
            <button class="btn-login active">Login</button>
            <button class="btn-cadastro" on:click={() => navigate('/cadastro')}>Cadastro</button>
        </div>
    </header>

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

    <main class="login-content">
        <h1 class="login-title">Login</h1>
        
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
                {#if isLoading}
                    <span class="spinner"></span> Carregando...
                {:else}
                    Login
                {/if}
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
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        max-width: 350px;
        opacity: 0.96;
        backdrop-filter: blur(3px);
        border: 1px solid rgba(255, 255, 255, 0.15);
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

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 0.96;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 0.96;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification.error {
        background: rgba(231, 76, 60, 0.92);
    }

    .notification.success {
        background: rgba(39, 174, 96, 0.92);
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
        
        .form-group input {
            padding: 0.75rem;
        }
        
        .app-header {
            padding: 1rem;
        }
        
        .notification {
            top: 80px;
            right: 10px;
            max-width: calc(100% - 20px);
        }
    }
</style>