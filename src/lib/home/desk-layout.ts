import { SHELVES, type ShelfId } from './desk-items';

export const DESK = {
	W: 840,
	H: 440,
	LEDGE_Y: 400,
	LABEL_W: 138,
	ROW0: 80,
	ROW_H: 64,
	GAP: 8
} as const;

export const plankY = (row: number) => DESK.ROW0 + row * DESK.ROW_H;

// Tag body: 44 px of padding/notch, plus 26 px for a logo badge.
export const tagWidth = (textWidth: number, subWidth: number, hasLogo: boolean) =>
	Math.max(64, Math.max(textWidth, subWidth) + 44 + (hasLogo ? 26 : 0));

export function layoutShelves(items: { id: string; cat: ShelfId; w: number; h: number }[]) {
	const out = new Map<string, { x: number; y: number }>();
	SHELVES.forEach((shelf, row) => {
		let x = DESK.LABEL_W;
		for (const it of items.filter((i) => i.cat === shelf.id)) {
			out.set(it.id, { x: x + it.w / 2, y: plankY(row) - it.h / 2 - 1 });
			x += it.w + DESK.GAP;
		}
	});
	return out;
}

export const isClick = (
	down: { x: number; y: number; t: number },
	up: { x: number; y: number; t: number }
) => Math.hypot(up.x - down.x, up.y - down.y) < 6 && up.t - down.t < 350;

export type DeskMode = 'loose' | 'organized';
export const nextDeskMode = (m: DeskMode): DeskMode => (m === 'loose' ? 'organized' : 'loose');
