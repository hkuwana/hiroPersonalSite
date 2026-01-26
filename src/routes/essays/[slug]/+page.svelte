<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let visible = false;

	onMount(() => {
		requestAnimationFrame(() => {
			visible = true;
		});
	});

	const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
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
	<meta property="article:author" content="Hiro Kuwana" />
	<link rel="canonical" href="https://hirokuwana.com/essays/{data.slug}" />

	<!-- Article structured data -->
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
				"@id": "https://hirokuwana.com/essays/${data.slug}"
			}
		}
	</script>`}
</svelte:head>

<article class="essay-page" class:visible>
	<header class="essay-header">
		<a href="/essays" class="back-link">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>Essays</span>
		</a>

		<h1 class="essay-title">{data.title}</h1>
		<time datetime={data.date} class="essay-date">{formattedDate}</time>
	</header>

	<div class="essay-content">
		<svelte:component this={data.content} />
	</div>

	<footer class="essay-footer">
		<div class="footer-divider"></div>
		<a href="/essays" class="footer-link">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>Back to all essays</span>
		</a>
	</footer>
</article>

<style>
	.essay-page {
		max-width: 680px;
		margin: 0 auto;
		padding: 3rem 2rem 6rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s var(--ease-out-expo);
	}

	.essay-page.visible {
		opacity: 1;
		transform: translateY(0);
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
		font-size: clamp(1.75rem, 5vw, 2.5rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-text);
		margin: 0 0 1rem;
		letter-spacing: -0.02em;
	}

	.essay-date {
		display: block;
		font-size: 0.9375rem;
		color: var(--color-text-tertiary);
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
		padding: 1.5rem 1.5rem 1.5rem 2rem;
		background: var(--color-bg-muted);
		border-left: 3px solid var(--color-accent);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
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

	/* Footer */
	.essay-footer {
		margin-top: 4rem;
	}

	.footer-divider {
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, var(--color-accent), #8b5cf6);
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
			padding: 2rem 1.5rem 4rem;
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
