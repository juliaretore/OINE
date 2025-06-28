<script lang="ts">
  import { onMount } from 'svelte';

  let turmas = [];
  $: turmaSelecionada = '';
  $: progresso = [];
  $: todasAsTentativas = [];

  async function carregarTurmas() {
    const res = await fetch('http://localhost:3000/api/turmas');
    const data = await res.json();
    turmas = data;
    if (data.length > 0) {
      turmaSelecionada = data[0]._id;
      carregarProgresso();
    }
  }

  function onTurmaChange(e) {
    const select = e.target;
    turmaSelecionada = select.value;
    carregarProgresso();
  }

  export async function carregarTentativas() {
    const res = await fetch(`http://localhost:3000/api/tentativas`);
    todasAsTentativas = await res.json();
  }

  function carregarProgresso() {
    if (!turmaSelecionada) return;
    const turma = turmas.find(t => t._id === turmaSelecionada);
    if (!turma) return;
    progresso = turma.alunos.map(aluno => {
        const tentativasDoAluno = todasAsTentativas.filter(t => t.aluno._id == aluno._id);
        const diasUnicos = new Set(tentativasDoAluno.map(t => new Date(t.dataHora).toISOString().split('T')[0]));
        const pontuacaoTotal = tentativasDoAluno.reduce((acc, t) => {return t.acertos === 3 ? acc + 1 : acc;}, 0);
        return {
            nome: aluno.nome,
            frequencia: diasUnicos.size,
            pontuacao: pontuacaoTotal
        };
    });
 }

  onMount(async () => {
    await carregarTentativas();
    await carregarTurmas();
    await carregarProgresso();
});
</script>

<style>
  label {
    display: block;
    margin-bottom: 1rem;
  }
  select, input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
</style>

<label>
  <span>Selecione a Turma</span>
  <select on:change={onTurmaChange}>
    {#each turmas as turma}
      <option value={turma._id}>{turma.nome}</option>
    {/each}
  </select>
</label>

<label>
  <span>Quantidade de Alunos</span>
  <input type="number" readonly value={turmas.find(t => t._id === turmaSelecionada)?.alunos.length || 0} />
</label>

<div class="grid grid-cols-2 gap-8 mt-6">
  <div>
    <h2>Frequência</h2>
    {#if progresso.length > 0}
        {#each progresso as aluno}
        <div class="grafico">
            <span class="w-40">{aluno.nome}</span>
            <span class="ml-2">{aluno.frequencia} dias</span>
        </div>
        {/each}
    {/if}
  </div>

  <div>
    <h2>Pontuação</h2>
    {#if progresso.length > 0}
        {#each progresso.sort((a, b) => b.pontuacao - a.pontuacao) as aluno}
            <div class="grafico">
                <span class="w-40">{aluno.nome}</span>
                <span class="ml-2">{aluno.pontuacao} pontos</span>
            </div>
        {/each}
    {/if}
  </div>
</div>
