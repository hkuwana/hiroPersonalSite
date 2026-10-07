import { FACETS } from './facets';
import type { Palette } from './palette';
import { MILL, QUARTER, stepWindDir, sunPosition } from './windmill-model';

type Gust = { kind: 'streak' | 'leaf'; x: number; y: number; len: number; curl: boolean; rot: number; life: number; leafColor: 'moss' | 'gold' };
export type WindState = { dir: number; acc: number; gusts: Gust[] };
export type MillFrame = { angle: number; sunPhase: number; top: number; wind: WindState };

export const createWind = (): WindState => ({ dir: 1, acc: 0, gusts: [] });

export function stepWind(w: WindState, speed: number, turn: number) {
	w.dir = stepWindDir(w.dir, turn);
	w.acc += 0.012 + speed * 0.6;
	const edge = w.dir >= 0 ? -120 : MILL.W + 120;
	while (w.acc > 1) {
		w.acc -= 1;
		const leaf = Math.random() >= 0.8;
		w.gusts.push({ kind: leaf ? 'leaf' : 'streak', x: edge, y: (leaf ? 80 : 60) + Math.random() * (leaf ? 320 : 360),
			len: 70 + Math.random() * 90, curl: Math.random() < 0.6, rot: Math.random() * 6, life: 0, leafColor: Math.random() < 0.5 ? 'moss' : 'gold' });
	}
	const v = (1.4 + speed * 60) * w.dir;
	const dir = w.dir >= 0 ? 1 : -1;
	w.gusts = w.gusts.filter((g) => {
		g.x += v * (g.kind === 'leaf' ? 0.8 : 1);
		g.life += 1;
		if (g.kind === 'leaf') { g.rot += (0.05 + speed) * dir; g.y += Math.sin(g.life / 14) * 0.6; }
		return g.x <= MILL.W + 160 && g.x >= -160;
	});
}

const mixHex = (a: string, b: string, t: number) => {
	const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
	const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
	return `rgb(${pa.map((v, k) => Math.round(v + (pb[k] - v) * t)).join(',')})`;
};

function drawSun(ctx: CanvasRenderingContext2D, p: Palette, f: MillFrame) {
	const { x, y, low } = sunPosition(f.sunPhase);
	ctx.fillStyle = mixHex(p.paper2, '#d9a77f', low);
	ctx.beginPath(); ctx.arc(x, y, 56, 0, Math.PI * 2); ctx.fill();
	ctx.strokeStyle = mixHex(p.paper2, '#c48a63', Math.min(1, low + 0.2));
	ctx.lineWidth = 2;
	for (let k = 0; k < 12; k++) {
		const a = f.angle * 0.5 + (k * Math.PI) / 6;
		ctx.beginPath();
		ctx.moveTo(x + Math.cos(a) * 66, y + Math.sin(a) * 66);
		ctx.lineTo(x + Math.cos(a) * 80, y + Math.sin(a) * 80);
		ctx.stroke();
	}
}

function drawWind(ctx: CanvasRenderingContext2D, p: Palette, w: WindState) {
	const dir = w.dir >= 0 ? 1 : -1;
	for (const g of w.gusts) {
		const fade = Math.min(1, g.life / 30);
		if (g.kind === 'streak') {
			const head = g.x + dir * g.len;
			ctx.strokeStyle = p.ink; ctx.globalAlpha = 0.28 * fade; ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(g.x, g.y);
			ctx.bezierCurveTo(g.x + dir * g.len * 0.3, g.y - 6, g.x + dir * g.len * 0.6, g.y + 6, head, g.y);
			if (g.curl) {
				if (dir > 0) ctx.arc(head, g.y - 9, 9, Math.PI / 2, -Math.PI * 0.9, true);
				else ctx.arc(head, g.y - 9, 9, Math.PI / 2, -Math.PI * 0.1, false);
			}
			ctx.stroke();
		} else {
			ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot);
			ctx.globalAlpha = 0.85 * fade; ctx.fillStyle = p[g.leafColor];
			ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}
}

