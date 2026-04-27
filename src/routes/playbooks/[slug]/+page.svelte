<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props<{ data: PageData }>();

	let visible = $state(false);

	onMount(() => {
		requestAnimationFrame(() => {
			visible = true;
		});
	});

	const locale = $derived(getLocale());
	const formattedDate = $derived(new Date(data.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}));
</script>

<svelte:head>
	<title>{data.title} - Hiro Kuwana</title>
	<meta name="description" content={data.description} />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://hirokuwana.com/playbooks/{data.slug}" />
	<meta property="article:published_time" content={data.date} />
	<meta property="article:author" content="Hiro Kuwana" />
	<link rel="canonical" href="https://hirokuwana.com/playbooks/{data.slug}" />

	{@html `<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Article",
			"headline": "${data.title}",
			"description": "${data.description}",
			"datePublished": "${data.date}",
			"author": {
				"@type": "Person",
				"name": "Hiro Kuwana",
				"url": "https://hirokuwana.com"
			},
			"publisher": {
				"@type": "Person",
				"name": "Hiro Kuwana"
			},
			"mainEntityOfPage": {
				"@type": "WebPage",
				"@id": "https://hirokuwana.com/playbooks/${data.slug}"
			}
		}
	</script>`}
</svelte:head>

<article
	class="playbook-page mx-auto max-w-[680px] px-6 pt-8 pb-16 transition-all duration-[600ms] [transition-timing-function:var(--ease-out-expo)] sm:px-8 sm:pt-12 sm:pb-24 {visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}"
>
	<header class="mb-12">
		<a
			href={localizeHref('/playbooks')}
			class="group/back text-secondary hover:text-accent mb-8 inline-flex items-center gap-2 text-sm font-medium no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)]"
		>
			<svg class="transition-transform duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover/back:-translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_playbooks()}</span>
		</a>

		<h1 class="text-primary m-0 mb-4 text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.2] tracking-[-0.02em]">{data.title}</h1>
		<time datetime={data.date} class="text-base-content/50 block text-[0.9375rem]">{formattedDate}</time>
	</header>

	<div class="playbook-content text-base-content/70 text-base leading-[1.8] sm:text-[1.0625rem]">
		<data.content />
	</div>

	<footer class="mt-16">
		<div class="from-accent to-secondary mb-8 h-[3px] w-[60px] rounded-sm bg-gradient-to-r"></div>
		<a
			href={localizeHref('/playbooks')}
			class="group/back text-secondary hover:text-accent inline-flex items-center gap-2 text-[0.9375rem] font-medium no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)]"
		>
			<svg class="transition-transform duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover/back:-translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_playbooks()}</span>
		</a>
	</footer>
</article>

<style>
	/* Markdown content styling — applied to mdsvex output that has no class control. */
	.playbook-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.playbook-content :global(h2) {
		font-size: 1.375rem;
		font-weight: 600;
		margin-top: 3rem;
		margin-bottom: 1rem;
		color: oklch(var(--bc));
		letter-spacing: -0.02em;
	}

	.playbook-content :global(h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
		color: oklch(var(--bc));
	}

	.playbook-content :global(ul),
	.playbook-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	.playbook-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.playbook-content :global(blockquote) {
		margin: 2rem 0;
		padding: 1.5rem 1.5rem 1.5rem 2rem;
		background: oklch(var(--b2));
		border-left: 3px solid oklch(var(--a));
		border-radius: 0 0.75rem 0.75rem 0;
		color: oklch(var(--bc));
		font-style: italic;
	}

	.playbook-content :global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	.playbook-content :global(code) {
		font-family: 'SF Mono', Monaco, 'Courier New', monospace;
		font-size: 0.875em;
		background: oklch(var(--b2));
		padding: 0.2em 0.4em;
		border-radius: 0.375rem;
		color: oklch(var(--bc));
	}

	.playbook-content :global(pre) {
		background: oklch(var(--b2));
		padding: 1.25rem;
		border-radius: 0.75rem;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.playbook-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.playbook-content :global(a) {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: opacity var(--duration-fast) var(--ease-out-expo);
	}

	.playbook-content :global(a:hover) {
		opacity: 0.8;
	}

	.playbook-content :global(strong) {
		font-weight: 600;
		color: oklch(var(--bc));
	}

	.playbook-content :global(em) {
		font-style: italic;
	}

	.playbook-content :global(hr) {
		border: none;
		height: 1px;
		background: oklch(var(--bc) / 0.1);
		margin: 3rem 0;
	}

	.playbook-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.75rem;
		margin: 2rem 0;
	}

	@media (min-width: 641px) {
		.playbook-content :global(h2) {
			font-size: 1.5rem;
		}
		.playbook-content :global(h3) {
			font-size: 1.25rem;
		}
	}
</style>
