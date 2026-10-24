// Read a logo image for the workshop figures: which pixels are the logo
// and which are background, and where the logo sits in the image. The
// pixel reading is pure and tested; `loadLogoPixels` only draws the image
// into a canvas.

// 1 marks background. Transparent logos use their alpha; opaque ones lose
// the colour that floods in from the edge (light parts inside the logo stay).
export function logoBackground(
	data: Uint8ClampedArray,
	w: number,
	h: number,
	tolerance = 34
): Uint8Array {
	const background = new Uint8Array(w * h);
	let transparent = false;
	for (let i = 3; i < data.length; i += 4)
		if (data[i] < 200) {
			transparent = true;
			break;
		}
	if (transparent) {
		for (let k = 0; k < w * h; k++) if (data[k * 4 + 3] < 128) background[k] = 1;
		return background;
	}
	const ref = [data[0], data[1], data[2]];
	const near = (i: number) =>
		Math.abs(data[i] - ref[0]) + Math.abs(data[i + 1] - ref[1]) + Math.abs(data[i + 2] - ref[2]) <
		tolerance * 3;
	const stack: number[] = [];
	for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
	for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
	while (stack.length) {
		const k = stack.pop()!;
		if (background[k] || !near(k * 4)) continue;
		background[k] = 1;
		const x = k % w;
		const y = (k - x) / w;
		if (x > 0) stack.push(k - 1);
		if (x < w - 1) stack.push(k + 1);
		if (y > 0) stack.push(k - w);
		if (y < h - 1) stack.push(k + w);
	}
	return background;
}

// The smallest box around the logo's own pixels, in pixel rows and columns.
export function logoBounds(background: Uint8Array, w: number, h: number) {
	let minX = w,
		minY = h,
		maxX = -1,
		maxY = -1;
	for (let y = 0; y < h; y++)
		for (let x = 0; x < w; x++) {
			if (background[y * w + x]) continue;
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
	return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

// Draw a logo into a res × res canvas and return its pixels. SVGs without
// a size do not draw in every browser, so they get one first.
// `crop` is a part of the image in fractions (Kaiwa's file has a colour
// strip under the face).
export type Crop = { x: number; y: number; w: number; h: number };
export async function loadLogoPixels(
	url: string,
	res: number,
	crop: Crop = { x: 0, y: 0, w: 1, h: 1 }
) {
	let src = url;
	let revoke = '';
	if (url.endsWith('.svg')) {
		const text = await (await fetch(url)).text();
		const sized = text.replace('<svg', `<svg width="${res * 4}" height="${res * 4}"`);
		revoke = src = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
	}
	try {
		const img = new Image();
		img.src = src;
		await img.decode();
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = res;
		const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
		ctx.imageSmoothingEnabled = true;
		const sw = img.naturalWidth * crop.w;
		const sh = img.naturalHeight * crop.h;
		// Fill the letterbox with the image's own corner, so an opaque logo
		// stays opaque (a transparent corner leaves it transparent).
		ctx.drawImage(img, img.naturalWidth * crop.x, img.naturalHeight * crop.y, 1, 1, 0, 0, res, res);
		const r = sw / sh || 1;
		const dw = r >= 1 ? res : res * r;
		const dh = r >= 1 ? res / r : res;
		ctx.drawImage(
			img,
			img.naturalWidth * crop.x,
			img.naturalHeight * crop.y,
			sw,
			sh,
			(res - dw) / 2,
			res - dh,
			dw,
			dh
		);
		return { data: ctx.getImageData(0, 0, res, res).data, w: res, h: res };
	} finally {
		if (revoke) URL.revokeObjectURL(revoke);
	}
}
