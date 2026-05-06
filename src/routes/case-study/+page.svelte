<script lang="ts">
	import { CONTACT, SITE } from '$data/constants';
	import { localizeHref } from '$lib/paraglide/runtime';

	const caseStudyUrl = `${SITE.url}/case-study`;
</script>

<svelte:head>
	<title>Thread - a quieter inbox for AI agents | Hiro Kuwana</title>
	<meta
		name="description"
		content="A quiet case-study page from Hiro Kuwana's redesign: reframing agent output as letters, not chat."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content={caseStudyUrl} />
	<meta property="og:title" content="Thread - a quieter inbox for AI agents" />
	<meta
		property="og:description"
		content="Reframing agent output as letters, not chat, so the work feels considered rather than reactive."
	/>
	<link rel="canonical" href={caseStudyUrl} />
</svelte:head>

<article class="case-page">
	<header class="case-hero" data-screen-label="Case - Thread">
		<div class="crumb">
			<a href={localizeHref('/#work')}>back</a>
			<span aria-hidden="true">/</span>
			<span>Case study 01</span>
		</div>

		<h1>Thread <em>- a quieter inbox for AI agents.</em></h1>
		<p class="lede">
			Reframing agent output as <strong>letters, not chat</strong>, so the work feels
			considered rather than reactive. A six-month design study, now in private beta
			with twelve teams.
		</p>

		<div class="case-meta" aria-label="Case study metadata">
			<div class="cell">
				<div class="k">Role</div>
				<div class="v">Lead designer<br />+ frontend</div>
			</div>
			<div class="cell">
				<div class="k">Year</div>
				<div class="v">2025 - ongoing</div>
			</div>
			<div class="cell">
				<div class="k">Team</div>
				<div class="v">Solo, with 1 collaborator</div>
			</div>
			<div class="cell">
				<div class="k">Status</div>
				<div class="v">Private beta · 12 teams</div>
			</div>
		</div>
	</header>

	<figure class="case-fig">
		<div class="case-mockup" aria-label="Thread interface mockup">
			<div class="mockup-bar">
				<span>Thread</span>
				<span>morning tray</span>
			</div>
			<div class="letter-tray">
				<section class="letter-list" aria-label="Incoming letters">
					<article class="letter active">
						<span class="letter-kicker">needs patience</span>
						<h3>Model memory drift in onboarding</h3>
						<p>Three runs disagree on when to ask for intent. Suggested margin notes attached.</p>
					</article>
					<article class="letter">
						<span class="letter-kicker">quiet review</span>
						<h3>Weekly synthesis from support</h3>
						<p>Two repeated complaints, one likely copy problem, no incident.</p>
					</article>
					<article class="letter">
						<span class="letter-kicker">can wait</span>
						<h3>Pricing page experiment readout</h3>
						<p>Signal is real but thin. Keep collecting until Friday.</p>
					</article>
				</section>
				<section class="letter-detail" aria-label="Selected letter detail">
					<span class="letter-date">皐月 · 09:15</span>
					<h3>Model memory drift in onboarding</h3>
					<p>
						The agent found a difference between what users say they want and what the
						current prompt stores. It recommends splitting first-session intent from
						long-term learning goals.
					</p>
					<div class="margin-note">margin: ask for the human goal first, then compress later</div>
				</section>
			</div>
		</div>
		<figcaption class="caption">
			fig. 1 - the day's incoming letters, sorted by patience required, not urgency.
		</figcaption>
	</figure>

	<div class="case-body">
		<section>
			<h2><span class="num">01</span> The brief</h2>
			<p>
				A founder I'd worked with before came back with a complaint that had the shape
				of a real problem: <strong>her team was drowning in agent output</strong>. They
				had built a clever orchestration layer, but the UI was still a chat thread, and
				chat threads are not good at carrying the weight of work.
			</p>
			<p>
				The ask was vague on purpose: <em>make it feel less frantic</em>. I took that as
				license to question the chat metaphor entirely.
			</p>

			<blockquote>
				"We do not actually want to talk to it. We want it to leave us something we can
				come back to." - first interview, week one.
			</blockquote>
		</section>

		<section>
			<h2><span class="num">02</span> What I tried first, and why I threw it out</h2>
			<p>
				The obvious move is a kanban: agent output as cards in columns. I built it in a
				week. It was fine. It was also <strong>more software about software</strong>,
				and the team already had three tools that looked like that. I shelved it.
			</p>
			<p>
				The shift was noticing that nobody opened the agent's output the moment it
				arrived. They batched. They opened things in the morning, in a quiet half-hour,
				with coffee. The metaphor was not a chat. It was a stack of mail.
			</p>

			<figure class="case-fig inset">
				<div class="prototype-board" aria-label="Early kanban prototype mockup">
					<div>
						<span>new</span>
						<i></i>
						<i></i>
					</div>
					<div>
						<span>triage</span>
						<i></i>
						<i></i>
						<i></i>
					</div>
					<div>
						<span>done</span>
						<i></i>
					</div>
				</div>
				<figcaption class="caption">
					fig. 2 - the kanban that taught me what the product was not.
				</figcaption>
			</figure>
		</section>

		<section>
			<h2><span class="num">03</span> The shape it took</h2>
			<p>Thread is, at its core, three small ideas glued together:</p>
			<ul>
				<li>Agents write <strong>letters</strong>, not messages: a subject line, a body, a signature, an ask.</li>
				<li>Letters arrive on a <strong>tray</strong>, sorted by how much patience they require, not by when they arrived.</li>
				<li>You reply by <strong>annotating in the margin</strong>, like a manuscript. The agent reads the annotations and tries again.</li>
			</ul>
			<p>
				None of this is technically novel. The novelty is in what we removed:
				notifications, unread counts, the idea that anything is ever urgent.
			</p>
		</section>

		<section>
			<h2><span class="num">04</span> What I learned</h2>
			<p>
				The thing I keep coming back to: <strong>chat is a default, not a decision</strong>.
				We reach for it because it is easy to build, not because it serves the work.
				Agents that produce real output deserve real surfaces: surfaces that let the
				output sit, breathe, and be considered.
			</p>
			<p>
				I am continuing to work on Thread with a small group of teams through the rest
				of the year. If your team is making something agent-shaped and you want to talk
				about the surface around it, <a href={`mailto:${CONTACT.email}`}>write to me</a>.
			</p>
		</section>
	</div>

	<nav class="next-up" aria-label="Next case study">
		<span class="l">Next case</span>
		<a href={localizeHref('/#work')}>Lantern - a reading lamp that listens</a>
	</nav>
