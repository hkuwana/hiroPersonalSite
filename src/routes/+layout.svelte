<script lang="ts">
	import { onMount } from 'svelte';
	import { trackOutboundClick } from '$lib/analytics';
	import Header from '../lib/components/header.svelte';
	import '../style.css';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale } from '$lib/paraglide/runtime';

	onMount(() => {
		document.addEventListener('click', trackOutboundClick);

		// Keep --nav-h equal to the real height of the fixed nav, so pages never start under it.
		// The values in style.css are the fallback before this runs.
		const nav = document.querySelector<HTMLElement>('.nav');
		const root = document.documentElement;
		const navObserver = new ResizeObserver(() => {
			if (nav) root.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
		});
		if (nav) navObserver.observe(nav);

		return () => {
			document.removeEventListener('click', trackOutboundClick);
			navObserver.disconnect();
		};
	});

	let { children, data } = $props();

	const routeLang = $derived((data.locale as 'en' | 'ja' | undefined) ?? getLocale());
	const lang = $derived($optimisticLocale ?? routeLang);
	const footerCopy = $derived(
		lang === 'ja' ? '© 2026 Hiro · 東京 · ニューヨーク' : '© 2026 Hiro · Tokyo · New York'
	);
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
