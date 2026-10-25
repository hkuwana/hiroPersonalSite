<script lang="ts">
	// The frame shared by the rooms you can walk into (the windmill workshop,
	// the house): a 3D canvas you can look around in, a shelf of the room's
	// objects as plain buttons, and a journal for the chosen one. The shelf
	// and journal are the whole content, so a failed or lightweight scene
	// loses nothing.
	import { onMount, tick, untrack, type Snippet } from 'svelte';
	import { onThemeChange, readPalette, type Palette } from '$lib/home/palette';
	import type { RoomScene } from './room-camera';

	type Item = { id: string; name: string; sub?: string };
	let {
		title,
		items,
		selected = 0,
		reduceMotion = false,
		lightweight = false,
		labels,
		load,
		onselect,
		onleave,
		onready,
		journal
	}: {
		title: string;
		items: Item[];
		selected?: number;
		reduceMotion?: boolean;
		lightweight?: boolean;
		labels: {
			back: string;
			list: string;
			loading: string;
			fallback: string;
			hint: string;
			closer: string;
			further: string;
			recentre: string;
			prev: string;
			next: string;
		};
		load: () => Promise<
			(
				canvas: HTMLCanvasElement,
				palette: Palette,
				opts: { reduceMotion: boolean; onLost: () => void }
			) => RoomScene
		>;
		onselect: (index: number) => void;
		onleave: () => void;
		onready: () => void;
		journal: Snippet;
	} = $props();

	let canvas = $state<HTMLCanvasElement>();
	let room: HTMLDivElement;
	let back: HTMLButtonElement;
	let shelf = $state<HTMLElement>();
	let journalEl = $state<HTMLElement>();
	let loading = $state(true);
	let failed = $state(false);
	let pointing = $state(false);
	let looking = $state(false);
	let scene: RoomScene | undefined;
	let mounted = $state(false);
	let stopped = false;
	let cleanupScene = () => {};
	let generation = 0;
	// Pointers on the canvas: one drags the view, two pinch to zoom.
	// Not reactive on purpose: pointer moves must not re-render anything.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const pointers = new Map<number, { x: number; y: number }>();
	let downAt: { x: number; y: number } | null = null;
	let pinch = 0;

	function local(e: { clientX: number; clientY: number }) {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}
	function onDown(e: PointerEvent) {
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size === 1) downAt = { x: e.clientX, y: e.clientY };
		else downAt = null;
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			pinch = Math.hypot(a.x - b.x, a.y - b.y);
		}
	}
	function onMove(e: PointerEvent) {
		const prev = pointers.get(e.pointerId);
		if (!prev) {
			const p = local(e);
			pointing = scene?.pick(p.x, p.y) != null;
			return;
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			const d = Math.hypot(a.x - b.x, a.y - b.y);
			if (pinch > 0 && d > 0) scene?.zoom(pinch / d);
			pinch = d;
			return;
		}
		if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6) return;
		if (!looking && canvas) {
			looking = true;
			try {
				canvas.setPointerCapture(e.pointerId);
			} catch {
				/* Synthetic pointers cannot be captured. */
			}
		}
		const dx = e.clientX - prev.x;
		// Touch keeps vertical moves for page scrolling; a mouse tilts too.
		const dy = e.pointerType === 'mouse' ? e.clientY - prev.y : 0;
		scene?.orbit(-dx * 0.006, dy * 0.004);
	}
	function onUp(e: PointerEvent) {
		const wasLooking = looking;
		pointers.delete(e.pointerId);
		if (pointers.size < 2) pinch = 0;
		if (pointers.size) return;
		looking = false;
		const start = downAt;
		downAt = null;
		if (wasLooking || !start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return;
		const p = local(e);
		const index = scene?.pick(p.x, p.y);
		if (index != null) onselect(index);
	}
	function onCancel(e: PointerEvent) {
		pointers.delete(e.pointerId);
		if (!pointers.size) {
			looking = false;
			downAt = null;
			pinch = 0;
		}
	}

	// Tell the camera which part of the screen the shelf and journal cover.
	function measureInset() {
		if (!scene || !room) return;
		const r = room.getBoundingClientRect();
		const s = shelf?.getBoundingClientRect();
		const j = journalEl?.getBoundingClientRect();
		const narrow = r.width <= 700;
		scene.setInset(
			narrow
				? {
						left: 0,
						right: 0,
						top: s ? Math.max(0, s.bottom - r.top) : 0,
						bottom: j ? Math.max(0, r.bottom - j.top) : 0
					}
				: {
						left: s ? Math.max(0, s.right - r.left) : 0,
						right: j ? Math.max(0, r.right - j.left) : 0,
						top: 0,
						bottom: 0
					}
		);
	}

	async function boot() {
		const id = ++generation;
		cleanupScene();
		pointing = false;
		failed = false;
		loading = !lightweight;
		if (lightweight) {
			onready();
			return;
		}
		try {
			const create = await load();
			await tick();
			if (stopped || id !== generation || !canvas) return;
			const s = create(canvas, readPalette(), {
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
			const fit = () => {
				s.resize(room.clientWidth, room.clientHeight);
				measureInset();
			};
			fit();
			const ro = new ResizeObserver(fit);
			ro.observe(room);
			if (journalEl) ro.observe(journalEl);
			let visible = true;
			const active = () => s.setActive(visible && !document.hidden);
			const io = new IntersectionObserver(([entry]) => {
				visible = entry.isIntersecting;
				active();
			});
			io.observe(room);
			// Vertical wheels zoom the room instead of scrolling the page.
			const wheel = (e: WheelEvent) => {
				e.preventDefault();
				s.zoom(Math.exp(e.deltaY * 0.0012));
			};
			canvas.addEventListener('wheel', wheel, { passive: false });
			document.addEventListener('visibilitychange', active);
			const c = canvas;
			cleanupScene = () => {
				ro.disconnect();
				io.disconnect();
				c.removeEventListener('wheel', wheel);
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
		// Read `selected` first: `scene?.` would skip it while the scene loads,
		// and the effect would then never run again.
		const index = selected;
		scene?.select(index);
		void tick().then(measureInset);
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
	class="room"
	class:lightweight={lightweight || failed}
	bind:this={room}
	role="region"
	aria-label={title}
>
	{#if !lightweight && !failed}
		<!-- Room objects have equivalent native buttons in the shelf. -->
		<canvas
			bind:this={canvas}
			class:pointing
			class:looking
			aria-hidden="true"
			onpointerdown={onDown}
			onpointermove={onMove}
			onpointerup={onUp}
			onpointercancel={onCancel}
			onpointerleave={(e) => {
				if (!pointers.has(e.pointerId)) pointing = false;
			}}
		></canvas>
		<div class="washi" aria-hidden="true"></div>
	{/if}
	<header>
		<button class="back" type="button" onclick={onleave} bind:this={back} aria-label={labels.back}>
			<!-- An exit sign: a door, and an arrow leaving it. -->
			<svg viewBox="0 0 24 24" aria-hidden="true"
				><path d="M13 3h7v18h-7M10 7l-5 5 5 5M5 12h11" /></svg
			>
			<span class="back-text">{labels.back}</span>
		</button>
		<h2>{title}</h2>
	</header>
	{#if loading && !lightweight}<p class="loading" role="status">{labels.loading}</p>{/if}
	<nav class="shelf" aria-label={labels.list} bind:this={shelf}>
		{#each items as item, i (item.id)}
			<button
				type="button"
				class:chosen={i === selected}
				aria-pressed={i === selected}
				onclick={() => onselect(i)}
			>
				<span>{item.name}</span>
				{#if item.sub}<span class="state">{item.sub}</span>{/if}
			</button>
		{/each}
	</nav>
	<article class="journal" aria-live="polite" bind:this={journalEl}>
		<!-- On phones the shelf is hidden; these step through the same items. -->
		<div class="pager">
			<button
				type="button"
				aria-label={labels.prev}
				onclick={() => onselect((selected - 1 + items.length) % items.length)}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
			</button>
			<span>{selected + 1} / {items.length}</span>
			<button
				type="button"
				aria-label={labels.next}
				onclick={() => onselect((selected + 1) % items.length)}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
			</button>
		</div>
		{@render journal()}
	</article>
	{#if !lightweight && !failed && !loading}
		<div class="view">
			<button type="button" onclick={() => scene?.zoom(0.8)} aria-label={labels.closer}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
			</button>
			<button type="button" onclick={() => scene?.reset()} aria-label={labels.recentre}>
				<svg viewBox="0 0 24 24" aria-hidden="true"
					><circle cx="12" cy="12" r="7" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg
				>
			</button>
			<button type="button" onclick={() => scene?.zoom(1.25)} aria-label={labels.further}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
			</button>
		</div>
	{/if}
	<p class="room-note">{lightweight || failed ? labels.fallback : labels.hint}</p>
</div>

<style>
	.room {
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
		cursor: grab;
	}
	/* Washi: the same paper fibre as the village, over the room. */
	.washi {
		position: absolute;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0.14;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	:global([data-theme='dark']) .washi {
		mix-blend-mode: screen;
		opacity: 0.07;
	}
	canvas.pointing {
		cursor: pointer;
	}
	canvas.looking {
		cursor: grabbing;
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
	.journal :global(a) {
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
		max-height: calc(100% - 9rem);
		overflow: auto;
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
	.back:hover,
	.view button:hover {
		background: var(--paper-2);
	}
	button:focus-visible,
	.journal :global(a:focus-visible),
	.journal :global(button:focus-visible) {
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
	.pager {
		display: none;
	}
	.journal :global(.journal-top) {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		color: var(--ink-soft);
		font-size: 0.82rem;
	}
	.journal :global(h3) {
		margin: 1.3rem 0 0.65rem;
		font-family: var(--f-display);
		font-size: clamp(1.8rem, 3vw, 2.7rem);
		font-weight: 400;
		line-height: 1.05;
		text-wrap: balance;
	}
	.journal :global(p) {
		font-size: 1.05rem;
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}
	.journal :global(.links) {
		display: flex;
		gap: 0.5rem 1.2rem;
		flex-wrap: wrap;
		align-items: center;
	}
	.journal :global(.links a),
	.journal :global(.links button) {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 0.25em;
		min-height: 44px;
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}
	.journal :global(.links .primary) {
		padding: 0.5rem 0.9rem;
		color: var(--paper);
		background: var(--ink);
		text-decoration: none;
	}
	.journal :global(.links a:hover),
	.journal :global(.links button:hover) {
		color: var(--shu);
	}
	.journal :global(.links .primary:hover) {
		color: var(--paper);
		background: var(--ebicha);
	}
	.journal :global(.links .all) {
		font-size: 0.88rem;
	}
	.view {
		position: absolute;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		display: flex;
		border: 1px solid var(--rule);
		background: var(--paper);
	}
	.view button {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 0;
		background: none;
		color: var(--ink);
		cursor: pointer;
	}
	.view button + button {
		border-left: 1px solid var(--rule);
	}
	.room-note {
		position: absolute;
		bottom: 1.1rem;
		left: 2rem;
		margin: 0;
		width: fit-content;
		max-width: calc(50% - 6rem);
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
	.lightweight .room-note {
		max-width: calc(100% - 4rem);
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
		.pager {
			display: none;
		}
		.journal :global(.journal-top) {
			font-size: 0.73rem;
		}
		.journal :global(h3) {
			margin: 0.7rem 0 0.5rem;
			font-size: 1.8rem;
		}
		.journal :global(p) {
			font-size: 0.95rem;
			margin-bottom: 0.65rem;
			line-height: 1.45;
		}
		.view {
			left: auto;
			right: 0.75rem;
			bottom: auto;
			top: 10.5rem;
			transform: none;
			flex-direction: column;
		}
		.view button + button {
			border-left: 0;
			border-top: 1px solid var(--rule);
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
	/* Phones, with the 3D room live: the figures are the menu. No title, no
	   list, no hint; a small exit sign, and arrows on the journal. */
	@media (max-width: 700px) {
		.room:not(.lightweight) h2,
		.room:not(.lightweight) .shelf,
		.room:not(.lightweight) .room-note {
			display: none;
		}
		.back {
			justify-content: center;
			width: 44px;
			height: 44px;
			padding: 0;
		}
		.back-text {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			white-space: nowrap;
		}
		.room:not(.lightweight) .journal {
			bottom: 0.75rem;
		}
		.room:not(.lightweight) .pager {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: -0.35rem -0.5rem 0.2rem;
			color: var(--ink-soft);
			font-family: var(--f-mono);
			font-size: 0.72rem;
			letter-spacing: 0.08em;
		}
		.pager button {
			display: grid;
			place-items: center;
			width: 44px;
			height: 36px;
			border: 0;
			background: none;
			color: var(--ink);
			cursor: pointer;
		}
		.view {
			top: 0.75rem;
			flex-direction: row;
		}
		.view button + button {
			border-top: 0;
			border-left: 1px solid var(--rule);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.shelf button {
			transition: none;
		}
	}
</style>