</article>

<style>
	.case-page {
		position: relative;
		z-index: 2;
	}

	.case-hero {
		max-width: var(--max);
		margin: 0 auto;
		padding: clamp(6rem, 12vh, 8rem) var(--pad-inline) clamp(3rem, 6vh, 5rem);
	}

	.crumb {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		margin-bottom: 2rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.crumb a:hover {
		color: var(--ink);
	}

	.case-hero h1 {
		max-width: 14ch;
		margin: 0 0 0.25em;
		font-family: var(--f-display);
		font-size: clamp(3rem, 8vw, 6.875rem);
		font-weight: 500;
		line-height: 0.95;
		color: var(--ink);
	}

	.case-hero h1 em {
		font-family: var(--f-body);
		font-style: italic;
		font-weight: 400;
		color: var(--ink-mute);
	}

	.lede {
		max-width: 56ch;
		margin: 0.75rem 0 0;
		font-size: clamp(1.125rem, 2vw, 1.375rem);
		line-height: 1.5;
		color: var(--ink-soft);
		text-wrap: pretty;
	}

	.lede strong,
	.case-body strong {
		color: var(--ink);
		font-weight: inherit;
		background: linear-gradient(180deg, transparent 60%, var(--highlight) 60%);
		padding: 0 0.125rem;
	}

	.case-meta {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 2rem;
		margin-top: 3.5rem;
		padding: 1.75rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.cell .k {
		margin-bottom: 0.375rem;
		font-family: var(--f-mono);
		font-size: 0.625rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.cell .v {
		font-family: var(--f-display);
		font-size: 1.125rem;
		font-weight: 500;
		line-height: 1.35;
		color: var(--ink);
	}

	.case-fig {
		max-width: var(--max);
		margin: 0 auto;
		padding: clamp(2.5rem, 6vw, 5rem) var(--pad-inline);
	}

	.case-fig.inset {
		padding: 2rem 0;
	}

	.case-mockup,
	.prototype-board {
		display: flex;
		border: 1px solid var(--rule);
		border-radius: 4px;
		background: var(--paper-2);
		box-shadow: 0 1rem 3rem rgba(21, 23, 15, 0.08);
	}

	.case-mockup {
		aspect-ratio: 16 / 9;
		flex-direction: column;
		overflow: hidden;
	}

	.mockup-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--rule);
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.letter-tray {
		display: grid;
		grid-template-columns: minmax(15rem, 0.9fr) minmax(0, 1.4fr);
		min-height: 0;
		flex: 1;
	}

	.letter-list {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--rule);
	}

	.letter {
		padding: 1rem;
		border-bottom: 1px dashed var(--rule);
		background: color-mix(in oklch, var(--paper) 36%, transparent);
	}

	.letter.active {
		background: var(--paper);
		box-shadow: inset 3px 0 0 var(--shu);
	}

	.letter-kicker,
	.letter-date,
	.margin-note {
		font-family: var(--f-mono);
		font-size: 0.625rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.letter h3,
	.letter-detail h3 {
		margin: 0.35rem 0;
		font-family: var(--f-display);
		font-size: 1.25rem;
		font-weight: 500;
		line-height: 1.15;
		color: var(--ink);
	}

	.letter p,
	.letter-detail p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--ink-soft);
	}

	.letter-detail {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.875rem;
		padding: clamp(1.25rem, 4vw, 3rem);
	}

	.letter-detail h3 {
		font-size: clamp(1.75rem, 4vw, 3rem);
	}

	.letter-detail p {
		max-width: 42ch;
		font-size: clamp(1rem, 1.6vw, 1.25rem);
	}

	.margin-note {
		max-width: 42ch;
		margin-top: 0.75rem;
		padding: 0.75rem 0.875rem;
		border-left: 2px solid var(--shu);
		background: color-mix(in oklch, var(--paper) 58%, transparent);
		line-height: 1.45;
	}

	.prototype-board {
		aspect-ratio: 21 / 9;
		align-items: stretch;
		gap: 1px;
		background: var(--rule);
		overflow: hidden;
	}

	.prototype-board div {
		flex: 1;
		padding: 0.875rem;
		background: repeating-linear-gradient(135deg, var(--paper-edge) 0 6px, var(--paper-2) 6px 12px);
	}

	.prototype-board span {
		display: block;
		margin-bottom: 0.75rem;
		font-family: var(--f-mono);
		font-size: 0.625rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.prototype-board i {
		display: block;
		height: 2.5rem;
		margin-bottom: 0.625rem;
		border: 1px solid var(--rule);
		background: color-mix(in oklch, var(--paper) 68%, transparent);
	}

	.caption {
		max-width: 60ch;
		margin: 0.75rem 0 0;
		font-family: var(--f-body);
		font-size: 0.9375rem;
		font-style: italic;
		color: var(--ink-mute);
	}

	.case-body {
		max-width: 47.5rem;
		margin: 0 auto;
		padding: 0 var(--pad-inline) clamp(4rem, 10vh, 7.5rem);
		font-size: 1.1875rem;
		line-height: 1.7;
		color: var(--ink-soft);
	}

	.case-body h2 {
		margin: 3.5rem 0 1.125rem;
		font-family: var(--f-display);
		font-size: clamp(1.75rem, 3.6vw, 2.625rem);
		font-weight: 500;
		line-height: 1.1;
		color: var(--ink);
	}

	.case-body h2 .num {
		margin-right: 1rem;
		font-family: var(--f-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.15em;
		color: var(--ink-mute);
		vertical-align: middle;
	}

	.case-body p {
		margin: 0 0 1.2em;
		text-wrap: pretty;
	}

	.case-body blockquote {
		margin: 2rem 0;
		padding: 0.5rem 0 0.5rem 1.75rem;
		border-left: 3px solid var(--shu);
		font-family: var(--f-body);
		font-size: 1.375rem;
		font-style: italic;
		line-height: 1.45;
		color: var(--ink);
	}

	.case-body ul {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		margin: 1.5rem 0;
		padding: 0;
		list-style: none;
	}

	.case-body li {
		position: relative;
		padding-left: 1.75rem;
	}

	.case-body li::before {
		content: '-';
		position: absolute;
		left: 0;
		color: var(--shu);
		font-family: var(--f-mono);
	}

	.case-body a {
		color: var(--ink);
		border-bottom: 1px solid var(--shu);
	}

	.case-body a:hover {
		color: var(--shu);
	}

	.next-up {
		max-width: var(--max);
		margin: 0 auto;
		padding: 3.5rem var(--pad-inline);
		border-top: 1px solid var(--rule);
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	.next-up .l {
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.next-up a {
		padding-bottom: 0.25rem;
		border-bottom: 2px solid var(--shu);
		font-family: var(--f-display);
		font-size: clamp(1.75rem, 4vw, 3rem);
		font-weight: 500;
		line-height: 1.1;
		color: var(--ink);
	}

	.next-up a:hover {
		color: var(--shu);
	}

	@media (max-width: 760px) {
		.case-hero {
			padding-top: 10.5rem;
		}

		.case-hero h1 {
			line-height: 1;
		}

		.case-meta {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1.25rem;
		}

		.case-body {
			font-size: 1.0625rem;
		}

		.case-mockup {
			aspect-ratio: auto;
		}

		.letter-tray {
			grid-template-columns: 1fr;
		}

		.letter-list {
			border-right: 0;
			border-bottom: 1px solid var(--rule);
		}

		.letter-list .letter:not(.active) {
			display: none;
		}

		.prototype-board {
			aspect-ratio: auto;
			min-height: 12rem;
		}
	}

	@media (max-width: 520px) {
		.case-meta {
			grid-template-columns: 1fr;
		}

		.case-hero h1 {
			font-size: 2.625rem;
		}

		.next-up {
			align-items: flex-start;
		}
	}
</style>
