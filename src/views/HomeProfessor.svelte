<script>
    import { onMount } from 'svelte';

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    let turmas = [];
    let quantidadeTurmas = 0;
    let quantidadeAlunos = 0;

    let serieNovaTurma = '';
    let nomeNovaTurma = '';
    let mensagem = '';
    let carregando = false;

    // Carrega as turmas do professor logado
    onMount(async () => {
        if (usuarioLogado && usuarioLogado._id) {
            await carregarTurmas();
        }
    });

    async function carregarTurmas() {
        try {
            const res = await fetch('http://localhost:3000/api/turmas');
            const todasTurmas = await res.json();

            // Filtra as turmas do professor logado
            turmas = todasTurmas.filter(t => t.idProfessor._id === usuarioLogado._id);

            quantidadeTurmas = turmas.length;
            quantidadeAlunos = turmas.reduce((total, turma) => total + turma.alunos.length, 0);
        } catch (err) {
            console.error('Erro ao carregar turmas:', err);
            mensagem = '❌ Erro ao carregar turmas.';
        }
    }

    async function cadastrarTurma() {
        if (!serieNovaTurma || !nomeNovaTurma) {
            mensagem = 'Preencha a série e o nome da turma.';
            return;
        }

        carregando = true;
        mensagem = '';

        try {
            const res = await fetch('http://localhost:3000/api/turma', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serie: Number(serieNovaTurma),
                    idProfessor: usuarioLogado._id,
                    alunos: [],
                    nome: nomeNovaTurma,
                })
            });

            if (!res.ok) {
                const erro = await res.json();
                mensagem = erro.message || 'Erro ao cadastrar turma.';
                carregando = false;
                return;
            }

            mensagem = '✅ Turma cadastrada com sucesso!';
            serieNovaTurma = '';
            nomeNovaTurma = '';

            await carregarTurmas();

        } catch (err) {
            console.error('Erro ao cadastrar turma:', err);
            mensagem = '❌ Erro na requisição.';
        } finally {
            carregando = false;
        }
    }
</script>

<h1>Bem-vindo, {usuarioLogado.nome}</h1>
<h2>Turmas: {quantidadeTurmas}</h2>
<h2>Alunos: {quantidadeAlunos}</h2>

<h2>Cadastrar Nova Turma</h2>

<form on:submit|preventDefault={cadastrarTurma}>
    <label>
        Série:
        <input type="number" min="1" max="9" bind:value={serieNovaTurma} required />
    </label>

    <label>
        Nome da Turma:
        <input type="text" bind:value={nomeNovaTurma} required placeholder="Ex: Turma A, 5B..." />
    </label>

    <button type="submit" disabled={carregando}>
        {carregando ? 'Cadastrando...' : 'Cadastrar'}
    </button>
</form>

<p class="mensagem">{mensagem}</p>
