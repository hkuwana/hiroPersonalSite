<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<svelte:head>
	<title>Privacy · Hiro Kuwana</title>
	<meta name="description" content="What hirokuwana.com captures, how to opt out, and how to request deletion." />
	<link rel="canonical" href="https://hirokuwana.com/privacy" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<article class="privacy-page">
	<header>
		<p class="eyebrow text-base-content/50">Privacy</p>
		<h1 class="title text-primary">What this site collects</h1>
		<p class="updated text-base-content/50">Last updated · April 2026</p>
	</header>

	<section>
		<h2 class="text-primary">Short version</h2>
		<p>
			I capture anonymous page-view and click data via PostHog (routed through hirokuwana.com/ingest, not a third-party domain). No account, no cookie banner, no cross-site tracking. If your browser sends a Do Not Track signal, PostHog is not initialized. You can see exactly what's sent by opening DevTools → Network.
		</p>
	</section>

	<section>
		<h2 class="text-primary">What I collect</h2>
		<ul>
			<li>Page URL and anonymous session ID (for funnels and retention analysis)</li>
			<li>Referrer (how you arrived)</li>
			<li>Device category (desktop, mobile, tablet) and viewport size</li>
			<li>Country (never city, never IP stored)</li>
			<li>Clicks on outbound links, essay reads, and CTA buttons</li>
		</ul>
	</section>

	<section>
		<h2 class="text-primary">What I don't collect</h2>
		<ul>
			<li>Your name, email, or any identifying information unless you explicitly submit it (e.g., subscribing to a newsletter)</li>
			<li>Form-input keystrokes — all input fields are masked in any session recordings</li>
			<li>Data from users with Do Not Track enabled</li>
			<li>Anything on the <a href={localizeHref('/ics-validator')}>ICS Validator</a> or <a href={localizeHref('/vcf-splitter')}>VCF Splitter</a> pages beyond the page view — file processing is 100% in your browser and nothing is ever uploaded</li>
		</ul>
	</section>

	<section>
		<h2 class="text-primary">Third parties</h2>
		<ul>
			<li><strong>PostHog</strong> — product analytics, US hosting</li>
			<li><strong>Vercel</strong> — hosting provider, collects standard web-server logs</li>
			<li><strong>Google Fonts</strong> — serves the Inter typeface (no cookies)</li>
		</ul>
	</section>

	<section>
		<h2 class="text-primary">Requests and opt-out</h2>
		<p>
			Want your data removed? Want to opt out proactively? Email <a href="mailto:hiro@trykaiwa.com">hiro@trykaiwa.com</a> and I'll purge any associated session data from PostHog.
		</p>
	</section>

	<footer>
		<a href={localizeHref('/')} class="back-link">← Back to home</a>
	</footer>
</article>

<style>
	.privacy-page {
		max-width: 42rem;
		margin: 0 auto;
		padding: 5rem 1.5rem 6rem;
	}

	.eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0 0 0.5rem;
	}

	.title {
		font-size: clamp(1.75rem, 3vw + 1rem, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.025em;
		margin: 0 0 0.5rem;
	}

	.updated {
		font-size: 0.8125rem;
		margin: 0 0 3rem;
	}

	section {
		margin-bottom: 2.5rem;
	}

	section h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
		letter-spacing: -0.01em;
	}

	section p,
	section li {
		font-size: 1rem;
		line-height: 1.7;
		color: oklch(var(--bc) / 0.75);
	}

	section p {
		margin: 0;
	}

	section ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	section li {
		margin-bottom: 0.5rem;
	}

	section a {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	footer {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.08);
	}

	.back-link {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		text-decoration: none;
	}

	.back-link:hover {
		color: oklch(var(--a));
	}
</style>
