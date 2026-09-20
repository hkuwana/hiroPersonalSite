<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { changeTheme } from '$lib/theme';

	let isDark = $state(false);
	let transitioning = false;

	onMount(() => {
		// The head script already applied the saved/system preference before paint.
		isDark = document.documentElement.dataset.theme === 'dark';
	});

	async function toggleTheme() {
		if (transitioning) return;
		transitioning = true;
		const nextDark = !isDark;
		try {
			await changeTheme(nextDark, async () => {
				isDark = nextDark;
				const theme = nextDark ? 'dark' : 'light';
				document.documentElement.dataset.theme = theme;
				try {
					localStorage.setItem('theme', theme);
				} catch {
					/* Storage can be blocked. */
				}
				await tick();
			});
		} finally {
			transitioning = false;
		}
	}
</script>

<button
	type="button"
	class="theme-toggle"
	aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
	title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
	onclick={toggleTheme}
>
	<span class="sky-dial" class:night={isDark} aria-hidden="true">
		<span class="sky-orbit"><span class="sun">☀</span><span class="moon">☾</span></span>
	</span>
</button>

<style>
	.sky-dial {
		position: relative;
		display: block;
		width: 1.5rem;
		height: 1.25rem;
		overflow: hidden;
		border-bottom: 1px solid var(--rule);
	}
	.sky-orbit {
		position: absolute;
		inset: 0;
		width: 1.5rem;
		height: 2.5rem;
		transform: rotate(0deg);
		transition: transform 480ms var(--ease-out-quart);
	}
	.night .sky-orbit {
		transform: rotate(-180deg);
	}
	.sun,
	.moon {
		position: absolute;
		left: 0;
		width: 100%;
		height: 1.25rem;
		line-height: 1.25rem;
		text-align: center;
	}
	.sun {
		top: 0;
		color: var(--shu);
	}
	.moon {
		bottom: 0;
		transform: rotate(180deg);
	}
	@media (prefers-reduced-motion: reduce) {
		.sky-orbit {
			transition: none;
		}
	}
</style>
