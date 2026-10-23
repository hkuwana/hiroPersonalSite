<script lang="ts">
	// 墨の村 The ink village: the front of the site. Hi-fi is a three.js
	// diorama, loaded only by a dynamic import; lo-fi is the live 2D 風車
	// island. A static kite appears before JS; low-power visitors get lo-fi.
	// On the home page
	// (`tall`), the stage holds still while you scroll: the camera rises and
	// paper mist covers the village, then the rest of the page continues.
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quartOut } from 'svelte/easing';
	import { replaceState } from '$app/navigation';
	import { track } from '$lib/analytics';
	import Windmill from '$lib/components/home/Windmill.svelte';
	import { FACETS } from '$lib/home/facets';
	import { onThemeChange, readPalette } from '$lib/home/palette';
	import { changeTheme } from '$lib/theme';
	import { classifyStroke, encloses, type Pt } from './brush';
	import {
		chooseFidelity,
		parsePref,
		PREF_KEY,
		PROBE_FRAMES,
		probeVerdict,
		type DeviceSignals,
		type FidelityChoice,
		type FidelityPref
	} from './fidelity';
	import type { InkScene, Pick, PlaceRef } from './ink-scene';
	import KitePlaceholder from './KitePlaceholder.svelte';
	import { createKiteIntro } from './kite-intro';
	import PlaceScroll from './PlaceScroll.svelte';
	import {
		facetContent,
		facetOf,
		PLACE_NAME,
		sailName,
		type Essay,
		type FacetId,
		type Locale
	} from './place-content';
	import type { PlaceId } from './places';

	let {
		lang,
		essays = [],
		tall = false,
		debug = false,
		nextHref = ''
	}: {
		lang: Locale;
		essays?: Essay[];
		tall?: boolean; // home page: hold the stage while scrolling into the page
		debug?: boolean; // lab page: show frame stats and the gate's reason
		nextHref?: string; // where the scroll cue leads
	} = $props();

	// Functional labels only (Hiro's own sentences come from the site copy).
	const COPY = {
		en: {
			region: 'Ink village',
			regionHint:
				'Interactive scene. Arrow keys or WASD walk the akabeko; Enter opens the place beside it.',
			keys: 'Select the scene, then arrows / WASD walk · Enter opens',
			places: 'Places',
			fidelity: 'Graphics',
			auto: 'Auto',
			hi: 'Hi-fi',
			lo: 'Lo-fi',
			loading: 'Bringing the village to life…',
			loadingHint: 'You can keep reading while it loads.',
			useLite: 'Use the lighter scene',
			loadFailed: 'The 3D scene could not load. The lighter scene is ready to explore.',
			kiteUp: 'Fly the kite',
			kiteDown: 'Land the kite',
			sky: 'Sun / moon',
			brush: 'Brush',
			hints: [
				'○ around a tree · it blooms',
				'○ in the sky · the sun',
				'☾ in the sky · the moon',
				'→ or ← · wind',
				'↑ or ↓ · the kite'
			],
			bloom: '桜 the tree blooms',
			sunrise: '日 sunrise',
			moonrise: '月 moonrise',
			sunUp: '日 the sun is already up',
			moonUp: '月 the moon is already up',
			windL: '風 ← a gust of wind',
			windR: '風 → a gust of wind',
			kiteFly: '凧 ↑ the kite flies',
			kiteHome: '凧 ↓ the kite comes home',
			unread: '· stroke not read',
			credit: 'Inspired by Ōkami (Clover Studio / Capcom, 2006)',
			scroll: 'Scroll'
		},
		ja: {
			region: '墨の村',
			regionHint:
				'操作できるシーンです。矢印キーか WASD で赤べこが歩き、Enter でそばの場所を開きます。',
			keys: 'シーンを選んで 矢印キー / WASD で歩く · Enter で開く',
			places: '場所',
			fidelity: '表示',
			auto: '自動',
			hi: '高画質',
			lo: '軽量',
			loading: '村を読み込んでいます…',
			loadingHint: '読み込み中も、この先をお読みいただけます。',
			useLite: '軽量表示に切り替える',
			loadFailed: '3Dシーンを読み込めなかったため、軽量表示に切り替えました。',
			kiteUp: '凧をあげる',
			kiteDown: '凧をおろす',
			sky: '日と月',
			brush: '筆',
			hints: ['木を○で囲む · 花が咲く', '空に○ · 日', '空に☾ · 月', '→ か ← · 風', '↑ か ↓ · 凧'],
			bloom: '桜 花が咲いた',
			sunrise: '日 日の出',
			moonrise: '月 月の出',
			sunUp: '日 もう昼です',
			moonUp: '月 もう夜です',
			windL: '風 ← 風が吹く',
			windR: '風 → 風が吹く',
			kiteFly: '凧 ↑ 凧があがる',
			kiteHome: '凧 ↓ 凧がもどる',
			unread: '· 読み取れませんでした',
			credit: '『大神』（クローバースタジオ / カプコン、2006）に着想を得ています',
			scroll: 'スクロール'
		}
	} as const;
	const c = $derived(COPY[lang] ?? COPY.en);

	let villageEl: HTMLElement;
	let stageEl: HTMLDivElement;
	let glEl = $state<HTMLCanvasElement>();
	let brushEl = $state<HTMLCanvasElement>();

	let pref = $state<FidelityPref>('auto');
	let choice = $state<FidelityChoice | null>(null);
	let live = $state(false); // hi-fi has drawn its first frame
	let slowLoad = $state(false);
	let reduceMotion = $state(false);
	let kite = $state(false);
	let brush = $state(false);
	let gesture = $state('');
	let stats = $state({ first: 0, fps: 0, calls: 0, tris: 0 });
	let progress = $state(0); // 0..1 through the scroll transition
	const holding = $derived(tall && live);

	// ── Places and sails ──────────────────────────────────────────────────
	// The open scroll: which facet, and the place it was opened from.
	let opened = $state<{ facet: FacetId; from: string } | null>(null);
	let nearBy = $state<PlaceRef | null>(null);
	let tag = $state<{ text: string; x: number; y: number } | null>(null);
	let status = $state('');

	const content = $derived(opened ? facetContent(opened.facet, lang, essays, opened.from) : null);
	const PLACES: PlaceId[] = ['windmill', 'torii', 'board', 'tree'];
	const placeLabel = (place: PlaceId, index = 0) =>
		place === 'sail' ? sailName(index, lang) : PLACE_NAME[place][lang];

	function show(facet: FacetId, from: string) {
		opened = { facet, from };
		track('village_place_opened', { choice: facet, locale: lang });
	}
	// Open the scroll for a place (a sail opens its own facet).
	function openAt(place: PlaceId, index = 0) {
		const facet = facetOf(place, index);
		if (!facet) return;
		if (place === 'tree') scene?.bloomTree(index);
		show(facet, place === 'sail' ? PLACE_NAME.windmill[lang] : placeLabel(place, index));
	}
	// The kanji tabs in the scroll switch facets and turn that sail to the top.
	function chooseFacet(id: FacetId) {
		show(id, opened?.from ?? PLACE_NAME.windmill[lang]);
		scene?.seekSail(FACETS.findIndex((f) => f.id === id));
	}

	let scene: InkScene | null = null;
	let teardown = () => {};
	let bootId = 0;
	let slowTimer = 0;
	let loadTimer = 0;
	let introEligible = true;
	let intro = createKiteIntro(false);
	function clearLoadTimers() {
		clearTimeout(slowTimer);
		clearTimeout(loadTimer);
		slowLoad = false;
	}

	const isDark = () => document.documentElement.dataset.theme === 'dark';

	function readSignals(): DeviceSignals {
		let probe: WebGL2RenderingContext | null = null;
		try {
			probe = document.createElement('canvas').getContext('webgl2');
		} catch {
			probe = null;
		}
		let renderer = '';
		if (probe) {
			const ext = probe.getExtension('WEBGL_debug_renderer_info');
			renderer = String(
				probe.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER) ?? ''
			);
			probe.getExtension('WEBGL_lose_context')?.loseContext();
		}
		const nav = navigator as Navigator & {
			deviceMemory?: number;
			connection?: { saveData?: boolean };
		};
		return {
			webgl2: !!probe,
			renderer,
			deviceMemory: nav.deviceMemory,
			reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
			saveData: !!nav.connection?.saveData
		};
	}

	function fallBack(reason: FidelityChoice['reason']) {
		const id = ++bootId; // Invalidate any import that is still in flight.
		clearLoadTimers();
		intro.cancel();
		choice = { fidelity: 'lo', reason };
		queueMicrotask(() => {
			if (id === bootId) teardown();
		});
		track('village_fidelity', { choice: `lo:${reason}`, locale: lang });
	}

	async function boot() {
		const id = ++bootId;
		clearLoadTimers();
		intro.cancel();
		teardown();
		live = false;
		const signals = readSignals();
		reduceMotion = signals.reduceMotion;
		choice = chooseFidelity(pref, signals);
		if (choice.fidelity === 'lo') {
			track('village_fidelity', { choice: `lo:${choice.reason}`, locale: lang });
			return;
		}

		const t0 = performance.now();
		slowTimer = window.setTimeout(() => {
			if (id === bootId) slowLoad = true;
		}, 1500);
		loadTimer = window.setTimeout(() => {
			if (id === bootId) fallBack('timeout');
		}, 12_000);
		let createInkScene: typeof import('./ink-scene').createInkScene;
		try {
			({ createInkScene } = await import('./ink-scene'));
		} catch {
			// The chunk did not load (offline, deploy in progress): stay lo-fi.
			if (id === bootId) fallBack('error');
			return;
		}
		await tick();
		if (id !== bootId || !glEl || choice?.fidelity !== 'hi') return;
		intro = createKiteIntro(tall && introEligible && !signals.reduceMotion);
		kite = intro.initialKite;

		const frames: number[] = [];
		let seen = 0;
		let acc = 0;
		let count = 0;
		let s: InkScene;
		try {
			s = createInkScene(glEl, readPalette(), {
				night: isDark(),
				reduceMotion: signals.reduceMotion,
				initialKite: kite,
				onLost: () => fallBack('context-lost'),
				onArrive(p) {
					status = '';
					openAt(p.place, p.index);
				},
				onFrame(ms) {
					seen++;
					if (seen === 1) {
						clearLoadTimers();
						stats.first = Math.round(performance.now() - t0);
						live = true;
						track('village_fidelity', { choice: `hi:${choice?.reason}`, locale: lang });
						return;
					}
					if (intro.advance(ms, onScreen && !document.hidden && progress < 0.35)) {
						kite = false;
						s.setKite(false);
					}
					// Skip shader-compile frames, then judge the next PROBE_FRAMES.
					if (pref === 'auto' && seen > 10 && frames.length < PROBE_FRAMES) {
						frames.push(ms);
						if (probeVerdict(frames) === 'drop') fallBack('slow-frames');
					}
					// Is the akabeko beside a place? (for the Enter prompt)
					if (seen % 8 === 0) {
						const n = s.near();
						if (n?.place !== nearBy?.place || n?.index !== nearBy?.index) nearBy = n;
					}
					if (!debug) return;
					acc += ms;
					count++;
					if (acc > 500) {
						stats.fps = Math.round((count * 1000) / acc);
						const info = s.info();
						stats.calls = info.calls;
						stats.tris = info.triangles;
						acc = 0;
						count = 0;
					}
				}
			});
		} catch {
			// The GPU refused a context after all.
			fallBack('error');
			return;
		}
		scene = s;
		s.setKite(kite);
		const fit = () => {
			const r = stageEl.getBoundingClientRect();
			s.resize(r.width, r.height);
			if (brushEl) {
				const dpr = window.devicePixelRatio || 1;
				brushEl.width = r.width * dpr;
				brushEl.height = r.height * dpr;
			}
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(stageEl);
		// Draw only while the village is on screen and not lost in the mist.
		const io = new IntersectionObserver(([e]) => {
			onScreen = e.isIntersecting;
			syncActive();
		});
		io.observe(villageEl);
		const stopTheme = onThemeChange(() => s.setPalette(readPalette(), isDark()));
		teardown = () => {
			ro.disconnect();
			io.disconnect();
			stopTheme();
			s.dispose();
			scene = null;
			live = false;
			opened = null;
			tag = null;
			teardown = () => {};
		};
		measure();
	}

	function setPref(p: FidelityPref) {
		cancelIntro();
		pref = p;
		try {
			localStorage.setItem(PREF_KEY, p);
		} catch {
			/* Storage can be blocked. */
		}
		const url = new URL(location.href);
		url.searchParams.delete('room');
		replaceState(url, {});
		void boot();
	}

	function toggleKite(on = !kite) {
		cancelIntro();
		kite = on;
		scene?.setKite(on);
	}
	function cancelIntro() {
		introEligible = false;
		intro.cancel();
	}

	const toggleSky = () => setSky(!isDark());

	async function setSky(dark: boolean) {
		await changeTheme(dark, () => {
			const theme = dark ? 'dark' : 'light';
			document.documentElement.dataset.theme = theme;
			try {
				localStorage.setItem('theme', theme);
			} catch {
				/* Storage can be blocked. */
			}
		});
	}

	// ── Scroll: hold the stage, raise the camera, let the mist in ────────
	let scrollRaf = 0;
	let onScreen = true;
	const syncActive = () => scene?.setActive(onScreen && !document.hidden && progress < 0.999);
	function measure() {
		if (!holding || !villageEl) {
			progress = 0;
			scene?.setScroll(0);
			return;
		}
		const r = villageEl.getBoundingClientRect();
		const travel = r.height - window.innerHeight;
		const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
		if (Math.abs(p - progress) < 0.001) return;
		progress = p;
		scene?.setScroll(p);
		syncActive();
		if (p > 0.5) {
			opened = null;
			brush = false;
			tag = null;
		}
	}
	function onScroll() {
		cancelAnimationFrame(scrollRaf);
		scrollRaf = requestAnimationFrame(measure);
	}

	// ── Click to walk or visit, drag the windmill to spin it ──────────────
	let drag: { x: number; t: number } | null = null;
	let down: { x: number; y: number; hit: Pick | null } | null = null;
	const onStage = (e: PointerEvent) => {
		const r = stageEl.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};
	const fromUi = (e: PointerEvent) =>
		!!(e.target as HTMLElement).closest('button, a, .hud, .actions, .scroll, .places, .cue');

	function visit(place: PlaceId, index = 0) {
		if (!scene) return;
		tag = null;
		opened = null;
		if (place === 'hiro') {
			scene.hop();
			status = '';
			return;
		}
		// A sail turns to the top at once; the akabeko walks over to read it.
		if (place === 'sail') scene.seekSail(index);
		status = `→ ${placeLabel(place, index)}`;
		scene.walkTo(place, index);
	}

	function onStageDown(e: PointerEvent) {
		if (brush || !scene || fromUi(e)) return;
		const p = onStage(e);
		// Remember what was pressed: the sails keep turning, so a pick at
		// release time could find a different sail.
		const hit = scene.pick(p.x, p.y);
		down = { x: e.clientX, y: e.clientY, hit };
		const onMill = hit && 'place' in hit && (hit.place === 'windmill' || hit.place === 'sail');
		drag = onMill && e.pointerType === 'mouse' ? { x: e.clientX, t: performance.now() } : null;
	}
	function onStageUp(e: PointerEvent) {
		const start = down;
		down = null;
		drag = null;
		if (!start || brush || !scene || fromUi(e)) return;
		if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return; // a drag or a swipe
		const hit = start.hit;
		if (!hit) return;
		if ('ground' in hit) {
			opened = null;
			status = '';
			scene.walkToPoint(hit.ground);
		} else {
			visit(hit.place, hit.index);
		}
	}

	let hoverRaf = 0;
	function onStageMove(e: PointerEvent) {
		cancelAnimationFrame(hoverRaf);
		if (!scene) return;
		const p = onStage(e);
		const r = stageEl.getBoundingClientRect();
		scene.setPointer((p.x / r.width) * 2 - 1, -((p.y / r.height) * 2 - 1));
		if (drag && !brush) {
			const now = performance.now();
			scene.spin(((e.clientX - drag.x) / Math.max(16, now - drag.t)) * 1.6);
			drag = { x: e.clientX, t: now };
		}
		if (brush || fromUi(e) || e.pointerType !== 'mouse') {
			tag = null;
			return;
		}
		hoverRaf = requestAnimationFrame(() => {
			const h = scene?.hover(p.x, p.y);
			tag = h ? { text: placeLabel(h.place, h.index), x: h.x, y: h.y } : null;
		});
	}

	// ── Keys: with the scene focused, arrows or WASD walk, Enter opens ────
	const KEY_DIR: Record<string, [number, number]> = {
		arrowleft: [-1, 0],
		a: [-1, 0],
		arrowright: [1, 0],
		d: [1, 0],
		arrowup: [0, -1],
		w: [0, -1],
		arrowdown: [0, 1],
		s: [0, 1]
	};
	const held: Record<string, boolean> = {}; // keys down now (not reactive)
	function steer() {
		let dx = 0,
			dz = 0;
		for (const k of Object.keys(held)) {
			dx += KEY_DIR[k][0];
			dz += KEY_DIR[k][1];
		}
		scene?.setMove(dx, dz);
		if (dx || dz) {
			status = '';
			opened = null;
		}
	}
	// Only the focused stage steers, so the arrow keys still scroll the page.
	function onStageKey(e: KeyboardEvent, isDown: boolean) {
		if (!scene || brush || e.metaKey || e.ctrlKey || e.altKey || e.target !== stageEl) return;
		const key = e.key.toLowerCase();
		if (key in KEY_DIR) {
			e.preventDefault();
			if (isDown) held[key] = true;
			else delete held[key];
			steer();
		} else if (isDown && key === 'enter' && nearBy && !opened) {
			e.preventDefault();
			openAt(nearBy.place, nearBy.index);
		}
	}
	function releaseKeys() {
		for (const k of Object.keys(held)) delete held[k];
		steer();
	}
	function onWindowKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && opened) opened = null;
	}

	// ── Brush (筆): draw, then read the stroke ────────────────────────────
	let stroke: Pt[] = [];
	let fadeTimer = 0;
	// Canvas-local CSS px. Not offsetX: it is unreliable on synthetic events.
	const local = (e: PointerEvent): Pt => {
		const r = brushEl!.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};
	function brushDown(e: PointerEvent) {
		if (!brush || !brushEl) return;
		try {
			brushEl.setPointerCapture(e.pointerId);
		} catch {
			/* Synthetic pointers cannot be captured. */
		}
		clearTimeout(fadeTimer);
		brushEl.classList.remove('fade');
		brushEl.getContext('2d')!.clearRect(0, 0, brushEl.width, brushEl.height);
		stroke = [local(e)];
	}
	function brushMove(e: PointerEvent) {
		if (!brush || !brushEl || !stroke.length) return;
		const p = local(e);
		const q = stroke[stroke.length - 1];
		const d = Math.hypot(p.x - q.x, p.y - q.y);
		if (d < 2) return;
		stroke.push(p);
		const ctx = brushEl.getContext('2d')!;
		const dpr = window.devicePixelRatio || 1;
		// Sumi: a fast stroke is thin, a slow stroke is wet and wide.
		ctx.lineWidth = Math.max(2, 13 - d * 0.35) * dpr;
		ctx.lineCap = 'round';
		ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink');
		ctx.globalAlpha = 0.85;
		ctx.beginPath();
		ctx.moveTo(q.x * dpr, q.y * dpr);
		ctx.lineTo(p.x * dpr, p.y * dpr);
		ctx.stroke();
	}

	// Call the sun or the moon. If it is already in the sky, it only swells.
	function callSky(dark: boolean) {
		if (isDark() === dark) {
			scene?.flare();
			return dark ? c.moonUp : c.sunUp;
		}
		void setSky(dark);
		return dark ? c.moonrise : c.sunrise;
	}

	function brushUp() {
		if (!brush || !stroke.length) return;
		const pts = stroke;
		stroke = [];
		const g = classifyStroke(pts);
		switch (g) {
			case 'circle': {
				// A circle around a tree makes it bloom; anywhere else, it calls the sun.
				const n = scene?.bloomInside((x, y) => encloses(pts, { x, y })) ?? 0;
				gesture = n ? c.bloom : callSky(false);
				break;
			}
			case 'crescent':
				gesture = callSky(true);
				break;
			case 'wind-left':
			case 'wind-right':
				scene?.gust(g === 'wind-left' ? -1 : 1);
				gesture = g === 'wind-left' ? c.windL : c.windR;
				break;
			case 'rise':
				toggleKite(true);
				gesture = c.kiteFly;
				break;
			case 'fall':
				toggleKite(false);
				gesture = c.kiteHome;
				break;
			default:
				gesture = c.unread;
		}
		brushEl?.classList.add('fade');
		fadeTimer = window.setTimeout(() => {
			brushEl?.getContext('2d')!.clearRect(0, 0, brushEl.width, brushEl.height);
			brushEl?.classList.remove('fade');
		}, 700);
	}

	$effect(() => {
		void holding;
		measure();
	});

	onMount(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(PREF_KEY);
		} catch {
			/* Storage can be blocked. */
		}
		pref = parsePref(location.search, stored);
		document.addEventListener('visibilitychange', syncActive);
		void boot();
		return () => {
			bootId++;
			clearLoadTimers();
			intro.cancel();
			document.removeEventListener('visibilitychange', syncActive);
			cancelAnimationFrame(hoverRaf);
			cancelAnimationFrame(scrollRaf);
			clearTimeout(fadeTimer);
			teardown();
		};
	});

	const reasonLabel: Record<string, string> = {
		capable: 'capable device',
		override: 'your choice',
		'no-webgl2': 'no WebGL2',
		'software-gpu': 'software GPU',
		'reduced-motion': 'reduced motion',
		'save-data': 'data saver',
		'low-memory': 'low memory',
		'slow-frames': 'frames too slow',
		'context-lost': 'GPU context lost',
		timeout: 'loading timed out',
		error: 'could not start'
	};
