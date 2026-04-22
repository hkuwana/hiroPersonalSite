<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<svelte:head>
	<title>{m.privacy_meta_title()}</title>
	<meta name="description" content={m.privacy_meta_description()} />
	<link rel="canonical" href="https://hirokuwana.com/privacy" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<article class="privacy-page">
	<header>
		<p class="eyebrow text-base-content/50">{m.privacy_eyebrow()}</p>
		<h1 class="title text-primary">{m.privacy_title()}</h1>
		<p class="updated text-base-content/50">{m.privacy_updated()}</p>
	</header>

	<section>
		<h2 class="text-primary">{m.privacy_short_h2()}</h2>
		<p>{m.privacy_short_body()}</p>
	</section>

	<section>
		<h2 class="text-primary">{m.privacy_collect_h2()}</h2>
		{@html m.privacy_collect_html()}
	</section>

	<section>
		<h2 class="text-primary">{m.privacy_exclude_h2()}</h2>
		{@html m.privacy_exclude_html()}
	</section>

	<section>
		<h2 class="text-primary">{m.privacy_third_h2()}</h2>
		{@html m.privacy_third_html()}
	</section>

	<section>
		<h2 class="text-primary">{m.privacy_requests_h2()}</h2>
		{@html m.privacy_requests_html()}
	</section>

	<footer>
		<a href={localizeHref('/')} class="back-link">← {m.common_back_home()}</a>
	</footer>
</article>

<style>
	.privacy-page {
		max-width: 42rem;
		margin: 0 auto;
		padding: 5rem 1.5rem 6rem;
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
		margin: 0 0 3rem;
	}

	section {
		margin-bottom: 2.5rem;
	}

	section h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
		letter-spacing: -0.01em;
	}

	section p,
	section :global(li) {
		font-size: 1rem;
		line-height: 1.7;
		color: oklch(var(--bc) / 0.75);
	}

	section p {
		margin: 0;
	}

	section :global(ul) {
		margin: 0;
		padding-left: 1.25rem;
	}

	section :global(li) {
		margin-bottom: 0.5rem;
	}

	section :global(a) {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	footer {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.08);
	}

	.back-link {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		text-decoration: none;
	}

	.back-link:hover {
		color: oklch(var(--a));
	}
</style>
