<script lang="ts">
	// Stamp the letter to show the email. The 浩 seal and three kanji tiles are
	// matter-js bodies in a small paper tray (after the "Gravity" idea in Fancy
	// Components). Drop the seal on the envelope's stamp box and gsap presses a
	// print, then the address scrambles in. The address is built only then, so it
	// is never in the HTML. Keyboard users press Enter on the seal; a tap does nothing.
	import { onMount } from 'svelte';
	import { track } from '$lib/analytics';
	import { whenVisible } from '$lib/home/when-visible';
	import type { Body as MBody } from 'matter-js';

	type Locale = 'en' | 'ja';
	let { lang, getEmail }: { lang: Locale; getEmail: () => string } = $props();

	const COPY = {
		en: {
			hint: 'Press the seal on the stamp box to see my email',
			seal: 'Stamp the letter to show my email address',
			copy: 'copy',
			copied: 'copied · ありがとう'
		},
		ja: {
			hint: '印を切手の枠に押すと、メールアドレスが出ます',
			seal: '手紙に判を押して、メールアドレスを表示',
			copy: 'コピー',
			copied: 'コピーしました'
		}
	};
	const t = $derived(COPY[lang]);

	// Tray geometry in CSS pixels. The tray is H tall; the envelope sits on its floor at the right.
	const H = 176;
	const SEAL = 44;
	const TILE = 34;
	const ENV_W = 148;
	const ENV_H = 92;
	const ENV_RIGHT = 14;
	const STAMP = 46;
	const TILES = ['文', '筆', '墨'];

	let trayEl: HTMLDivElement;
	let sealEl: HTMLButtonElement;
	let printEl: HTMLSpanElement;
	let tileEls: HTMLSpanElement[] = $state([]);
	let stamped = $state(false);
	let email = $state('');
	let shown = $state('');
	let copied = $state(false);
	let copiedTimer: number | undefined;

	// Filled in on mount, once the libraries load.
	let stampAt: (() => void) | null = null;

	const place = (el: HTMLElement | undefined, x: number, y: number, size: number, angle = 0) => {
		if (el)
			el.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${angle}rad)`;
	};

	// Where the stamp box is, from the tray's current width.
	const stampCenter = (w: number) => ({
		x: w - ENV_RIGHT - 12 - STAMP / 2,
		y: H - ENV_H + 10 + STAMP / 2
	});

	async function scrambleIn(gsap: typeof import('gsap').gsap, target: string) {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			shown = target;
			return;
		}
		const pool = 'あいうえおかきくけこ浩文筆墨abcdefghijklmnopqrstuvwxyz';
		const state = { p: 0 };
		await gsap.to(state, {
			p: 1,
			duration: 0.9,
			ease: 'power1.out',
			onUpdate: () => {
				const done = Math.floor(state.p * target.length);
				shown =
					target.slice(0, done) +
					Array.from(target.slice(done), (ch) =>
						ch === '@' || ch === '.' ? ch : pool[Math.floor(Math.random() * pool.length)]
					).join('');
			}
		});
		shown = target;
	}

	onMount(() => {
		let stopped = false;
		let cleanup = () => {};

		// Before the libraries load, the seal still answers the keyboard.
		stampAt = () => {
			if (stamped) return;
			stamped = true;
			email = getEmail();
			shown = email;
			track('contact_email_revealed', { locale: lang });
		};

		(async () => {
			await whenVisible(trayEl, '200px');
			const [{ default: Matter }, { gsap }] = await Promise.all([
				import('matter-js'),
				import('gsap')
			]);
			if (stopped) return;
			const { Engine, Bodies, Body, Composite } = Matter;

			let W = trayEl.clientWidth;
			const engine = Engine.create({ gravity: { x: 0, y: 1 } });
			const wall = { isStatic: true, friction: 0.3 };
			const floor = Bodies.rectangle(2000, H + 30, 4000, 60, wall);
			const ceiling = Bodies.rectangle(2000, -30, 4000, 60, wall);
			const left = Bodies.rectangle(-30, H / 2, 60, H * 4, wall);
			const right = Bodies.rectangle(W + 30, H / 2, 60, H * 4, wall);
			const envelope = Bodies.rectangle(
				W - ENV_RIGHT - ENV_W / 2,
				H - ENV_H / 2,
				ENV_W,
				ENV_H,
				// Tiles land on the envelope; the seal (category 2) passes in front of it to reach the stamp box.
				{ ...wall, collisionFilter: { category: 0x0004, mask: 0x0001 } }
			);

			const seal = Bodies.circle(40, H - SEAL / 2, SEAL / 2, {
				restitution: 0.35,
				friction: 0.2,
				density: 0.003,
				collisionFilter: { category: 0x0002 }
			});
			const tiles = TILES.map((_, i) =>
				Bodies.rectangle(100 + i * 44, 20 + i * 8, TILE, TILE, {
					chamfer: { radius: 4 },
					restitution: 0.2,
					friction: 0.4,
					angle: (i - 1) * 0.3
				})
			);
			Composite.add(engine.world, [floor, ceiling, left, right, envelope, seal, ...tiles]);

			const items: { body: MBody; el: () => HTMLElement | undefined; size: number }[] = [
				{ body: seal, el: () => sealEl, size: SEAL },
				...tiles.map((body, i) => ({ body, el: () => tileEls[i], size: TILE }))
			];

			// Drag: the held body follows the pointer; setPosition with velocity lets a release throw it.
			let held: MBody | null = null;
			let target = { x: 0, y: 0 };
			const local = (e: PointerEvent) => {
				const r = trayEl.getBoundingClientRect();
				return { x: e.clientX - r.left, y: e.clientY - r.top };
			};
			const down = (e: PointerEvent) => {
				if (stamped) return;
				const hit = items.find((item) => item.el() === e.currentTarget);
				if (!hit) return;
				held = hit.body;
				target = local(e);
				(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
			};
			const move = (e: PointerEvent) => {
				if (held) target = local(e);
			};
			const up = () => {
				if (!held) return;
				const v = held.velocity;
				Body.setVelocity(held, {
					x: Math.max(-22, Math.min(22, v.x)),
					y: Math.max(-22, Math.min(22, v.y))
				});
				held = null;
			};
			for (const item of items) {
				const el = item.el();
				el?.addEventListener('pointerdown', down);
				el?.addEventListener('pointermove', move);
				el?.addEventListener('pointerup', up);
				el?.addEventListener('pointercancel', up);
			}

			const resize = new ResizeObserver(() => {
				W = trayEl.clientWidth;
				Body.setPosition(right, { x: W + 30, y: H / 2 });
				Body.setPosition(envelope, { x: W - ENV_RIGHT - ENV_W / 2, y: H - ENV_H / 2 });
			});
			resize.observe(trayEl);

			let frame = 0;
			let visible = true;
			const io = new IntersectionObserver(([entry]) => {
				visible = entry.isIntersecting;
				if (visible && !frame && !stamped) frame = requestAnimationFrame(tick);
			});
			io.observe(trayEl);

			function tick() {
				frame = 0;
				if (stopped || stamped || !visible) return;
				if (held) {
					const r = held === seal ? SEAL / 2 : TILE / 2;
					const x = Math.max(r, Math.min(W - r, target.x));
					const y = Math.max(r, Math.min(H - r, target.y));
					const v = { x: x - held.position.x, y: y - held.position.y };
					Body.setPosition(held, { x, y });
					Body.setVelocity(held, v);
					Body.setAngularVelocity(held, 0);
				}
				Engine.update(engine, 1000 / 60);
				for (const item of items)
					place(item.el(), item.body.position.x, item.body.position.y, item.size, item.body.angle);

				const s = stampCenter(W);
				if (
					Math.abs(seal.position.x - s.x) < STAMP / 2 &&
					Math.abs(seal.position.y - s.y) < STAMP / 2
				)
					press();
				else frame = requestAnimationFrame(tick);
			}
			frame = requestAnimationFrame(tick);

			// The seal presses down on the stamp box, leaves a print, and lifts away.
			async function press() {
				if (stamped) return;
				stamped = true;
				held = null;
				const s = stampCenter(W);
				const from = { x: seal.position.x, y: seal.position.y, scale: 1 };
				const draw = () =>
					sealEl &&
					(sealEl.style.transform = `translate(${from.x - SEAL / 2}px, ${from.y - SEAL / 2}px) scale(${from.scale})`);
				const tl = gsap.timeline({ onUpdate: draw });
				tl.to(from, { x: s.x, y: s.y - 14, scale: 1.2, duration: 0.25, ease: 'power2.out' })
					.to(from, { y: s.y, scale: 0.92, duration: 0.12, ease: 'power3.in' })
					.fromTo(
						printEl,
						{ opacity: 0, scale: 1.25 },
						{ opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' },
						'<0.08'
					)
					.to(from, { y: s.y - 46, scale: 1, duration: 0.35, ease: 'power2.out' })
					.to(sealEl, { opacity: 0, duration: 0.25 }, '<0.1');
				await tl;
				email = getEmail();
				track('contact_email_revealed', { locale: lang });
				await scrambleIn(gsap, email);
			}
			stampAt = press;

			cleanup = () => {
				cancelAnimationFrame(frame);
				resize.disconnect();
				io.disconnect();
				Engine.clear(engine);
			};
		})();

		return () => {
			stopped = true;
			window.clearTimeout(copiedTimer);
			cleanup();
		};
	});

	function onSealClick(event: MouseEvent) {
		// detail is 0 only for a keyboard press, so a plain tap does not skip the stamp.
		if (event.detail === 0) stampAt?.();
	}

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(email);
			copied = true;
			track('contact_email_copied', { locale: lang });
			window.clearTimeout(copiedTimer);
			copiedTimer = window.setTimeout(() => (copied = false), 3200);
		} catch {
			// The address is on screen and selectable, so a failed copy needs no message.
		}
	}
</script>

<div class="stamp-check">
	<div class="tray" bind:this={trayEl} class:stamped style={`--h:${H}px`}>
		<span class="tray-hint" aria-hidden="true">{t.hint}</span>

		<div
			class="envelope"
			aria-hidden="true"
			style={`--w:${ENV_W}px; --eh:${ENV_H}px; --r:${ENV_RIGHT}px; --stamp:${STAMP}px`}
		>
			<svg class="flap" viewBox="0 0 100 60" preserveAspectRatio="none"
				><polyline points="0,0 50,52 100,0" /></svg
			>
			<span class="stamp-box">
				<span class="print" bind:this={printEl}>浩</span>
			</span>
		</div>

		{#each TILES as tile, i}
			<span
				class="tile"
				aria-hidden="true"
				bind:this={tileEls[i]}
				style={`width:${TILE}px; height:${TILE}px; transform: translate(${100 + i * 44 - TILE / 2}px, ${H - TILE}px)`}
			>
				{tile}
			</span>
		{/each}

		<button
			type="button"
			class="seal"
			bind:this={sealEl}
			aria-label={t.seal}
			onclick={onSealClick}
			style={`width:${SEAL}px; height:${SEAL}px; transform: translate(${40 - SEAL / 2}px, ${H - SEAL}px)`}
		>
			浩
		</button>
	</div>

	{#if email}
		<div class="email-out">
			<a class="email-address" href={`mailto:${email}`} aria-label={email}>{shown}</a>
			<button type="button" class="email-copy" onclick={copyEmail} aria-live="polite">
				{copied ? t.copied : t.copy}
			</button>
		</div>
	{/if}
</div>

<style>
	.stamp-check {
		margin: 0.5rem 0 1.5rem;
	}

	.tray {
		position: relative;
		height: var(--h);
		border: 1px solid var(--rule);
		border-radius: 3px;
		background: color-mix(in oklch, var(--paper-2) 70%, transparent);
		overflow: hidden;
		touch-action: pan-y;
		user-select: none;
	}

	.tray-hint {
		position: absolute;
		top: 0.75rem;
		left: 0.875rem;
		right: 0.875rem;
		font-family: var(--f-mono);
		font-size: 0.625rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-mute);
		pointer-events: none;
		transition: opacity 0.3s;
	}

	.stamped .tray-hint {
		opacity: 0;
	}

	.envelope {
		position: absolute;
		right: var(--r);
		bottom: 0;
		width: var(--w);
		height: var(--eh);
		background: var(--paper);
		border: 1px solid var(--rule);
		border-bottom: 0;
		overflow: hidden;
	}

	.flap {
		position: absolute;
		inset: 0 0 auto;
		width: 100%;
		height: 60%;
	}

	.flap polyline {
		fill: none;
		stroke: var(--rule);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}

	.stamp-box {
		position: absolute;
		top: 10px;
		right: 12px;
		width: var(--stamp);
		height: var(--stamp);
		display: grid;
		place-items: center;
		border: 1.5px dashed var(--shu);
		background: var(--paper);
	}

	.print {
		display: grid;
		place-items: center;
		width: 80%;
		height: 80%;
		background: var(--shu);
		color: var(--paper);
		font-family: var(--f-jp);
		font-size: 1.125rem;
		opacity: 0;
		rotate: -6deg;
	}

	.tile,
	.seal {
		position: absolute;
		top: 0;
		left: 0;
		display: grid;
		place-items: center;
		font-family: var(--f-jp);
		touch-action: none;
		cursor: grab;
		will-change: transform;
	}

	.tile {
		border: 1px solid var(--rule);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink-soft);
		font-size: 1rem;
	}

	.seal {
		z-index: 1;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--shu);
		color: var(--paper);
		font-size: 1.125rem;
	}

	.tile:active,
	.seal:active {
		cursor: grabbing;
	}

	.seal:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}

	.email-out {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem 1rem;
		margin-top: 1rem;
		padding-bottom: 0.35rem;
		border-bottom: 2px solid var(--shu);
	}

	.email-address {
		font-family: var(--f-display);
		font-size: 1.625rem;
		line-height: 1.1;
		color: var(--ink);
		overflow-wrap: anywhere;
	}

	.email-address:hover {
		color: var(--shu);
	}

	.email-copy {
		appearance: none;
		border: 0;
		background: none;
		padding: 0;
		font-family: var(--f-mono);
		font-size: 0.625rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
		cursor: pointer;
	}

	.email-copy:hover,
	.email-copy:focus-visible {
		color: var(--shu);
	}
</style>
