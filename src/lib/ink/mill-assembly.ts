export const MILL_BUILT_KEY = 'village-mill-built-v1';
export const ARRIVAL_SEEN_KEY = 'village-arrival-seen-v1';

// A one-shot visible-time assembly. Reading is independent of this clock.
export function createMillAssembly(built: boolean, reduceMotion = false) {
	let started = built;
	let progress = built ? 1 : 0;
	return {
		get started() {
			return started;
		},
		get progress() {
			return progress;
		},
		start() {
			if (started) return false;
			started = true;
			if (reduceMotion) progress = 1;
			return true;
		},
		advance(ms: number) {
			if (started && progress < 1)
				progress = Math.min(1, progress + Math.max(0, Math.min(ms, 50)) / 1800);
			return progress;
		}
	};
}
