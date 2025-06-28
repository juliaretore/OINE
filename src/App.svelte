<script>
    import { Router, Route, Link } from 'svelte-routing';
    import '../public/global.css';

    import Home from './views/Home.svelte';
    import Login from './views/Login.svelte';
	import NovoCadastro from './views/NovoCadastro.svelte';
    import HomeAluno from './views/HomeAluno.svelte';
    import HomeProfessor from './views/HomeProfessor.svelte';
    import Adicao from './views/questoes/Adicao.svelte';
    import Subtracao from './views/questoes/Subtracao.svelte';
    import Multiplicacao from './views/questoes/Multiplicacao.svelte';
    import Divisao from './views/questoes/Divisao.svelte';
    import Feedback from './views/questoes/Feedback.svelte';
    import DesafiosDiarios from './views/DesafiosDiarios.svelte';
    import Dashboard from './views/Dashboard.svelte';

</script>

<Router>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
	<Route path="/cadastro" component={NovoCadastro} />
    <Route path="/home-aluno" component={HomeAluno} />
    <Route path="/home-professor" component={HomeProfessor} />
    <Route path="/adicao" component={Adicao} />
    <Route path="/subtracao" component={Subtracao} />
    <Route path="/multiplicacao" component={Multiplicacao} />
    <Route path="/divisao" component={Divisao} />
    <Route path="/feedback" component={Feedback} />
    <Route path="/desafios-diarios" component={DesafiosDiarios} />
    <Route path="/dashboard" component={Dashboard} />
</Router>
