<script>
	import Header from './Header.svelte';
	import '../app.css';
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-orange-50 ">
	<Header />

	<main>
		<slot />
	</main>

	<footer class="footer footer-center p-4 bg-secondary text-base-content">
		<div>
			<p>Copyright © 2022 - All right reserved by Hiroyuki Kuwana</p>
		</div>
	</footer>
</div>
