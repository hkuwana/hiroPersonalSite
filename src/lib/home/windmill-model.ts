// Pure rules for the 風車 windmill. No DOM, no matter.js: the island feeds
// these with the rotor angle and velocity that matter.js integrates.
export const MILL = {
	W: 560,
	H: 540,
	HUB: { x: 280, y: 210 },
	BLADE_LEN: 170,
	BLADE_W: 54,
	BLADE_OFF: 30,
	REACH: 212
} as const;

export const QUARTER = Math.PI / 2;
export const SAIL_COUNT = 4;
export const SETTLE_SPEED = 0.012;
export const GUST_INTERVAL_MS = 6500;

const TAU = Math.PI * 2;
const CLICK_SPIN = 0.32;
const MAX_FLICK = 0.7;
const WIND_MIN_TURN = 0.03;
const WIND_EASE = 0.08;
const SUN_PER_RADIAN = 0.03;

export const topIndex = (angle: number) =>
	((Math.round(-angle / QUARTER) % SAIL_COUNT) + SAIL_COUNT) % SAIL_COUNT;

export const nearestSnap = (angle: number) => Math.round(angle / QUARTER) * QUARTER;

export function angleForSail(i: number, current: number): number {
	const base = -i * QUARTER;
	return base + Math.round((current - base) / TAU) * TAU;
}

export const springVelocity = (av: number, angle: number, target: number) =>
	av * 0.88 + (target - angle) * 0.012;

export const clickSpin = (pointerX: number, hubX: number) => (pointerX >= hubX ? CLICK_SPIN : -CLICK_SPIN);

export const clampFlick = (v: number) => Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));

export const onRotor = (p: { x: number; y: number }) =>
	Math.hypot(p.x - MILL.HUB.x, p.y - MILL.HUB.y) < MILL.REACH;

// Wind follows real spins only; the small settle motion is ignored.
export function stepWindDir(windDir: number, turn: number): number {
	if (Math.abs(turn) <= WIND_MIN_TURN) return windDir;
	return windDir + (Math.sign(turn) - windDir) * WIND_EASE;
}

export const stepSunPhase = (phase: number, turn: number) =>
	(((phase + turn * SUN_PER_RADIAN) % 1) + 1) % 1;

// 0 = left horizon, 0.5 = noon, 1 = right horizon. `low` is 0 high … 1 at horizon.
export function sunPosition(phase: number) {
	const th = Math.PI + phase * Math.PI;
	const x = MILL.W / 2 + Math.cos(th) * 300;
	const y = 500 + Math.sin(th) * 400;
	const low = Math.max(0, Math.min(1, (y - 140) / 300));
	return { x, y, low };
}

export function shouldGust(s: {
	now: number;
	lastGust: number;
	userTookOver: boolean;
	paused: boolean;
	reduceMotion: boolean;
}): boolean {
	return !s.userTookOver && !s.paused && !s.reduceMotion && s.now - s.lastGust > GUST_INTERVAL_MS;
}

export const clampDelta = (ms: number) => Math.min(ms, 1000 / 30);
