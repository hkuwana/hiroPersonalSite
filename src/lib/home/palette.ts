import type { PaletteKey } from './desk-items';

export type Palette = Record<PaletteKey, string>;

const VARS: Record<PaletteKey, string> = {
	paper: '--paper',
	paper2: '--paper-2',
	ink: '--ink',
	inkMute: '--ink-mute',
	moss: '--moss-green',
	mossLight: '--moss-light',
	ebicha: '--ebicha',
	kon: '--kon',
	gold: '--gold',
	wood: '--wood'
};

// Read live tokens, so canvases follow the light/dark theme.
export function readPalette(el: Element = document.documentElement): Palette {
	const cs = getComputedStyle(el);
	return Object.fromEntries(
		Object.entries(VARS).map(([k, v]) => [k, cs.getPropertyValue(v).trim()])
	) as Palette;
}

export function onThemeChange(cb: () => void): () => void {
	const mo = new MutationObserver(cb);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	return () => mo.disconnect();
}
