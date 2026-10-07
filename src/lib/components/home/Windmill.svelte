<script lang="ts">
	// 風車 hero island. SSR renders the buttons and the first panel (works with
	// no JS). On mount, matter-js integrates the rotor and gsap animates the panel.
	import { onMount } from 'svelte';
	import { whenVisible } from '$lib/home/when-visible';
	import { COPY_MILL, type Locale } from '$lib/home/copy';
	import { FACETS } from '$lib/home/facets';
	import { onThemeChange, readPalette, type Palette } from '$lib/home/palette';
	import { createWind, drawMill, stepWind } from '$lib/home/windmill-scene';
	import * as M from '$lib/home/windmill-model';

	let { lang }: { lang: Locale } = $props();
	const t = (k: string) => COPY_MILL[lang][k] ?? k;

	let canvasEl: HTMLCanvasElement;
	let panelEl: HTMLDivElement;
	let active = $state(0);
	let choose = $state<(i: number) => void>(() => {});
	let animatePanel: (() => void) | null = null;

	$effect(() => {
		// re-run when the facet changes
		if (active >= 0) animatePanel?.();
	});

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
			const { Engine, Bodies, Body, Composite } = Matter;
			const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
			const dpr = window.devicePixelRatio || 1;
			canvasEl.width = M.MILL.W * dpr;
			canvasEl.height = M.MILL.H * dpr;
			const ctx = canvasEl.getContext('2d')!;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			let palette: Palette = readPalette();
			const stopTheme = onThemeChange(() => (palette = readPalette()));

			const engine = Engine.create({ gravity: { x: 0, y: 0 } });
			const rotor = Bodies.circle(M.MILL.HUB.x, M.MILL.HUB.y, M.MILL.REACH, {
				frictionAir: 0.016,
				collisionFilter: { mask: 0 }
			});
			Composite.add(engine.world, rotor);

			let target: number | null = null;
			let grabbing = false;
			let userTookOver = false;
			let paused = false;
			let lastGust = performance.now();
			const takeOver = () => {
				userTookOver = true;
				target = null;
			};
			choose = (i: number) => {
				takeOver();
				target = M.angleForSail(i, rotor.angle);
				if (reduce) {
					Body.setAngle(rotor, target);
					Body.setAngularVelocity(rotor, 0);
				}
			};
			animatePanel = () => {
				if (!reduce && panelEl)
					gsap.fromTo(
						panelEl.children,
						{ y: 10, opacity: 0 },
						{ y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out', overwrite: true }
					);
			};

			// pointer: drag, flick, click to spin
			const local = (e: PointerEvent) => {
				const r = canvasEl.getBoundingClientRect();
				return {
					x: ((e.clientX - r.left) / r.width) * M.MILL.W,
					y: ((e.clientY - r.top) / r.height) * M.MILL.H
				};
			};
			let lastA = 0,
				lastT = 0,
				moved = 0,
				vel = 0,
				downX = 0;
			const onDown = (e: PointerEvent) => {
				const p = local(e);
				if (!M.onRotor(p)) return;
				e.preventDefault();
				takeOver();
				grabbing = true;
				canvasEl.setPointerCapture(e.pointerId);
				lastA = Math.atan2(p.y - M.MILL.HUB.y, p.x - M.MILL.HUB.x);
				lastT = performance.now();
				moved = 0;
				vel = 0;
				downX = p.x;
				Body.setAngularVelocity(rotor, 0);
			};
			const onMove = (e: PointerEvent) => {
				const p = local(e);
				canvasEl.style.cursor = grabbing ? 'grabbing' : M.onRotor(p) ? 'grab' : 'default';
				if (!grabbing) return;
				const a = Math.atan2(p.y - M.MILL.HUB.y, p.x - M.MILL.HUB.x);
				let d = a - lastA;
				if (d > Math.PI) d -= 2 * Math.PI;
				if (d < -Math.PI) d += 2 * Math.PI;
				const now = performance.now();
				vel = vel * 0.5 + (d / (Math.max(1, now - lastT) / (1000 / 60))) * 0.5;
				Body.setAngle(rotor, rotor.angle + d);
				moved += Math.abs(d);
				lastA = a;
				lastT = now;
			};
			const onUp = () => {
				if (!grabbing) return;
				grabbing = false;
				Body.setAngularVelocity(
					rotor,
					moved < 0.04 ? M.clickSpin(downX, M.MILL.HUB.x) : M.clampFlick(vel)
				);
			};
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					takeOver();
					Body.setAngularVelocity(rotor, 0.32);
				}
				if (e.key === 'ArrowRight') {
					e.preventDefault();
					choose((M.topIndex(rotor.angle) + 3) % 4);
				}
				if (e.key === 'ArrowLeft') {
					e.preventDefault();
					choose((M.topIndex(rotor.angle) + 1) % 4);
				}
			};
			const pause = () => (paused = true);
			const resume = () => (paused = false);
			canvasEl.addEventListener('pointerdown', onDown);
			canvasEl.addEventListener('pointermove', onMove);
			canvasEl.addEventListener('pointerup', onUp);
			canvasEl.addEventListener('pointercancel', onUp);
			canvasEl.addEventListener('pointerenter', pause);
			canvasEl.addEventListener('pointerleave', resume);
			canvasEl.addEventListener('keydown', onKey);
			panelEl.parentElement!.addEventListener('pointerenter', pause);
			panelEl.parentElement!.addEventListener('pointerleave', resume);

			// loop: runs only while visible and the tab is shown
			const wind = createWind();
			let sunPhase = 0.78;
			let prevAngle = rotor.angle;
			let raf = 0;
			let last = performance.now();
			let visible = true;
			const frame = (now: number) => {
				const dt = M.clampDelta(now - last);
				last = now;
				Body.setPosition(rotor, M.MILL.HUB);
				Body.setVelocity(rotor, { x: 0, y: 0 });
				if (!grabbing) {
					if (M.shouldGust({ now, lastGust, userTookOver, paused, reduceMotion: reduce })) {
						target = M.nearestSnap(rotor.angle) + M.QUARTER;
						lastGust = now;
					}
					if (target === null && Math.abs(rotor.angularVelocity) < M.SETTLE_SPEED)
						target = M.nearestSnap(rotor.angle);
					if (target !== null)
						Body.setAngularVelocity(
							rotor,
							M.springVelocity(rotor.angularVelocity, rotor.angle, target)
						);
				}
				Engine.update(engine, dt);
				const turn = rotor.angle - prevAngle;
				prevAngle = rotor.angle;
				sunPhase = M.stepSunPhase(sunPhase, turn);
				if (!reduce) stepWind(wind, Math.min(0.5, Math.abs(turn)), turn);
				const top = M.topIndex(rotor.angle);
				if (top !== active) active = top;
				drawMill(ctx, palette, { angle: rotor.angle, sunPhase, top, wind });
				raf = requestAnimationFrame(frame);
			};
			const start = () => {
				if (!raf && visible && !document.hidden) {
					last = performance.now();
					raf = requestAnimationFrame(frame);
				}
			};
			const stop = () => {
				cancelAnimationFrame(raf);
				raf = 0;
			};
			const io = new IntersectionObserver(([e]) => {
				visible = e.isIntersecting;
				if (visible) start();
				else stop();
			});
			io.observe(canvasEl);
			const onVis = () => (document.hidden ? stop() : start());
			document.addEventListener('visibilitychange', onVis);
			if (!reduce) Body.setAngularVelocity(rotor, 0.12);
			start();

			cleanup = () => {
				stop();
				io.disconnect();
				stopTheme();
				document.removeEventListener('visibilitychange', onVis);
				canvasEl.removeEventListener('pointerdown', onDown);
				canvasEl.removeEventListener('pointermove', onMove);
				canvasEl.removeEventListener('pointerup', onUp);
				canvasEl.removeEventListener('pointercancel', onUp);
				canvasEl.removeEventListener('keydown', onKey);
				Engine.clear(engine);
			};
		})();
		return () => {
			stopped = true;
			cleanup();
		};
	});

	const facet = $derived(FACETS[active]);
</script>

<div class="mill">
	<canvas bind:this={canvasEl} class="mill-canvas" tabindex="0" aria-label={t('canvas')}></canvas>
	<div class="mill-side">
		<div class="mill-tabs" role="group" aria-label={t('label')}>
			{#each FACETS as f, i}
				<button
					type="button"
					aria-pressed={i === active}
					onclick={() => {
						active = i;
						choose(i);
					}}
				>
					<span class="k">{f.kanji}</span>
					{f.title[lang]}
				</button>
			{/each}
		</div>
		<div class="mill-panel" bind:this={panelEl} aria-live="polite">
			<div
				class="kanji"
				style={`color: var(--${facet.color === 'moss' ? 'moss-green' : facet.color})`}
			>
				{facet.kanji}
			</div>
			<h3>{facet.title[lang]}</h3>
			<p>{facet.line[lang]}</p>
			<a
				class="ink-link"
				href={facet.link.href}
				target={facet.link.external ? '_blank' : undefined}
				rel={facet.link.external ? 'noopener' : undefined}>{facet.link.label[lang]}</a
			>
		</div>
		<p class="mill-hint">{t('hint')}</p>
	</div>
</div>
