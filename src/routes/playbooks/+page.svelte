<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props<{ data: PageData }>();

	let visible = $state(false);

	const locale = $derived(getLocale());

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			visible = true;
		} else {
			requestAnimationFrame(() => { visible = true; });
		}
	});
</script>

<svelte:head>
	<title>{m.nav_playbooks()} - Hiro Kuwana</title>
	<meta name="description" content="Tactical playbooks: the actual prompts, loops, and tools I run to remove SaaS from my one-person company." />
	<meta property="og:title" content="{m.nav_playbooks()} - Hiro Kuwana" />
	<meta property="og:description" content="Tactical playbooks: the actual prompts, loops, and tools I run to remove SaaS from my one-person company." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hirokuwana.com/playbooks" />
	<link rel="canonical" href="https://hirokuwana.com/playbooks" />
</svelte:head>

<main
	class="mx-auto max-w-[720px] px-6 pt-12 pb-16 transition-all duration-[600ms] [transition-timing-function:var(--ease-out-expo)] sm:px-8 sm:pt-16 sm:pb-24 {visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}"
>
	<header class="mb-12 text-center">
		<h1 class="text-primary m-0 mb-3 text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">{m.nav_playbooks()}</h1>
		<p class="text-secondary m-0 text-[1.0625rem]">The actual prompts, loops, and tools I run. Steal them.</p>
	</header>

	<div class="flex flex-col gap-3">
		{#each data.playbooks as playbook, i}
			<a
				href={localizeHref(`/playbooks/${playbook.slug}`)}
				class="group bg-base-100 border-base-content/10 hover:bg-base-200 hover:border-base-content/[0.12] flex flex-col items-start gap-2 rounded-2xl border px-5 py-4 no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)] hover:translate-x-1 hover:shadow-md sm:flex-row sm:items-start sm:gap-6 sm:px-6 sm:py-5"
				style="transition-delay: {i * 0.05}s"
			>
				<time
					datetime={playbook.date}
					class="text-base-content/50 shrink-0 text-[0.8125rem] sm:min-w-[120px] sm:pt-[0.15rem]"
				>
					{new Date(playbook.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
				<div class="flex flex-1 flex-col gap-1">
					<h2 class="text-primary group-hover:text-accent m-0 text-[1.0625rem] font-medium transition-colors duration-[250ms] [transition-timing-function:var(--ease-out-expo)]">
						{playbook.title}
						{#if playbook.isDraft}<span class="text-warning border-warning/40 ml-2 rounded-full border px-2 py-0.5 align-middle text-[0.625rem] font-semibold uppercase tracking-wider">Draft</span>{/if}
					</h2>
					{#if playbook.description}
						<p class="text-base-content/50 m-0 text-[0.875rem] leading-[1.5]">{playbook.description}</p>
					{/if}
				</div>
				<div aria-hidden="true" class="text-base-content/50 group-hover:text-accent hidden -translate-x-2 opacity-0 transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 sm:block sm:pt-[0.15rem]">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</a>
		{:else}
			<div class="border-base-content/10 bg-base-100/50 rounded-2xl border border-dashed px-6 py-12 text-center">
				<p class="text-secondary m-0 text-[1rem]">No playbooks published yet — first one is on the way.</p>
				<p class="text-base-content/50 mt-2 mb-0 text-[0.875rem]">In the meantime, the <a href={localizeHref('/essays')} class="text-accent underline-offset-4 hover:underline">essays</a> cover the thinking behind them.</p>
			</div>
		{/each}
	</div>

	<footer class="border-base-content/10 mt-16 border-t pt-8">
		<a href={localizeHref('/')} class="group/back text-secondary hover:text-accent inline-flex items-center gap-2 text-[0.9375rem] font-medium no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)]">
			<svg aria-hidden="true" class="transition-transform duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover/back:-translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_home()}</span>
		</a>
	</footer>
</main>
