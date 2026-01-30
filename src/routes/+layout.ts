import type { LayoutLoad } from './$types';
import { setLocale, getLocale } from '$lib/paraglide/runtime';

// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;

export const load: LayoutLoad = async ({ url }) => {
	// Extract locale from URL path
	const pathSegments = url.pathname.split('/').filter(Boolean);
	const potentialLocale = pathSegments[0];

	// Check if first segment is a valid locale
	if (potentialLocale === 'ja') {
		setLocale('ja', { reload: false });
	} else {
		setLocale('en', { reload: false });
	}

	return {
		locale: getLocale()
	};
};
