// Count rendered, visible time, not time spent downloading or in a hidden tab.
export function createKiteIntro(enabled: boolean) {
	let remaining = enabled ? 1800 : 0;
	return {
		initialKite: enabled,
		cancel() {
			remaining = 0;
		},
		advance(frameMs: number, visible: boolean) {
			if (!visible || remaining <= 0) return false;
			remaining -= Math.max(0, Math.min(frameMs, 50));
			return remaining <= 0;
		}
	};
}
