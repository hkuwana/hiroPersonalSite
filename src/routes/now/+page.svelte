<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<svelte:head>
	<title>{m.now_meta_title()}</title>
	<meta name="description" content={m.now_meta_description()} />
	<link rel="canonical" href="https://hirokuwana.com/now" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<article class="now-page">
	<header class="now-header">
		<p class="eyebrow text-base-content/50">{m.now_eyebrow()}</p>
		<h1 class="title text-primary">{m.now_title()}</h1>
		<p class="updated text-base-content/50">{m.now_updated()}</p>
	</header>

	<section class="now-section">
		<h2 class="text-primary">{m.now_building_h2()}</h2>
		{@html m.now_building_html()}
	</section>

	<section class="now-section">
		<h2 class="text-primary">{m.now_writing_h2()}</h2>
		{@html m.now_writing_html()}
	</section>

	<section class="now-section">
		<h2 class="text-primary">{m.now_advising_h2()}</h2>
		{@html m.now_advising_html()}
	</section>

	<section class="now-section">
		<h2 class="text-primary">{m.now_reading_h2()}</h2>
		{@html m.now_reading_html()}
	</section>

	<footer class="now-footer">
		{@html m.now_footer_html()}
		<a href={localizeHref('/')} class="back-link">← {m.common_back_home()}</a>
	</footer>
</article>

<style>
	.now-page {
		max-width: 42rem;
		margin: 0 auto;
		padding: 5rem 1.5rem 6rem;
	}

	.now-header {
		margin-bottom: 3rem;
	}

	.eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0 0 0.5rem;
	}

	.title {
		font-size: clamp(1.75rem, 3vw + 1rem, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.025em;
		margin: 0 0 0.5rem;
	}

	.updated {
		font-size: 0.8125rem;
		margin: 0;
	}

	.now-section {
		margin-bottom: 2.5rem;
	}

	.now-section h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.625rem;
		letter-spacing: -0.01em;
	}

	.now-section :global(p) {
		font-size: 1rem;
		line-height: 1.7;
		color: oklch(var(--bc) / 0.7);
		margin: 0;
	}

	.now-section :global(a) {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.now-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.08);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.now-footer :global(p) {
		font-size: 0.875rem;
		margin: 0;
		color: oklch(var(--bc) / 0.6);
	}

	.now-footer :global(a) {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.back-link {
		font-size: 0.875rem;
		text-decoration: none !important;
		color: oklch(var(--bc) / 0.6) !important;
	}

	.back-link:hover {
		color: oklch(var(--a)) !important;
	}
</style>
