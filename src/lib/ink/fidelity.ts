// Pure rules for the hi-fi / lo-fi gate. No DOM: the page reads the signals
// and the frame times, and these functions decide.
export type Fidelity = 'hi' | 'lo';
export type FidelityPref = 'auto' | Fidelity;
export type FidelityReason =
	| 'capable'
	| 'override'
	| 'no-webgl2'
	| 'software-gpu'
	| 'reduced-motion'
	| 'save-data'
	| 'low-memory'
	| 'slow-frames'
	| 'context-lost' // the GPU dropped the scene after it started
	| 'timeout' // the scene did not become ready within the loading window
	| 'error'; // three.js did not load, or WebGL refused a context
export type FidelityChoice = { fidelity: Fidelity; reason: FidelityReason };

export type DeviceSignals = {
	webgl2: boolean;
	/** Unmasked GPU name, or '' when the browser hides it. */
	renderer: string;
	/** navigator.deviceMemory in GB; undefined where the browser hides it (Safari, Firefox). */
	deviceMemory?: number;
	reduceMotion: boolean;
	saveData: boolean;
};

export const PREF_KEY = 'fidelity';
const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;
const MIN_MEMORY_GB = 4;

export function chooseFidelity(pref: FidelityPref, s: DeviceSignals): FidelityChoice {
	if (!s.webgl2) return { fidelity: 'lo', reason: 'no-webgl2' };
	if (pref !== 'auto') return { fidelity: pref, reason: 'override' };
	if (SOFTWARE_GPU.test(s.renderer)) return { fidelity: 'lo', reason: 'software-gpu' };
	if (s.reduceMotion) return { fidelity: 'lo', reason: 'reduced-motion' };
	if (s.saveData) return { fidelity: 'lo', reason: 'save-data' };
	if (s.deviceMemory !== undefined && s.deviceMemory < MIN_MEMORY_GB)
		return { fidelity: 'lo', reason: 'low-memory' };
	return { fidelity: 'hi', reason: 'capable' };
}

/** `?room=1` / `?room=0` win (the same link Felix's site uses), then the saved choice. */
export function parsePref(search: string, stored: string | null): FidelityPref {
	const room = new URLSearchParams(search).get('room');
	if (room === '1') return 'hi';
	if (room === '0') return 'lo';
	return stored === 'hi' || stored === 'lo' || stored === 'auto' ? stored : 'auto';
}

export const PROBE_FRAMES = 30;
export const SLOW_FRAME_MS = 33;

/** After the first frames, keep hi-fi only if the median frame is at 30 fps or better. */
export function probeVerdict(frameMs: number[]): 'wait' | 'keep' | 'drop' {
	if (frameMs.length < PROBE_FRAMES) return 'wait';
	const sorted = [...frameMs].sort((a, b) => a - b);
	const median = sorted[Math.floor(sorted.length / 2)];
	return median > SLOW_FRAME_MS ? 'drop' : 'keep';
}
