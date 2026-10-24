// The camera inside a room (the windmill workshop, the house). It flies to
// the chosen object, and the visitor can turn around it (drag) and come
// closer or step back (wheel, pinch, buttons). The math is pure, so tests
// cover the limits; `createRoomCamera` applies it to a three.js camera.
import type { PerspectiveCamera, Vector3 } from 'three';

export type Orbit = { yaw: number; pitch: number; dist: number };
export type Limits = { yaw: number; minPitch: number; maxPitch: number; near: number; far: number };
export type Inset = { left: number; right: number; top: number; bottom: number };

export const LIMITS: Limits = { yaw: 0.85, minPitch: 0.08, maxPitch: 0.95, near: 0.55, far: 2.4 };

// `dist` is a factor of the focused object's own viewing distance.
export function clampOrbit(o: Orbit, l: Limits = LIMITS): Orbit {
	return {
		yaw: Math.max(-l.yaw, Math.min(l.yaw, o.yaw)),
		pitch: Math.max(l.minPitch, Math.min(l.maxPitch, o.pitch)),
		dist: Math.max(l.near, Math.min(l.far, o.dist))
	};
}

// Shift the picture so the focus point sits in the middle of the area that
// the shelf and the journal leave free, instead of behind them.
export function viewShift(w: number, h: number, inset: Inset) {
	const freeW = Math.max(1, w - inset.left - inset.right);
	const freeH = Math.max(1, h - inset.top - inset.bottom);
	return {
		x: w / 2 - (inset.left + freeW / 2),
		y: h / 2 - (inset.top + freeH / 2),
		// A narrow free area needs the camera further back to fit the object.
		fit: Math.max(1, Math.min(2.2, Math.max((w * 0.62) / freeW, (h * 0.62) / freeH)))
	};
}

export function createRoomCamera(
	camera: PerspectiveCamera,
	make: () => Vector3,
	opts: { reduceMotion: boolean; base: Orbit }
) {
	const target = make();
	const look = make();
	let focusDist = 8;
	let focused = false;
	let wish: Orbit = { ...opts.base };
	let now: Orbit = { ...opts.base };
	let w = 1;
	let h = 1;
	let inset: Inset = { left: 0, right: 0, top: 0, bottom: 0 };
	let shift = viewShift(1, 1, inset);
	const ease = (dt: number, rate: number) => (opts.reduceMotion ? 1 : 1 - Math.exp(-dt * rate));

	function applyView() {
		shift = viewShift(w, h, inset);
		camera.aspect = w / h;
		camera.setViewOffset(w, h, shift.x, shift.y, w, h);
		camera.updateProjectionMatrix();
	}

	return {
		// Look at a new object from its own distance, facing it again.
		focus(point: Vector3, dist: number) {
			target.copy(point);
			if (!focused) look.copy(point);
			focused = true;
			focusDist = dist;
			wish = { ...opts.base, dist: Math.min(Math.max(wish.dist, 0.8), 1.25) };
		},
		orbit(dx: number, dy: number) {
			wish = clampOrbit({ yaw: wish.yaw + dx, pitch: wish.pitch + dy, dist: wish.dist });
		},
		zoom(factor: number) {
			wish = clampOrbit({ ...wish, dist: wish.dist * factor });
		},
		reset() {
			wish = { ...opts.base };
		},
		resize(width: number, height: number) {
			w = width;
			h = height;
			applyView();
		},
		setInset(next: Inset) {
			inset = next;
			applyView();
		},
		update(dt: number) {
			const k = ease(dt, 4);
			now = {
				yaw: now.yaw + (wish.yaw - now.yaw) * k,
				pitch: now.pitch + (wish.pitch - now.pitch) * k,
				dist: now.dist + (wish.dist - now.dist) * k
			};
			look.lerp(target, ease(dt, 3.2));
			// Portrait screens need more distance for the same object, and narrow
			// phones more again, so a whole shelf still fits across.
			const portrait = w / h < 1 ? Math.min(1.75, Math.max(1.35, 0.85 / (w / h))) : 1;
			const r = focusDist * now.dist * shift.fit * portrait;
			camera.position.set(
				look.x + Math.sin(now.yaw) * Math.cos(now.pitch) * r,
				look.y + Math.sin(now.pitch) * r,
				look.z + Math.cos(now.yaw) * Math.cos(now.pitch) * r
			);
			camera.lookAt(look);
		}
	};
}
export type RoomCamera = ReturnType<typeof createRoomCamera>;

// What every room scene offers to `RoomStage.svelte`.
export type RoomScene = {
	resize(w: number, h: number): void;
	pick(x: number, y: number): number | null;
	select(index: number): void;
	orbit(dx: number, dy: number): void;
	zoom(factor: number): void;
	reset(): void;
	setInset(inset: Inset): void;
	setActive(on: boolean): void;
	dispose(): void;
};
