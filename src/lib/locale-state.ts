import { writable } from 'svelte/store';

export type SiteLocale = 'en' | 'ja';

export const optimisticLocale = writable<SiteLocale | null>(null);
