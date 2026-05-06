<script lang="ts">
	import { page } from '$app/stores';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Locale = 'en' | 'ja';

	const lang = $derived((($page.data.locale as Locale | undefined) ?? getLocale()) as Locale);
	const copy = $derived(
		lang === 'ja'
			? {
					back: 'Writing へ戻る',
					label: 'AI Guides',
					updated: '更新'
				}
			: {
					back: 'Back to writing',
					label: 'AI Guides',
					updated: 'Updated'
				}
	);
	const formattedDate = $derived(
		new Date(data.updated).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
	const Content = $derived(data.content);
</script>

<svelte:head>
	<title>{data.title} - Hiro Kuwana</title>
	<meta name="description" content={data.description} />
	<meta property="og:title" content="{data.title} - Hiro Kuwana" />
	<meta property="og:description" content={data.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://hirokuwana.com/ai-guides" />
	<link rel="canonical" href="https://hirokuwana.com/ai-guides" />
</svelte:head>

<article class="guide-page">
	<header class="guide-hero">
		<a class="back-link" href={localizeHref('/#writing', { locale: lang })}>
			<span aria-hidden="true">←</span>
			{copy.back}
		</a>
		<p class="eyebrow">{copy.label}</p>
		<h1>{data.title}</h1>
		<p class="lede">{data.description}</p>
		<p class="updated">
			{copy.updated}
			<time datetime={data.updated}>{formattedDate}</time>
		</p>
	</header>

	<div class="guide-content">
		<Content />
	</div>
</article>

<style>
	.guide-page {
		width: min(100%, 54rem);
		margin: 0 auto;
		padding: 8rem var(--pad-inline) 7rem;
	}

	.guide-hero {
		border-bottom: 1px solid var(--rule);
		padding-bottom: 2.5rem;
		margin-bottom: 3rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.75rem;
		margin-bottom: 2rem;
		font-family: var(--f-mono);
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-mute);
		transition:
			color var(--duration-normal) var(--ease-out-expo),
			transform var(--duration-normal) var(--ease-out-expo);
	}

	.back-link:hover {
		color: var(--shu);
		transform: translateX(-0.25rem);
	}

	.eyebrow,
	.updated {
		font-family: var(--f-mono);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.guide-hero h1 {
		margin: 0.5rem 0 1.25rem;
		font-family: var(--f-display);
		font-size: clamp(3.5rem, 11vw, 8rem);
		font-weight: 400;
		line-height: 0.9;
		letter-spacing: 0;
		color: var(--ink);
	}

	.lede {
		max-width: 42rem;
		margin: 0;
		font-size: clamp(1.25rem, 2vw, 1.65rem);
		line-height: 1.45;
		color: var(--ink-soft);
	}

	.updated {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin: 1.5rem 0 0;
	}

	.guide-content {
		font-size: clamp(1.05rem, 1.6vw, 1.22rem);
		line-height: 1.78;
		color: var(--ink-soft);
	}

	.guide-content :global(h2) {
		scroll-margin-top: 7rem;
		margin: 4rem 0 1rem;
		font-family: var(--f-display);
		font-size: clamp(2rem, 5vw, 3.35rem);
		font-weight: 400;
		line-height: 1.05;
		color: var(--ink);
		letter-spacing: 0;
	}

	.guide-content :global(p) {
		margin: 0 0 1.35rem;
	}

	.guide-content :global(ul),
	.guide-content :global(ol) {
		margin: 0 0 1.5rem;
		padding-left: 1.5rem;
	}

	.guide-content :global(li) {
		margin-bottom: 0.4rem;
	}

	.guide-content :global(pre) {
		margin: 2rem 0;
		padding: 1.25rem;
		overflow-x: auto;
		background: var(--paper-2);
		border: 1px solid var(--rule);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.guide-content :global(code) {
		font-family: var(--f-mono);
		font-size: 0.82em;
	}

	.guide-content :global(:not(pre) > code) {
		padding: 0.1rem 0.3rem;
		background: var(--paper-2);
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
	}

	@media (max-width: 760px) {
		.guide-page {
			padding-top: 10.25rem;
			padding-bottom: 5rem;
		}

		.guide-hero {
			margin-bottom: 2.25rem;
		}
	}
</style>
