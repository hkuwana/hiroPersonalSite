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
			<p class="footer-text text-secondary">
				Made with care by Hiro Kuwana
			</p>
			<p class="footer-year text-base-content/50">
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
		padding: 2.5rem 2rem;
		text-align: center;
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-subtle);
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
	}

	.footer-text {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.footer-year {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
		letter-spacing: 0.02em;
	}

	@media (max-width: 640px) {
		.footer {
			padding: 2rem 1.5rem;
		}
	}
</style>
