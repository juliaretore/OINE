<script>
    import { Router, Route, Link } from 'svelte-routing';
    import '../public/global.css';

    import Home from './Home.svelte';
    import Login from './Login.svelte';
	import NovoCadastro from './NovoCadastro.svelte';
    import HomeAluno from './HomeAluno.svelte';


</script>

<Router>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
	<Route path="/cadastro" component={NovoCadastro} />
    <Route path="/home-aluno" component={HomeAluno} />
</Router>
