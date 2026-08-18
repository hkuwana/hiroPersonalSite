<script lang="ts">
	import { asset } from '$app/paths';
	import { CONTACT } from '$data/constants';

	const skills = [
		'Strategic Planning',
		'AI/ML Implementation',
		'Cross-functional Leadership',
		'Agile Methodology',
		'Stakeholder Management',
		'Product Roadmapping',
		'Growth Hacking',
		'Thought Leadership',
		'Synergy Optimization',
		'Paradigm Shifting'
	];
</script>

<svelte:head>
	<title>Hiroyuki Kuwana | Strategic Innovation Leader & AI Transformation Specialist</title>
</svelte:head>

<!-- Intentionally generic corporate styling. The blandness is the joke. -->
<div class="corp-page">
	<div class="corp-inner">
		<!-- Header -->
		<div class="corp-header">
			<div class="corp-avatar">
				<img src={asset('/hiro-avatar.jpg')} alt="Hiroyuki Kuwana" />
			</div>
			<h1>Hiroyuki Kuwana</h1>
			<p class="corp-tagline">
				Strategic Innovation Leader | AI Transformation Specialist | Thought Partner
			</p>
		</div>

		<!-- Professional Summary -->
		<section class="corp-section">
			<h2>Professional Summary</h2>
			<p>
				Results-driven entrepreneur with a proven track record of leveraging cutting-edge AI technologies
				to drive synergistic outcomes across multiple verticals. Passionate about ideating scalable solutions
				that move the needle on key performance indicators while maintaining stakeholder alignment.
			</p>
			<p>
				Core competencies include: strategic visioning, cross-functional collaboration, agile methodology
				implementation, and thought leadership in the AI/ML space. Committed to fostering innovation ecosystems
				that deliver measurable ROI.
			</p>
		</section>

		<!-- Experience -->
		<section class="corp-section">
			<h2>Professional Experience</h2>

			<div class="corp-jobs">
				<div class="corp-job">
					<div class="corp-job-head">
						<div>
							<h3>Founder &amp; Chief Executive Officer</h3>
							<p class="corp-org accent">Kaiwa Technologies, Inc.</p>
						</div>
						<span class="corp-dates">Present</span>
					</div>
					<ul>
						<li>Spearheading AI-driven language acquisition platform with 30-second engagement optimization</li>
						<li>Orchestrating end-to-end product roadmap while cultivating strategic partnerships</li>
						<li>Evangelizing best practices in conversational AI implementation</li>
					</ul>
				</div>

				<div class="corp-job">
					<div class="corp-job-head">
						<div>
							<h3>Founder &amp; Chief Executive Officer</h3>
							<p class="corp-org">Flybyrd (Sunset)</p>
						</div>
						<span class="corp-dates">2023 - 2024</span>
					</div>
					<ul>
						<li>Architected AI-powered deal flow optimization solution for venture capital stakeholders</li>
						<li>Successfully pivoted resources to higher-impact opportunities (strategic sunset)</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Education -->
		<section class="corp-section">
			<h2>Education</h2>
			<div>
				<h3>Brown University</h3>
				<p class="corp-degree">Bachelor of Science, Environmental Engineering</p>
				<p class="corp-fine">Relevant coursework: Systems Thinking, Sustainability Frameworks, Data-Driven Decision Making</p>
			</div>
		</section>

		<!-- Skills -->
		<section class="corp-section">
			<h2>Core Competencies</h2>
			<div class="corp-badges">
				{#each skills as skill}
					<span class="corp-badge">{skill}</span>
				{/each}
			</div>
		</section>

		<!-- CTA -->
		<div class="corp-cta">
			<p>Open to strategic conversations about synergistic opportunities.</p>
			<a href={CONTACT.cal} target="_blank" rel="noopener" class="corp-btn">
				Schedule a Strategic Alignment Session
			</a>
		</div>

		<!-- Escape hatch -->
		<div class="corp-escape">
			<a href="/">okay I get it, take me back to the real site</a>
		</div>
	</div>
</div>

<style>
	.corp-page {
		min-height: 100vh;
		background: #f5f6f8;
		color: #1f2733;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
		padding: 4rem 2rem;
	}

	.corp-inner {
		max-width: 48rem;
		margin: 0 auto;
	}

	.corp-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.corp-avatar {
		width: 8rem;
		height: 8rem;
		margin: 0 auto 1.5rem;
		border-radius: 50%;
		overflow: hidden;
		box-shadow: 0 0 0 4px #dfe3e8;
	}

	.corp-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1);
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 0.5rem;
	}

	.corp-tagline {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: #66707d;
		margin: 0;
	}

	.corp-section {
		margin-bottom: 3rem;
	}

	.corp-section h2 {
		font-size: 1.05rem;
		font-weight: 600;
		border-bottom: 1px solid #dfe3e8;
		padding-bottom: 0.5rem;
		margin: 0 0 1rem;
	}

	.corp-section p {
		color: #4a5462;
		line-height: 1.7;
		margin: 0 0 1rem;
	}

	.corp-jobs {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.corp-job-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.corp-job h3,
	.corp-section h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	.corp-org {
		font-size: 0.875rem;
		color: #66707d;
		margin: 0.15rem 0 0;
	}

	.corp-org.accent {
		color: #0a66c2;
	}

	.corp-dates {
		font-size: 0.75rem;
		color: #8a93a0;
		white-space: nowrap;
	}

	.corp-job ul {
		list-style: disc inside;
		font-size: 0.875rem;
		color: #4a5462;
		margin: 0.5rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.corp-degree {
		font-size: 0.875rem;
		color: #4a5462;
		margin: 0.25rem 0 0;
	}

	.corp-fine {
		font-size: 0.75rem;
		color: #8a93a0;
		margin: 0.35rem 0 0;
	}

	.corp-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.corp-badge {
		font-size: 0.75rem;
		border: 1px solid #c6ccd4;
		border-radius: 999px;
		padding: 0.25rem 0.75rem;
		color: #4a5462;
		background: #fff;
	}

	.corp-cta {
		text-align: center;
		border-top: 1px solid #dfe3e8;
		padding-top: 2rem;
	}

	.corp-cta p {
		font-size: 0.875rem;
		color: #66707d;
		margin: 0 0 1rem;
	}

	.corp-btn {
		display: inline-block;
		background: #0a66c2;
		color: #fff;
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
		border-radius: 4px;
		padding: 0.6rem 1.4rem;
		transition: background 150ms ease;
	}

	.corp-btn:hover {
		background: #084d92;
	}

	.corp-escape {
		text-align: center;
		margin-top: 4rem;
	}

	.corp-escape a {
		font-size: 0.75rem;
		color: #b3bac2;
		text-decoration: none;
		transition: color 150ms ease;
	}

	.corp-escape a:hover {
		color: #8a93a0;
	}

	@media (max-width: 480px) {
		.corp-page {
			padding: 3rem 1.25rem;
		}

		.corp-job-head {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
