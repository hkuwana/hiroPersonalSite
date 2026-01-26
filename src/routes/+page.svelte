<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	const calLink = 'https://cal.com/hirokuwana/15min';

	// For the playful Japanese name easter egg
	let showMeaning = false;
	let profileHovered = false;

	// Intersection Observer for scroll animations
	let sections: HTMLElement[] = [];
	let visibleSections = new Set<number>();

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const index = sections.indexOf(entry.target as HTMLElement);
					if (entry.isIntersecting) {
						visibleSections.add(index);
						visibleSections = visibleSections;
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
		);

		sections.forEach((section) => {
			if (section) observer.observe(section);
		});

		return () => observer.disconnect();
	});

	const projects = [
		{
			name: 'Flybyrd',
			tagline: 'AI for Venture Capital',
			description: 'Helping VCs discover and analyze startups with AI-powered deal flow analysis. Making investment decisions faster and more data-driven.',
			link: 'https://www.flybyrd.io',
			logo: `${base}/flybyrd_logo.png`,
			status: 'current',
			color: '#10b981'
		},
		{
			name: 'Kaiwa',
			tagline: 'Language Learning, Reimagined',
			description: 'Practice languages through bite-sized AI conversations. Real-time translations, social streaks, and 30-second daily sessions.',
			link: 'https://www.trykaiwa.com/',
			logo: `${base}/kaiwa_logo.png`,
			status: 'active',
			color: '#8b5cf6'
		},
		{
			name: 'Pebblr',
			tagline: 'Connecting Nonprofits',
			description: 'Connected nonprofits with younger donors. Sunset after GPT technologies offered more scalable solutions.',
			logo: `${base}/icon-512x512.png`,
			status: 'sunset',
			color: '#6b7280'
		}
	];
</script>

<svelte:head>
	<title>Hiro Kuwana - AI Entrepreneur & Founder | Democratizing Education Through Technology</title>
	<meta
		name="description"
		content="Hiro Kuwana is a tech entrepreneur building AI solutions to democratize education and empower human potential. Founder of Flybyrd (VC deal analysis) and Kaiwa (AI language learning). Making premium tools accessible to everyone."
	/>
	<meta
		name="keywords"
		content="Hiro Kuwana, AI entrepreneur, startup founder, educational technology, AI democratization, venture capital AI, language learning app, tech innovation, artificial intelligence, EdTech"
	/>
	<meta name="author" content="Hiro Kuwana" />
	<meta name="robots" content="index, follow" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hirokuwana.com/" />
	<meta
		property="og:title"
		content="Hiro Kuwana - AI Entrepreneur & Founder | Democratizing Education Through Technology"
	/>
	<meta
		property="og:description"
		content="Tech entrepreneur building AI solutions to democratize education and empower human potential. Founder of Flybyrd and Kaiwa."
	/>
	<meta property="og:image" content="https://hirokuwana.com/hiro-social-preview.jpg" />
	<meta property="og:site_name" content="Hiro Kuwana" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://hirokuwana.com/" />
	<meta property="twitter:title" content="Hiro Kuwana - AI Entrepreneur & Founder" />
	<meta
		property="twitter:description"
		content="Building AI solutions to democratize education and empower human potential. Founder of Flybyrd and Kaiwa."
	/>
	<meta property="twitter:image" content="https://hirokuwana.com/hiro-social-preview.jpg" />

	<!-- Additional SEO -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta charset="UTF-8" />
	<link rel="canonical" href="https://hirokuwana.com/" />

	<!-- Structured Data -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Hiroyuki Kuwana",
			"alternateName": "Hiro Kuwana",
			"description": "AI entrepreneur and tech founder focused on democratizing education through artificial intelligence",
			"url": "https://hirokuwana.com",
			"jobTitle": "Founder & CEO",
			"worksFor": {
				"@type": "Organization",
				"name": "Flybyrd"
			},
			"alumniOf": {
				"@type": "EducationalOrganization",
				"name": "Brown University"
			},
			"nationality": ["Japanese", "American"],
			"knowsAbout": [
				"Artificial Intelligence",
				"Educational Technology",
				"Venture Capital",
				"Language Learning",
				"Startup Development"
			],
			"sameAs": ["https://www.flybyrd.io", "https://www.trykaiwa.com"]
		}
	</script>
</svelte:head>

