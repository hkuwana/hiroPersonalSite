<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import { onThemeChange, readPalette } from '$lib/home/palette';
	import { track } from '$lib/analytics';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { WORKSHOP_PROJECTS } from './workshop';
	import type { Locale } from './place-content';
	import type { createWorkshopScene } from './workshop-scene';

	let {
		lang,
		selected = 0,
		reduceMotion = false,
		lightweight = false,
		onselect,
		onleave,
		onready
	}: {
		lang: Locale;
		selected?: number;
		reduceMotion?: boolean;
		lightweight?: boolean;
		onselect: (index: number) => void;
		onleave: () => void;
		onready: () => void;
	} = $props();
	const c = $derived(
		lang === 'ja'
			? {
					title: '風車の工房',
					back: '村へ戻る',
					projects: 'プロジェクト',
					journal: 'プロジェクトノート',
					current: '制作中',
					active: '公開中',
					sunset: 'アーカイブ',
					visit: 'サイトを見る',
					source: 'ソースを見る',
					loading: '工房を読み込んでいます…',
					fallback: '軽量表示 · すべてのプロジェクトを閲覧できます。',
					all: '全プロジェクト',
					hint: '机の上の道具を選ぶと、プロジェクトを開きます。'
				}
			: {
					title: 'The windmill workshop',
					back: 'Back to the village',
					projects: 'Projects',
					journal: 'Project journal',
					current: 'In progress',
					active: 'Live',
					sunset: 'Archive',
					visit: 'Visit project',
					source: 'View source',
					loading: 'Opening the workshop…',
					fallback: 'Lightweight view · All projects are available.',
					all: 'All projects',
					hint: 'Choose an object on the workbench to open its project.'
				}
	);
	const project = $derived(WORKSHOP_PROJECTS[selected] ?? WORKSHOP_PROJECTS[0]);
	let canvas = $state<HTMLCanvasElement>();
	let room: HTMLDivElement;
	let back: HTMLButtonElement;
	let loading = $state(true);
	let failed = $state(false);
	let pointing = $state(false);
	let scene: ReturnType<typeof createWorkshopScene> | undefined;
	let mounted = $state(false);
	let stopped = false;
	let cleanupScene = () => {};
	let generation = 0;
	let down: { x: number; y: number } | null = null;

	function choose(index: number) {
		onselect(index);
		track('village_project_selected', { choice: WORKSHOP_PROJECTS[index].id, locale: lang });
	}
	function local(e: PointerEvent) {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}
	function clickObject(e: PointerEvent) {
		if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) {
			down = null;
			return;
		}
		down = null;
		const p = local(e);
		const index = scene?.pick(p.x, p.y);
		if (index != null) choose(index);
	}
	function hover(e: PointerEvent) {
		const p = local(e);
		pointing = scene?.pick(p.x, p.y) != null;
	}
	async function boot() {
		const id = ++generation;
		cleanupScene();
		pointing = false;
		down = null;
		failed = false;
		loading = !lightweight;
		if (lightweight) {
			onready();
			return;
		}
		try {
			const { createWorkshopScene } = await import('./workshop-scene');
			await tick();
			if (stopped || id !== generation || !canvas) return;
			const s = createWorkshopScene(canvas, readPalette(), {
				reduceMotion,
				onLost: () => {
					loading = false;
					failed = true;
					cleanupScene();
					onready();
				}
			});
			scene = s;
			// Register disposal before sizing/observers, so a failed setup cannot
			// leave a renderer running behind the readable fallback.
			cleanupScene = () => {
				s.dispose();
				scene = undefined;
				cleanupScene = () => {};
			};
			s.select(selected);
			const fit = () => s.resize(room.clientWidth, room.clientHeight);
			fit();
			const ro = new ResizeObserver(fit);
			ro.observe(room);
			let visible = true;
			const active = () => s.setActive(visible && !document.hidden);
			const io = new IntersectionObserver(([entry]) => {
				visible = entry.isIntersecting;
				active();
			});
			io.observe(room);
			document.addEventListener('visibilitychange', active);
			cleanupScene = () => {
				ro.disconnect();
				io.disconnect();
				document.removeEventListener('visibilitychange', active);
				s.dispose();
				scene = undefined;
				cleanupScene = () => {};
			};
			loading = false;
			failed = false;
			onready();
		} catch {
			if (!stopped && id === generation) {
				cleanupScene();
				loading = false;
				failed = true;
				onready();
			}
		}
	}
	$effect(() => {
		scene?.select(selected);
	});
	$effect(() => {
		if (!mounted) return;
		// Fidelity can drop after the outdoor frame probe or a lost context.
		// Its previous canvas must stop drawing even when the room stays open.
		void lightweight;
		void reduceMotion;
		untrack(() => {
			void boot();
		});
	});
	onMount(() => {
		back.focus({ preventScroll: true });
		mounted = true;
		const theme = onThemeChange(() => {
			void boot();
		});
		return () => {
			stopped = true;
			generation++;
			theme();
			cleanupScene();
		};
	});
