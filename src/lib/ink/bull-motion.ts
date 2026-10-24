export const BULL_SPEED = 5.4;

// Accelerate into a run and brake before a waypoint. Frame-rate independent;
// the distance cap prevents a fast bull overshooting doors or corners.
export function bullStep(speed: number, distance: number, dt: number, moving: boolean) {
	const target = moving ? Math.min(BULL_SPEED, Math.sqrt(Math.max(0, distance) * 22)) : 0;
	const nextSpeed = speed + (target - speed) * (1 - Math.exp(-dt * (moving ? 9 : 14)));
	return { speed: nextSpeed, distance: moving ? Math.min(distance, nextSpeed * dt) : 0 };
}
