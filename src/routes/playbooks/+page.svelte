<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props<{ data: PageData }>();

	let visible = $state(false);

	const locale = $derived(getLocale());

	onMount(() => {
		requestAnimationFrame(() => {
			visible = true;
		});
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

<article
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
				class="group bg-base-100 border-base-content/10 hover:bg-base-200 hover:border-base-content/[0.12] flex flex-col items-start gap-2 rounded-2xl border px-5 py-4 no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)] hover:translate-x-1 hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5"
				style="transition-delay: {i * 0.05}s"
			>
				<time class="text-base-content/50 shrink-0 text-[0.8125rem] sm:min-w-[120px]">
					{new Date(playbook.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
				<h2 class="text-primary group-hover:text-accent m-0 flex-1 text-[1.0625rem] font-medium transition-colors duration-[250ms] [transition-timing-function:var(--ease-out-expo)]">{playbook.title}</h2>
				<div class="text-base-content/50 group-hover:text-accent hidden -translate-x-2 opacity-0 transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 sm:block">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</a>
		{/each}
	</div>

	<footer class="border-base-content/10 mt-16 border-t pt-8">
		<a href={localizeHref('/')} class="group/back text-secondary hover:text-accent inline-flex items-center gap-2 text-[0.9375rem] font-medium no-underline transition-all duration-[250ms] [transition-timing-function:var(--ease-out-expo)]">
			<svg class="transition-transform duration-[250ms] [transition-timing-function:var(--ease-out-expo)] group-hover/back:-translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{m.nav_home()}</span>
		</a>
	</footer>
</article>
