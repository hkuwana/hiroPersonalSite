<script lang="ts">
	// ThemeToggle - Switches between caramellatte (light) and dim (dark) themes
	// Uses Material Design Icons from Iconify

	import iconData from '@iconify-json/mdi/icons.json';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	// Get the SVG body for light and dark mode icons
	const lightModeIcon = iconData.icons['white-balance-sunny']?.body || '';
	const darkModeIcon = iconData.icons['weather-night']?.body || '';

	let isDark = $state(false);

	// Initialize theme from localStorage or system preference
	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		isDark = savedTheme === 'dim' || (!savedTheme && prefersDark);
		applyTheme();
	});

	function applyTheme() {
		const theme = isDark ? 'dim' : 'caramellatte';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	function toggleTheme() {
		isDark = !isDark;
		applyTheme();
	}
</script>

<label class="swap swap-rotate">
	<input type="checkbox" checked={isDark} onchange={toggleTheme} aria-label={m.aria_toggle_theme()} />

	<!-- Light mode icon (sun) -->
	<svg
		class="swap-off h-6 w-6 fill-current"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		role="img"
		aria-label={m.aria_light_mode()}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html lightModeIcon}
	</svg>

	<!-- Dark mode icon (moon) -->
	<svg
		class="swap-on h-6 w-6 fill-current"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		role="img"
		aria-label={m.aria_dark_mode()}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html darkModeIcon}
	</svg>
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