</script>

<div
	class="workshop"
	class:lightweight={lightweight || failed}
	bind:this={room}
	role="region"
	aria-label={c.title}
>
	{#if !lightweight && !failed}
		<!-- Project objects have equivalent native buttons in the project shelf. -->
		<canvas
			bind:this={canvas}
			class:pointing
			aria-hidden="true"
			onpointerdown={(e) => {
				down = { x: e.clientX, y: e.clientY };
			}}
			onpointerup={clickObject}
			onpointermove={hover}
			onpointercancel={() => {
				down = null;
			}}
			onpointerleave={() => {
				down = null;
				pointing = false;
			}}
		></canvas>
	{/if}
	<header>
		<button class="back" type="button" onclick={onleave} bind:this={back}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>
			{c.back}
		</button>
		<h2>{c.title}</h2>
	</header>
	{#if loading && !lightweight}<p class="loading" role="status">{c.loading}</p>{/if}
	<nav class="shelf" aria-label={c.projects}>
		{#each WORKSHOP_PROJECTS as item, i (item.id)}
			<button
				type="button"
				class:chosen={i === selected}
				aria-pressed={i === selected}
				onclick={() => choose(i)}
			>
				<span>{item.name}</span>
				<span class="state">{c[item.status]}</span>
			</button>
		{/each}
	</nav>
	<article class="journal" aria-labelledby="project-name" aria-live="polite">
		<div class="journal-top"><span>{c.journal}</span><span>{c[project.status]}</span></div>
		<h3 id="project-name">{project.name}</h3>
		<p>{project.description}</p>
		<div class="links">
			{#if project.href}
				<a href={project.href} target="_blank" rel="noopener noreferrer"
					>{project.source === project.href ? c.source : c.visit}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>
				</a>
			{/if}
			{#if project.source && project.source !== project.href}
				<a href={project.source} target="_blank" rel="noopener noreferrer">{c.source}</a>
			{/if}
			<a class="all" href={localizeHref('/#work', { locale: lang })}>{c.all}</a>
		</div>
	</article>
	<p class="room-note">{lightweight || failed ? c.fallback : c.hint}</p>
</div>

<style>
	.workshop {
		position: absolute;
		inset: 0;
		z-index: 4;
		overflow: hidden;
		color: var(--ink);
		background: var(--paper-2);
	}
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		touch-action: pan-y;
	}
	canvas.pointing {
		cursor: pointer;
	}
	header {
		position: absolute;
		top: 1.5rem;
		left: 2rem;
		right: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		pointer-events: none;
	}
	h2 {
		margin: 0;
		font-family: var(--f-display);
		font-size: clamp(1.3rem, 2.3vw, 2rem);
		font-weight: 400;
		text-wrap: balance;
		background: var(--paper);
		padding: 0.35rem 0.75rem;
	}
	button,
	a {
		-webkit-tap-highlight-color: transparent;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.65rem 0.85rem;
		min-height: 44px;
		border: 1px solid var(--rule);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
		font: inherit;
		font-size: 0.95rem;
		pointer-events: auto;
	}
	svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		flex-shrink: 0;
	}
	.shelf {
		position: absolute;
		left: 2rem;
		bottom: 4rem;
		width: 13rem;
		display: grid;
		background: var(--paper);
		border-top: 1px solid var(--rule);
	}
	.shelf button {
		text-align: left;
		padding: 0.7rem 0.9rem;
		min-height: 48px;
		border: 0;
		border-bottom: 1px solid var(--rule);
		background: none;
		color: var(--ink);
		cursor: pointer;
		font-family: var(--f-display);
		font-size: 1.08rem;
		transition: background 180ms ease-out;
	}
	.state {
		display: block;
		margin-top: 0.15rem;
		color: var(--ink-soft);
		font-family: var(--f-body);
		font-size: 0.78rem;
	}
	.shelf button.chosen {
		background: var(--ink);
		color: var(--paper);
	}
	.chosen .state {
		color: var(--paper);
	}
	.shelf button:hover:not(.chosen),
	.back:hover {
		background: var(--paper-2);
	}
	button:focus-visible,
	a:focus-visible {
		outline: 2px solid var(--shu);
		outline-offset: 3px;
	}
	.journal {
		position: absolute;
		right: 2rem;
		bottom: 4rem;
		width: min(23rem, 36%);
		max-height: calc(100% - 9rem);
		overflow: auto;
		padding: 1.4rem 1.7rem 1.5rem;
		background: var(--paper);
		border-top: 2px solid var(--wood);
		border-bottom: 2px solid var(--wood);
		scrollbar-color: var(--wood) var(--paper);
	}
	.journal-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		color: var(--ink-soft);
		font-size: 0.82rem;
	}
	h3 {
		margin: 1.3rem 0 0.65rem;
		font-family: var(--f-display);
		font-size: clamp(1.8rem, 3vw, 2.7rem);
		font-weight: 400;
		line-height: 1.05;
		text-wrap: balance;
	}
	.journal p {
		font-size: 1.05rem;
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}
	.links {
		display: flex;
		gap: 0.5rem 1.2rem;
		flex-wrap: wrap;
		align-items: center;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 0.25em;
		min-height: 44px;
	}
	.links a:hover {
		color: var(--shu);
	}
	.links .all {
		font-size: 0.88rem;
	}
	.room-note {
		position: absolute;
		bottom: 1.1rem;
		left: 2rem;
		right: 2rem;
		margin: 0;
		width: fit-content;
		max-width: calc(100% - 4rem);
		background: var(--paper);
		color: var(--ink-soft);
		padding: 0.25rem 0.5rem;
		font-size: 0.85rem;
	}
	.loading {
		position: absolute;
		left: 50%;
		top: 40%;
		transform: translate(-50%, -50%);
		padding: 0.7rem 1rem;
		background: var(--paper);
	}
	.lightweight .shelf {
		top: 7rem;
		bottom: auto;
	}
	.lightweight .journal {
		top: 7rem;
		bottom: auto;
		width: min(38rem, calc(100% - 21rem));
	}
	@media (max-width: 700px) {
		header {
			top: 0.75rem;
			left: 0.75rem;
			right: 0.75rem;
			gap: 0.5rem;
			align-items: flex-start;
		}
		h2 {
			max-width: 10rem;
			font-size: 1.15rem;
		}
		.back {
			max-width: 10.5rem;
			font-size: 0.85rem;
		}
		.shelf,
		.lightweight .shelf {
			top: 5rem;
			left: 0.75rem;
			right: 0.75rem;
			bottom: auto;
			width: auto;
			display: flex;
			overflow-x: auto;
			scrollbar-width: thin;
			scrollbar-color: var(--wood) var(--paper);
		}
		.shelf button {
			flex: 0 0 auto;
			padding: 0.55rem 0.8rem;
			font-size: 0.98rem;
		}
		.state {
			font-size: 0.7rem;
		}
		.journal,
		.lightweight .journal {
			top: auto;
			right: 0.75rem;
			left: 0.75rem;
			bottom: 2.8rem;
			width: auto;
			max-height: 39%;
			padding: 0.85rem 1.1rem;
		}
		.journal-top {
			font-size: 0.73rem;
		}
		h3 {
			margin: 0.7rem 0 0.5rem;
			font-size: 1.8rem;
		}
		.journal p {
			font-size: 0.95rem;
			margin-bottom: 0.65rem;
			line-height: 1.45;
		}
		.room-note {
			bottom: 0.55rem;
			left: 0.75rem;
			right: 0.75rem;
			max-width: calc(100% - 1.5rem);
			font-size: 0.72rem;
		}
		.lightweight .journal {
			top: 11rem;
			bottom: auto;
			max-height: calc(100% - 14rem);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.shelf button {
			transition: none;
		}
	}
</style>
