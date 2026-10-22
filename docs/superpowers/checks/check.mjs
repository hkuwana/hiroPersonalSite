import { chromium } from 'playwright-core';
const O = '/tmp/hiro-pw', U = 'http://localhost:4800';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const res = {};
const errors = [];
const mk = async (opts = {}) => { const p = await browser.newPage({ viewport: { width: 1280, height: 900 }, ...opts }); p.on('pageerror', (e) => errors.push(String(e))); return p; };

// 1. cards via canvas click (organized) + a11y list
let p = await mk();
await p.goto(U + '/', { waitUntil: 'networkidle' });
await p.locator('.desk').scrollIntoViewIfNeeded(); await p.waitForTimeout(3500);
await p.locator('.desk-actions button').first().click(); await p.waitForTimeout(1500);
const box = await p.locator('.desk-canvas').boundingBox(); const k = box.width / 840;
await p.mouse.click(box.x + 205 * k, box.y + 60 * k); await p.waitForTimeout(600);
res.kaiwaCard = await p.locator('.desk-card').innerText();
await p.locator('.desk nav button', { hasText: 'Dostoevsky' }).evaluate((b) => b.click()); await p.waitForTimeout(600);
res.dostoevskyCard = (await p.locator('.desk-card').innerText()).slice(0, 160);
res.portraitLoaded = await p.locator('.desk-portrait').evaluate((i) => i.complete && i.naturalWidth > 0);
await p.locator('.desk nav button', { hasText: 'Hiroyuki' }).evaluate((b) => b.click()); await p.waitForTimeout(600);
res.sealCard = await p.locator('.desk-card').innerText();
await p.locator('.desk').screenshot({ path: `${O}/card-seal.png` });

// 2. windmill: click right then left, panel follows the top sail
await p.locator('.hero-mill').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
const mb = await p.locator('.mill-canvas').boundingBox(); const mk2 = mb.width / 560;
const before = await p.locator('.mill-panel h3').innerText();
await p.mouse.click(mb.x + 380 * mk2, mb.y + 210 * mk2); await p.waitForTimeout(5000);
res.millAfterClick = { before, after: await p.locator('.mill-panel h3').innerText() };
await p.keyboard.press('Tab');
await p.locator('.mill-canvas').focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(2500);
res.millAfterArrow = await p.locator('.mill-panel h3').innerText();
await p.locator('.hero-mill').screenshot({ path: `${O}/mill-light.png` });

// 3. dark theme follows at once
await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark')); await p.waitForTimeout(400);
await p.locator('.hero-mill').screenshot({ path: `${O}/mill-dark.png` });
await p.close();

// 4. JA
p = await mk();
await p.goto(U + '/ja/', { waitUntil: 'networkidle' });
res.jaName = await p.locator('.hero-name').innerText();
res.jaPanel = await p.locator('.mill-panel').innerText();
await p.locator('.desk').scrollIntoViewIfNeeded(); await p.waitForTimeout(3500);
await p.locator('.desk-actions button').first().click(); await p.waitForTimeout(1500);
await p.locator('.desk').screenshot({ path: `${O}/desk-ja.png` });
await p.close();

// 5. reduced motion: desk starts organized
p = await mk({ reducedMotion: 'reduce' });
await p.goto(U + '/', { waitUntil: 'networkidle' });
await p.locator('.desk').scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
res.reducedButton = await p.locator('.desk-actions button').first().innerText();
await p.close();

// 6. mobile
p = await mk({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await p.goto(U + '/', { waitUntil: 'networkidle' });
res.touchAction = await p.locator('.mill-canvas').evaluate((c) => getComputedStyle(c).touchAction);
res.mobileOverflowX = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
await p.locator('.hero-mill').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
await p.screenshot({ path: `${O}/mobile-mill.png` });
await p.close();

res.errors = errors;
console.log(JSON.stringify(res, null, 1));
await browser.close();
