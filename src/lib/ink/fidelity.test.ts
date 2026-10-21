import { describe, expect, it } from 'vitest';
import { chooseFidelity, parsePref, probeVerdict, type DeviceSignals } from './fidelity';

const strong: DeviceSignals = {
	webgl2: true,
	renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
	deviceMemory: 8,
	reduceMotion: false,
	saveData: false
};

describe('chooseFidelity', () => {
	it('gives hi-fi to a capable device on auto', () => {
		expect(chooseFidelity('auto', strong)).toEqual({ fidelity: 'hi', reason: 'capable' });
	});

	it('gives hi-fi when the browser hides device memory', () => {
		expect(chooseFidelity('auto', { ...strong, deviceMemory: undefined }).fidelity).toBe('hi');
	});

	it.each([
		['no-webgl2', { webgl2: false }],
		['software-gpu', { renderer: 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))' }],
		['software-gpu', { renderer: 'llvmpipe (LLVM 15.0.7, 256 bits)' }],
		['reduced-motion', { reduceMotion: true }],
		['save-data', { saveData: true }],
		['low-memory', { deviceMemory: 2 }]
	] as const)('falls back to lo-fi on auto: %s', (reason, patch) => {
		expect(chooseFidelity('auto', { ...strong, ...patch })).toEqual({ fidelity: 'lo', reason });
	});

	it('lets the visitor force hi-fi past the soft checks', () => {
		const weak = { ...strong, reduceMotion: true, deviceMemory: 2 };
		expect(chooseFidelity('hi', weak)).toEqual({ fidelity: 'hi', reason: 'override' });
	});

	it('never forces hi-fi without WebGL2', () => {
		expect(chooseFidelity('hi', { ...strong, webgl2: false })).toEqual({
			fidelity: 'lo',
			reason: 'no-webgl2'
		});
	});

	it('lets the visitor force lo-fi', () => {
		expect(chooseFidelity('lo', strong)).toEqual({ fidelity: 'lo', reason: 'override' });
	});
});

describe('parsePref', () => {
	it('reads ?room=1 and ?room=0 before the stored choice', () => {
		expect(parsePref('?room=1', 'lo')).toBe('hi');
		expect(parsePref('?room=0', 'hi')).toBe('lo');
	});

	it('uses a valid stored choice, else auto', () => {
		expect(parsePref('', 'lo')).toBe('lo');
		expect(parsePref('', 'nonsense')).toBe('auto');
		expect(parsePref('', null)).toBe('auto');
	});
});

describe('probeVerdict', () => {
	it('waits until it has enough frames', () => {
		expect(probeVerdict([50, 50, 50])).toBe('wait');
	});

	it('keeps hi-fi at 60 fps with a few slow frames', () => {
		const frames = [...Array(40).fill(16.7), 80, 90, 120];
		expect(probeVerdict(frames)).toBe('keep');
	});

	it('drops to lo-fi when the median frame is slower than 30 fps', () => {
		expect(probeVerdict(Array(40).fill(45))).toBe('drop');
	});
});
