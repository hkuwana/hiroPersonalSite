<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { SITE } from '$data/constants';
	import { blogPosting, breadcrumbs, jsonLd } from '$lib/seo';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';

	export let data: PageData;

	type Locale = 'en' | 'ja';

	$: lang = (($page.data.locale as Locale | undefined) ?? getLocale()) as Locale;
	$: essaysHref = localizeHref('/essays', { locale: lang });
	$: formattedDate = new Date(`${data.date}T00:00:00`).toLocaleDateString(
		lang === 'ja' ? 'ja-JP' : 'en-US',
		{
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}
	);
	$: formatShortDate = (date: string) =>
		new Date(`${date}T00:00:00`).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
</script>

<svelte:head>
	<title>{data.title} - Hiro Kuwana</title>
	<meta name="description" content={data.description} />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://hirokuwana.com/essays/{data.slug}" />
	<meta property="article:published_time" content={data.date} />
	<meta property="article:modified_time" content={data.updated || data.date} />
	<meta property="article:author" content="Hiro Kuwana" />
	<link rel="canonical" href="https://hirokuwana.com/essays/{data.slug}" />

	<meta property="og:image" content={SITE.image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content={SITE.name} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.title} />
	<meta name="twitter:description" content={data.description} />
	<meta name="twitter:image" content={SITE.image} />

	<!-- BlogPosting and breadcrumb structured data, built by $lib/seo -->
	{@html jsonLd([
		blogPosting(data),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Essays', path: '/essays' },
			{ name: data.title, path: `/essays/${data.slug}` }
		])
	])}
</svelte:head>