function drawLand(ctx: CanvasRenderingContext2D, p: Palette) {
	const { W, H, HUB } = MILL;
	ctx.fillStyle = p.mossLight;
	ctx.beginPath(); ctx.moveTo(0, 450); ctx.quadraticCurveTo(W * 0.3, 380, W * 0.65, 440); ctx.quadraticCurveTo(W * 0.85, 470, W, 420); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
	ctx.fillStyle = p.moss;
	ctx.beginPath(); ctx.moveTo(0, 490); ctx.quadraticCurveTo(W * 0.5, 440, W, 500); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
	ctx.fillStyle = p.paper; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5;
	ctx.beginPath(); ctx.moveTo(HUB.x - 34, 240); ctx.lineTo(HUB.x + 34, 240); ctx.lineTo(HUB.x + 62, 470); ctx.lineTo(HUB.x - 62, 470); ctx.closePath(); ctx.fill(); ctx.stroke();
	for (let y = 270; y < 470; y += 28) {
		const half = 34 + 28 * ((y - 240) / 230);
		ctx.beginPath(); ctx.moveTo(HUB.x - half, y); ctx.lineTo(HUB.x + half, y); ctx.stroke();
	}
	ctx.fillStyle = p.ebicha;
	ctx.beginPath(); ctx.moveTo(HUB.x - 44, 244); ctx.quadraticCurveTo(HUB.x, 168, HUB.x + 44, 244); ctx.closePath(); ctx.fill(); ctx.stroke();
	ctx.fillStyle = p.kon;
	ctx.beginPath(); ctx.moveTo(HUB.x - 14, 470); ctx.lineTo(HUB.x - 14, 430); ctx.arc(HUB.x, 430, 14, Math.PI, 0); ctx.lineTo(HUB.x + 14, 470); ctx.fill();
}

function drawBlade(ctx: CanvasRenderingContext2D, p: Palette, i: number, f: MillFrame) {
	const { BLADE_W, BLADE_LEN, BLADE_OFF } = MILL;
	const facet = FACETS[i];
	const x0 = -BLADE_W / 2, y0 = -(BLADE_OFF + BLADE_LEN);
	ctx.strokeStyle = p.ink; ctx.lineWidth = 3;
	ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, y0 - 6); ctx.stroke();
	ctx.fillStyle = p[facet.color];
	ctx.beginPath(); ctx.moveTo(0, -BLADE_OFF); ctx.lineTo(x0, y0); ctx.lineTo(0, y0); ctx.closePath(); ctx.fill();
	ctx.globalAlpha = 0.72;
	ctx.beginPath(); ctx.moveTo(0, -BLADE_OFF); ctx.lineTo(0, y0); ctx.lineTo(-x0, y0 + 26); ctx.closePath(); ctx.fill();
	ctx.globalAlpha = 1;
	ctx.lineWidth = 1;
	ctx.strokeRect(x0, y0, BLADE_W, BLADE_LEN);
	for (let y = y0 + 22; y < -BLADE_OFF; y += 22) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(-x0, y); ctx.stroke(); }
	ctx.save();
	ctx.translate(0, y0 + 40);
	ctx.rotate(-(f.angle + i * QUARTER)); // kanji stays upright
	ctx.fillStyle = p.paper;
	ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
	ctx.strokeStyle = i === f.top ? p.ebicha : p.ink; ctx.lineWidth = i === f.top ? 2 : 1; ctx.stroke();
	ctx.fillStyle = p.ink;
	ctx.font = '600 20px "Shippori Mincho", serif';
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
	ctx.fillText(facet.kanji, 0, 1);
	ctx.restore();
}

export function drawMill(ctx: CanvasRenderingContext2D, p: Palette, f: MillFrame) {
	ctx.clearRect(0, 0, MILL.W, MILL.H);
	drawSun(ctx, p, f);
	drawWind(ctx, p, f.wind);
	drawLand(ctx, p);
	ctx.save();
	ctx.translate(MILL.HUB.x, MILL.HUB.y);
	ctx.rotate(f.angle);
	for (let i = 0; i < FACETS.length; i++) { ctx.save(); ctx.rotate(i * QUARTER); drawBlade(ctx, p, i, f); ctx.restore(); }
	ctx.restore();
	ctx.fillStyle = p.gold; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5;
	ctx.beginPath(); ctx.arc(MILL.HUB.x, MILL.HUB.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}