</script>

<svelte:window onscroll={onScroll} onresize={onScroll} onkeydown={onWindowKey} />

<section
	class="village"
	class:holding
	class:leaving={progress > 0.35}
	bind:this={villageEl}
	style:--p={progress}
	aria-label={c.region}
>
	<!-- The stage is a keyboard-operated widget (arrows walk, Enter opens), so it
	     takes focus and key events; every action also has a button. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="stage"
		class:brushing={brush}
		class:pointing={!!tag}
		bind:this={stageEl}
		role="application"
		aria-label={c.region}
		aria-describedby="village-hint"
		tabindex={live ? 0 : -1}
		onpointermove={onStageMove}
		onpointerdown={onStageDown}
		onpointerdowncapture={cancelIntro}
		onpointerup={onStageUp}
		onpointerleave={() => {
			cancelAnimationFrame(hoverRaf);
			drag = null;
			down = null;
			tag = null;
		}}
		onkeydown={(e) => onStageKey(e, true)}
		onkeydowncapture={cancelIntro}
		onkeyup={(e) => onStageKey(e, false)}
		onblur={releaseKeys}
	>
		<p id="village-hint" class="sr-only">{c.regionHint}</p>
		{#if choice?.fidelity === 'hi'}
			<canvas class="gl" class:on={live} bind:this={glEl} aria-hidden="true"></canvas>
			<div class="washi" aria-hidden="true"></div>
			<canvas
				class="brush"
				bind:this={brushEl}
				aria-hidden="true"
				onpointerdown={brushDown}
				onpointermove={brushMove}
				onpointerup={brushUp}
				onpointercancel={brushUp}
			></canvas>
		{/if}
		{#if choice?.fidelity === 'lo'}
			<div class="lofi">
				<Windmill {lang} />
			</div>
		{:else if !live}
			<div
				class="arrival"
				out:fly={{ x: -80, y: -64, duration: reduceMotion ? 0 : 480, easing: quartOut }}
			>
				<KitePlaceholder ready={live} />
			</div>
		{/if}
		{#if holding}
			<!-- 霞 Kasumi: a flat paper mist bank with a scalloped ink edge, as in
			     Japanese screen painting. It rises as you scroll into the page. -->
			<svg class="mist" viewBox="0 0 1200 1000" preserveAspectRatio="none" aria-hidden="true">
				<path
					class="bank"
					d="M0,95 Q70,43 140,95 Q210,43 280,95 Q365,15 450,95 Q550,15 650,95 Q705,15 760,95 Q815,43 870,95 Q970,43 1070,95 Q1135,43 1200,95 L1200,1000 L0,1000 Z"
				/>
				<path
					class="edge"
					d="M0,95 Q70,43 140,95 Q210,43 280,95 Q365,15 450,95 Q550,15 650,95 Q705,15 760,95 Q815,43 870,95 Q970,43 1070,95 Q1135,43 1200,95"
				/>
			</svg>
		{/if}

		<div class="ui">
			<div class="hud mono" aria-live="polite">
				{#if choice}
					<div class="seg" role="group" aria-label={c.fidelity}>
						{#each ['auto', 'hi', 'lo'] as const as p (p)}
							<button type="button" aria-pressed={pref === p} onclick={() => setPref(p)}>
								{c[p]}
							</button>
						{/each}
					</div>
				{/if}
				{#if debug && choice}
					<p>{choice.fidelity === 'hi' ? 'hi-fi' : 'lo-fi'} · {reasonLabel[choice.reason]}</p>
					{#if live}
						<p>first frame {stats.first} ms · {stats.fps} fps</p>
						<p>{stats.calls} draws · {(stats.tris / 1000).toFixed(1)}k tris</p>
					{/if}
				{/if}
			</div>
			<div class="load-status mono" role="status">
				{#if slowLoad}
					<p>{c.loading}</p>
					<p>{c.loadingHint}</p>
					<button type="button" class="act" onclick={() => setPref('lo')}>{c.useLite}</button>
				{:else if choice?.fidelity === 'lo' && ['error', 'timeout', 'context-lost'].includes(choice.reason)}
					<p>{c.loadFailed}</p>
				{/if}
			</div>

			{#if live}
				<nav class="places mono" aria-label={c.places}>
					<ul>
						{#each PLACES as place (place)}
							<li>
								<button type="button" onclick={() => visit(place)}>{placeLabel(place)}</button>
							</li>
						{/each}
					</ul>
					<p class="keys">{c.keys}</p>
					<p class="credit">{c.credit}</p>
				</nav>
				{#if tag}
					<span class="tag mono" style:left="{tag.x}px" style:top="{tag.y}px" aria-hidden="true"
						>{tag.text}</span
					>
				{/if}
				<p class="status mono" class:said={!!status} aria-live="polite">
					{#if status}{status}{:else if nearBy && !opened}
						<button
							type="button"
							class="enter"
							onclick={() => nearBy && visit(nearBy.place, nearBy.index)}
							>Enter · {placeLabel(nearBy.place, nearBy.index)}</button
						>
					{/if}
				</p>

				<div class="actions">
					<button type="button" class="act" aria-pressed={kite} onclick={() => toggleKite()}>
						{#if lang === 'en'}<span class="jp" aria-hidden="true">凧</span>{/if}
						{kite ? c.kiteDown : c.kiteUp}
					</button>
					<button type="button" class="act" onclick={toggleSky}>
						{#if lang === 'en'}<span class="jp" aria-hidden="true">日月</span>{/if}
						{c.sky}
					</button>
					<button type="button" class="act" aria-pressed={brush} onclick={() => (brush = !brush)}>
						{#if lang === 'en'}<span class="jp" aria-hidden="true">筆</span>{/if}
						{c.brush}
					</button>
					{#if brush}
						<ul class="hint mono">
							{#each c.hints as hint (hint)}<li>{hint}</li>{/each}
							{#if gesture}<li><strong>{gesture}</strong></li>{/if}
						</ul>
					{/if}
				</div>
			{/if}

			{#if tall && nextHref}
				<a class="cue mono" href={nextHref}>
					<span>{c.scroll}</span>
					<span class="line" aria-hidden="true"></span>
				</a>
			{/if}
		</div>

		{#if content}
			<PlaceScroll {content} {lang} onclose={() => (opened = null)} onfacet={chooseFacet} />
		{/if}
	</div>
</section>

<style>
	.village {
		position: relative;
		padding-top: var(--nav-h);
		background: var(--paper);
	}
	/* Home page, hi-fi: a taller section, so the stage holds while you scroll.
	   The negative margin lets the next section slide up over the misted stage
	   during that hold, so the page never shows an empty screen of paper. */
	.village.holding {
		height: calc(100svh + 70svh);
		margin-bottom: -70svh;
	}
	.stage {
		position: relative;
		height: calc(100svh - var(--nav-h));
		min-height: 30rem;
		overflow: hidden;
		background: var(--paper);
		touch-action: pan-y;
		outline: none;
	}
	.holding .stage {
		position: sticky;
		top: var(--nav-h);
		/* Fade out once the mist is thick, so the page's own paper shows. */
		opacity: calc((1 - var(--p)) * 4);
	}
	.stage:focus-visible {
		outline: 2px solid var(--ebicha);
		outline-offset: -2px;
	}
	.stage.brushing {
		touch-action: none;
	}
	.gl,
	.brush,
	.washi,
	.mist {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.gl {
		opacity: 0;
		transition: opacity 600ms var(--ease-out-quart);
	}
	.gl.on {
		opacity: 1;
	}
	.arrival {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}
	.arrival :global(svg) {
		width: min(18rem, 55vw);
		height: auto;
	}
	.load-status {
		position: absolute;
		left: 50%;
		bottom: 4rem;
		transform: translateX(-50%);
		width: min(30rem, calc(100% - 2rem));
		text-align: center;
		color: var(--ink);
	}
	.load-status p {
		margin: 0.35rem 0;
	}
	.load-status .act {
		margin-top: 0.5rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.gl {
			transition: none;
		}
	}
	/* A walking ring over the ground, a familiar hand over clickable places,
	   and the ink brush while painting. */
	@media (hover: hover) and (pointer: fine) {
		.gl {
			cursor:
				url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='9' fill='none' stroke='%23fbf8ef' stroke-width='4'/%3E%3Ccircle cx='14' cy='14' r='9' fill='none' stroke='%231e1a16' stroke-width='1.8'/%3E%3C/svg%3E")
					14 14,
				crosshair;
		}
		.pointing .gl {
			cursor: pointer;
		}
		.brushing .brush {
			cursor:
				url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M29 3 L14 18' stroke='%23fbf8ef' stroke-width='6' stroke-linecap='round'/%3E%3Cpath d='M29 3 L14 18' stroke='%238a6a45' stroke-width='3.2' stroke-linecap='round'/%3E%3Cpath d='M15.5 16.5 L11.5 20.5' stroke='%231e1a16' stroke-width='5' stroke-linecap='round'/%3E%3Cpath d='M12.5 18.5 C8 21 5 25 2 30 C7 28 11 25.5 14 21.5 Z' fill='%231e1a16' stroke='%23fbf8ef' stroke-width='1.2' stroke-linejoin='round'/%3E%3C/svg%3E")
					2 30,
				crosshair;
		}
	}
	/* The mist bank sits below the stage at the top of the page and rises to
	   cover it by the end of the hold. Flat fills only, like the rest of the site. */
	.mist {
		top: auto;
		bottom: 0;
		height: 125%;
		pointer-events: none;
		transform: translateY(calc((1 - var(--p)) * 100%));
	}
	.mist .bank {
		fill: var(--paper);
	}
	.mist .edge {
		fill: none;
		stroke: var(--ink);
		stroke-width: 1.2;
		vector-effect: non-scaling-stroke;
		opacity: 0.55;
	}
	.ui {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: calc(1 - var(--p, 0) * 3);
	}
	.ui > :global(*) {
		pointer-events: auto;
	}
	.leaving .ui > :global(*) {
		pointer-events: none;
	}
	.places {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: grid;
		gap: 0.4rem;
		max-width: min(27rem, calc(100% - 16rem));
	}
	.places p {
		margin: 0;
	}
	.places ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.places button,
	.enter {
		font: inherit;
		letter-spacing: inherit;
		text-transform: none;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--rule);
		padding: 0.3rem 0.55rem;
		cursor: pointer;
	}
	.places button:hover,
	.enter:hover {
		border-color: var(--ink);
	}
	.places .keys {
		display: none;
	}
	.stage:focus-visible .keys {
		display: block;
	}
	.places .credit {
		margin-top: 0.2rem;
		color: var(--ink);
	}
	.tag {
		position: absolute;
		transform: translate(-50%, -130%);
		padding: 0.25rem 0.5rem;
		color: var(--paper);
		background: var(--ink);
		text-transform: none;
		white-space: nowrap;
		pointer-events: none !important;
	}
	.status {
		position: absolute;
		left: 50%;
		bottom: 6.5rem;
		transform: translateX(-50%);
		margin: 0;
		color: var(--ink);
	}
	.status.said {
		padding: 0.3rem 0.6rem;
		background: color-mix(in srgb, var(--paper) 88%, transparent);
	}
	.brush {
		pointer-events: none;
		transition: opacity 600ms var(--ease-out-quart);
	}
	.brushing .brush {
		pointer-events: auto;
	}
	.brush:global(.fade) {
		opacity: 0;
	}
	/* Washi: paper fibre from an SVG noise filter. No image to download. */
	.washi {
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0.32;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	:global([data-theme='dark']) .washi {
		mix-blend-mode: screen;
		opacity: 0.14;
	}
	.lofi {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 2rem;
	}
	.mono {
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}
	.hud {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: grid;
		gap: 0.35rem;
		justify-items: end;
		text-align: right;
		pointer-events: none !important;
	}
	.hud p {
		margin: 0;
	}
	.seg {
		display: flex;
		border: 1px solid var(--rule);
		background: var(--paper);
		pointer-events: auto;
	}
	.leaving .seg {
		pointer-events: none;
	}
	.seg button {
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		color: var(--ink-mute);
		background: none;
		border: 0;
		padding: 0.4rem 0.7rem;
		cursor: pointer;
	}
	.seg button + button {
		border-left: 1px solid var(--rule);
	}
	.seg button[aria-pressed='true'] {
		color: var(--paper);
		background: var(--ink);
	}
	.actions {
		position: absolute;
		left: 1rem;
		bottom: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		max-width: calc(100% - 2rem);
	}
	.act {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--ink);
		padding: 0.45rem 0.8rem;
		cursor: pointer;
	}
	.act[aria-pressed='true'] {
		background: var(--ink);
		color: var(--paper);
	}
	.act .jp {
		font-family: var(--f-jp);
		font-size: 0.95rem;
		margin-right: 0.3rem;
		text-transform: none;
	}
	.hint {
		flex-basis: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 1rem;
		list-style: none;
		margin: 0.25rem 0 0;
		padding: 0.35rem 0.6rem;
		background: color-mix(in srgb, var(--paper) 80%, transparent);
	}
	.hint li:last-child:has(strong) {
		flex-basis: 100%;
	}
	.hint strong {
		color: var(--ink);
		font-weight: 500;
	}
	.cue {
		position: absolute;
		right: 1.25rem;
		bottom: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem;
		color: var(--ink-mute);
		text-decoration: none;
	}
	.cue:hover {
		color: var(--ebicha);
	}
	.cue .line {
		width: 1px;
		height: 1.75rem;
		background: currentColor;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	@media (max-width: 760px) {
		.places {
			top: 3.75rem;
			max-width: calc(100% - 2rem);
		}
		.cue {
			display: none;
		}
		.status {
			bottom: 7.5rem;
		}
	}
</style>
