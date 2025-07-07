<script>
    import { onMount } from 'svelte';

    export let tentativas = [];
    export let todasAsTentativas = [];
    export let onClose; 
    
    let tempoRestante = '';
    let sequenciaAtual = 0;
    let vitoriasPorQuestao = [];
    let maiorSequencia = 0;
    let totalJogos = 0;

    function atualizarCronometro() {
        const agora = new Date();
        const proximoDia = new Date();
        proximoDia.setHours(24, 0, 0, 0);

        const diff = proximoDia - agora;

        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);

        tempoRestante = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    setInterval(atualizarCronometro, 1000);
    
    onMount(() => {
        atualizarCronometro();
        calcularSequenciasDeVitorias();
    });

    $: if (todasAsTentativas.length > 0) calcularSequenciasDeVitorias();

    function calcularSequenciasDeVitorias() {
        totalJogos = [...new Set(todasAsTentativas.map(t => t.questaoDiaria._id))].length;

        const agrupado = {};
        for (const tentativa of todasAsTentativas) {
            const qid = tentativa.questaoDiaria._id;
            if (!agrupado[qid]) agrupado[qid] = [];
            agrupado[qid].push(tentativa);
        }

        const resultados = [];
        for (const [questaoId, tentativasDaQuestao] of Object.entries(agrupado)) {
            let venceu = false;
            for (const tentativa of tentativasDaQuestao)
                if (tentativa.acertos === 3) venceu = true;

            const dataMaisRecente = Math.max(...tentativasDaQuestao.map(t => new Date(t.dataHora).getTime()));
            resultados.push({questaoId, venceu, data: dataMaisRecente});
        }

        resultados.sort((a, b) => a.data - b.data);
        vitoriasPorQuestao = resultados;
        
        let atual = 0;
        let max = 0;

        for (const resultado of resultados) {
            if (resultado.venceu) {
                atual++;
                if (atual > max) max = atual;
            } else atual = 0;
        }
        maiorSequencia = max;

        sequenciaAtual = 0;
        for (let i = resultados.length - 1; i >= 0; i--) {
            if (resultados[i].venceu) {
                sequenciaAtual++;
            } else break;
        }
    }
</script>

<style>
    .feedback-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .feedback-container {
        width: 90%;
        max-width: 800px;
        background: #579F74; 
        border-radius: 32px; 
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        position: relative;
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .feedback-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .feedback-header h1 {
        color: white; 
        font-size: 2.5rem;
        margin-bottom: 10px;
    }

    .feedback-header h2 {
        color: white; 
        font-size: 1.5rem;
        margin-top: 0;
    }

    .stats-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
    }

    .stat-box {
        background: rgba(255, 255, 255, 0.2); 
        border-radius: 12px;
        padding: 20px;
        width: 30%;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-box h3 {
        color: white;
        font-size: 1.1rem;
        margin-bottom: 10px;
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: white; 
        margin: 10px 0;
    }

    .timer-container {
        text-align: center;
        margin-top: 20px;
    }

    .timer-label {
        color: white; 
        font-size: 1.1rem;
        margin-bottom: 5px;
    }

    .timer {
        font-size: 1.8rem;
        font-weight: bold;
        color: white; 
        background: rgba(0, 0, 0, 0.2);
        padding: 10px 20px;
        border-radius: 8px;
        display: inline-block;
    }

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: white; 
    }

    .close-button:hover {
        color: #FFEB3B; 
    }
</style>

<div class="feedback-overlay">
    <div class="feedback-container">
        <button class="close-button" on:click={onClose}>×</button> 
        
        <div class="feedback-header">
            <h1>Parabéns!</h1>
            <h2>Desafio concluído com sucesso</h2>
        </div>
        
        <div class="stats-container">
            <div class="stat-box">
                <h3>Quantidade de Jogos</h3>
                <div class="stat-value">{totalJogos}</div>
            </div>
            
            <div class="stat-box">
                <h3>Sequência de Vitórias</h3>
                <div class="stat-value">{sequenciaAtual}</div>
            </div>
            
            <div class="stat-box">
                <h3>Maior Sequência</h3>
                <div class="stat-value">{maiorSequencia}</div>
            </div>
        </div>
        
        <div class="timer-container">
            <div class="timer-label">Próximo Jogo em:</div>
            <div class="timer">{tempoRestante}</div>
        </div>
    </div>
</div>