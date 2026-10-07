import { expect, test } from 'vitest';
import { createTweenSet } from '$lib/home/tween-set';

test('killAll stops every tracked tween and empties the set', () => {
	const killed: number[] = [];
	const set = createTweenSet();
	set.add({ kill: () => killed.push(1) });
	set.add({ kill: () => killed.push(2) });
	set.killAll();
	expect(killed).toEqual([1, 2]);
	set.killAll();
	expect(killed).toEqual([1, 2]);
	expect(set.size()).toBe(0);
});
