<script>
    import { navigate } from 'svelte-routing';
</script>

<div class="home-container">
    <!-- Barra superior igual às outras páginas -->
    <header class="app-header">
        <div class="logo-container">
            <img src="/images/fracionando.png" alt="Logo Fracionando" class="logo" />
        </div>
        <div class="auth-options">
            <button class="btn-login" on:click={() => navigate('/login')}>Login</button>
            <button class="btn-cadastro" on:click={() => navigate('/cadastro')}>Cadastro</button>
        </div>
    </header>

    <!-- Conteúdo principal -->
    <main class="hero-section">
        <div class="hero-content">
            <h1 class="hero-title">Fracionando</h1>
            <p class="hero-description">
                Pratique frações todos os dias com desafios rápidos, divertidos e feitos especialmente para alunos do 6° ano. Professores acompanham o progresso da turma com facilidade.
            </p>
            <div class="hero-buttons">
                <button class="hero-btn login-btn" on:click={() => navigate('/login')}>Login</button>
                <button class="hero-btn cadastro-btn" on:click={() => navigate('/cadastro')}>Cadastro</button>
            </div>
        </div>
    </main>
</div>

<style>
    /* Estilos globais consistentes */
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

    /* Barra superior idêntica às outras páginas */
    .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

    /* Seção hero principal */
    .hero-section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        padding: 2rem;
    }

    .hero-content {
        max-width: 800px;
        text-align: center;
        padding: 2rem;
    }

    .hero-title {
        color: #303030;
        font-size: 3.5rem;
        margin-bottom: 1.5rem;
        font-weight: 800;
    }

    .hero-description {
        color: #5B5C65;
        font-size: 1.5rem;
        line-height: 1.6;
        margin-bottom: 3rem;
    }

    .hero-buttons {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 2rem;
    }

    .hero-btn {
        padding: 1rem 2.5rem;
        border: none;
        border-radius: 8px;
        font-family: 'Baloo 2', sans-serif;
        font-weight: 800;
        font-size: 1.2rem;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .hero-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .login-btn {
        background-color: #67B8F0;
        color: white;
    }

    .cadastro-btn {
        background-color: #66F0CE;
        color: #5B5C65;
    }

    /* Responsividade */
    @media (max-width: 768px) {
        .hero-title {
            font-size: 2.5rem;
        }

        .hero-description {
            font-size: 1.2rem;
        }

        .hero-buttons {
            flex-direction: column;
            gap: 1rem;
        }

        .hero-btn {
            width: 100%;
            padding: 0.8rem;
        }
    }
</style>