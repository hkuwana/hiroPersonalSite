import { expect, test } from 'vitest';
import { COPY_DESK, COPY_MILL } from '$lib/home/copy';

test.each([
	['mill', COPY_MILL],
	['desk', COPY_DESK]
])('%s copy has the same non-empty keys in EN and JA', (_name, copy) => {
	expect(Object.keys(copy.ja).sort()).toEqual(Object.keys(copy.en).sort());
	for (const v of [...Object.values(copy.en), ...Object.values(copy.ja)])
		expect(v.trim()).not.toBe('');
});

test('nature sail uses Hiro’s words', async () => {
	const { FACETS } = await import('$lib/home/facets');
	expect(FACETS.find((f) => f.id === 'nature')?.line.en).toContain('iterations of design');
});
