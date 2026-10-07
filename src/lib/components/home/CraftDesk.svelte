<script lang="ts">
	// Craftsman's desk island. SSR renders the buttons, the intro card, and a
	// grouped list of every item (keyboard + screen readers + no JS).
	import { onMount } from 'svelte';
	import { whenVisible } from '$lib/home/when-visible';
	import { createTweenSet } from '$lib/home/tween-set';
	import { COPY_DESK, type Locale } from '$lib/home/copy';
	import { DESK_ITEMS, SHELVES, type DeskItem } from '$lib/home/desk-items';
	import {
		DESK,
		isClick,
		layoutShelves,
		nextDeskMode,
		tagWidth,
		type DeskMode
	} from '$lib/home/desk-layout';
	import { drawDesk, type DrawnItem } from '$lib/home/desk-scene';
	import { onThemeChange, readPalette, type Palette } from '$lib/home/palette';
	import { clampDelta } from '$lib/home/windmill-model';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { Body as MBody } from 'matter-js';

	let { lang }: { lang: Locale } = $props();
	const t = (k: string) => COPY_DESK[lang][k] ?? k;

	let canvasEl: HTMLCanvasElement;
	let cardEl: HTMLDivElement;
	let selected = $state<DeskItem | null>(null);
	let mode = $state<DeskMode>('loose');
	let toggle = $state<() => void>(() => {});
	let drop = $state<() => void>(() => {});
	let animateCard: (() => void) | null = null;
	const href = (i: DeskItem) =>
		i.href && !i.external ? localizeHref(i.href, { locale: lang }) : i.href;
	const shelfLabel = (i: DeskItem) => SHELVES.find((s) => s.id === i.cat)!.label[lang];
	const open = (i: DeskItem) => {
		selected = i;
		queueMicrotask(() => animateCard?.());
	};

	onMount(() => {
		let stopped = false;
		let cleanup = () => {};
		(async () => {
			await whenVisible(canvasEl, '0px');
			if (stopped) return;
			const [{ default: Matter }, { gsap }] = await Promise.all([
				import('matter-js'),
				import('gsap')
			]);
			if (stopped) return;
			const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Query } = Matter;
			const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
			const dpr = window.devicePixelRatio || 1;
			canvasEl.width = DESK.W * dpr;
			canvasEl.height = DESK.H * dpr;
			const ctx = canvasEl.getContext('2d')!;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			animateCard = () => {
				if (!reduce && cardEl)
					gsap.fromTo(
						cardEl.children,
						{ y: 8, opacity: 0 },
						{ y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', overwrite: true }
					);
			};

			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local cache, not reactive state
			const logos = new Map<string, HTMLImageElement>();
			for (const i of DESK_ITEMS)
				if (i.logo) {
					const img = new Image();
					img.src = i.logo;
					logos.set(i.logo, img);
				}

			const engine = Engine.create();
			Composite.add(engine.world, [
				Bodies.rectangle(DESK.W / 2, DESK.LEDGE_Y + 20, DESK.W + 40, 40, { isStatic: true }),
				Bodies.rectangle(-20, DESK.H / 2, 40, DESK.H * 2, { isStatic: true }),
				Bodies.rectangle(DESK.W + 20, DESK.H / 2, 40, DESK.H * 2, { isStatic: true })
			]);
			const mouse = Mouse.create(canvasEl);
			// let the page scroll over the canvas
			const m = mouse as unknown as { mousewheel: (e: Event) => void };
			canvasEl.removeEventListener('wheel', m.mousewheel);
			canvasEl.removeEventListener('mousewheel', m.mousewheel);
			canvasEl.removeEventListener('DOMMouseScroll', m.mousewheel);
			// canvas is W*dpr wide; matter's raw position is in canvas pixels
			Mouse.setScale(mouse, { x: 1 / dpr, y: 1 / dpr });
			// matter blocks every touch (non-passive preventDefault), which stops page
			// scrolling. Route touches to matter only when they start on a tag.
			const mt = mouse as unknown as {
				mousedown: (e: Event) => void;
				mousemove: (e: Event) => void;
				mouseup: (e: Event) => void;
			};
			canvasEl.removeEventListener('touchstart', mt.mousedown);
			canvasEl.removeEventListener('touchmove', mt.mousemove);
			canvasEl.removeEventListener('touchend', mt.mouseup);
			Composite.add(
				engine.world,
				MouseConstraint.create(engine, {
					mouse,
					constraint: { stiffness: 0.15, render: { visible: false } } as never
				})
			);

			// measure tags once fonts are ready
			await document.fonts.ready;
			if (stopped) return;
			let palette: Palette = readPalette();
			const stopTheme = onThemeChange(() => (palette = readPalette()));
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local cache, not reactive state
			const sizes = new Map<string, { w: number; h: number }>();
			for (const i of DESK_ITEMS) {
				if (i.kind === 'seal') {
					sizes.set(i.id, { w: 60, h: 60 });
					continue;
				}
				ctx.font = '18px "Newsreader", serif';
				const main = ctx.measureText(i.label).width;
				ctx.font = 'italic 13px "Newsreader", serif';
				const sub = i.sub ? ctx.measureText(i.sub).width : 0;
				sizes.set(i.id, { w: tagWidth(main, sub, !!i.logo), h: i.sub ? 52 : 38 });
			}
			const shelfPos = layoutShelves(
				DESK_ITEMS.map((i) => ({ id: i.id, cat: i.cat, ...sizes.get(i.id)! }))
			);
			let bodies: { item: DeskItem; body: MBody }[] = [];
			const timers: number[] = [];
			const makeBody = (i: DeskItem, x: number, y: number) => {
				const s = sizes.get(i.id)!;
				return i.kind === 'seal'
					? Bodies.circle(x, y, 30, { restitution: 0.25, friction: 0.6 })
					: Bodies.rectangle(x, y, s.w, s.h, {
							chamfer: { radius: 4 },
							restitution: 0.15,
							friction: 0.7,
							angle: (Math.random() - 0.5) * 0.8
						});
			};

			const tweens = createTweenSet();
			const organize = () => {
				mode = 'organized';
				tweens.killAll();
				// tags still waiting to drop go straight to their shelf
				timers.splice(0).forEach(clearTimeout);
				for (const item of DESK_ITEMS) {
					if (bodies.some((b) => b.item.id === item.id)) continue;
					const to = shelfPos.get(item.id)!;
					const body = makeBody(item, to.x, to.y);
					Body.setAngle(body, 0);
					bodies.push({ item, body });
					Composite.add(engine.world, body);
				}
				bodies.forEach(({ item, body }, k) => {
					Body.setStatic(body, true);
					const to = shelfPos.get(item.id)!;
					const proxy = { x: body.position.x, y: body.position.y, a: body.angle };
					tweens.add(
						gsap.to(proxy, {
							x: to.x,
							y: to.y,
							a: Math.round(body.angle / (2 * Math.PI)) * 2 * Math.PI,
							duration: reduce ? 0 : 0.8,
							delay: reduce ? 0 : k * 0.03,
							ease: 'power3.inOut',
							onUpdate: () => {
								Body.setPosition(body, { x: proxy.x, y: proxy.y });
								Body.setAngle(body, proxy.a);
							}
						})
					);
				});
			};
			const scatter = () => {
				mode = 'loose';
				tweens.killAll();
				for (const { body } of bodies) {
					Body.setStatic(body, false);
					Body.setVelocity(body, { x: (Math.random() - 0.5) * 14, y: -6 - Math.random() * 8 });
					Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
				}
			};
			toggle = () => (nextDeskMode(mode) === 'organized' ? organize() : scatter());
			drop = () => {
				tweens.killAll();
				timers.splice(0).forEach(clearTimeout);
				for (const { body } of bodies) Composite.remove(engine.world, body);
				bodies = [];
				mode = 'loose';
				DESK_ITEMS.forEach((item, k) => {
					timers.push(
						window.setTimeout(() => {
							const body = makeBody(item, 70 + Math.random() * (DESK.W - 140), -40);
							bodies.push({ item, body });
							Composite.add(engine.world, body);
						}, k * 120)
					);
				});
			};

			// click (not drag) opens a card
			const local = (e: PointerEvent) => {
				const r = canvasEl.getBoundingClientRect();
				return {
					x: ((e.clientX - r.left) / r.width) * DESK.W,
					y: ((e.clientY - r.top) / r.height) * DESK.H,
					t: performance.now()
				};
			};
			const hit = (p: { x: number; y: number }) => {
				const b = Query.point(
					bodies.map((x) => x.body),
					p
				)[0];
				return b ? bodies.find((x) => x.body === b)?.item : undefined;
			};
			let down: { x: number; y: number; t: number } | null = null;
			const onDown = (e: PointerEvent) => {
				down = local(e);
			};
			const onUp = (e: PointerEvent) => {
				if (!down) return;
				const up = local(e);
				const item = isClick(down, up) ? hit(up) : undefined;
				down = null;
				if (item) open(item);
			};
			const onMove = (e: PointerEvent) => {
				canvasEl.style.cursor = hit(local(e)) ? 'pointer' : 'default';
			};
			canvasEl.addEventListener('pointerdown', onDown);
			// touches reach matter only when they start on a tag; elsewhere the page scrolls
			let touchDrag = false;
			const touchPoint = (e: TouchEvent) => {
				const t = e.changedTouches[0];
				const r = canvasEl.getBoundingClientRect();
				return {
					x: ((t.clientX - r.left) / r.width) * DESK.W,
					y: ((t.clientY - r.top) / r.height) * DESK.H
				};
			};
			const onTouchStart = (e: TouchEvent) => {
				if (!hit(touchPoint(e))) return;
				touchDrag = true;
				mt.mousedown(e);
			};
			const onTouchMove = (e: TouchEvent) => {
				if (touchDrag) mt.mousemove(e);
			};
			const onTouchEnd = (e: TouchEvent) => {
				if (!touchDrag) return;
				touchDrag = false;
				mt.mouseup(e);
			};
			canvasEl.addEventListener('touchstart', onTouchStart, { passive: false });
			canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
			canvasEl.addEventListener('touchend', onTouchEnd);
			canvasEl.addEventListener('pointerup', onUp);
			canvasEl.addEventListener('pointermove', onMove);

			let raf = 0;
			let last = performance.now();
			let started = false;
			const frame = (now: number) => {
				Engine.update(engine, clampDelta(now - last));
				last = now;
				const items: DrawnItem[] = bodies.map(({ item, body }) => ({
					item,
					...sizes.get(item.id)!,
					x: body.position.x,
					y: body.position.y,
					angle: body.angle
				}));
				drawDesk(ctx, palette, { items, mode, lang, logos });
				raf = requestAnimationFrame(frame);
			};
			const start = () => {
				if (!raf && !document.hidden) {
					last = performance.now();
					raf = requestAnimationFrame(frame);
				}
			};
			const stop = () => {
				cancelAnimationFrame(raf);
				raf = 0;
			};
			const io = new IntersectionObserver(
				([e]) => {
					if (!e.isIntersecting) return stop();
					start();
					if (!started) {
						started = true;
						if (reduce) {
							for (const item of DESK_ITEMS) {
								const p = shelfPos.get(item.id)!;
								const body = makeBody(item, p.x, p.y);
								Body.setAngle(body, 0);
								bodies.push({ item, body });
								Composite.add(engine.world, body);
							}
							organize();
						} else drop();
					}
				},
				{ threshold: 0.3 }
			);
			io.observe(canvasEl);
			const onVis = () => (document.hidden ? stop() : start());
			document.addEventListener('visibilitychange', onVis);

			cleanup = () => {
				stop();
				io.disconnect();
				stopTheme();
				timers.forEach(clearTimeout);
				document.removeEventListener('visibilitychange', onVis);
				canvasEl.removeEventListener('pointerdown', onDown);
				canvasEl.removeEventListener('touchstart', onTouchStart);
				canvasEl.removeEventListener('touchmove', onTouchMove);
				canvasEl.removeEventListener('touchend', onTouchEnd);
				tweens.killAll();
				canvasEl.removeEventListener('pointerup', onUp);
				canvasEl.removeEventListener('pointermove', onMove);
				Engine.clear(engine);
			};
		})();
		return () => {
			stopped = true;
			cleanup();
		};
	});
