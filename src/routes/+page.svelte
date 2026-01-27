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
			description: 'Helped VCs discover and analyze startups with AI-powered deal flow analysis. Sunset to focus on new opportunities.',
			logo: `${base}/flybyrd_logo.png`,
			status: 'sunset',
			color: '#6b7280'
		},
		{
			name: 'Kaiwa',
			tagline: 'Language Learning, Reimagined',
			description: 'Practice languages through bite-sized AI conversations. Real-time translations, social streaks, and 30-second daily sessions.',
			link: 'https://www.trykaiwa.com/',
			logo: `${base}/kaiwa_logo.png`,
			status: 'current',
			color: '#10b981'
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
		content="Hiro Kuwana is a tech entrepreneur building AI solutions to democratize education and empower human potential. Founder of Kaiwa (AI language learning). Making premium tools accessible to everyone."
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
		content="Tech entrepreneur building AI solutions to democratize education and empower human potential. Founder of Kaiwa."
	/>
	<meta property="og:image" content="https://hirokuwana.com/hiro-social-preview.jpg" />
	<meta property="og:site_name" content="Hiro Kuwana" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://hirokuwana.com/" />
	<meta property="twitter:title" content="Hiro Kuwana - AI Entrepreneur & Founder" />
	<meta
		property="twitter:description"
		content="Building AI solutions to democratize education and empower human potential. Founder of Kaiwa."
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
				"name": "Kaiwa"
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
			"sameAs": ["https://www.trykaiwa.com"]
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
					<span class="meaning">くわな ひろゆき</span>
				{:else}
					<span class="hint">click me</span>
				{/if}
			</button>

			<p class="tagline animate-fade-in-up delay-2">
				Building AI as a tool for humanity, not a replacement
			</p>

			<a href={calLink} target="_blank" class="btn btn-primary animate-fade-in-up delay-3">
				Let's Talk
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div class="scroll-indicator animate-fade-in-up delay-4">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="bounce">
			<path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
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
	   Johnny Ive-inspired minimal design
	   ========================================== */
	.hero {
		position: relative;
		min-height: calc(100vh - 80px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5rem 2rem;
		background:
			radial-gradient(ellipse 80% 60% at 50% -30%, rgba(0, 113, 227, 0.03), transparent),
			radial-gradient(ellipse 60% 40% at 80% 0%, rgba(88, 86, 214, 0.02), transparent),
			var(--color-bg);
		opacity: 0;
		transform: translateY(16px);
		transition: all 0.7s var(--ease-out-expo);
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
		gap: 2.5rem;
		max-width: 560px;
	}

	/* Avatar - Refined with subtle depth */
	.avatar-wrapper {
		position: relative;
		cursor: pointer;
	}

	.avatar-glow {
		position: absolute;
		inset: -12px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(0, 113, 227, 0.3) 0%, rgba(88, 86, 214, 0.3) 100%);
		opacity: 0;
		filter: blur(24px);
		transition: opacity 0.6s var(--ease-out-expo);
		z-index: 0;
	}

	.avatar-glow.active {
		opacity: 0.5;
	}

	.avatar-image {
		position: relative;
		width: 160px;
		height: 160px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid white;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.08),
			0 12px 40px rgba(0, 0, 0, 0.12);
		transition: transform 0.5s var(--ease-out-expo), box-shadow 0.5s var(--ease-out-expo);
		z-index: 1;
	}

	.avatar-image.float {
		transform: translateY(-6px) scale(1.02);
		box-shadow:
			0 8px 20px rgba(0, 0, 0, 0.1),
			0 20px 50px rgba(0, 0, 0, 0.15);
	}

	/* Hero Text - Refined typography */
	.hero-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.875rem;
	}

	.name {
		font-size: clamp(2.5rem, 7vw, 3.25rem);
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.035em;
		margin: 0;
		line-height: 1.1;
	}

	.japanese-name {
		display: flex;
		align-items: center;
		gap: 0.625rem;
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
		border-color: var(--color-border-hover);
		transform: translateY(-1px);
	}

	.japanese-name:active {
		transform: scale(0.98);
	}

	.kanji {
		font-size: 1rem;
		color: var(--color-text);
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	.meaning {
		font-size: 0.8125rem;
		color: var(--color-accent);
		font-style: italic;
		font-weight: 500;
	}

	.hint {
		font-size: 0.625rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 500;
	}

	.tagline {
		font-size: 1.0625rem;
		color: var(--color-text-secondary);
		max-width: 380px;
		margin: 0.25rem 0 0;
		line-height: 1.5;
		letter-spacing: -0.01em;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.25rem;
		padding: 0.8125rem 1.625rem;
		font-size: 0.9375rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: white;
		background: var(--color-accent);
		border-radius: var(--radius-full);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
		position: relative;
		overflow: hidden;
	}

	.cta-button::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
		opacity: 0;
		transition: opacity var(--duration-fast);
	}

	.cta-button:hover {
		background: var(--color-accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(0, 113, 227, 0.25), 0 2px 6px rgba(0, 113, 227, 0.15);
	}

	.cta-button:hover::before {
		opacity: 1;
	}

	.cta-button:active {
		transform: translateY(0) scale(0.98);
	}

	.cta-button svg {
		transition: transform var(--duration-normal) var(--ease-out-expo);
	}

	.cta-button:hover svg {
		transform: translateX(3px);
	}

	/* Scroll Indicator */
	.scroll-indicator {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		color: var(--color-text-tertiary);
		opacity: 0.6;
		transition: opacity var(--duration-normal);
	}

	.scroll-indicator:hover {
		opacity: 1;
	}

	.scroll-indicator .bounce {
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-8px);
		}
		60% {
			transform: translateY(-4px);
		}
	}

	/* ==========================================
	   PROJECTS SECTION
	   Clean, minimal project cards
	   ========================================== */
	.projects-section {
		padding: 6rem 2rem 7rem;
		background: var(--color-bg-subtle);
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.7s var(--ease-out-expo);
	}

	.projects-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.section-container {
		max-width: 1080px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 3rem;
		color: var(--color-text);
		letter-spacing: -0.025em;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.25rem;
	}

	.project-card {
		background: var(--color-bg);
		border-radius: var(--radius-xl);
		padding: 1.75rem;
		border: 1px solid var(--color-border);
		transition: all 0.4s var(--ease-out-expo);
		transition-delay: var(--delay);
		position: relative;
	}

	.project-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.015) 100%);
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--duration-normal);
	}

	.project-card:hover {
		transform: translateY(-4px);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.06),
			0 4px 12px rgba(0, 0, 0, 0.04);
		border-color: transparent;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	.project-card.current {
		border-color: rgba(52, 199, 89, 0.2);
		background: linear-gradient(180deg, rgba(52, 199, 89, 0.02) 0%, var(--color-bg) 100%);
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}

	.project-logo {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--color-bg-muted);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.project-logo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-status {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.3125rem 0.625rem;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		color: var(--color-text-tertiary);
	}

	.project-status.current {
		background: rgba(52, 199, 89, 0.1);
		color: #059669;
	}

	.project-status.sunset {
		background: rgba(134, 134, 139, 0.1);
		color: var(--color-text-tertiary);
	}

	.project-name {
		font-size: 1.375rem;
		font-weight: 600;
		margin: 0 0 0.25rem;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.project-tagline {
		font-size: 0.875rem;
		color: var(--color-accent);
		margin: 0 0 0.875rem;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.project-description {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0 0 1.25rem;
		letter-spacing: -0.01em;
	}

	.project-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-accent);
		text-decoration: none;
		transition: all var(--duration-fast) var(--ease-out-quart);
	}

	.project-link:hover {
		gap: 0.5rem;
	}

	.project-link svg {
		transition: transform var(--duration-fast) var(--ease-out-quart);
	}

	.project-link:hover svg {
		transform: translate(2px, -2px);
	}

	/* ==========================================
	   BIO SECTION
	   Refined storytelling typography
	   ========================================== */
	.bio-section {
		padding: 6rem 2rem 7rem;
		background: var(--color-bg);
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.7s var(--ease-out-expo);
	}

	.bio-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.bio-container {
		max-width: 640px;
		margin: 0 auto;
		text-align: center;
	}

	.bio-title {
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: 2.5rem;
		color: var(--color-text);
		letter-spacing: -0.025em;
	}

	.bio-content {
		text-align: left;
	}

	.bio-content p {
		font-size: 1.0625rem;
		color: var(--color-text-secondary);
		line-height: 1.75;
		margin: 0 0 1.375rem;
		letter-spacing: -0.01em;
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
		font-size: 1.375rem;
		font-weight: 500;
		color: var(--color-text);
		margin: 2.5rem 0;
		padding: 0;
		text-align: center;
		font-style: italic;
		position: relative;
		letter-spacing: -0.02em;
		line-height: 1.4;
	}

	.bio-content blockquote::before {
		content: '';
		display: block;
		width: 48px;
		height: 2px;
		background: linear-gradient(90deg, var(--color-accent), #5856d6);
		margin: 0 auto 1.5rem;
		border-radius: 1px;
	}

	.bio-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 2rem;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--color-accent);
		background: transparent;
		border: 1.5px solid rgba(0, 113, 227, 0.3);
		border-radius: var(--radius-full);
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.bio-cta:hover {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		transform: translateY(-1px);
	}

	.bio-cta:active {
		transform: translateY(0) scale(0.98);
	}

	/* ==========================================
	   RESPONSIVE
	   ========================================== */
	@media (min-width: 768px) {
		.avatar-image {
			width: 180px;
			height: 180px;
		}

		.hero-content {
			gap: 2.75rem;
		}

		.hero {
			padding: 6rem 2rem;
		}
	}

	@media (max-width: 640px) {
		.hero {
			padding: 3rem 1.5rem;
			min-height: calc(100vh - 100px);
		}

		.hero-content {
			gap: 2rem;
		}

		.avatar-image {
			width: 140px;
			height: 140px;
		}

		.name {
			font-size: 2.25rem;
		}

		.tagline {
			font-size: 1rem;
		}

		.projects-section,
		.bio-section {
			padding: 4rem 1.5rem;
		}

		.section-title,
		.bio-title {
			font-size: 1.5rem;
			margin-bottom: 2rem;
		}

		.projects-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.project-card {
			padding: 1.5rem;
		}

		.project-name {
			font-size: 1.25rem;
		}

		.bio-content p {
			font-size: 1rem;
		}

		.bio-content blockquote {
			font-size: 1.1875rem;
		}
	}

	/* Extra small devices */
	@media (max-width: 380px) {
		.hero {
			padding: 2rem 1rem;
		}

		.avatar-image {
			width: 120px;
			height: 120px;
		}

		.name {
			font-size: 2rem;
		}

		.japanese-name {
			padding: 0.4rem 0.875rem;
		}

		.kanji {
			font-size: 0.9375rem;
		}
	}
</style>