<!-- Hero Section -->
<section class="hero" bind:this={sections[0]} class:visible={visibleSections.has(0)}>
	<div class="hero-content">
		<div
			class="avatar-wrapper"
			on:mouseenter={() => (profileHovered = true)}
			on:mouseleave={() => (profileHovered = false)}
			role="img"
			aria-label="Hiro Kuwana profile photo"
		>
			<div class="avatar-glow" class:active={profileHovered}></div>
			<img
				src={hiroProfile}
				alt="Hiro Kuwana"
				class="avatar-image"
				class:float={profileHovered}
			/>
		</div>

		<div class="hero-text">
			<h1 class="name animate-fade-in-up">Hiro Kuwana</h1>
			<button
				class="japanese-name animate-fade-in-up delay-1"
				on:click={() => (showMeaning = !showMeaning)}
				aria-expanded={showMeaning}
			>
				<span class="kanji">桑名 浩行</span>
				{#if showMeaning}
					<span class="meaning">"vast journey"</span>
				{:else}
					<span class="hint">click me</span>
				{/if}
			</button>

			<p class="tagline animate-fade-in-up delay-2">
				Building AI that democratizes opportunity
			</p>

			<a href={calLink} target="_blank" class="cta-button animate-fade-in-up delay-3">
				<span>Let's Talk</span>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		</div>
	</div>
</section>

<!-- Projects Section -->
<section class="projects-section" bind:this={sections[1]} class:visible={visibleSections.has(1)}>
	<div class="section-container">
		<h2 class="section-title">What I'm Building</h2>

		<div class="projects-grid">
			{#each projects as project, i}
				<article
					class="project-card"
					class:current={project.status === 'current'}
					style="--delay: {i * 0.1}s"
				>
					<div class="project-header">
						<div class="project-logo">
							<img src={project.logo} alt="{project.name} logo" />
						</div>
						<div class="project-status" class:current={project.status === 'current'} class:sunset={project.status === 'sunset'}>
							{project.status === 'current' ? 'Current Focus' : project.status === 'sunset' ? 'Sunset' : 'Active'}
						</div>
					</div>

					<h3 class="project-name">{project.name}</h3>
					<p class="project-tagline">{project.tagline}</p>
					<p class="project-description">{project.description}</p>

					{#if project.link}
						<a href={project.link} target="_blank" rel="noopener" class="project-link">
							Visit {project.name}
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<path d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</a>
					{/if}
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- Bio Section -->
<section class="bio-section" bind:this={sections[2]} class:visible={visibleSections.has(2)}>
	<div class="bio-container">
		<h2 class="bio-title">The Story</h2>

		<div class="bio-content">
			<p>
				<strong>Born in Japan, raised in the U.S.</strong> — I've lived across Spain, Estonia, and beyond.
				This global perspective shapes everything I build.
			</p>

			<p>
				After studying Environmental Engineering at Brown, I discovered my real passion:
				<em>making powerful tools accessible to everyone</em>.
			</p>

			<p>
				I believe AI should be humanity's great equalizer — the tutors, advisors, and assistants
				once reserved for the privileged few should be available to all.
			</p>

			<blockquote>
				"AI as the glider for everyone's mind."
			</blockquote>
		</div>

		<a href={calLink} target="_blank" class="bio-cta">
			Schedule a conversation
		</a>
	</div>
</section>

<style>
	/* ==========================================
	   HERO SECTION
	   ========================================== */
	.hero {
		min-height: calc(100vh - 80px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		background:
			radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent),
			var(--color-bg);
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s var(--ease-out-expo);
	}

	.hero.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 2rem;
		max-width: 600px;
	}

	/* Avatar */
	.avatar-wrapper {
		position: relative;
		cursor: pointer;
	}

	.avatar-glow {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
		opacity: 0;
		filter: blur(20px);
		transition: opacity 0.5s var(--ease-out-expo);
		z-index: 0;
	}

	.avatar-glow.active {
		opacity: 0.6;
	}

	.avatar-image {
		position: relative;
		width: 180px;
		height: 180px;
		border-radius: 50%;
		object-fit: cover;
		border: 4px solid white;
		box-shadow: var(--shadow-lg);
		transition: transform 0.6s var(--ease-out-expo);
		z-index: 1;
	}

	.avatar-image.float {
		transform: translateY(-8px) scale(1.02);
	}

	/* Hero Text */
	.hero-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.name {
		font-size: clamp(2.5rem, 8vw, 3.5rem);
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.03em;
		margin: 0;
	}

	.japanese-name {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: var(--color-bg-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out-expo);
		font-family: inherit;
	}

	.japanese-name:hover {
		background: var(--color-bg-subtle);
		border-color: rgba(0, 0, 0, 0.12);
		transform: scale(1.02);
	}

	.kanji {
		font-size: 1.125rem;
		color: var(--color-text);
		font-weight: 500;
	}

	.meaning {
		font-size: 0.8125rem;
		color: var(--color-accent);
		font-style: italic;
	}

	.hint {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tagline {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		max-width: 400px;
		margin: 0.5rem 0 0;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding: 0.875rem 1.75rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: white;
		background: var(--color-accent);
		border-radius: var(--radius-full);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.cta-button:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(0, 113, 227, 0.3);
	}

	.cta-button svg {
		transition: transform var(--duration-normal) var(--ease-out-expo);
	}

	.cta-button:hover svg {
		transform: translateX(4px);
	}

	/* ==========================================
	   PROJECTS SECTION
	   ========================================== */
	.projects-section {
		padding: 6rem 2rem;
		background: var(--color-bg-subtle);
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.8s var(--ease-out-expo);
	}

	.projects-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.section-container {
		max-width: 1120px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 3rem;
		color: var(--color-text);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.project-card {
		background: var(--color-bg);
		border-radius: var(--radius-xl);
		padding: 2rem;
		border: 1px solid var(--color-border);
		transition: all 0.5s var(--ease-out-expo);
		transition-delay: var(--delay);
	}

	.project-card:hover {
		transform: translateY(-8px);
		box-shadow: var(--shadow-xl);
		border-color: transparent;
	}

	.project-card.current {
		border-color: rgba(16, 185, 129, 0.3);
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, var(--color-bg) 100%);
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}

	.project-logo {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-bg-muted);
	}

	.project-logo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-status {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		color: var(--color-text-secondary);
	}

	.project-status.current {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
	}

	.project-status.sunset {
		background: rgba(107, 114, 128, 0.1);
		color: #6b7280;
	}

	.project-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.25rem;
		color: var(--color-text);
	}

	.project-tagline {
		font-size: 0.9375rem;
		color: var(--color-accent);
		margin: 0 0 1rem;
		font-weight: 500;
	}

	.project-description {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}

	.project-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-accent);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.project-link:hover {
		gap: 0.75rem;
	}

	/* ==========================================
	   BIO SECTION
	   ========================================== */
	.bio-section {
		padding: 6rem 2rem;
		background: var(--color-bg);
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.8s var(--ease-out-expo);
	}

	.bio-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.bio-container {
		max-width: 680px;
		margin: 0 auto;
		text-align: center;
	}

	.bio-title {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 2.5rem;
		color: var(--color-text);
	}

	.bio-content {
		text-align: left;
	}

	.bio-content p {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		line-height: 1.8;
		margin: 0 0 1.5rem;
	}

	.bio-content strong {
		color: var(--color-text);
		font-weight: 600;
	}

	.bio-content em {
		color: var(--color-accent);
		font-style: normal;
		font-weight: 500;
	}

	.bio-content blockquote {
		font-size: 1.5rem;
		font-weight: 500;
		color: var(--color-text);
		margin: 2.5rem 0;
		padding: 0;
		text-align: center;
		font-style: italic;
		position: relative;
	}

	.bio-content blockquote::before {
		content: '';
		display: block;
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, var(--color-accent), #8b5cf6);
		margin: 0 auto 1.5rem;
		border-radius: 2px;
	}

	.bio-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 2rem;
		padding: 1rem 2rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-accent);
		background: transparent;
		border: 1.5px solid var(--color-accent);
		border-radius: var(--radius-full);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.bio-cta:hover {
		background: var(--color-accent);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(0, 113, 227, 0.2);
	}

	/* ==========================================
	   RESPONSIVE
	   ========================================== */
	@media (min-width: 768px) {
		.avatar-image {
			width: 200px;
			height: 200px;
		}

		.hero-content {
			gap: 2.5rem;
		}
	}

	@media (max-width: 640px) {
		.hero {
			padding: 3rem 1.5rem;
		}

		.projects-section,
		.bio-section {
			padding: 4rem 1.5rem;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}

		.project-card {
			padding: 1.5rem;
		}

		.bio-content blockquote {
			font-size: 1.25rem;
		}
	}
</style>
