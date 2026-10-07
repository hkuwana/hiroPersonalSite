import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4800/', { waitUntil: 'networkidle' });
await p.locator('.hero-mill').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
const mb = await p.locator('.mill-canvas').boundingBox();
await p.mouse.click(mb.x + mb.width * 0.7, mb.y + mb.height * 0.39);
await p.waitForTimeout(9000); // spin fully settled
const o = await p.locator('.mill-panel').evaluate((el) => [...el.children].map((c) => +getComputedStyle(c).opacity));
console.log('opacities after spin:', o.join(', '), o.every((v) => v === 1) ? 'PASS' : 'FAIL');
await browser.close();
