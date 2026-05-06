<script lang="ts">
	import Header from '../lib/components/header.svelte';
	import '../style.css';
	import { getLocale } from '$lib/paraglide/runtime';

	let { children, data } = $props();

	const lang = $derived((data.locale as 'en' | 'ja' | undefined) ?? getLocale());
	const footerCopy = $derived(lang === 'ja' ? '© 2026 Hiro · 京都' : '© 2026 Hiro · Kyoto');
	const footerRight = $derived(lang === 'ja' ? '手仕事 · v 4.5' : 'made by hand · v 4.5');
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-shell">
	<Header />
	<main>
		{@render children()}
	</main>
	<footer class="site-footer">
		<span>{footerCopy}</span>
		<span class="center">浩</span>
		<span class="right">{footerRight}</span>
	</footer>
</div>
