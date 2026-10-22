// Run after `pnpm build`. Two rules for the 3D (hi-fi) layer:
// 1. No route loads three.js through a static import: lo-fi visitors pay 0 KB.
// 2. Everything the hi-fi scene downloads stays under the budget (gzip).
import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const OUT = '.svelte-kit/output/client';
const NODES = '.svelte-kit/generated/client-optimized/nodes';
const SCENE = 'src/lib/ink/ink-scene.ts';
const BUDGET_KB = 1536;

const manifest = JSON.parse(await readFile(`${OUT}/.vite/manifest.json`, 'utf8'));
const code = new Map();
const read = async (file) => {
	if (!code.has(file)) code.set(file, await readFile(`${OUT}/${file}`));
	return code.get(file);
};
const hasThree = async (key) => (await read(manifest[key].file)).includes('isWebGLRenderer');

function staticClosure(key, seen = new Set()) {
	if (seen.has(key)) return seen;
	seen.add(key);
	for (const dep of manifest[key].imports ?? []) staticClosure(dep, seen);
	return seen;
}

let failed = false;
const routeOf = {};
for (const f of await readdir(NODES)) {
	const src = await readFile(`${NODES}/${f}`, 'utf8');
	routeOf[`${NODES}/${f}`] = src.match(/src\/routes\/(.*?)\+\w+\.svelte/)?.[1] ?? f;
}

for (const key of Object.keys(manifest).filter((k) => manifest[k].isEntry)) {
	for (const dep of staticClosure(key)) {
		if (await hasThree(dep)) {
			console.error(`✗ /${routeOf[key] ?? key} loads three.js statically (via ${dep})`);
			failed = true;
		}
	}
}
if (!failed) console.log('✓ no route loads three.js statically');

if (!manifest[SCENE]?.isDynamicEntry) {
	console.error(`✗ ${SCENE} is not a dynamic import`);
	failed = true;
} else {
	let gz = 0;
	for (const dep of staticClosure(SCENE)) gz += gzipSync(await read(manifest[dep].file)).length;
	const kb = Math.round(gz / 1024);
	const ok = kb <= BUDGET_KB;
	console[ok ? 'log' : 'error'](`${ok ? '✓' : '✗'} hi-fi scene: ${kb} KB gzip (budget ${BUDGET_KB} KB)`);
	failed ||= !ok;
}

process.exit(failed ? 1 : 0);
