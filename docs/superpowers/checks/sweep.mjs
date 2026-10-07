import { chromium } from 'playwright-core';
const pages = ['/', '/about', '/essays', '/essays/build-your-own-autoresearch', '/ai-guides', '/case-study', '/corporate', '/tools', '/ja/'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const theme of ['light', 'dark']) for (const [w, h] of [[1280, 900], [390, 844]]) {
	const ctx = await browser.newContext({ viewport: { width: w, height: h } });
	await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
	for (const path of pages) {
		const p = await ctx.newPage(); const errs = [];
		p.on('pageerror', (e) => errs.push(String(e).slice(0, 80)));
		const r = await p.goto('http://localhost:4800' + path, { waitUntil: 'networkidle' });
		const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		const mode = await p.evaluate(() => document.compatMode);
		if (w === 1280) await p.screenshot({ path: '/tmp/hiro-pw/sweep-' + theme + path.replace(/\//g, '_') + '.png' });
		console.log(theme, w, path, r.status(), mode, 'overflowX=' + overflow, errs.length ? 'ERR ' + errs.join(' | ') : '');
		await p.close();
	}
	await ctx.close();
}
await browser.close();
