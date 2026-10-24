// 音 The village's sound: a quiet field-recording bed (day or night, CC0, see
// static/audio/CREDITS.md) and small synthesized effects, so the effects
// cost no download. Sound is off until a visitor turns it on; browsers
// also refuse to start audio before a click.
export const SOUND_KEY = 'village-sound-v1';
export type Sfx = 'brush' | 'kon' | 'bell' | 'unroll' | 'gust';

export const parseSoundPref = (stored: string | null) => stored === 'on';

// Where the ambience lives. AAC for Safari and most browsers, Vorbis otherwise.
export function ambienceUrl(night: boolean, canAac: boolean) {
	return `/audio/village-${night ? 'night' : 'day'}.${canAac ? 'm4a' : 'ogg'}`;
}

const BED = 0.55; // ambience level under full presence
const FX = 0.5;

export function createVillageSound() {
	let ctx: AudioContext | null = null;
	let master: GainNode;
	let bedGain: GainNode;
	let fxGain: GainNode;
	let noise: AudioBuffer;
	let on = false;
	let night = false;
	let presence = 1;
	let bed: { src: AudioBufferSourceNode; gain: GainNode; night: boolean } | null = null;
	const buffers = new Map<string, Promise<AudioBuffer | null>>();
	let canAac = true;

	function setup() {
		if (ctx) return ctx;
		const AC =
			window.AudioContext ??
			(window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AC) return null;
		ctx = new AC();
		master = ctx.createGain();
		master.gain.value = 0;
		master.connect(ctx.destination);
		bedGain = ctx.createGain();
		bedGain.gain.value = BED * presence;
		bedGain.connect(master);
		fxGain = ctx.createGain();
		fxGain.gain.value = FX;
		fxGain.connect(master);
		// One second of white noise feeds every brush, paper and wind sound.
		noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
		const d = noise.getChannelData(0);
		for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
		canAac = new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
		return ctx;
	}

	function load(isNight: boolean) {
		const url = ambienceUrl(isNight, canAac);
		let p = buffers.get(url);
		if (!p) {
			p = fetch(url)
				.then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
				.then((b) => ctx!.decodeAudioData(b))
				.catch(() => null);
			buffers.set(url, p);
		}
		return p;
	}

	// Cross-fade to the bed for the current time of day.
	async function playBed() {
		if (!ctx || !on || bed?.night === night) return;
		const want = night;
		const buffer = await load(want);
		if (!ctx || !on || want !== night || !buffer || bed?.night === want) return;
		const t = ctx.currentTime;
		if (bed) {
			const old = bed;
			old.gain.gain.setTargetAtTime(0, t, 0.8);
			old.src.stop(t + 4);
		}
		const src = ctx.createBufferSource();
		src.buffer = buffer;
		// The files carry their own crossfaded seam, so the whole buffer loops.
		src.loop = true;
		const gain = ctx.createGain();
		gain.gain.value = 0;
		gain.gain.setTargetAtTime(1, t, 0.9);
		src.connect(gain).connect(bedGain);
		src.start(t, Math.random() * buffer.duration * 0.8);
		bed = { src, gain, night: want };
	}

	function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(peak, t + attack);
		g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
	}
	function noiseBurst(t: number, length: number) {
		const src = ctx!.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		src.start(t, Math.random() * 0.5);
		src.stop(t + length + 0.05);
		return src;
	}

	const SYNTH: Record<Sfx, (t: number) => void> = {
		// 筆 a soft brush across paper: band-passed noise that slows down.
		brush(t) {
			const bp = ctx!.createBiquadFilter();
			bp.type = 'bandpass';
			bp.Q.value = 0.9;
			bp.frequency.setValueAtTime(2600, t);
			bp.frequency.exponentialRampToValueAtTime(900, t + 0.35);
			const g = ctx!.createGain();
			env(g, t, 0.22, 0.03, 0.34);
			noiseBurst(t, 0.4).connect(bp).connect(g).connect(fxGain);
		},
		// コン a wooden block: a short, low, hollow knock.
		kon(t) {
			for (const [f, peak] of [
				[620, 0.32],
				[1130, 0.1]
			] as const) {
				const o = ctx!.createOscillator();
				o.frequency.setValueAtTime(f, t);
				o.frequency.exponentialRampToValueAtTime(f * 0.92, t + 0.15);
				const g = ctx!.createGain();
				env(g, t, peak, 0.004, 0.16);
				o.connect(g).connect(fxGain);
				o.start(t);
				o.stop(t + 0.25);
			}
		},
		// 風鈴 a small wind bell: inharmonic partials with a long ring.
		bell(t) {
			const base = 1320 + Math.random() * 160;
			for (const [ratio, peak, decay] of [
				[1, 0.12, 2.4],
				[2.76, 0.05, 1.4],
				[5.4, 0.025, 0.7]
			] as const) {
				const o = ctx!.createOscillator();
				o.frequency.value = base * ratio;
				const g = ctx!.createGain();
				env(g, t, peak, 0.005, decay);
				o.connect(g).connect(fxGain);
				o.start(t);
				o.stop(t + decay + 0.1);
			}
		},
		// 巻物 paper unrolling: low rustle with an uneven flutter.
		unroll(t) {
			const lp = ctx!.createBiquadFilter();
			lp.type = 'bandpass';
			lp.frequency.value = 1500;
			lp.Q.value = 0.5;
			const g = ctx!.createGain();
			g.gain.setValueAtTime(0.0001, t);
			for (let i = 0; i < 9; i++)
				g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.1, t + 0.04 + i * 0.075);
			g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
			noiseBurst(t, 0.9).connect(lp).connect(g).connect(fxGain);
		},
		// 風 a gust: a wide rush of air that swells and fades, with a thin
		// whistle riding on top.
		gust(t) {
			const bp = ctx!.createBiquadFilter();
			bp.type = 'bandpass';
			bp.Q.value = 0.8;
			bp.frequency.setValueAtTime(320, t);
			bp.frequency.exponentialRampToValueAtTime(1400, t + 0.7);
			bp.frequency.exponentialRampToValueAtTime(380, t + 2);
			const g = ctx!.createGain();
			env(g, t, 0.6, 0.45, 1.6);
			noiseBurst(t, 2.2).connect(bp).connect(g).connect(fxGain);
			const whistle = ctx!.createBiquadFilter();
			whistle.type = 'bandpass';
			whistle.Q.value = 12;
			whistle.frequency.setValueAtTime(900, t);
			whistle.frequency.exponentialRampToValueAtTime(2100, t + 0.8);
			whistle.frequency.exponentialRampToValueAtTime(1100, t + 1.9);
			const wg = ctx!.createGain();
			env(wg, t, 0.18, 0.6, 1.3);
			noiseBurst(t, 2.1).connect(whistle).connect(wg).connect(fxGain);
		}
	};

	return {
		get on() {
			return on;
		},
		// Call from a click or key handler, so the browser allows audio.
		enable() {
			if (!setup()) return false;
			on = true;
			void ctx!.resume();
			master.gain.setTargetAtTime(1, ctx!.currentTime, 0.4);
			void playBed();
			return true;
		},
		disable() {
			on = false;
			if (!ctx) return;
			master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
		},
		setNight(isNight: boolean) {
			night = isNight;
			void playBed();
		},
		// 0..1: how much of the village is still in view (scroll, rooms).
		setPresence(p: number) {
			presence = Math.min(1, Math.max(0, p));
			if (ctx) bedGain.gain.setTargetAtTime(BED * presence, ctx.currentTime, 0.25);
		},
		// Pause the clock while the tab is hidden.
		setAwake(awake: boolean) {
			if (!ctx || !on) return;
			void (awake ? ctx.resume() : ctx.suspend());
		},
		play(sfx: Sfx) {
			if (!ctx || !on || ctx.state !== 'running') return;
			SYNTH[sfx](ctx.currentTime + 0.01);
		},
		dispose() {
			on = false;
			bed = null;
			void ctx?.close();
			ctx = null;
		}
	};
}
export type VillageSound = ReturnType<typeof createVillageSound>;
