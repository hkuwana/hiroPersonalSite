<script lang="ts">
	// 絵巻 An emaki, the long picture scroll of Ōkami's menus: two rods part
	// from the middle and the paper unrolls between them. Drag, scroll or use
	// the arrow keys to travel along it. All of it is plain HTML, so the lo-fi
	// village, screen readers and keyboards get the same content.
	import { onMount } from 'svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { Emaki, EmakiAction } from './emaki-content';
	import type { Locale } from './place-content';
	import type { Room } from './workshop';

	let {
		emaki,
		lang,
		reduceMotion = false,
		onleave,
		onroom,
		onbrush,
		onready
	}: {
		emaki: Emaki;
		lang: Locale;
		reduceMotion?: boolean;
		onleave: () => void;
		onroom: (room: Room) => void;
		onbrush: () => void;
		onready: () => void;
	} = $props();

	const c = $derived(
		lang === 'ja'
			? {
					back: '村へ戻る',
					prev: '前へ',
					next: '次へ',
					along: 'ドラッグ、スクロール、矢印キーで巻物を進む',
					swipe: 'スワイプで巻物を進む',
					scroll: '巻物'
				}
			: {
					back: 'Back to the village',
					prev: 'Previous',
					next: 'Next',
					along: 'Drag, scroll or use the arrow keys to unroll',
					swipe: 'Swipe to unroll',
					scroll: 'Scroll'
				}
	);

	let back: HTMLButtonElement;
	let track: HTMLDivElement;
	let progress = $state(0);
	let dragging = $state(false);
	let drag: { x: number; left: number; moved: boolean } | null = null;

	const href = (a: Extract<EmakiAction, { kind: 'link' }>) =>
		a.external ? a.href : localizeHref(a.href, { locale: lang });

	function onScroll() {
		const max = track.scrollWidth - track.clientWidth;
		progress = max > 0 ? track.scrollLeft / max : 0;
	}
	function step(dir: number) {
		const panel = track.querySelector<HTMLElement>('.panel:not(.opening)');
		const w = panel ? panel.offsetWidth : track.clientWidth * 0.6;
		track.scrollBy({ left: dir * w, behavior: reduceMotion ? 'auto' : 'smooth' });
	}
	function onKey(e: KeyboardEvent) {
		if (e.target !== track) return;
		if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
			e.preventDefault();
			step(e.key === 'ArrowRight' ? 1 : -1);
		} else if (e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			track.scrollTo({
				left: e.key === 'Home' ? 0 : track.scrollWidth,
				behavior: reduceMotion ? 'auto' : 'smooth'
			});
		}
	}
	// A mouse drags the paper; touch already scrolls it natively.
	function down(e: PointerEvent) {
		if (e.pointerType !== 'mouse' || e.button !== 0) return;
		drag = { x: e.clientX, left: track.scrollLeft, moved: false };
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		const dx = e.clientX - drag.x;
		if (!drag.moved && Math.abs(dx) < 6) return;
		if (!drag.moved) {
			drag.moved = true;
			dragging = true;
			track.setPointerCapture(e.pointerId);
		}
		track.scrollLeft = drag.left - dx;
	}
	function up(e: PointerEvent) {
		if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
		const moved = drag?.moved;
		drag = null;
		dragging = false;
		// A drag that ends over a link must not open it.
		if (moved)
			track.addEventListener('click', (ev) => ev.preventDefault(), { capture: true, once: true });
	}

	// Ink decorations, different on every panel: a rolling ridge and an
	// Ōkami-style curl of cloud.
	function ridge(i: number) {
		const s = i * 1.7 + 0.4;
		let d = 'M0,70';
		for (let x = 0; x <= 200; x += 25) {
			const y = 58 + 9 * Math.sin(x * 0.03 + s) + 5 * Math.sin(x * 0.081 + s * 2.3);
			d += ` Q${x - 12.5},${(y - 8).toFixed(1)} ${x},${y.toFixed(1)}`;
		}
		return d;
	}
	function cloud(i: number) {
		const cx = 40 + ((i * 53) % 110);
		const cy = 18 + ((i * 7) % 10);
		// A short spiral with a trailing tail, drawn as one brush line.
		let d = `M${cx - 34},${cy + 9}`;
		d += ` Q${cx - 18},${cy + 10} ${cx - 8},${cy + 6}`;
		for (let k = 0; k < 10; k++) {
			const a = k * 0.85;
			const r = 10 - k * 0.85;
			d += ` L${(cx + r * Math.cos(a)).toFixed(1)},${(cy - r * Math.sin(a)).toFixed(1)}`;
		}
		return d;
	}

	onMount(() => {
		back.focus({ preventScroll: true });
		onready();
		// Vertical wheels travel along the scroll; it is a horizontal object.
		const wheel = (e: WheelEvent) => {
			if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
			e.preventDefault();
			track.scrollLeft += e.deltaY;
		};
		track.addEventListener('wheel', wheel, { passive: false });
		return () => track.removeEventListener('wheel', wheel);
	});
