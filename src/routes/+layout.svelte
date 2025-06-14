<script>
	import Header from '../lib/components/header.svelte';
	import '../style.css';
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-orange-50">
	<Header />

	<main>
		<slot />
	</main>

	<footer class="footer footer-center p-4 bg-secondary text-base-content">
		<div>
			<p>Copyright © 2025 - All right reserved by Hiro Kuwana</p>
		</div>
	</footer>
</div>
