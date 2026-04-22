<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<svelte:head>
	<title>Now — {m.nav_home()} · Hiro Kuwana</title>
	<meta name="description" content="What Hiro Kuwana is currently working on, writing about, reading, and where he is." />
	<link rel="canonical" href="https://hirokuwana.com/now" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<article class="now-page">
	<header class="now-header">
		<p class="eyebrow text-base-content/50">Now</p>
		<h1 class="title text-primary">What I'm doing right now</h1>
		<p class="updated text-base-content/50">Last updated · April 2026</p>
	</header>

	<section class="now-section">
		<h2 class="text-primary">Building</h2>
		<p>
			<strong>Kaiwa</strong> — AI-powered language learning through bite-sized conversations. 1,000+ monthly signups, currently focused on the free → paid conversion loop (see my essay
			<a href={localizeHref('/essays/your-funnel-is-a-lie')}>Your Funnel Is a Lie</a>).
		</p>
	</section>

	<section class="now-section">
		<h2 class="text-primary">Writing about</h2>
		<p>
			Automation playbooks for non-technical founders and executives. How solo founders can run the work of a team with AI. The gap between "AI that looks impressive in a demo" and "AI that actually works."
		</p>
	</section>

	<section class="now-section">
		<h2 class="text-primary">Advising</h2>
		<p>
			A small number of non-technical founders and executives on their AI workflow audits. Booking for April 2026 onward.
		</p>
	</section>

	<section class="now-section">
		<h2 class="text-primary">Reading</h2>
		<p>
			Currently: <em>The Brothers Karamazov</em> (re-read), plus a steady diet of Paul Graham essays and the PostHog + Anthropic blogs.
		</p>
	</section>

	<footer class="now-footer">
		<p class="text-base-content/60">
			Inspired by <a href="https://nownownow.com/about" target="_blank" rel="noopener">Derek Sivers' /now movement</a>. Updated roughly monthly.
		</p>
		<a href={localizeHref('/')} class="back-link">← Back to home</a>
	</footer>
</article>

<style>
	.now-page {
		max-width: 42rem;
		margin: 0 auto;
		padding: 5rem 1.5rem 6rem;
	}

	.now-header {
		margin-bottom: 3rem;
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
		margin: 0;
	}

	.now-section {
		margin-bottom: 2.5rem;
	}

	.now-section h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.625rem;
		letter-spacing: -0.01em;
	}

	.now-section p {
		font-size: 1rem;
		line-height: 1.7;
		color: oklch(var(--bc) / 0.7);
		margin: 0;
	}

	.now-section a {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.now-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.08);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.now-footer p {
		font-size: 0.875rem;
		margin: 0;
	}

	.now-footer a {
		color: oklch(var(--a));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.back-link {
		font-size: 0.875rem;
		text-decoration: none !important;
		color: oklch(var(--bc) / 0.6) !important;
	}

	.back-link:hover {
		color: oklch(var(--a)) !important;
	}
</style>
