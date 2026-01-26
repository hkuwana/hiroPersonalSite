<script>
	import { page } from '$app/stores';
	import Socials from '$lib/components/socials.svelte';
</script>

<header class="header">
	<div class="header-inner">
		<nav class="nav">
			<a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>
				Home
			</a>
			<span class="nav-divider"></span>
			<a href="/essays" class="nav-link" class:active={$page.url.pathname.startsWith('/essays')}>
				Essays
			</a>
		</nav>

		<div class="socials-wrapper">
			<Socials />
		</div>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 1rem 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--color-border);
	}

	.header-inner {
		max-width: 1120px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-link {
		padding: 0.5rem 1rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: var(--radius-full);
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-bg-muted);
	}

	.nav-link.active {
		color: var(--color-text);
		background: var(--color-bg-muted);
	}

	.nav-divider {
		width: 4px;
		height: 4px;
		background: var(--color-border);
		border-radius: 50%;
	}

	.socials-wrapper {
		display: flex;
		align-items: center;
	}

	@media (max-width: 640px) {
		.header-inner {
			flex-direction: column;
			gap: 1rem;
		}

		.nav {
			order: 1;
		}

		.socials-wrapper {
			order: 2;
		}
	}
</style>
