import { afterEach, expect, test, vi } from 'vitest';
import { changeTheme } from './theme';
afterEach(() => vi.unstubAllGlobals());
function setup(reduced = false) {
	const root = { dataset: {} as Record<string, string> };
	const start = vi.fn((update: () => void) => {
		update();
		return { ready: Promise.resolve(), finished: Promise.resolve() };
	});
	vi.stubGlobal('document', { documentElement: root, startViewTransition: start });
	vi.stubGlobal('window', { matchMedia: () => ({ matches: reduced }) });
	return { root, start };
}
test('uses a theme transition and cleans up its styling state', async () => {
	const { root, start } = setup();
	await changeTheme(true, () => {
		expect(root.dataset.themeTransition).toBe('sunset');
	});
	expect(start).toHaveBeenCalledOnce();
	expect(root.dataset.themeTransition).toBeUndefined();
});
test('reduced motion changes theme without a snapshot animation', async () => {
	const { start } = setup(true);
	const update = vi.fn();
	await changeTheme(false, update);
	expect(update).toHaveBeenCalledOnce();
	expect(start).not.toHaveBeenCalled();
});
test('older browsers still change theme', async () => {
	setup();
	vi.stubGlobal('document', { documentElement: { dataset: {} } });
	const update = vi.fn();
	await changeTheme(true, update);
	expect(update).toHaveBeenCalledOnce();
});
