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
		padding: 0.875rem 1.5rem;
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border-bottom: 1px solid var(--color-border);
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
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: var(--radius-full);
		transition: all var(--duration-fast) var(--ease-out-quart);
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
		width: 3px;
		height: 3px;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 50%;
		margin: 0 0.125rem;
	}

	.socials-wrapper {
		display: flex;
		align-items: center;
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
