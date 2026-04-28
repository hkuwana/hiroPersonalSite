<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { SITE } from '$data/constants';

	let { data } = $props<{ data: PageData }>();

	let visible = $state(false);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			visible = true;
		} else {
			requestAnimationFrame(() => { visible = true; });
		}
	});

	const locale = $derived(getLocale());
	const formattedDate = $derived(new Date(data.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}));

	const canonicalPath = $derived(
		data.resolvedLocale === 'en'
			? `/playbooks/${data.slug}`
			: `/${data.resolvedLocale}/playbooks/${data.slug}`
	);
	const canonicalUrl = $derived(`${SITE.url}${canonicalPath}`);

	function hreflangTagFor(locale: 'en' | 'ja'): string {
		return locale === 'ja' ? 'ja-JP' : 'en-US';
	}
	function urlFor(locale: 'en' | 'ja'): string {
		return locale === 'en'
			? `${SITE.url}/playbooks/${data.slug}`
			: `${SITE.url}/${locale}/playbooks/${data.slug}`;
	}

	const jsonLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: data.title,
		description: data.description,
		datePublished: data.date,
		inLanguage: hreflangTagFor(data.resolvedLocale),
		author: { '@type': 'Person', name: 'Hiro Kuwana', url: 'https://hirokuwana.com' },
		publisher: { '@type': 'Person', name: 'Hiro Kuwana' },
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
	}));
</script>

<svelte:head>
	<title>{data.title} - Hiro Kuwana</title>
	<meta name="description" content={data.description} />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="article:published_time" content={data.date} />
	<meta property="article:author" content="Hiro Kuwana" />
	<link rel="canonical" href={canonicalUrl} />

	{#each data.availableLocales as availableLocale}
		<link rel="alternate" hreflang={hreflangTagFor(availableLocale)} href={urlFor(availableLocale)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{SITE.url}/playbooks/{data.slug}" />

	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<article
	class="mx-auto max-w-[680px] px-6 pt-8 pb-16 transition-all duration-[600ms] [transition-timing-function:var(--ease-out-expo)] sm:px-8 sm:pt-12 sm:pb-24 {visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}"
>
	<header class="mb-12">
		<a
			href={localizeHref('/playbooks')}
			class="group/back text-secondary hover:text-accent mb-8 inline-flex items-center gap-2 text-sm font-medium no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)]"
		>
			<svg aria-hidden="true" class="transition-transform duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover/back:-translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_playbooks()}</span>
		</a>

		{#if data.fellBack}
			<aside class="bg-base-200 border-base-content/10 mb-6 rounded-xl border px-4 py-3 text-sm text-base-content/70" role="note">
				{m.playbook_translation_pending()}
			</aside>
		{/if}

		<h1 class="text-primary m-0 mb-4 text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.2] tracking-[-0.02em]">{data.title}</h1>
		<time datetime={data.date} class="text-base-content/50 block text-[0.9375rem]">{formattedDate}</time>
	</header>

	<div class="prose-content text-base-content/70 text-base leading-[1.8] sm:text-[1.0625rem]">
		<data.content />
	</div>

	<footer class="mt-16">
		<hr class="border-base-content/10 mb-8 border-t" />
		<a
			href={localizeHref('/playbooks')}
			class="group/back text-secondary hover:text-accent inline-flex items-center gap-2 text-[0.9375rem] font-medium no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)]"
		>
			<svg aria-hidden="true" class="transition-transform duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover/back:-translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_playbooks()}</span>
		</a>
	</footer>
</article>
