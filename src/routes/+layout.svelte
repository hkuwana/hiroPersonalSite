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

	<footer class="footer">
		<div class="footer-content">
			<p class="footer-text">
				Made with care by Hiro Kuwana
			</p>
			<p class="footer-year">
				{new Date().getFullYear()}
			</p>
		</div>
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

	.footer {
		padding: 3rem 2rem;
		text-align: center;
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-subtle);
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.footer-text {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.footer-year {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}
</style>
