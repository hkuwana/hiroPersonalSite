<script lang="ts">
	// Lab: the ink village with its developer stats (frame time, draw calls,
	// and why the gate chose hi-fi or lo-fi). The home page uses the same
	// component without the stats.
	import { page } from '$app/stores';
	import InkHero from '$lib/ink/InkHero.svelte';
	import type { Essay } from '$lib/ink/place-content';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale } from '$lib/paraglide/runtime';

	type Locale = 'en' | 'ja';
	const lang = $derived(
		($optimisticLocale ?? ($page.data.locale as Locale | undefined) ?? getLocale()) as Locale
	);

	// Newest essays for the notice board (metadata only, like the home page).
	type EssayMeta = { title: string; date: string };
	const ESSAY_META = import.meta.glob<EssayMeta>(
		['/src/content/essays/*.md', '!/src/content/essays/_*.md'],
		{ eager: true, import: 'metadata' }
	);
	const ESSAYS: Essay[] = Object.entries(ESSAY_META)
		.map(([path, meta]) => ({ slug: path.split('/').pop()!.replace('.md', ''), ...meta }))
		.filter((e) => e.title && e.date)
		.sort((a, b) => b.date.localeCompare(a.date));
</script>

<svelte:head>
	<title>Lab · 墨 ink village · Hiro Kuwana</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<InkHero {lang} essays={ESSAYS} debug />
