<script lang="ts">
	// 巻物: a hand scroll that unrolls beside the scene when the akabeko
	// reaches a place. Text comes from place-content.ts (site copy, reused as
	// is). The four kanji tabs switch between the four sails.
	import { FACETS } from '$lib/home/facets';
	import type { FacetId, Locale, PlaceContent } from '$lib/ink/place-content';

	let {
		content,
		lang,
		onclose,
		onfacet
	}: {
		content: PlaceContent;
		lang: Locale;
		onclose: () => void;
		onfacet: (id: FacetId) => void;
	} = $props();

	let el = $state<HTMLElement>();
	$effect(() => {
		void content;
		el?.focus({ preventScroll: true });
	});
</script>

{#key content}
	<div
		class="scroll"
		role="dialog"
		aria-modal="false"
		aria-labelledby="scroll-title"
		tabindex="-1"
		bind:this={el}
	>
		<div class="paper">
			<button
				type="button"
				class="close"
				onclick={onclose}
				aria-label={lang === 'ja' ? '閉じる' : 'Close'}>×</button
			>
			<p class="place">{content.place}</p>
			<div class="tabs" role="tablist" aria-label={lang === 'ja' ? '風車の羽根' : 'Windmill sails'}>
				{#each FACETS as f (f.id)}
					<button
						type="button"
						role="tab"
						aria-selected={f.id === content.facet}
						title={f.title[lang]}
						onclick={() => onfacet(f.id)}>{f.kanji}</button
					>
				{/each}
			</div>
			<div class="head">
				<span class="kanji" aria-hidden="true">{content.kanji}</span>
				<h2 id="scroll-title">{content.title}</h2>
			</div>
			{#if content.line}
				<p class="line">{content.line}</p>
			{/if}
			{#if content.items.length}
				<ul>
					{#each content.items as item (item.href + item.label)}
						<li>
							<a
								href={item.href}
								target={item.external ? '_blank' : undefined}
								rel={item.external ? 'noopener noreferrer' : undefined}>{item.label}</a
							>
							{#if item.meta}<span class="meta">{item.meta}</span>{/if}
						</li>
					{/each}
				</ul>
			{/if}
			{#if content.link}
				<a
					class="more"
					href={content.link.href}
					target={content.link.external ? '_blank' : undefined}
					rel={content.link.external ? 'noopener noreferrer' : undefined}>{content.link.label}</a
				>
			{/if}
		</div>
	</div>
{/key}

<style>
	.scroll {
		position: absolute;
		top: 50%;
		right: 1.75rem;
		transform: translateY(-50%);
		width: min(23rem, calc(100% - 3.5rem));
		max-height: calc(100% - 7rem);
		display: flex;
		outline: none;
		z-index: 3;
	}
	/* Two wooden rods: the right one holds still, the left one rolls open. */
	.scroll::before,
	.scroll::after {
		content: '';
		position: absolute;
		top: -0.6rem;
		bottom: -0.6rem;
		width: 0.7rem;
		background: var(--wood);
		border: 1px solid var(--ink);
		border-radius: 0.35rem;
	}
	.scroll::after {
		right: -0.35rem;
	}
	.scroll::before {
		left: -0.35rem;
		animation: rod 560ms var(--ease-out-quart) both;
	}
	.paper {
		position: relative;
		flex: 1;
		overflow: auto;
		padding: 1.4rem 1.6rem 1.5rem;
		background: var(--paper);
		border-top: 1px solid var(--ink);
		border-bottom: 1px solid var(--ink);
		animation: unroll 560ms var(--ease-out-quart) both;
	}
	@keyframes unroll {
		from {
			clip-path: inset(0 0 0 100%);
		}
		to {
			clip-path: inset(0);
		}
	}
	@keyframes rod {
		from {
			left: calc(100% - 0.35rem);
		}
		to {
			left: -0.35rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.paper,
		.scroll::before {
			animation: none;
		}
	}
	.close {
		position: absolute;
		top: 0.5rem;
		right: 0.6rem;
		width: 2rem;
		height: 2rem;
		font-size: 1.2rem;
		line-height: 1;
		color: var(--ink-mute);
		background: none;
		border: 0;
		cursor: pointer;
	}
	.close:hover {
		color: var(--ink);
	}
	.place {
		margin: 0 0 0.6rem;
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}
	.tabs {
		display: flex;
		gap: 0.3rem;
		margin: -0.2rem 0 0.8rem;
	}
	.tabs button {
		width: 2.1rem;
		height: 2.1rem;
		font-family: var(--f-jp);
		font-size: 1.05rem;
		color: var(--ink-mute);
		background: none;
		border: 1px solid var(--rule);
		border-radius: 50%;
		cursor: pointer;
		transition:
			color var(--duration-fast),
			border-color var(--duration-fast),
			transform var(--duration-fast);
	}
	.tabs button:hover {
		color: var(--ink);
		border-color: var(--ink);
		transform: translateY(-1px);
	}
	.tabs button[aria-selected='true'] {
		color: var(--paper);
		background: var(--ebicha);
		border-color: var(--ebicha);
	}
	.head {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}
	.kanji {
		font-family: var(--f-jp);
		font-size: 2.8rem;
		line-height: 1;
		color: var(--ebicha);
	}
	h2 {
		margin: 0;
		font-family: var(--f-display);
		font-size: 1.6rem;
		font-weight: 500;
		color: var(--ink);
	}
	.line {
		margin: 0.9rem 0 0;
		font-family: var(--f-display);
		font-size: 1.05rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}
	ul {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0.75rem 0 0;
		border-top: 1px solid var(--rule);
		display: grid;
		gap: 0.55rem;
	}
	li {
		display: grid;
		gap: 0.1rem;
	}
	li a {
		font-family: var(--f-body);
		font-size: 1rem;
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--rule);
		text-underline-offset: 0.2em;
	}
	li a:hover {
		text-decoration-color: var(--ebicha);
	}
	.meta {
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.04em;
		color: var(--ink-mute);
	}
	.more {
		display: inline-block;
		margin-top: 1.1rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ebicha);
	}
	@media (max-width: 640px) {
		.scroll {
			top: auto;
			bottom: 4.5rem;
			right: 1rem;
			left: 1rem;
			width: auto;
			transform: none;
			max-height: 55%;
		}
	}
</style>
