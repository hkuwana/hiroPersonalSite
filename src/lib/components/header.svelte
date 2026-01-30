<script>
	import { page } from '$app/stores';
	import Socials from '$lib/components/socials.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<header class="header">
	<div class="header-inner">
		<nav class="nav">
			<a href="/" class="nav-link text-secondary hover:text-primary" class:active={$page.url.pathname === '/'}>
				{m.nav_home()}
			</a>
			<span class="nav-divider"></span>
			<a href="/essays" class="nav-link text-secondary hover:text-primary" class:active={$page.url.pathname.startsWith('/essays')}>
				{m.nav_essays()}
			</a>
		</nav>

		<div class="socials-wrapper">
			<ThemeToggle />
			<span class="toggle-divider"></span>
			<LanguageToggle />
			<span class="toggle-divider"></span>
			<Socials />
		</div>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 0.875rem 1.5rem;
		background: oklch(var(--b1) / 0.72);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border-bottom: 1px solid oklch(var(--bc) / 0.1);
	}

	.header-inner {
		max-width: 1080px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.nav-link {
		padding: 0.4375rem 0.875rem;
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: oklch(var(--bc) / 0.7);
		text-decoration: none;
		border-radius: 9999px;
		transition: all var(--duration-fast) var(--ease-out-quart);
	}

	.nav-link:hover {
		color: oklch(var(--bc));
		background: oklch(var(--b2));
	}

	.nav-link.active {
		color: oklch(var(--bc));
		background: oklch(var(--b2));
	}

	.nav-divider {
		width: 3px;
		height: 3px;
		background: oklch(var(--bc) / 0.2);
		border-radius: 50%;
		margin: 0 0.125rem;
	}

	.socials-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.toggle-divider {
		width: 1px;
		height: 20px;
		background: oklch(var(--bc) / 0.15);
	}

	@media (max-width: 640px) {
		.header {
			padding: 0.75rem 1rem;
		}

		.header-inner {
			flex-direction: column;
			gap: 0.75rem;
		}

		.nav {
			order: 1;
		}

		.socials-wrapper {
			order: 2;
		}
	}
</style>
