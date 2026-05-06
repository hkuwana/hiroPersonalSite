<script lang="ts">
	import { onMount } from 'svelte';

	let isDark = $state(false);

	function applyTheme() {
		const theme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		isDark = savedTheme === 'dark' || savedTheme === 'dim' || (!savedTheme && prefersDark);
		applyTheme();
	});

	function toggleTheme() {
		isDark = !isDark;
		applyTheme();
	}
</script>

<button
	type="button"
	class="theme-toggle"
	aria-label="Toggle theme"
	title="Toggle theme"
	onclick={toggleTheme}
>
	<span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
</button>
