<script>
	import Header from './Header.svelte';
  import "../app.css";
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
</svelte:head>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<p>All rights reserved. Hiroyuki (Hiro) Kuwana @2022</p>
	</footer>
</div>
