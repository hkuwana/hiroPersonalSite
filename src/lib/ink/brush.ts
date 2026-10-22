// Pure rules for the brush gestures, inspired by the Celestial Brush in
// Ōkami (Clover Studio, 2006). A circle in the sky calls the sun, and a
// crescent calls the moon. A circle around a tree makes it bloom. A side
// stroke is a gust of wind. An up-stroke flies the kite, and a down-stroke
// brings it home. Screen coordinates: y grows downward.
export type Pt = { x: number; y: number };
export type Gesture = 'circle' | 'crescent' | 'rise' | 'fall' | 'wind-left' | 'wind-right' | 'none';

const MIN_SIZE = 60;

export function classifyStroke(pts: Pt[]): Gesture {
	if (pts.length < 8) return 'none';
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity,
		length = 0;
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i];
		minX = Math.min(minX, p.x);
		maxX = Math.max(maxX, p.x);
		minY = Math.min(minY, p.y);
		maxY = Math.max(maxY, p.y);
		if (i) length += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
	}
	const w = maxX - minX,
		h = maxY - minY;
	const diag = Math.hypot(w, h);
	if (diag < MIN_SIZE) return 'none';

	const first = pts[0],
		last = pts[pts.length - 1];
	const gap = Math.hypot(last.x - first.x, last.y - first.y);
	const aspect = w / Math.max(h, 1);
	// A circle's path is ~2.2× its box diagonal; a half arc is ~1.1×.
	if (gap < diag * 0.35 && length > diag * 1.7 && aspect > 0.45 && aspect < 2.2) return 'circle';

	// A crescent is an open curve that bows far from its chord: a half
	// circle bows 0.5× its chord, a hand-drawn straight line ~0.05×.
	if (gap >= diag * 0.35 && bow(pts, first, last, gap) > 0.3) return 'crescent';

	const dx = last.x - first.x,
		dy = last.y - first.y;
	if (gap / length < 0.6) return 'none';
	if (Math.abs(dy) > MIN_SIZE && Math.abs(dy) > Math.abs(dx)) return dy < 0 ? 'rise' : 'fall';
	if (Math.abs(dx) > MIN_SIZE * 1.5) return dx < 0 ? 'wind-left' : 'wind-right';
	return 'none';
}

// The largest distance from the chord (first → last), as a fraction of it.
function bow(pts: Pt[], a: Pt, b: Pt, chord: number): number {
	let max = 0;
	for (const p of pts) {
		const d = Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / chord;
		max = Math.max(max, d);
	}
	return max / chord;
}

// Is `p` inside the loop of the stroke? The loop closes from the last point
// back to the first, so a slightly open circle still counts (ray casting).
export function encloses(pts: Pt[], p: Pt): boolean {
	let inside = false;
	for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
		const a = pts[i],
			b = pts[j];
		if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
			inside = !inside;
		}
	}
	return inside;
}
