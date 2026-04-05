<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props<{ data: PageData }>();

	let visible = false;

	const locale = $derived(getLocale());

	onMount(() => {
		requestAnimationFrame(() => {
			visible = true;
		});
	});
</script>

<svelte:head>
	<title>{m.nav_essays()} - Hiro Kuwana</title>
	<meta name="description" content="Essays on technology, startups, education, and building things that last." />
	<meta property="og:title" content="{m.nav_essays()} - Hiro Kuwana" />
	<meta property="og:description" content="Essays on technology, startups, education, and building things that last." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hirokuwana.com/essays" />
	<link rel="canonical" href="https://hirokuwana.com/essays" />
</svelte:head>

<article class="essays-page" class:visible>
	<header class="page-header">
		<h1 class="page-title text-primary">{m.nav_essays()}</h1>
		<p class="page-subtitle text-secondary">Thoughts on technology, startups, and building things that matter</p>
	</header>

	<div class="essays-list">
		{#each data.essays as essay, i}
			<a
				href={localizeHref(`/essays/${essay.slug}`)}
				class="essay-card"
				style="--delay: {i * 0.05}s"
			>
				<time class="essay-date text-base-content/50">
					{new Date(essay.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
				<h2 class="essay-title text-primary hover:text-accent">{essay.title}</h2>
				<div class="essay-arrow">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</a>
		{/each}
	</div>

	<footer class="page-footer">
		<a href={localizeHref('/')} class="back-link text-secondary hover:text-accent">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_home()}</span>
		</a>
	</footer>
</article>

<style>
	.essays-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 4rem 2rem 6rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s var(--ease-out-expo);
	}

	.essays-page.visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Header */
	.page-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: oklch(var(--bc));
		margin: 0 0 0.75rem;
		letter-spacing: -0.03em;
	}

	.page-subtitle {
		font-size: 1.0625rem;
		color: oklch(var(--bc) / 0.7);
		margin: 0;
	}

	/* Essays List */
	.essays-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.essay-card {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.25rem 1.5rem;
		background: oklch(var(--b1));
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 1rem;
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
		transition-delay: var(--delay);
	}

	.essay-card:hover {
		background: oklch(var(--b2));
		border-color: oklch(var(--bc) / 0.12);
		transform: translateX(4px);
		box-shadow: 0 4px 6px oklch(var(--bc) / 0.05);
	}

	.essay-date {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.5);
		min-width: 120px;
		flex-shrink: 0;
	}

	.essay-title {
		flex: 1;
		font-size: 1.0625rem;
		font-weight: 500;
		color: oklch(var(--bc));
		margin: 0;
		transition: color var(--duration-normal) var(--ease-out-expo);
	}

	.essay-card:hover .essay-title {
		color: oklch(var(--a));
	}

	.essay-arrow {
		color: oklch(var(--bc) / 0.5);
		opacity: 0;
		transform: translateX(-8px);
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.essay-card:hover .essay-arrow {
		opacity: 1;
		transform: translateX(0);
		color: oklch(var(--a));
	}

	/* Footer */
	.page-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.1);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.back-link:hover {
		color: oklch(var(--a));
	}

	.back-link:hover svg {
		transform: translateX(-4px);
	}

	.back-link svg {
		transition: transform var(--duration-normal) var(--ease-out-expo);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.essays-page {
			padding: 3rem 1.5rem 4rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.essay-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
			padding: 1rem 1.25rem;
		}

		.essay-date {
			min-width: auto;
		}

		.essay-arrow {
			display: none;
		}
	}
</style>