<article class="essay-page">
	<header class="essay-header">
		<a href={essaysHref} class="back-link">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{lang === 'ja' ? 'エッセイ' : 'Essays'}</span>
		</a>

		<h1 class="essay-title">{data.title}</h1>
		<p class="essay-meta">
			<time datetime={data.date} class="essay-date">{formattedDate}</time>
			<span class="meta-sep" aria-hidden="true">·</span>
			<a rel="author" href={localizeHref('/about', { locale: lang })} class="essay-byline">Hiro Kuwana</a>
		</p>
	</header>

	<div class="essay-content">
		<svelte:component this={data.content} />
	</div>

	<NewsletterSignup {lang} source="essay" />

	{#if data.moreEssays.length}
		<nav class="more-essays" aria-labelledby="more-essays-heading">
			<h2 id="more-essays-heading" class="more-heading">
				{lang === 'ja' ? 'ほかのエッセイ' : 'More essays'}
			</h2>
			<ol class="more-list">
				{#each data.moreEssays as essay (essay.slug)}
					<li>
						<a href={localizeHref(`/essays/${essay.slug}`, { locale: lang })} class="more-row">
							<time class="more-date" datetime={essay.date}>{formatShortDate(essay.date)}</time>
							<span class="more-title">{essay.title}</span>
						</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}

	<footer class="essay-footer">
		<div class="footer-divider"></div>
		<a href={essaysHref} class="footer-link">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{lang === 'ja' ? 'すべてのエッセイへ戻る' : 'Back to all essays'}</span>
		</a>
	</footer>
</article>

<style>
	.essay-page {
		max-width: 680px;
		margin: 0 auto;
		padding: calc(var(--nav-h) + 2.5rem) 2rem 6rem;
	}

	/* Content is visible without JS; the entrance only runs when motion is welcome. */
	@media (prefers-reduced-motion: no-preference) {
		.essay-page {
			animation: page-in 0.6s var(--ease-out-expo) both;
		}
	}

	@keyframes page-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	/* Header */
	.essay-header {
		margin-bottom: 3rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		margin-bottom: 2rem;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.back-link:hover {
		color: var(--color-accent);
	}

	.back-link:hover svg {
		transform: translateX(-4px);
	}

	.back-link svg {
		transition: transform var(--duration-normal) var(--ease-out-expo);
	}

	.essay-title {
		font-family: var(--f-display);
		font-size: clamp(1.75rem, 5vw, 2.5rem);
		font-weight: 400;
		line-height: 1.2;
		color: var(--ink);
		margin: 0 0 1rem;
		letter-spacing: 0;
	}

	.essay-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin: 0;
		font-size: 0.9375rem;
		color: var(--color-text-tertiary);
	}

	.essay-byline {
		color: var(--color-text-secondary);
		text-decoration: underline;
		text-decoration-color: var(--rule);
		text-underline-offset: 3px;
		transition: color var(--duration-normal) var(--ease-out-expo);
	}

	.essay-byline:hover {
		color: var(--color-accent);
	}

	/* Content */
	.essay-content {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: var(--color-text-secondary);
	}

	/* Markdown content styles */
	.essay-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.essay-content :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 3rem;
		margin-bottom: 1rem;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.essay-content :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
		color: var(--color-text);
	}

	.essay-content :global(ul),
	.essay-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	.essay-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.essay-content :global(blockquote) {
		margin: 2rem 0;
		padding: 1.5rem;
		background: var(--color-bg-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text);
		font-style: italic;
	}

	.essay-content :global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	.essay-content :global(code) {
		font-family: 'SF Mono', Monaco, 'Courier New', monospace;
		font-size: 0.875em;
		background: var(--color-bg-muted);
		padding: 0.2em 0.4em;
		border-radius: var(--radius-sm);
		color: var(--color-text);
	}

	.essay-content :global(pre) {
		background: var(--color-bg-muted);
		padding: 1.25rem;
		border-radius: var(--radius-md);
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.essay-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.essay-content :global(a) {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: opacity var(--duration-fast) var(--ease-out-expo);
	}

	.essay-content :global(a:hover) {
		opacity: 0.8;
	}

	.essay-content :global(strong) {
		font-weight: 600;
		color: var(--color-text);
	}

	.essay-content :global(em) {
		font-style: italic;
	}

	.essay-content :global(hr) {
		border: none;
		height: 1px;
		background: var(--color-border);
		margin: 3rem 0;
	}

	.essay-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-md);
		margin: 2rem 0;
	}

	/* More essays: rules and whitespace, matching the /essays index rows. */
	.more-essays {
		margin-top: 4rem;
	}

	.more-heading {
		margin: 0 0 1rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		font-weight: 400;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.more-list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--rule);
	}

	.more-list li {
		border-bottom: 1px solid var(--rule);
	}

	.more-row {
		position: relative;
		display: block;
		padding: 1.25rem 0 1.25rem 1.75rem;
		text-decoration: none;
		color: inherit;
	}

	.more-row::before {
		content: '';
		position: absolute;
		left: 0;
		top: 2.125rem;
		width: 0.75rem;
		height: 1px;
		background: var(--shu);
		transition: width var(--duration-normal) var(--ease-out-expo);
	}

	.more-date {
		display: block;
		margin-bottom: 0.25rem;
		font-family: var(--f-body);
		font-style: italic;
		font-size: 0.8125rem;
		color: var(--ink-mute);
	}

	.more-title {
		display: block;
		font-family: var(--f-display);
		font-weight: 400;
		font-size: 1.25rem;
		line-height: 1.25;
		color: var(--ink);
		transition: color var(--duration-normal) var(--ease-out-expo);
	}

	.more-row:hover .more-title {
		color: var(--shu);
	}

	.more-row:hover::before {
		width: 1.25rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.more-row::before,
		.more-title,
		.essay-byline {
			transition: none;
		}
	}

	/* Footer */
	.essay-footer {
		margin-top: 4rem;
	}

	.footer-divider {
		width: 60px;
		height: 3px;
		background: var(--color-accent);
		border-radius: 2px;
		margin-bottom: 2rem;
	}

	.footer-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.footer-link:hover {
		color: var(--color-accent);
	}

	.footer-link:hover svg {
		transform: translateX(-4px);
	}

	.footer-link svg {
		transition: transform var(--duration-normal) var(--ease-out-expo);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.essay-page {
			padding: calc(var(--nav-h) + 1.5rem) 1.5rem 4rem;
		}

		.essay-content {
			font-size: 1rem;
		}

		.essay-content :global(h2) {
			font-size: 1.375rem;
		}

		.essay-content :global(h3) {
			font-size: 1.125rem;
		}
	}
</style>
