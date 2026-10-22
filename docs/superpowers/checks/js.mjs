import { chromium } from 'playwright-core';
import { gzipSync } from 'node:zlib';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, port] of [['main', 4801], ['branch', 4800]]) {
	const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	const js = [];
	p.on('response', async (r) => { if (r.url().endsWith('.js') && r.url().includes('localhost')) js.push({ t: Date.now(), n: gzipSync(await r.body()).length, u: r.url() }); });
	const t0 = Date.now();
	await p.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
	const atLoad = js.reduce((s, x) => s + x.n, 0);
	await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(3000);
	const total = js.reduce((s, x) => s + x.n, 0);
	console.log(name, 'JS gz at load:', Math.round(atLoad / 1024) + ' KB', '| total after scroll:', Math.round(total / 1024) + ' KB');
	await p.close();
}
await browser.close();
