import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4800/', { waitUntil: 'networkidle' });
await p.locator('.hero-mill').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
const mb = await p.locator('.mill-canvas').boundingBox(); const k = mb.width / 560;
for (const [label, x] of [['right', 380], ['left', 180]]) {
	await p.mouse.click(mb.x + x * k, mb.y + 210 * k);
	const seen = [];
	for (let i = 0; i < 25; i++) { seen.push(await p.locator('.mill-panel h3').innerText()); await p.waitForTimeout(80); }
	console.log(label, [...new Set(seen)].join(' → '), '| order:', seen.filter((v, i) => v !== seen[i - 1]).slice(0, 6).join(','));
	await p.waitForTimeout(5000);
}
await browser.close();
