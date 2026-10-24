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
	import { pushState, replaceState } from '$app/navigation';
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
	import { ARRIVAL_SEEN_KEY, MILL_BUILT_KEY } from './mill-assembly';
	import PlaceScroll from './PlaceScroll.svelte';
	import WorkshopRoom from './WorkshopRoom.svelte';
	import { villageUrl, workshopProject, workshopUrl, WORKSHOP_PROJECTS } from './workshop';
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
			buildMill: 'Build the mill',
			sky: 'Sun / moon',
			brush: 'Draw',
			resetView: 'Reset view',
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
			buildMill: '風車を組み立てる',
			sky: '日と月',
			brush: '描く',
			resetView: '視点を戻す',
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
	let millBuilt = $state(false);
	let brush = $state(false);
	let explored = $state(false);
	let orbiting = $state(false);
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
	let scrollSeen = false;
	let scrollAnimate = $state(false);
	let workshop = $state(false);
	let selectedProject = $state(0);
	let curtain = $state<'cover' | 'reveal' | null>(null);
	let enteringMill = false;
	let arrivalTimer = 0;
	let coverTimer = 0;
	let revealTimer = 0;
	let readyTimer = 0;
	let workshopEntryUrl: string | null = null;
	let transitionTarget: boolean | null = null;
	let transitionId = 0;
	let leavingWorkshop = false;

	function cancelWorkshopTransition() {
		transitionId++;
		clearTimeout(arrivalTimer);
		clearTimeout(coverTimer);
		clearTimeout(revealTimer);
		clearTimeout(readyTimer);
		enteringMill = false;
		transitionTarget = null;
		curtain = null;
	}
	function focusVillage() {
		void tick().then(() => {
			if (workshop || curtain) return;
			const entry = stageEl?.querySelector<HTMLButtonElement>('.workshop-entry');
			(entry ?? stageEl)?.focus({ preventScroll: true });
		});
	}

	function revealRoom() {
		clearTimeout(readyTimer);
		// A theme/fidelity reload of the old room must not uncover an exit
		// before its cover has reached the other side.
		if (curtain !== 'cover' || transitionTarget !== workshop) return;
		const id = transitionId;
		curtain = reduceMotion ? null : 'reveal';
		clearTimeout(revealTimer);
		revealTimer = window.setTimeout(() => {
			if (id !== transitionId) return;
			curtain = null;
			transitionTarget = null;
			if (!workshop) focusVillage();
		}, 380);
	}
	function transitionWorkshop(inside: boolean, updateUrl = true) {
		cancelWorkshopTransition();
		const id = transitionId;
		transitionTarget = inside;
		opened = null;
		brush = false;
		tag = null;
		releaseKeys();
		curtain = reduceMotion ? null : 'cover';
		const changeRoom = () => {
			if (id !== transitionId) return;
			workshop = inside;
			leavingWorkshop = false;
			if (inside) {
				progress = 0;
				scene?.setScroll(0);
				if (updateUrl) {
					const url = workshopUrl(location.href, WORKSHOP_PROJECTS[selectedProject].id);
					workshopEntryUrl = url.href;
					pushState(url, {});
				}
				// A failed import still leaves the readable project shelf available.
				readyTimer = window.setTimeout(revealRoom, 1600);
			} else {
				if (updateUrl) replaceState(villageUrl(location.href), {});
				revealRoom();
				if (reduceMotion) focusVillage();
			}
			if (reduceMotion) transitionTarget = null;
			syncActive();
		};
		if (reduceMotion) changeRoom();
		else coverTimer = window.setTimeout(changeRoom, 340);
	}
	function leaveWorkshop() {
		if (curtain || leavingWorkshop) return;
		leavingWorkshop = true;
		// Back restores the actual entry, including any pre-existing hash/locale.
		if (workshopEntryUrl) {
			workshopEntryUrl = null;
			history.back();
		} else transitionWorkshop(false);
	}
	function selectProject(index: number) {
		selectedProject = index;
		replaceState(workshopUrl(location.href, WORKSHOP_PROJECTS[index].id), {});
	}
	function restoreWorkshop() {
		const url = new URL(location.href);
		selectedProject = Math.max(0, workshopProject(url.searchParams.get('project')));
		const inside = url.searchParams.get('place') === 'windmill';
		// Popstate also cancels a cover that has not switched rooms yet. Without
		// this, a quick Back could reopen the room after the URL returned home.
		if (inside !== workshop) transitionWorkshop(inside, false);
		else {
			cancelWorkshopTransition();
			leavingWorkshop = false;
			if (!inside) focusVillage();
		}
	}

	const content = $derived(opened ? facetContent(opened.facet, lang, essays, opened.from) : null);
	const PLACES: PlaceId[] = ['windmill', 'izakaya', 'board', 'tree'];
	const placeLabel = (place: PlaceId, index = 0) =>
		place === 'sail'
			? sailName(index, lang)
			: place === 'windmill' && !millBuilt
				? c.buildMill
				: PLACE_NAME[place][lang];

	function show(facet: FacetId, from: string) {
		scrollAnimate = !scrollSeen && !reduceMotion;
		scrollSeen = true;
		try {
			sessionStorage.setItem('village-scroll-seen-v1', '1');
		} catch {
			/* Optional. */
		}
		opened = { facet, from };
		track('village_place_opened', { choice: facet, locale: lang });
	}
	// Open the scroll for a place (a sail opens its own facet).
	function openAt(place: PlaceId, index = 0) {
		if (place === 'windmill' || (place === 'sail' && index === 0)) {
			transitionWorkshop(true);
			return;
		}
		const facet = facetOf(place, index);
		if (!facet) return;
		if (place === 'tree') scene?.bloomTree(index);
		show(facet, place === 'sail' ? PLACE_NAME.windmill[lang] : placeLabel(place, index));
	}
	// The kanji tabs in the scroll switch facets and turn that sail to the top.
	function chooseFacet(id: FacetId) {
		if (id === 'builder') {
			transitionWorkshop(true);
			return;
		}
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
		millBuilt = millBuilt || signals.reduceMotion || !tall;
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
		kite = !millBuilt || intro.initialKite;

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
				initialMillBuilt: millBuilt,
				onArrive(p) {
					if (enteringMill && p.place === 'windmill') transitionWorkshop(true);
				},
				onBuild() {
					millBuilt = true;
					kite = false;
					try {
						localStorage.setItem(MILL_BUILT_KEY, '1');
					} catch {
						/* Storage is optional. */
					}
				},
				onLost: () => fallBack('context-lost'),
				onFrame(ms) {
					seen++;
					if (seen === 1) {
						clearLoadTimers();
						stats.first = Math.round(performance.now() - t0);
						live = true;
						if (workshop) queueMicrotask(syncActive);
						if (tall) {
							try {
								sessionStorage.setItem(ARRIVAL_SEEN_KEY, '1');
							} catch {
								/* Storage is optional. */
							}
						}
						track('village_fidelity', { choice: `hi:${choice?.reason}`, locale: lang });
						return;
					}
					if (intro.advance(ms, onScreen && !document.hidden && progress < 0.35) && s.isBuilt()) {
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
		if (!on) scene?.buildMill();
		kite = on;
		scene?.setKite(on);
	}
	function cancelIntro() {
		introEligible = false;
		intro.cancel();
	}

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
	const syncActive = () =>
		scene?.setActive((!workshop || !live) && onScreen && !document.hidden && progress < 0.999);
	function measure() {
		if (workshop) return;
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
	let cameraDrag: { x: number; y: number } | null = null;
	let down: { x: number; y: number; hit: Pick | null } | null = null;
	function clearPointer() {
		cancelAnimationFrame(hoverRaf);
		drag = null;
		down = null;
		cameraDrag = null;
		orbiting = false;
		tag = null;
	}
	const onStage = (e: { clientX: number; clientY: number }) => {
		const r = stageEl.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};
	const fromUi = (e: { target: EventTarget | null }) =>
		!!(e.target as HTMLElement).closest('button, a, .hud, .actions, .scroll, .places, .cue');

	function visit(place: PlaceId, index = 0) {
		if (workshop || curtain) return;
		clearTimeout(arrivalTimer);
		enteringMill = false;
		if (place === 'windmill' || (place === 'sail' && index === 0)) {
			opened = null;
			brush = false;
			if (!scene || reduceMotion) {
				transitionWorkshop(true);
				return;
			}
			scene.buildMill();
			enteringMill = true;
			scene.walkTo('windmill');
			// Bound travel time even when approaching from the far edge of the map.
			arrivalTimer = window.setTimeout(() => {
				if (enteringMill) transitionWorkshop(true);
			}, 1250);
			return;
		}
		if (!scene) {
			openAt(place, index);
			return;
		}
		tag = null;
		if (place === 'hiro') {
			scene.hop();
			status = '';
			return;
		}
		// Reading starts immediately. Arrival only animates the cow, so a
		// closed scroll stays closed and an old walk cannot replace new content.
		if (place === 'sail') scene.buildMill();
		openAt(place, index);
		if (place === 'sail') scene.seekSail(index);
		status = '';
		scene.walkTo(place, index);
	}

	function onStageDown(e: PointerEvent) {
		if (workshop || curtain || e.button !== 0 || brush || !scene || fromUi(e)) return;
		const p = onStage(e);
		// Remember what was pressed: the sails keep turning, so a pick at
		// release time could find a different sail.
		const hit = scene.pick(p.x, p.y);
		down = { x: e.clientX, y: e.clientY, hit };
		const onMill = hit && 'place' in hit && (hit.place === 'windmill' || hit.place === 'sail');
		drag = onMill && e.pointerType === 'mouse' ? { x: e.clientX, t: performance.now() } : null;
		cameraDrag =
			!onMill &&
			e.pointerType === 'mouse' &&
			stageEl.clientWidth >= 900 &&
			matchMedia('(hover: hover) and (pointer: fine)').matches
				? { x: e.clientX, y: e.clientY }
				: null;
		if (cameraDrag && e.isTrusted) stageEl.setPointerCapture(e.pointerId);
	}
	function onStageUp(e: PointerEvent) {
		const start = down;
		if (stageEl.hasPointerCapture(e.pointerId)) stageEl.releasePointerCapture(e.pointerId);
		down = null;
		drag = null;
		cameraDrag = null;
		orbiting = false;
		if (!start || brush || !scene || fromUi(e)) return;
		if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return; // a drag or a swipe
		const hit = start.hit;
		if (!hit) return;
		if ('ground' in hit) {
			clearTimeout(arrivalTimer);
			enteringMill = false;
			opened = null;
			status = '';
			scene.walkToPoint(hit.ground);
		} else {
			visit(hit.place, hit.index);
		}
	}
	function onStageDoubleClick(e: MouseEvent) {
		if (workshop || curtain || brush || !scene || fromUi(e)) return;
		const p = onStage(e);
		const hit = scene.pick(p.x, p.y);
		if (hit && 'place' in hit && (hit.place === 'izakaya' || hit.place === 'board')) {
			opened = null;
		} else if (!hit || 'ground' in hit) {
			scene.resetView();
			explored = false;
		}
	}

	let hoverRaf = 0;
	function onStageMove(e: PointerEvent) {
		cancelAnimationFrame(hoverRaf);
		if (workshop || curtain || !scene) return;
		const p = onStage(e);
		const r = stageEl.getBoundingClientRect();
		scene.setPointer((p.x / r.width) * 2 - 1, -((p.y / r.height) * 2 - 1));
		if (cameraDrag && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) {
			scene.orbit(-(e.clientX - cameraDrag.x) * 0.0035, (e.clientY - cameraDrag.y) * 0.0025);
			cameraDrag = { x: e.clientX, y: e.clientY };
			explored = true;
			orbiting = true;
			tag = null;
			return;
		}
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
		if (
			workshop ||
			curtain ||
			!scene ||
			brush ||
			e.metaKey ||
			e.ctrlKey ||
			e.altKey ||
			e.target !== stageEl
		)
			return;
		const key = e.key.toLowerCase();
		if (key in KEY_DIR) {
			e.preventDefault();
			if (isDown) {
				held[key] = true;
				clearTimeout(arrivalTimer);
				enteringMill = false;
			} else delete held[key];
			steer();
		} else if (isDown && key === 'enter' && nearBy && !opened) {
			e.preventDefault();
			visit(nearBy.place, nearBy.index);
		}
	}
	function releaseKeys() {
		for (const k of Object.keys(held)) delete held[k];
		steer();
	}
	function onWindowKey(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		if (!workshop && (enteringMill || transitionTarget === true)) {
			transitionWorkshop(false);
			return;
		}
		if (workshop) leaveWorkshop();
		else if (opened) opened = null;
		else if (explored) {
			scene?.resetView();
			explored = false;
		}
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
		const initialUrl = new URL(location.href);
		workshop = initialUrl.searchParams.get('place') === 'windmill';
		selectedProject = Math.max(0, workshopProject(initialUrl.searchParams.get('project')));
		window.addEventListener('popstate', restoreWorkshop);
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(PREF_KEY);
		} catch {
			/* Storage can be blocked. */
		}
		pref = parsePref(location.search, stored);
		try {
			millBuilt = localStorage.getItem(MILL_BUILT_KEY) === '1';
			introEligible = sessionStorage.getItem(ARRIVAL_SEEN_KEY) !== '1';
			scrollSeen = sessionStorage.getItem('village-scroll-seen-v1') === '1';
		} catch {
			/* Storage is optional. */
		}
		document.addEventListener('visibilitychange', syncActive);
		void boot();
		return () => {
			window.removeEventListener('popstate', restoreWorkshop);
			cancelWorkshopTransition();
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
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="stage"
		class:brushing={brush}
		class:pointing={!!tag}
		class:orbiting
		bind:this={stageEl}
		role={workshop ? undefined : 'application'}
		aria-label={c.region}
		aria-describedby={workshop ? undefined : 'village-hint'}
		tabindex={!workshop && live ? 0 : -1}
		onpointermove={onStageMove}
		onpointerdown={onStageDown}
		onpointerdowncapture={cancelIntro}
		onpointerup={onStageUp}
		ondblclick={onStageDoubleClick}
		onpointerleave={clearPointer}
		onpointercancel={clearPointer}
		onlostpointercapture={clearPointer}
		onkeydown={(e) => onStageKey(e, true)}
		onkeydowncapture={cancelIntro}
		onkeyup={(e) => onStageKey(e, false)}
		onblur={releaseKeys}
	>
		<p id="village-hint" class="sr-only">{c.regionHint}</p>
		<div class="outdoor" class:hidden={workshop} inert={workshop || !!curtain}>
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
					{#if choice && debug}
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

				{#if live || choice?.fidelity === 'lo'}
					<nav class="places mono" aria-label={c.places}>
						<button class="workshop-entry" type="button" onclick={() => visit('windmill')}>
							{lang === 'ja' ? '風車の工房に入る' : 'Enter the workshop'}
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
						</button>
						<ul class="landmark-access sr-only">
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
						<button type="button" class="act" aria-pressed={brush} onclick={() => (brush = !brush)}>
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
				<PlaceScroll
					{content}
					{lang}
					animate={scrollAnimate}
					onclose={() => (opened = null)}
					onfacet={chooseFacet}
				/>
			{/if}
		</div>
		{#if workshop && choice}
			<WorkshopRoom
				{lang}
				selected={selectedProject}
				{reduceMotion}
				lightweight={choice?.fidelity === 'lo'}
				onselect={selectProject}
				onleave={leaveWorkshop}
				onready={revealRoom}
			/>
		{/if}
		{#if curtain}
			<div class="area-scroll" class:reveal={curtain === 'reveal'} aria-hidden="true">
				<div class="scroll-sheet"><span>作</span></div>
			</div>
		{/if}
	</div>
</section>

<style>
	.outdoor {
		position: absolute;
		inset: 0;
	}
	.outdoor.hidden {
		visibility: hidden;
		pointer-events: none;
	}
	.places .workshop-entry {
		display: inline-flex;
		align-items: center;
		gap: 0.8rem;
		min-height: 44px;
		padding: 0.55rem 0.8rem;
		font-family: var(--f-body);
		font-size: 0.95rem;
		letter-spacing: 0;
	}
	.workshop-entry svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
	}
	.area-scroll {
		position: absolute;
		inset: -2%;
		z-index: 8;
		pointer-events: auto;
		animation: paper-cover 350ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}
	.area-scroll.reveal {
		animation: paper-reveal 370ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}
	.scroll-sheet {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: var(--paper);
		border-block: 1px solid var(--wood);
	}
	.scroll-sheet::before,
	.scroll-sheet::after {
		content: '';
		position: absolute;
		top: -1rem;
		bottom: -1rem;
		width: 1.8rem;
		border: 1px solid var(--ink);
		border-radius: 0.8rem;
		background: var(--wood);
	}
	.scroll-sheet::before {
		left: 0;
	}
	.scroll-sheet::after {
		right: 0;
	}
	.scroll-sheet span {
		font-family: var(--f-jp);
		font-size: clamp(4rem, 12vw, 8rem);
		color: var(--ebicha);
	}
	@keyframes paper-cover {
		from {
			transform: translateX(-110%);
		}
		to {
			transform: translateX(0);
		}
	}
	@keyframes paper-reveal {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(110%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.area-scroll,
		.area-scroll.reveal {
			animation: none;
		}
	}
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
		.orbiting .gl {
			cursor: grabbing;
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
	.places .landmark-access:focus-within {
		position: static;
		width: auto;
		height: auto;
		clip: auto;
		overflow: visible;
		white-space: normal;
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
		opacity: 0.14;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	:global([data-theme='dark']) .washi {
		mix-blend-mode: screen;
		opacity: 0.07;
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
