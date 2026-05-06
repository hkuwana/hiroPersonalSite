<script lang="ts">
	import Header from '../lib/components/header.svelte';
	import '../style.css';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale } from '$lib/paraglide/runtime';

	let { children, data } = $props();

	const routeLang = $derived((data.locale as 'en' | 'ja' | undefined) ?? getLocale());
	const lang = $derived($optimisticLocale ?? routeLang);
	const footerCopy = $derived(lang === 'ja' ? '© 2026 Hiro · 京都' : '© 2026 Hiro · Kyoto');
	const footerRight = $derived(lang === 'ja' ? 'v3.0' : 'v3.0');

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = lang;
		}

		if ($optimisticLocale === routeLang) {
			optimisticLocale.set(null);
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
	<link rel="alternate" type="application/rss+xml" title="Hiro Kuwana — Essays" href="/feed.xml" />
</svelte:head>

<div class="app-shell">
	<a href="#main" class="skip-link">Skip to content</a>
	<Header />
	<main id="main">
		{@render children()}
	</main>
	<footer class="site-footer">
		<span>{footerCopy}</span>
		<span class="center">浩</span>
		<span class="right">{footerRight}</span>
	</footer>
</div>

<style>
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
