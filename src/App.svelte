<script>
    import { Router, Route, Link } from 'svelte-routing';
    import '../public/global.css';

    import Home from './views/Home.svelte';
    import Login from './views/Login.svelte';
	import NovoCadastro from './views/NovoCadastro.svelte';
    import HomeAluno from './views/HomeAluno.svelte';
    import HomeProfessor from './views/HomeProfessor.svelte';
    import Adicao from './views/Adicao.svelte';
    import Subtracao from './views/Subtracao.svelte';
    import Multiplicacao from './views/Multiplicacao.svelte';
    import Divisao from './views/Divisao.svelte';


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
</Router>
