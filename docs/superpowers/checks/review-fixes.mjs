// Headless checks for the final-review findings (C1, I2, I4, I5, I6).
// Usage: node review-fixes.mjs [baseUrl]  (needs playwright-core and Google Chrome)
import { chromium } from 'playwright-core';
const U = process.argv[2] ?? 'http://localhost:4800';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
const touchSwipe = async (page, x, y, dy) => {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('Input.synthesizeScrollGesture', { x, y, yDistance: dy, gestureSourceType: 'touch', speed: 800 });
};

// C1: swipe on empty desk area scrolls the page on a phone
{
	const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
	const p = await ctx.newPage();
	await p.goto(U + '/', { waitUntil: 'networkidle' });
	await p.locator('.desk-canvas').scrollIntoViewIfNeeded(); await p.waitForTimeout(3500);
	const b = await p.locator('.desk-canvas').boundingBox();
	const y0 = await p.evaluate(() => scrollY);
	await touchSwipe(p, b.x + b.width * 0.5, b.y + b.height * 0.15, -200);
	await p.waitForTimeout(600);
	out.C1_deskSwipeScrolls = (await p.evaluate(() => scrollY)) - y0 > 50;
	// I5: vertical swipe that starts on the top sail does not scroll
	await p.locator('.mill-canvas').scrollIntoViewIfNeeded(); await p.waitForTimeout(3000);
	const m = await p.locator('.mill-canvas').boundingBox(); const k = m.width / 560;
	const y1 = await p.evaluate(() => scrollY);
	await touchSwipe(p, m.x + 280 * k, m.y + 210 * k, 150); // the hub is a hit at any angle
	await p.waitForTimeout(600);
	out.I5_sailSwipeDoesNotScroll = Math.abs((await p.evaluate(() => scrollY)) - y1) < 5;
	await ctx.close();
}

// I2: client-side language switch updates the hero name
{
	const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await p.goto(U + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
	await p.locator('a', { hasText: '日本語' }).first().click();
	await p.waitForURL(/\/ja/); await p.waitForTimeout(1200);
	const visible = await p.locator('.hero-name').evaluate((el) => [...el.childNodes].filter((n) => !(n.classList?.contains('sr-only'))).map((n) => n.textContent).join(''));
	out.I2_nameSwitchesToJa = visible.trim().startsWith('桑名浩行');
	await p.close();
}

// I4 + I6 helpers: organized-desk canvas pixels
async function organizedShot(opts, organizeAfterMs) {
	const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
	const p = await ctx.newPage();
	await p.addInitScript(() => { Math.random = () => 0.5; });
	await p.goto(U + '/', { waitUntil: 'networkidle' });
	await p.locator('.desk-canvas').scrollIntoViewIfNeeded();
	await p.waitForTimeout(organizeAfterMs);
	await p.locator('.desk-actions button').first().click();
	await p.waitForTimeout(3500);
	// coarse 24x12 grid of average colors, robust to sub-pixel anti-aliasing
	const grid = await p.locator('.desk-canvas').evaluate((c) => {
		const g = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
		const cw = Math.floor(c.width / 24), ch = Math.floor(c.height / 12), out = [];
		for (let gy = 0; gy < 12; gy++) for (let gx = 0; gx < 24; gx++) {
			let s = 0, n = 0;
			for (let y = gy * ch; y < (gy + 1) * ch; y += 2) for (let x = gx * cw; x < (gx + 1) * cw; x += 2) { const i = (y * c.width + x) * 4; s += g[i] + g[i + 1] + g[i + 2]; n++; }
			out.push(s / n);
		}
		return out;
	});
	return { p, ctx, shot: await p.locator('.desk-canvas').screenshot(), grid };
}

// I6: organize during the drop gives the same shelves as organize after the drop
{
	const late = await organizedShot({}, 4000);
	const early = await organizedShot({}, 700);
	out.I6_organizeMidDropMatches = late.grid.every((v, i) => Math.abs(v - early.grid[i]) < 6);
	await late.ctx.close(); await early.ctx.close();
}

// I4: at device pixel ratio 1.5, dragging the Kaiwa tag moves it
{
	const { p, ctx, shot: before } = await organizedShot({ deviceScaleFactor: 1.5 }, 4000);
	await p.locator('.desk-actions button').first().click(); // scatter → loose, let them settle
	await p.waitForTimeout(3500);
	const settled = await p.locator('.desk-canvas').screenshot();
	const b = await p.locator('.desk-canvas').boundingBox(); const k = b.width / 840;
	// grab the topmost-left tag area near the ledge and drag it up
	const shotBefore = await p.locator('.desk-canvas').screenshot();
	await p.mouse.move(b.x + 420 * k, b.y + 380 * k); await p.mouse.down();
	await p.mouse.move(b.x + 420 * k, b.y + 120 * k, { steps: 12 }); await p.waitForTimeout(300);
	const during = await p.locator('.desk-canvas').screenshot();
	await p.mouse.up();
	out.I4_dragWorksAtDpr15 = Buffer.compare(shotBefore, during) !== 0 && Buffer.compare(before, settled) !== 0;
	await ctx.close();
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
