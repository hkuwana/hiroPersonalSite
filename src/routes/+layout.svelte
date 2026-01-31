<script>
	import Header from '../lib/components/header.svelte';
	import '../style.css';
	let { children } = $props();
</script>

<svelte:head>
	<!-- Inter Font - Clean & Modern -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app-container">
	<Header />

	<main>
		{@render children()}
	</main>
<footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
  <aside>
  	<p class="footer-text text-secondary text-center w-full">
				Made with ❤️ by Hiro Kuwana
			</p>
			<p class="footer-year text-base-content/50">
				@{new Date().getFullYear()}
			</p>
  </aside>
</footer>
</div>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}

	main {
		flex: 1;
	}

	 
</style>
