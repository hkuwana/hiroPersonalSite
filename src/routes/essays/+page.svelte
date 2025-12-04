<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Essays - Hiro Kuwana</title>
	<meta name="description" content="Essays on technology, startups, education, and building things that last." />
	<meta property="og:title" content="Essays - Hiro Kuwana" />
	<meta property="og:description" content="Essays on technology, startups, education, and building things that last." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hirokuwana.com/essays" />
	<link rel="canonical" href="https://hirokuwana.com/essays" />
</svelte:head>

<article class="essay-container">
	<header class="essay-header">
		<h1>Essays</h1>
	</header>

	<div class="essay-list">
		{#each data.essays as essay}
			<a href="/essays/{essay.slug}" class="essay-item">
				<span class="essay-date">{new Date(essay.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
				<span class="essay-title">{essay.title}</span>
			</a>
		{/each}
	</div>

	<footer class="essay-footer">
		<a href="/">&larr; Back to home</a>
	</footer>
</article>

<style>
	.essay-container {
		max-width: 650px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: Georgia, 'Times New Roman', serif;
	}

	.essay-header h1 {
		font-size: 2rem;
		font-weight: normal;
		margin-bottom: 2rem;
		color: #333;
	}

	.essay-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.essay-item {
		display: flex;
		gap: 1rem;
		text-decoration: none;
		color: inherit;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	.essay-item:hover .essay-title {
		color: #666;
	}

	.essay-date {
		color: #999;
		font-size: 0.9rem;
		min-width: 120px;
		flex-shrink: 0;
	}

	.essay-title {
		color: #333;
		font-size: 1.1rem;
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

	@media (max-width: 600px) {
		.essay-item {
			flex-direction: column;
			gap: 0.25rem;
		}

		.essay-date {
			min-width: auto;
		}
	}
</style>
