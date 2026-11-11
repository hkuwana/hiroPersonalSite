<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { SITE } from '$data/constants';
	import { blog, breadcrumbs, jsonLd } from '$lib/seo';

	export let data: PageData;

	type Locale = 'en' | 'ja';

	$: lang = (($page.data.locale as Locale | undefined) ?? getLocale()) as Locale;
	$: formatDate = (date: string) =>
		new Date(`${date}T00:00:00`).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
</script>

<svelte:head>
	<title>Essays - Hiro Kuwana</title>
	<meta name="description" content="Field notes from building Kaiwa, practical AI workflows, and essays on product, language, and human judgment." />
	<meta property="og:title" content="Essays - Hiro Kuwana" />
	<meta property="og:description" content="Field notes from building Kaiwa, practical AI workflows, and essays on product, language, and human judgment." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hirokuwana.com/essays" />
	<meta property="og:image" content={SITE.image} />
	<meta property="og:site_name" content={SITE.name} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Essays - Hiro Kuwana" />
	<meta name="twitter:description" content="Field notes from building Kaiwa, practical AI workflows, and essays on product, language, and human judgment." />
	<meta name="twitter:image" content={SITE.image} />
	<link rel="canonical" href="https://hirokuwana.com/essays" />
	{@html jsonLd([
		blog(data.essays),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Essays', path: '/essays' }
		])
	])}
</svelte:head>

<article class="essays-page">
	<header class="page-header">
		<h1 class="page-title">Essays</h1>
		<p class="page-subtitle">Field notes from building Kaiwa, and the questions underneath the work.</p>
	</header>

	<ol class="essays-list">
		{#each data.essays as essay (essay.slug)}
			<li>
				<a href={localizeHref(`/essays/${essay.slug}`, { locale: lang })} class="essay-row">
					<time class="essay-date" datetime={essay.date}>{formatDate(essay.date)}</time>
					<h2 class="essay-title">{essay.title}</h2>
					{#if essay.description}
						<p class="essay-description">{essay.description}</p>
					{/if}
				</a>
			</li>
		{/each}
	</ol>

	<footer class="page-footer">
		<a href={localizeHref('/', { locale: lang })} class="back-link">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{lang === 'ja' ? 'ホームへ戻る' : 'Back to home'}</span>
		</a>
	</footer>
</article>

<style>
	.essays-page {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(var(--nav-h) + 2.5rem) 2rem 6rem;
	}

	/* Content is visible without JS; the entrance only runs when motion is welcome. */
	@media (prefers-reduced-motion: no-preference) {
		.essays-page {
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
	.page-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.page-title {
		font-family: var(--f-display);
		font-size: 2.5rem;
		font-weight: 400;
		line-height: 1.15;
		color: var(--ink);
		margin: 0 0 0.75rem;
		letter-spacing: 0;
	}

	.page-subtitle {
		font-size: 1.0625rem;
		color: var(--ink-soft);
		margin: 0;
	}

	/* Essays list: rules and whitespace, no cards (matches home .col-philo .post). */
	.essays-list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--rule);
	}

	.essays-list li {
		border-bottom: 1px solid var(--rule);
	}

	.essay-row {
		position: relative;
		display: block;
		padding: 1.75rem 0 1.75rem 1.75rem;
		text-decoration: none;
		color: inherit;
	}

	.essay-row::before {
		content: '';
		position: absolute;
		left: 0;
		top: 2.625rem;
		width: 0.75rem;
		height: 1px;
		background: var(--shu);
		transition: width var(--duration-normal) var(--ease-out-expo);
	}

	.essay-date {
		display: block;
		margin-bottom: 0.375rem;
		font-family: var(--f-body);
		font-style: italic;
		font-size: 0.8125rem;
		color: var(--ink-mute);
	}

	.essay-title {
		margin: 0 0 0.5rem;
		font-family: var(--f-display);
		font-weight: 400;
		font-size: 1.5rem;
		line-height: 1.2;
		color: var(--ink);
		transition: color var(--duration-normal) var(--ease-out-expo);
	}

	.essay-description {
		margin: 0;
		font-family: var(--f-body);
		font-size: 1rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	.essay-row:hover .essay-title {
		color: var(--shu);
	}

	.essay-row:hover::before {
		width: 1.25rem;
	}

	/* Footer */
	.page-footer {
		margin-top: 4rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.75rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-mute);
		text-decoration: none;
		transition: color var(--duration-normal) var(--ease-out-expo);
	}

	.back-link:hover {
		color: var(--shu);
	}

	.back-link svg {
		transition: transform var(--duration-normal) var(--ease-out-expo);
	}

	.back-link:hover svg {
		transform: translateX(-4px);
	}

	@media (prefers-reduced-motion: reduce) {
		.essay-row::before,
		.essay-title,
		.back-link,
		.back-link svg {
			transition: none;
		}
	}

	/* Responsive */
	@media (max-width: 640px) {
		.essays-page {
			padding: calc(var(--nav-h) + 1.5rem) 1.5rem 4rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.essay-row {
			padding: 1.5rem 0 1.5rem 1.5rem;
		}

		.essay-row::before {
			top: 2.375rem;
		}

		.essay-title {
			font-size: 1.3125rem;
		}
	}
</style>