</script>

<div class="desk frame-deco">
	<div class="desk-head">
		<h2>{t('title')} <em>{t('titleEm')}</em></h2>
	</div>
	<div class="desk-grid">
		<canvas bind:this={canvasEl} class="desk-canvas" aria-label={t('canvas')}></canvas>
		<div class="desk-side">
			<div class="desk-actions">
				<button type="button" class="contact-btn" onclick={() => toggle()}
					>{mode === 'organized' ? t('scatter') : t('organize')}</button
				>
				<button type="button" class="contact-btn ghost" onclick={() => drop()}>{t('drop')}</button>
			</div>
			<div class="desk-card" bind:this={cardEl} aria-live="polite">
				{#if !selected}
					<p>{t('intro')}</p>
				{:else if selected.author}
					<span class="desk-kicker">{shelfLabel(selected)}</span>
					<div class="desk-row">
						{#if selected.author.portrait}
							<img
								class="desk-portrait"
								src={selected.author.portrait}
								alt={selected.label}
								width="84"
								height="84"
							/>
						{:else}
							<span class="desk-portrait monogram">{selected.label[0]}</span>
						{/if}
						<div>
							<h3>{selected.label}</h3>
							<p class="desk-sub">{selected.author.descriptor[lang]}</p>
						</div>
					</div>
					<span class="desk-kicker">{t('take')}</span>
					<p class="desk-take">{selected.take?.[lang]}</p>
					<a class="ink-link" href={selected.author.wiki} target="_blank" rel="noopener"
						>{t('wiki')}</a
					>
				{:else if selected.avatar}
					<span class="desk-kicker">{shelfLabel(selected)}</span>
					<div class="desk-row">
						<img
							class="desk-portrait self"
							src={selected.avatar}
							alt={selected.name}
							width="84"
							height="84"
						/>
						<div>
							<h3>{selected.name}</h3>
							<p class="desk-sub">{selected.nameJa}</p>
						</div>
					</div>
					<p class="desk-take">{selected.desc?.[lang]}</p>
					<a class="ink-link" href={href(selected)}>{selected.cta?.[lang]} →</a>
				{:else}
					<span class="desk-kicker">{shelfLabel(selected)}</span>
					<div class="desk-row">
						{#if selected.logo}<img
								class="desk-logo"
								src={selected.logo}
								alt=""
								width="64"
								height="64"
							/>{/if}
						<h3>
							{selected.label}{#if selected.sub}
								<em>{selected.sub}</em>{/if}
						</h3>
					</div>
					<p>{selected.desc?.[lang]}</p>
					{#if selected.href}
						<a
							class="ink-link"
							href={href(selected)}
							target={selected.external ? '_blank' : undefined}
							rel={selected.external ? 'noopener' : undefined}>{selected.cta?.[lang]} ↗</a
						>
					{/if}
				{/if}
			</div>
		</div>
	</div>
	<nav class="sr-only" aria-label={t('list')}>
		{#each SHELVES as shelf}
			<h3>{shelf.label[lang]}</h3>
			<ul>
				{#each DESK_ITEMS.filter((i) => i.cat === shelf.id) as item}
					<li>
						<button type="button" onclick={() => open(item)}
							>{item.name ?? item.label}{item.sub ? ` (${item.sub})` : ''}</button
						>
					</li>
				{/each}
			</ul>
		{/each}
	</nav>
</div>
