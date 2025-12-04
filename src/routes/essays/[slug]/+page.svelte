<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

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

<article class="essay-container">
	<header class="essay-header">
		<h1>{data.title}</h1>
		<time datetime={data.date}>{formattedDate}</time>
	</header>

	<div class="essay-content">
		<svelte:component this={data.content} />
	</div>

	<footer class="essay-footer">
		<a href="/essays">&larr; Back to essays</a>
	</footer>
</article>

<style>
	.essay-container {
		max-width: 650px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: Georgia, 'Times New Roman', serif;
	}

	.essay-header {
		margin-bottom: 2rem;
	}

	.essay-header h1 {
		font-size: 2rem;
		font-weight: normal;
		line-height: 1.3;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.essay-header time {
		color: #999;
		font-size: 0.9rem;
	}

	.essay-content {
		font-size: 1.125rem;
		line-height: 1.7;
		color: #333;
	}

	/* Markdown content styles */
	.essay-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.essay-content :global(h2) {
		font-size: 1.4rem;
		font-weight: normal;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.essay-content :global(h3) {
		font-size: 1.2rem;
		font-weight: normal;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		color: #333;
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
		margin: 1.5rem 0;
		padding-left: 1.5rem;
		border-left: 3px solid #ddd;
		color: #666;
		font-style: italic;
	}

	.essay-content :global(code) {
		font-family: 'SF Mono', Monaco, 'Courier New', monospace;
		font-size: 0.9em;
		background: #f5f5f5;
		padding: 0.2em 0.4em;
		border-radius: 3px;
	}

	.essay-content :global(pre) {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.essay-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.essay-content :global(a) {
		color: #333;
		text-decoration: underline;
	}

	.essay-content :global(a:hover) {
		color: #666;
	}

	.essay-content :global(strong) {
		font-weight: 600;
	}

	.essay-content :global(hr) {
		border: none;
		border-top: 1px solid #eee;
		margin: 2rem 0;
	}

	.essay-footer {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.essay-footer a {
		color: #666;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.essay-footer a:hover {
		color: #333;
	}
</style>
