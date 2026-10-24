<script lang="ts">
	// 家 Hiro's house, behind the izakaya curtain: a tatami room open to a
	// garden. Each object is one part of the site; the journal says what it
	// is and where to go. The shelf of buttons holds the same list.
	import { localizeHref } from '$lib/paraglide/runtime';
	import { track } from '$lib/analytics';
	import RoomStage from './RoomStage.svelte';
	import { houseContent, type EmakiAction } from './emaki-content';
	import type { Locale } from './place-content';
	import type { Room } from './workshop';

	let {
		lang,
		reduceMotion = false,
		lightweight = false,
		onleave,
		onready,
		onroom,
		onbrush
	}: {
		lang: Locale;
		reduceMotion?: boolean;
		lightweight?: boolean;
		onleave: () => void;
		onready: () => void;
		onroom: (room: Room) => void;
		onbrush: () => void;
	} = $props();

	const c = $derived(
		lang === 'ja'
			? {
					title: '家 · いらっしゃい',
					back: '村へ戻る',
					list: '家の中',
					loading: '家を読み込んでいます…',
					fallback: '軽量表示 · サイトのすべてを閲覧できます。',
					hint: '部屋の物を選ぶ · ドラッグで見回す',
					closer: '近づく',
					further: '離れる',
					recentre: '視点を戻す',
					prev: '前へ',
					next: '次へ'
				}
			: {
					title: 'The house · irasshai',
					back: 'Back to the village',
					list: 'In the house',
					loading: 'Opening the house…',
					fallback: 'Lightweight view · The whole site is here.',
					hint: 'Choose something in the room · drag to look around',
					closer: 'Closer',
					further: 'Further',
					recentre: 'Recentre the view',
					prev: 'Previous',
					next: 'Next'
				}
	);
	const content = $derived(houseContent(lang));
	let selected = $state(0);
	const panel = $derived(content.panels[selected] ?? content.panels[0]);
	const items = $derived(content.panels.map((p) => ({ id: p.id, name: `${p.mark} ${p.title}` })));
	const href = (a: Extract<EmakiAction, { kind: 'link' }>) =>
		a.external ? a.href : localizeHref(a.href, { locale: lang });

	function choose(index: number) {
		selected = index;
		track('village_place_opened', { choice: `house:${content.panels[index].id}`, locale: lang });
	}
</script>

<RoomStage
	title={c.title}
	{items}
	{selected}
	{reduceMotion}
	{lightweight}
	labels={{
		back: c.back,
		list: c.list,
		loading: c.loading,
		fallback: c.fallback,
		hint: c.hint,
		closer: c.closer,
		further: c.further,
		recentre: c.recentre,
		prev: c.prev,
		next: c.next
	}}
	load={() =>
		import('./house-scene').then(
			(m) => (canvas: HTMLCanvasElement, palette, opts) =>
				m.createHouseScene(canvas, palette, {
					...opts,
					items: content.panels.map((p) => ({ id: p.id, mark: p.mark, title: p.title }))
				})
		)}
	onselect={choose}
	{onleave}
	{onready}
>
	{#snippet journal()}
		<div class="journal-top">
			<span>{content.title}</span><span class="mark">{panel.mark}</span>
		</div>
		<h3>{panel.title}</h3>
		{#if panel.text}<p>{panel.text}</p>{/if}
		{#if panel.list}
			<ul class="books">
				{#each panel.list as book, i (book.label)}
					{#if book.group}<li class="group">{book.group}</li>{/if}
					<li>
						<details open={i === 0}>
							<summary>
								<span class="book">{book.label}</span>
								{#if book.meta}<span class="book-meta">{book.meta}</span>{/if}
							</summary>
							{#if book.text}<p>{book.text}</p>{/if}
							{#if book.href}
								<a class="book-link" href={book.href} target="_blank" rel="noopener noreferrer"
									>{book.href.includes('wikipedia') ? 'Wikipedia' : new URL(book.href).hostname} ↗</a
								>
							{/if}
						</details>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="links">
			{#each panel.actions as a, j (j)}
				{#if a.kind === 'link'}
					<a
						class:primary={j === 0}
						href={href(a)}
						target={a.external ? '_blank' : undefined}
						rel={a.external ? 'noopener noreferrer' : undefined}>{a.label}</a
					>
				{:else if a.kind === 'room'}
					<button type="button" class:primary={j === 0} onclick={() => onroom(a.room)}
						>{a.label}</button
					>
				{:else}
					<button type="button" class:primary={j === 0} onclick={onbrush}>{a.label}</button>
				{/if}
			{/each}
		</div>
	{/snippet}
</RoomStage>

<style>
	.books {
		list-style: none;
		margin: -0.6rem 0 1.2rem;
		padding: 0;
		border-top: 1px solid var(--rule);
	}
	.books li {
		border-bottom: 1px solid var(--rule);
	}
	.books .group {
		padding: 1rem 0 0.3rem;
		color: var(--ink-soft);
		font-family: var(--f-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	summary {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.7rem;
		min-height: 44px;
		padding: 0.55rem 0;
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary::before {
		content: '＋';
		color: var(--ebicha);
		font-size: 0.8rem;
	}
	details[open] summary::before {
		content: '－';
	}
	.book {
		font-family: var(--f-display);
		font-size: 1.15rem;
	}
	.book-meta {
		color: var(--ink-soft);
		font-size: 0.8rem;
	}
	.books p {
		margin: 0 0 0.4rem !important;
		font-size: 0.95rem !important;
		line-height: 1.5 !important;
	}
	.book-link {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		color: var(--ink);
		font-size: 0.85rem;
	}
	summary:focus-visible,
	.book-link:focus-visible {
		outline: 2px solid var(--shu);
		outline-offset: 3px;
	}
	.mark {
		font-family: var(--f-jp);
		font-size: 1.4rem;
		line-height: 1;
		color: var(--ebicha);
	}
</style>
