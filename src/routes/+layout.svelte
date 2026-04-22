<script>
	import Header from '../lib/components/header.svelte';
	import SiteFooter from '../lib/components/SiteFooter.svelte';
	import '../style.css';
	let { children } = $props();
</script>

<svelte:head>
	<!-- Inter Font - Clean & Modern -->
	<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
	<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

	<!-- Essays RSS feed (auto-discovery for feed readers) -->
	<link rel="alternate" type="application/rss+xml" title="Hiro Kuwana — Essays" href="/feed.xml" />
</svelte:head>

<div class="app-container">
	<a href="#main" class="skip-link">Skip to content</a>
	<Header />

	<main id="main">
		{@render children()}
	</main>
	<SiteFooter />
</div>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: oklch(var(--b1));
	}

	main {
		flex: 1;
	}

	.skip-link {
		position: fixed;
		top: -100%;
		left: 0;
		z-index: 9999;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		text-decoration: underline;
		transition: top 0.2s ease;
	}

	.skip-link:focus {
		top: 0;
	}
</style>
