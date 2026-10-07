import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const css = strip(readFileSync('src/style.css', 'utf8'));

function svelteFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) return name === 'paraglide' ? [] : svelteFiles(p);
		return p.endsWith('.svelte') ? [p] : [];
	});
}

test('palette tokens', () => {
	const tokens = { '--paper': '#eeebdd', '--ink': '#1e1a16', '--moss-green': '#5e6b45', '--moss-light': '#a3ad86', '--ebicha': '#6e2f2a', '--kon': '#233a5e', '--gold': '#a8894a', '--wood': '#8a6a45' };
	for (const [k, v] of Object.entries(tokens)) expect(css.toLowerCase()).toContain(`${k}: ${v}`);
});

test('accent is ebicha', () => expect(css).toMatch(/--color-accent:\s*var\(--ebicha\)/));

test('flat: style.css has no box-shadow and no gradient fills', () => {
	expect(css).not.toMatch(/box-shadow:\s*(?!none)/);
	expect(css).not.toMatch(/(linear|radial)-gradient\(/);
});

test('flat: component styles have no box-shadow and no gradient fills', () => {
	for (const f of svelteFiles('src')) {
		const style = strip(readFileSync(f, 'utf8').match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '');
		expect(style, f).not.toMatch(/box-shadow:\s*(?!none)/);
		expect(style, f).not.toMatch(/(linear|radial)-gradient\(/);
	}
});

test('frame and helpers exist', () => {
	for (const sel of ['.frame-deco', '.asanoha-break', '.sr-only', '.ink-link']) expect(css).toContain(sel);
});
