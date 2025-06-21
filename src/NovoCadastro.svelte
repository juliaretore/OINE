<script>
    import { onMount } from 'svelte';

    let nome = '';
    let email = '';
    let senha = '';
    let confirmarSenha = '';
    let tipo = ''; // 'aluno' ou 'professor'
    let turmaSelecionada = '';
    let turmas = [];

    let mensagem = '';
    let carregando = false;

    // Carregar turmas ao abrir a tela
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

        const usuario = {
            nome,
            email,
            senha,
            tipo
        };

        try {
            // Cria o usuário
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

            // Se for aluno, adiciona na turma
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
            nome = email = senha = confirmarSenha = '';
            tipo = '';
            turmaSelecionada = '';

        } catch (err) {
            console.error(err);
            mensagem = '❌ Erro na requisição.';
        } finally {
            carregando = false;
        }
    }
</script>

<h1>Cadastro de Usuário</h1>

<form on:submit|preventDefault={cadastrar}>
    <label>
        Nome:
        <input type="text" bind:value={nome} required />
    </label>

    <label>
        Email:
        <input type="email" bind:value={email} required />
    </label>

    <label>
        Senha:
        <input type="password" bind:value={senha} required />
    </label>

    <label>
        Confirmar Senha:
        <input type="password" bind:value={confirmarSenha} required />
    </label>

    <div class="radio-group">
        <label>
            <input
                type="radio"
                name="tipo"
                value="aluno"
                checked={tipo === 'aluno'}
                on:change={() => tipo = 'aluno'} />
            Aluno
        </label>

        <label>
            <input
                type="radio"
                name="tipo"
                value="professor"
                checked={tipo === 'professor'}
                on:change={() => tipo = 'professor'} />
            Professor
        </label>
    </div>

    {#if tipo === 'aluno'}
        <label>
            Turma:
            <select bind:value={turmaSelecionada} required>
                <option value="" disabled selected>Selecione uma turma</option>
                {#each turmas as turma}
                    <option value={turma._id}>
                        {turma.serie}ª série — Professor: {turma.idProfessor.nome}
                    </option>
                {/each}
            </select>
        </label>
    {/if}

    <button type="submit" disabled={carregando}>
        {carregando ? 'Cadastrando...' : 'Cadastrar'}
    </button>
</form>

<p class="mensagem">{mensagem}</p>