</script>

<div
	class="emaki-room"
	class:still={reduceMotion}
	class:board={emaki.room === 'board'}
	role="region"
	aria-label={emaki.title}
>
	<header>
		<button class="back" type="button" onclick={onleave} bind:this={back} aria-label={c.back}>
			<!-- An exit sign: a door, and an arrow leaving it. -->
			<svg viewBox="0 0 24 24" aria-hidden="true"
				><path d="M13 3h7v18h-7M10 7l-5 5 5 5M5 12h11" /></svg
			>
			<span class="back-text">{c.back}</span>
		</button>
		<h2><span class="seal" aria-hidden="true">{emaki.kanji}</span>{emaki.title}</h2>
	</header>

	<div class="frame">
		<div class="rod left" aria-hidden="true"></div>
		<div class="paper">
			<svg class="edge top" viewBox="0 0 400 6" preserveAspectRatio="none" aria-hidden="true">
				<path d="M0,3 Q50,1 100,3.4 T200,2.6 T300,3.5 T400,2.8" />
			</svg>
			<!-- A scrollable region: it takes focus so arrow keys travel along it. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
			<div
				class="track"
				class:dragging
				bind:this={track}
				tabindex="0"
				role="group"
				aria-label={`${emaki.title} · ${c.along}`}
				onscroll={onScroll}
				onkeydown={onKey}
				onpointerdown={down}
				onpointermove={move}
				onpointerup={up}
				onpointercancel={up}
			>
				<section class="panel opening">
					<span class="big" aria-hidden="true">{emaki.kanji}</span>
					<h3>{emaki.title}</h3>
					<p>{emaki.intro}</p>
					<p class="along mono" aria-hidden="true">
						<span>←</span><em class="fine">{c.along}</em><em class="touch">{c.swipe}</em><span
							>→</span
						>
					</p>
				</section>
				{#each emaki.panels as panel, i (panel.id)}
					<section class="panel" aria-labelledby="emaki-{panel.id}">
						<svg class="art" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
							<path class="cloud" d={cloud(i)} />
							<path class="ridge" d={ridge(i)} />
						</svg>
						<span class="mark" aria-hidden="true">{panel.mark}</span>
						{#if panel.meta}<p class="meta mono">{panel.meta}</p>{/if}
						<h4 id="emaki-{panel.id}">{panel.title}</h4>
						{#if panel.text}<p class="text">{panel.text}</p>{/if}
						<div class="acts">
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
					</section>
				{/each}
				<section class="panel closing">
					{#each emaki.end as a (a.label)}
						{#if a.kind === 'link'}<a href={href(a)}>{a.label}</a>{/if}
					{/each}
					<span class="hanko" aria-hidden="true">浩</span>
				</section>
			</div>
			<svg class="edge bottom" viewBox="0 0 400 6" preserveAspectRatio="none" aria-hidden="true">
				<path d="M0,3 Q60,4.6 120,2.8 T240,3.4 T330,2.5 T400,3.2" />
			</svg>
		</div>
		<div class="rod right" aria-hidden="true"></div>
	</div>

	<div class="controls">
		<button type="button" class="nudge" onclick={() => step(-1)} aria-label={c.prev}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
		</button>
		<div class="line" aria-hidden="true">
			<span class="dot" style:left="{progress * 100}%"></span>
		</div>
		<button type="button" class="nudge" onclick={() => step(1)} aria-label={c.next}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
		</button>
	</div>
</div>

<style>
	.emaki-room {
		--band: var(--ebicha);
		--rod: 1.6rem;
		position: absolute;
		inset: 0;
		z-index: 4;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: 1rem;
		padding: 1.5rem 2rem 1.25rem;
		overflow: hidden;
		color: var(--ink);
		background: var(--paper-2);
	}
	.emaki-room.board {
		--band: var(--kon);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}
	h2 {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin: 0;
		font-family: var(--f-display);
		font-size: clamp(1.2rem, 2.1vw, 1.8rem);
		font-weight: 400;
		text-wrap: balance;
	}
	.seal {
		display: inline-grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		flex-shrink: 0;
		font-family: var(--f-jp);
		font-size: 1.3rem;
		color: var(--paper);
		background: var(--ebicha);
		border-radius: 0.2rem;
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
	}
	.back:hover {
		border-color: var(--ink);
	}
	svg {
		fill: none;
		stroke: currentColor;
	}
	.back svg,
	.nudge svg {
		width: 1.1rem;
		height: 1.1rem;
		stroke-width: 1.5;
		flex-shrink: 0;
	}
	button:focus-visible,
	a:focus-visible,
	.track:focus-visible {
		outline: 2px solid var(--shu);
		outline-offset: 3px;
	}

	/* ── The scroll: two rods and the paper between them ─────────────── */
	.frame {
		position: relative;
		container-type: inline-size;
		align-self: center;
		height: min(100%, 34rem);
		min-height: 0;
		padding-inline: var(--rod);
	}
	.rod {
		position: absolute;
		top: -0.9rem;
		bottom: -0.9rem;
		width: var(--rod);
		z-index: 2;
		background: var(--wood);
		border: 1px solid var(--ink);
		border-radius: 0.5rem;
	}
	/* Dark end caps on each rod, like a jiku. */
	.rod::before,
	.rod::after {
		content: '';
		position: absolute;
		left: -0.25rem;
		right: -0.25rem;
		height: 1.2rem;
		background: var(--ink);
		border-radius: 0.35rem;
	}
	.rod::before {
		top: -0.35rem;
	}
	.rod::after {
		bottom: -0.35rem;
	}
	.rod.left {
		left: 0;
		animation: rod-left 1000ms 320ms var(--ease-out-expo) both;
	}
	.rod.right {
		right: 0;
		animation: rod-right 1000ms 320ms var(--ease-out-expo) both;
	}
	.paper {
		position: relative;
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr auto;
		background: var(--paper);
		/* 表装 brocade bands along the top and bottom of the paper. */
		border-block: 0.75rem solid var(--band);
		outline: 1px solid var(--gold);
		outline-offset: -0.95rem;
		animation: unroll 1000ms 320ms var(--ease-out-expo) both;
	}
	@keyframes unroll {
		from {
			clip-path: inset(0 50% 0 50%);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}
	@keyframes rod-left {
		from {
			transform: translateX(calc(50cqw - var(--rod)));
		}
		to {
			transform: none;
		}
	}
	@keyframes rod-right {
		from {
			transform: translateX(calc(var(--rod) - 50cqw));
		}
		to {
			transform: none;
		}
	}
	.edge {
		width: 100%;
		height: 0.4rem;
		stroke: var(--ink);
		stroke-width: 1.4;
		vector-effect: non-scaling-stroke;
		opacity: 0.6;
	}
	.track {
		display: flex;
		min-height: 0;
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		scroll-snap-type: x proximity;
		scrollbar-width: none;
		cursor: grab;
		user-select: none;
	}
	.track::-webkit-scrollbar {
		display: none;
	}
	.track.dragging {
		cursor: grabbing;
		scroll-snap-type: none;
	}

	/* ── Panels ───────────────────────────────────────────────────────── */
	.panel {
		position: relative;
		flex: 0 0 clamp(16rem, 27cqw, 22rem);
		display: flex;
		flex-direction: column;
		padding: 1.6rem 1.8rem 1.4rem;
		border-left: 1px solid var(--rule);
		scroll-snap-align: center;
		overflow: hidden;
	}
	.panel.opening {
		flex-basis: clamp(18rem, 34cqw, 28rem);
		justify-content: center;
		border-left: 0;
	}
	.big {
		font-family: var(--f-jp);
		font-size: clamp(4.5rem, 10cqw, 7.5rem);
		line-height: 1;
		color: var(--ebicha);
	}
	.opening h3 {
		margin: 0.9rem 0 0.6rem;
		font-family: var(--f-display);
		font-size: clamp(1.5rem, 2.6cqw, 2.2rem);
		font-weight: 400;
		line-height: 1.15;
	}
	.opening p {
		margin: 0;
		max-width: 24rem;
		font-size: 1.02rem;
		line-height: 1.55;
	}
	.mono {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}
	.opening .along {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		margin-top: 1.6rem;
	}
	.along em {
		font-style: normal;
	}
	.along .touch {
		display: none;
	}
	@media (pointer: coarse) {
		.along .fine {
			display: none;
		}
		.along .touch {
			display: inline;
		}
	}
	.along span {
		color: var(--ebicha);
		animation: nudge 1.8s ease-in-out infinite;
	}
	.along span:first-child {
		animation-direction: reverse;
	}
	@keyframes nudge {
		50% {
			transform: translateX(0.3rem);
		}
	}
	.art {
		position: absolute;
		inset: auto 0 0 0;
		width: 100%;
		height: 42%;
		pointer-events: none;
		stroke: var(--ink);
		vector-effect: non-scaling-stroke;
	}
	.art .ridge {
		stroke-width: 1.6;
		opacity: 0.26;
	}
	.art .cloud {
		stroke-width: 1.3;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.3;
		transform: translateY(-1.5rem);
	}
	.mark {
		font-family: var(--f-jp);
		font-size: clamp(2.6rem, 5cqw, 3.6rem);
		line-height: 1;
		color: var(--ebicha);
	}
	.meta {
		margin: 0.9rem 0 0;
	}
	h4 {
		position: relative;
		margin: 0.7rem 0 0.55rem;
		font-family: var(--f-display);
		font-size: clamp(1.3rem, 2.1cqw, 1.7rem);
		font-weight: 400;
		line-height: 1.18;
		text-wrap: balance;
	}
	.text {
		position: relative;
		margin: 0;
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--ink-soft);
		display: -webkit-box;
		-webkit-line-clamp: 6;
		line-clamp: 6;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.acts {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		align-items: center;
		margin-top: auto;
		padding-top: 1.1rem;
	}
	.acts a,
	.acts button,
	.closing a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--ink);
		font: inherit;
		font-size: 0.95rem;
		text-decoration: underline;
		text-underline-offset: 0.25em;
		/* Paper behind the label keeps it clear of the ink ridge. */
		background: var(--paper);
		border: 0;
		padding: 0 0.3rem;
		margin-inline: -0.3rem;
		cursor: pointer;
	}
	.acts .primary {
		margin-inline: 0;
	}
	.acts .primary {
		padding: 0.5rem 0.9rem;
		color: var(--paper);
		background: var(--ink);
		text-decoration: none;
	}
	.acts .primary:hover {
		background: var(--ebicha);
	}
	.acts a:not(.primary):hover,
	.acts button:not(.primary):hover,
	.closing a:hover {
		color: var(--ebicha);
	}
	.closing {
		flex-basis: clamp(13rem, 20cqw, 16rem);
		justify-content: center;
		gap: 0.25rem;
	}
	.hanko {
		display: grid;
		place-items: center;
		width: 3.2rem;
		height: 3.2rem;
		margin-top: 1.2rem;
		font-family: var(--f-jp);
		font-size: 1.8rem;
		color: var(--ebicha);
		border: 2px solid var(--ebicha);
		border-radius: 0.3rem;
		transform: rotate(-4deg);
	}

	/* ── Travel controls ──────────────────────────────────────────────── */
	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-self: center;
		width: min(30rem, 100%);
	}
	.nudge {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--rule);
		cursor: pointer;
	}
	.nudge:hover {
		border-color: var(--ink);
	}
	.line {
		position: relative;
		flex: 1;
		height: 1px;
		background: var(--ink-mute);
	}
	.dot {
		position: absolute;
		top: 50%;
		width: 0.8rem;
		height: 0.8rem;
		background: var(--ebicha);
		border-radius: 0.15rem;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	@media (max-width: 700px) {
		.emaki-room {
			--rod: 1.1rem;
			padding: 0.75rem 0.75rem 0.9rem;
			gap: 0.9rem;
		}
		header {
			gap: 0.6rem;
			align-items: flex-start;
		}
		h2 {
			font-size: 1rem;
			max-width: 12rem;
		}
		.seal {
			width: 1.8rem;
			height: 1.8rem;
			font-size: 1.05rem;
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
		/* The opening panel already names the scroll. */
		h2 {
			display: none;
		}
		.frame {
			height: min(100%, 31rem);
		}
		.panel {
			flex-basis: 76cqw;
			padding: 1.2rem 1.25rem 1rem;
		}
		.panel.opening {
			flex-basis: 84cqw;
		}
		.closing {
			flex-basis: 56cqw;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.rod.left,
		.rod.right,
		.paper,
		.along em {
			font-style: normal;
		}
		.along .touch {
			display: none;
		}
		@media (pointer: coarse) {
			.along .fine {
				display: none;
			}
			.along .touch {
				display: inline;
			}
		}
		.along span {
			animation: none;
		}
	}
	.still .rod.left,
	.still .rod.right,
	.still .paper,
	.still .along span {
		animation: none;
	}
</style>
