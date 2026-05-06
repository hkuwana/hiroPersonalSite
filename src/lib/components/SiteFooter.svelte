<script lang="ts">
	import Socials from './socials.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { PERSONAL, CONTACT } from '$data/constants';

	const year = new Date().getFullYear();
</script>

<footer class="site-footer">
	<div class="footer-inner">
		<div class="footer-grid">
			<!-- Brand column -->
			<address class="footer-brand">
				<p class="footer-name text-primary">{PERSONAL.displayName}</p>
				<p class="footer-tagline text-base-content/60">{m.footer_tagline()}</p>
				<div class="footer-socials">
					<Socials />
				</div>
			</address>

			<!-- Explore column -->
			<nav class="footer-nav" aria-label="Footer navigation">
				<p class="footer-heading text-base-content/50">{m.footer_explore()}</p>
				<ul class="footer-list">
					<li><a href={localizeHref('/essays')} class="footer-link">{m.nav_essays()}</a></li>
					<li><a href={localizeHref('/playbooks')} class="footer-link">{m.nav_playbooks()}</a></li>
					<li><a href={localizeHref('/#tools')} class="footer-link">{m.nav_tools()}</a></li>
					<li><a href={localizeHref('/now')} class="footer-link">{m.footer_now()}</a></li>
					<li><a href={localizeHref('/privacy')} class="footer-link">{m.footer_privacy()}</a></li>
					<li><a href="mailto:{CONTACT.email}" class="footer-link">{m.footer_contact()}</a></li>
				</ul>
			</nav>

			<!-- Subscribe column -->
			<div class="footer-subscribe">
				<p class="footer-heading text-base-content/50">{m.footer_subscribe()}</p>
				<p class="footer-hint text-base-content/60">{m.footer_subscribe_hint()}</p>
				<a href="/feed.xml" class="rss-badge" aria-label={m.footer_rss()}>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M4 11a9 9 0 0 1 9 9" />
						<path d="M4 4a16 16 0 0 1 16 16" />
						<circle cx="5" cy="19" r="1" />
					</svg>
					<span>{m.footer_rss()}</span>
				</a>
			</div>
		</div>

		<div class="footer-meta">
			<p class="text-base-content/45">
				<span>© {year} {PERSONAL.displayName}</span>
				<span class="sep" aria-hidden="true">·</span>
				<span>{m.footer_made_by()}</span>
				<span class="sep" aria-hidden="true">·</span>
				<a href={localizeHref('/corporate')} class="footer-joke">{m.footer_joke()}</a>
			</p>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid oklch(var(--bc) / 0.08);
		background: oklch(var(--b1));
		padding: 4rem 1.5rem 2.25rem;
	}

	.footer-inner {
		max-width: 64rem;
		margin: 0 auto;
	}

	/* Grid */
	.footer-grid {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr;
		gap: 3rem;
		align-items: start;
		margin-bottom: 3rem;
	}

	/* Brand */
	.footer-brand {
		font-style: normal;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.footer-name {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 0;
	}

	.footer-tagline {
		font-size: 0.8125rem;
		line-height: 1.55;
		margin: 0 0 0.75rem;
		max-width: 18rem;
	}

	.footer-socials {
		margin-left: -0.5rem; /* align with text baseline */
	}

	/* Nav + Subscribe columns */
	.footer-heading {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0 0 0.875rem;
	}

	.footer-nav .footer-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.footer-link {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.7);
		text-decoration: none;
		transition: color var(--duration-normal, 200ms) var(--ease-out-expo, ease);
	}

	.footer-link:hover {
		color: oklch(var(--a));
	}

	/* Subscribe */
	.footer-subscribe {
		display: flex;
		flex-direction: column;
	}

	.footer-hint {
		font-size: 0.8125rem;
		line-height: 1.55;
		margin: 0 0 0.875rem;
		max-width: 14rem;
	}

	.rss-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		align-self: flex-start;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.65);
		background: oklch(var(--b2));
		border: 1px solid oklch(var(--bc) / 0.06);
		border-radius: 9999px;
		text-decoration: none;
		transition: all var(--duration-normal, 200ms) var(--ease-out-expo, ease);
	}

	.rss-badge:hover {
		color: oklch(var(--a));
		border-color: oklch(var(--a) / 0.25);
		transform: translateY(-1px);
	}

	/* Meta row */
	.footer-meta {
		padding-top: 1.75rem;
		border-top: 1px solid oklch(var(--bc) / 0.06);
	}

	.footer-meta p {
		font-size: 0.75rem;
		line-height: 1.6;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.footer-meta .sep {
		opacity: 0.5;
	}

	.footer-joke {
		font-style: italic;
		color: inherit;
		text-decoration: underline;
		text-decoration-color: oklch(var(--bc) / 0.2);
		text-underline-offset: 3px;
		transition: all var(--duration-normal, 200ms) var(--ease-out-expo, ease);
	}

	.footer-joke:hover {
		color: oklch(var(--bc) / 0.7);
		text-decoration-color: oklch(var(--bc) / 0.4);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.site-footer {
			padding: 3rem 1.25rem 2rem;
		}

		.footer-grid {
			grid-template-columns: 1fr;
			gap: 2.25rem;
			margin-bottom: 2.25rem;
		}

		.footer-tagline,
		.footer-hint {
			max-width: none;
		}

		.footer-meta p {
			justify-content: center;
			text-align: center;
		}
	}
</style>
