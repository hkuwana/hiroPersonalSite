<script lang="ts">
	// LanguageToggle - Switches between English (US) and Japanese
	// Shows both language options with active state

	import FlagIcon from './FlagIcon.svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';

	// Get current language
	const currentLang = $derived(getLocale());

	// Get the current path without locale prefix
	const currentPath = $derived($page.url.pathname);

	// Generate localized hrefs
	const enHref = $derived(localizeHref(currentPath, { locale: 'en' }));
	const jaHref = $derived(localizeHref(currentPath, { locale: 'ja' }));
</script>

<div class="language-toggle" role="group" aria-label={m.aria_toggle_language()}>
	<!-- English -->
	<a
		href={enHref}
		class="lang-option"
		class:active={currentLang === 'en'}
		aria-label="English"
		aria-current={currentLang === 'en' ? 'true' : undefined}
	>
		<FlagIcon countryCode="us" size="h-5 w-5" />
	</a>

	<!-- Japanese -->
	<a
		href={jaHref}
		class="lang-option"
		class:active={currentLang === 'ja'}
		aria-label="日本語"
		aria-current={currentLang === 'ja' ? 'true' : undefined}
	>
		<FlagIcon countryCode="jp" size="h-5 w-5" />
	</a>
</div>

<style>
	.language-toggle {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: oklch(var(--b2) / 0.5);
		border-radius: 9999px;
		border: 1px solid oklch(var(--bc) / 0.1);
	}

	.lang-option {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem;
		border-radius: 9999px;
		transition: all 0.2s ease;
		cursor: pointer;
		opacity: 0.5;
	}

	.lang-option:hover {
		opacity: 0.8;
		background: oklch(var(--b3) / 0.3);
	}

	.lang-option.active {
		opacity: 1;
		background: oklch(var(--b1));
		box-shadow: 0 1px 3px oklch(var(--bc) / 0.1);
	}

	.lang-option.active:hover {
		opacity: 1;
	}
</style>
