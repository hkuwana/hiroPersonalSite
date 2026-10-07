import type { Locale } from './copy';
import { DESK, plankY, type DeskMode } from './desk-layout';
import { SHELVES, type DeskItem } from './desk-items';
import type { Palette } from './palette';

export type DrawnItem = {
	item: DeskItem;
	w: number;
	h: number;
	x: number;
	y: number;
	angle: number;
};

const DARK_TEXT = new Set(['gold', 'mossLight']);

function drawSeal(ctx: CanvasRenderingContext2D, p: Palette) {
	ctx.fillStyle = p.gold;
	ctx.strokeStyle = p.ink;
	ctx.lineWidth = 1.2;
	ctx.beginPath();
	ctx.arc(0, 0, 30, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.arc(0, 0, 24, 0, Math.PI * 2);
	ctx.stroke();
	ctx.fillStyle = p.ink;
	ctx.font = '600 28px "Shippori Mincho", serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('浩', 0, 2);
}

function drawTag(ctx: CanvasRenderingContext2D, p: Palette, d: DrawnItem, logo?: HTMLImageElement) {
	const { w, h, item } = d;
	const shelf = SHELVES.find((s) => s.id === item.cat)!;
	const fill = p[shelf.color];
	ctx.fillStyle = fill;
	ctx.strokeStyle = p.ink;
	ctx.lineWidth = 1.2;
	ctx.beginPath();
	ctx.moveTo(-w / 2 + 12, -h / 2);
	ctx.lineTo(w / 2, -h / 2);
	ctx.lineTo(w / 2, h / 2);
	ctx.lineTo(-w / 2 + 12, h / 2);
	ctx.lineTo(-w / 2, 0);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	let tx = 8;
	if (item.logo) {
		const bx = -w / 2 + 28;
		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc(bx, 0, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (logo?.complete && logo.naturalWidth) {
			const k = 18 / Math.max(logo.naturalWidth, logo.naturalHeight);
			ctx.save();
			ctx.beginPath();
			ctx.arc(bx, 0, 12, 0, Math.PI * 2);
			ctx.clip();
			ctx.drawImage(
				logo,
				bx - (logo.naturalWidth * k) / 2,
				-(logo.naturalHeight * k) / 2,
				logo.naturalWidth * k,
				logo.naturalHeight * k
			);
			ctx.restore();
		}
		tx = 21;
	} else {
		ctx.fillStyle = p.paper;
		ctx.beginPath();
		ctx.arc(-w / 2 + 14, 0, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
	ctx.fillStyle = DARK_TEXT.has(shelf.color) ? p.ink : p.paper;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '18px "Newsreader", serif';
	ctx.fillText(item.label, tx, item.sub ? -8 : 1);
	if (item.sub) {
		ctx.font = 'italic 13px "Newsreader", serif';
		ctx.globalAlpha = 0.85;
		ctx.fillText(item.sub, tx, 13);
		ctx.globalAlpha = 1;
	}
}

export function drawDesk(
	ctx: CanvasRenderingContext2D,
	p: Palette,
	s: { items: DrawnItem[]; mode: DeskMode; lang: Locale; logos: Map<string, HTMLImageElement> }
) {
	const { W, H, LEDGE_Y, LABEL_W } = DESK;
	ctx.clearRect(0, 0, W, H);
	ctx.fillStyle = p.wood;
	ctx.fillRect(0, LEDGE_Y, W, H - LEDGE_Y);
	ctx.strokeStyle = p.ink;
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo(0, LEDGE_Y);
	ctx.lineTo(W, LEDGE_Y);
	ctx.stroke();
	ctx.globalAlpha = 0.35;
	ctx.lineWidth = 1;
	for (let i = 0; i < 4; i++) {
		ctx.beginPath();
		ctx.moveTo(0, LEDGE_Y + 9 + i * 8);
		ctx.bezierCurveTo(
			W * 0.3,
			LEDGE_Y + 5 + i * 8,
			W * 0.6,
			LEDGE_Y + 14 + i * 8,
			W,
			LEDGE_Y + 8 + i * 8
		);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
	if (s.mode === 'organized') {
		SHELVES.forEach((shelf, r) => {
			const y = plankY(r);
			if (y < LEDGE_Y) {
				ctx.fillStyle = p.wood;
				ctx.fillRect(LABEL_W - 12, y, W - LABEL_W + 4, 7);
				ctx.strokeStyle = p.ink;
				ctx.lineWidth = 1;
				ctx.strokeRect(LABEL_W - 12, y, W - LABEL_W + 4, 7);
			}
			ctx.fillStyle = p[shelf.color];
			ctx.fillRect(0, y - 26, 5, 24);
			ctx.fillStyle = p.ink;
			ctx.font = '600 14px "Shippori Mincho", serif';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText(shelf.label[s.lang], 12, y - 14);
		});
	}
	for (const d of s.items) {
		ctx.save();
		ctx.translate(d.x, d.y);
		ctx.rotate(d.angle);
		if (d.item.kind === 'seal') drawSeal(ctx, p);
		else drawTag(ctx, p, d, d.item.logo ? s.logos.get(d.item.logo) : undefined);
		ctx.restore();
	}
}
