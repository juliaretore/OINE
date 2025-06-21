<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';

    let email = '';
    let senha = '';
    let errorMessage = '';

    // Função para enviar o formulário
    async function handleLogin(event) {
        console.log({ email, senha });
        event.preventDefault();

        if (!senha) {
            errorMessage = 'Senha deve ser preenchida';
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),  // Garantir que 'email' e 'senha' têm valores
            });

            // Verificar o que o servidor responde
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
                // Redirecionar para a página de home do aluno
                if (data.user.tipo === 'professor') {
                    navigate('/home-professor');
                } else if (data.user.tipo === 'aluno') {
                    navigate('/home-aluno');
                } else {
                    errorMessage = 'Tipo de usuário desconhecido.';
                    return;
                }
            } else {
                errorMessage = data.message || 'Erro ao fazer login.';
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'Erro ao conectar com o servidor.';
        }
    }
</script>

<h2 class="text-success mb-4">Login</h2>
    {#if errorMessage}
        <div class="alert alert-danger">{errorMessage}</div>
    {/if}
    <form on:submit|preventDefault={handleLogin}>
        <div class="row mb-3">
            <div class="col-md-12">
                <label for="email" class="form-label required">E-mail Institucional:</label>
                <input
                    type="email"
                    class="form-control"
                    id="email"
                    bind:value={email}
                    placeholder="nome@udesc.br"
                    required
                />
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-12">
                <label for="password" class="form-label required">Senha:</label>
                <input
                    type="password"
                    class="form-control"
                    id="password"
                    bind:value={senha}
                    required
                />
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-6">
                <button type="submit" class="btn btn-success w-100">Entrar</button>
            </div>
            <div class="col-md-6">
                <a href="/NovoCadastro" class="btn btn-success w-100">Novo Cadastro</a>
            </div>
        </div>
    </form>

