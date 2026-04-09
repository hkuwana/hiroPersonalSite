<script>
	import { page } from '$app/stores';
	import Socials from '$lib/components/socials.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<header class="header">
	<div class="header-inner">
		<nav class="nav">
			<a href={localizeHref('/')} class="nav-link text-secondary hover:text-primary" class:active={$page.url.pathname === '/' || String($page.url.pathname) === '/ja'}>
				{m.nav_home()}
			</a>
			<span class="nav-divider"></span>
			<a href={localizeHref('/essays')} class="nav-link text-secondary hover:text-primary" class:active={$page.url.pathname.startsWith('/essays') || $page.url.pathname.startsWith('/ja/essays')}>
				{m.nav_essays()}
			</a>
			<span class="nav-divider"></span>
			<a href={localizeHref('/ics-validator')} class="nav-link text-secondary hover:text-primary" class:active={$page.url.pathname.startsWith('/ics-validator') || $page.url.pathname.startsWith('/ja/ics-validator')}>
				{m.nav_tools()}
			</a>
		</nav>

		<div class="socials-wrapper">
			<LanguageToggle />
			<span class="toggle-divider"></span>
			<ThemeToggle />
			<span class="toggle-divider hide-mobile"></span>
			<div class="socials-desktop">
				<Socials />
			</div>
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
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: oklch(var(--bc) / 0.7);
		text-decoration: none;
		border-radius: 9999px;
		transition: all var(--duration-fast) var(--ease-out-quart);
		min-height: 44px;
		display: flex;
		align-items: center;
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

	.socials-desktop {
		display: contents;
	}

	@media (max-width: 640px) {
		.header {
			padding: 0.625rem 0.875rem;
		}

		.header-inner {
			flex-direction: row;
			justify-content: space-between;
			gap: 0.375rem;
		}

		.nav {
			order: 1;
			gap: 0.125rem;
		}

		.nav-divider {
			display: none;
		}

		.socials-wrapper {
			order: 2;
			gap: 0.5rem;
		}

		.socials-desktop {
			display: none;
		}

		.hide-mobile {
			display: none;
		}

		.nav-link {
			padding: 0.5rem 0.625rem;
			font-size: 0.8125rem;
			min-height: 44px;
		}
	}
</style>
