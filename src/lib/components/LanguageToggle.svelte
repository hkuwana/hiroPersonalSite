<script lang="ts">
	// LanguageToggle - Switches between English (US) and Japanese
	// Uses circle-flags for country flag icons

	import FlagIcon from './FlagIcon.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	let currentLang = $state('en');

	onMount(() => {
		// Get current language from paraglide
		currentLang = getLocale();
	});

	function toggleLanguage() {
		const newLang = currentLang === 'en' ? 'ja' : 'en';

		// Navigate to the new language version
		const currentPath = window.location.pathname;
		const pathWithoutLang = currentPath.replace(/^\/(en|ja)/, '');
		const newPath = `/${newLang}${pathWithoutLang}`;

		window.location.href = newPath;
	}
</script>

<label class="swap swap-flip">
	<input
		type="checkbox"
		checked={currentLang === 'ja'}
		onchange={toggleLanguage}
		aria-label={m.aria_toggle_language()}
	/>

	<!-- US Flag (English) -->
	<div class="swap-off">
		<FlagIcon countryCode="us" size="h-6 w-6" />
	</div>

	<!-- Japanese Flag -->
	<div class="swap-on">
		<FlagIcon countryCode="jp" size="h-6 w-6" />
	</div>
</label>

<style>
	.swap {
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.swap:hover {
		opacity: 0.8;
		transform: scale(1.1);
	}
</style>
