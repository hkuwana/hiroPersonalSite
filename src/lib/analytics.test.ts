import { afterEach, expect, test, vi } from 'vitest';
import { track } from './analytics';
afterEach(() => vi.unstubAllGlobals());
test('works during SSR, with blockers, and when the SDK throws', () => {
	expect(() => track('contact_submit_succeeded')).not.toThrow();
	vi.stubGlobal('window', {});
	expect(() => track('contact_submit_succeeded')).not.toThrow();
	vi.stubGlobal('window', {
		posthog: {
			capture: () => {
				throw new Error('blocked');
			}
		}
	});
	expect(() => track('contact_submit_succeeded')).not.toThrow();
});
test('sends a named conversion with only non-personal metadata', () => {
	const capture = vi.fn();
	vi.stubGlobal('window', { posthog: { capture } });
	track('contact_submit_succeeded', { locale: 'ja' });
	expect(capture).toHaveBeenCalledWith('contact_submit_succeeded', { locale: 'ja' });
});
