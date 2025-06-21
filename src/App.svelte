<script>
    import { Router, Route, Link } from 'svelte-routing';
    import '../public/global.css';

    import Home from './Home.svelte';
    import Login from './Login.svelte';
	import NovoCadastro from './NovoCadastro.svelte';
    import HomeAluno from './HomeAluno.svelte';
    import HomeProfessor from './HomeProfessor.svelte';
    import Adicao from './Adicao.svelte';
    import Subtracao from './Subtracao.svelte';
    import Multiplicacao from './Multiplicacao.svelte';
    import Divisao from './Divisao.svelte';


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
