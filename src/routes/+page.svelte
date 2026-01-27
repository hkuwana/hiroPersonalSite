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
		// Easter egg for curious developers
		console.log('%c👋 Hey there, curious one!', 'font-size: 16px; font-weight: bold;');
		console.log('%cWhile you\'re here, reach out if you\'re curious about how I built this: hiro@trykaiwa.com', 'font-size: 12px;');
		console.log('%cI\'m not a T-1000. Look away... now.', 'font-size: 12px; color: gray;');

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
<section
	class="hero relative min-h-[calc(100vh-80px)] flex items-center justify-center px-8 py-20 md:py-24 bg-base-100"
	bind:this={sections[0]}
	class:visible={visibleSections.has(0)}
>
	<div class="flex flex-col items-center text-center gap-10 md:gap-11 max-w-xl">
		<!-- Avatar -->
		<div
			class="avatar relative cursor-pointer"
			on:mouseenter={() => (profileHovered = true)}
			on:mouseleave={() => (profileHovered = false)}
			role="img"
			aria-label="Hiro Kuwana profile photo"
		>
			<div class="avatar-glow" class:active={profileHovered}></div>
			<div class="w-40 h-40 md:w-44 md:h-44 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 shadow-xl transition-all duration-500 ease-out"
				class:float={profileHovered}
			>
				<img src={hiroProfile} alt="Hiro Kuwana" />
			</div>
		</div>

		<!-- Hero Text -->
		<div class="flex flex-col items-center gap-3.5">
			<h1 class="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-in-up">
				Hiro Kuwana
			</h1>

			<button
				class="btn btn-ghost btn-sm gap-2.5 rounded-full border border-base-300 hover:border-base-content/20 animate-fade-in-up delay-1"
				on:click={() => (showMeaning = !showMeaning)}
				aria-expanded={showMeaning}
			>
				<span class="text-base font-medium tracking-wide">桑名 浩行</span>
				{#if showMeaning}
					<span class="text-sm text-primary italic font-medium">くわな ひろゆき</span>
				{:else}
					<span class="text-xs text-base-content/50 uppercase tracking-widest font-medium">click me</span>
				{/if}
			</button>

			<p class="text-base-content/70 text-lg max-w-sm mt-1 leading-relaxed animate-fade-in-up delay-2">
				Building AI as a tool for humanity, not a replacement
			</p>

			<a href={calLink} target="_blank" class="btn btn-primary mt-5 gap-2 animate-fade-in-up delay-3">
				Let's Talk
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-base-content/40 hover:text-base-content/70 transition-colors animate-fade-in-up delay-4">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="animate-bounce">
			<path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</div>
</section>

<!-- Projects Section -->
<section
	class="section-animate py-24 md:py-28 px-8 bg-base-200/50"
	bind:this={sections[1]}
	class:visible={visibleSections.has(1)}
>
	<div class="max-w-5xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-12 tracking-tight">
			What I'm Building
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each projects as project, i}
				<div
					class="card bg-base-100 border border-base-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
					class:border-success/20={project.status === 'current'}
					class:bg-gradient-to-b={project.status === 'current'}
					class:from-success/5={project.status === 'current'}
					class:to-base-100={project.status === 'current'}
					style="animation-delay: {i * 0.1}s"
				>
					<div class="card-body">
						<!-- Header -->
						<div class="flex justify-between items-start mb-3">
							<div class="avatar">
								<div class="w-12 h-12 rounded-lg bg-base-200 shadow-sm">
									<img src={project.logo} alt="{project.name} logo" />
								</div>
							</div>
							<div
								class="badge badge-sm font-semibold uppercase tracking-wide"
								class:badge-success={project.status === 'current'}
								class:badge-ghost={project.status !== 'current'}
							>
								{project.status === 'current' ? 'Current Focus' : project.status === 'sunset' ? 'Sunset' : 'Active'}
							</div>
						</div>

						<h3 class="card-title text-xl">{project.name}</h3>
						<p class="text-primary text-sm font-medium">{project.tagline}</p>
						<p class="text-base-content/70 text-sm leading-relaxed">{project.description}</p>

						{#if project.link}
							<div class="card-actions mt-4">
								<a href={project.link} target="_blank" rel="noopener" class="link link-primary text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2 transition-all">
									Visit {project.name}
									<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
										<path d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</a>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Bio Section -->
<section
	class="section-animate py-24 md:py-28 px-8 bg-base-100"
	bind:this={sections[2]}
	class:visible={visibleSections.has(2)}
>
	<div class="max-w-2xl mx-auto text-center">
		<h2 class="text-2xl md:text-3xl font-semibold mb-10 tracking-tight">The Story</h2>

		<div class="text-left space-y-5">
			<p class="text-base-content/70 text-lg leading-relaxed">
				<strong class="text-base-content font-semibold">Born in Japan, raised in the U.S.</strong> I've lived across Spain, Estonia, and beyond.
				This global perspective shapes everything I build.
			</p>

			<p class="text-base-content/70 text-lg leading-relaxed">
				After studying Environmental Engineering at Brown, I discovered my real passion:
				<em class="text-primary not-italic font-medium">making powerful tools accessible to everyone</em>.
			</p>

			<p class="text-base-content/70 text-lg leading-relaxed">
				I believe AI should be humanity's great equalizer: the tutors, advisors, and assistants
				once reserved for the privileged few should be available to all.
			</p>

			<blockquote class="py-8 text-center">
				<div class="w-12 h-0.5 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full"></div>
				<p class="text-xl md:text-2xl font-medium italic tracking-tight">
					"AI as the glider for everyone's mind."
				</p>
			</blockquote>
		</div>

		<a href={calLink} target="_blank" class="btn btn-outline btn-primary mt-8">
			Schedule a conversation
		</a>
	</div>
</section>

<!-- FAQ Section -->
<section
	class="section-animate py-24 md:py-28 px-8 bg-base-200/50"
	bind:this={sections[3]}
	class:visible={visibleSections.has(3)}
>
	<div class="max-w-2xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-10 tracking-tight">
			Frequently Asked Questions
		</h2>
		<p class="text-base-content/60 text-center mb-8 text-sm">
			Things people ask me at parties. Yes, I'm fun at parties. No, I won't prove it.
		</p>

		<div class="space-y-3">
			<!-- AI Hot Take -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium">
					Will AI take over the world?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>No. But I do worry about how it will either force us to sharpen our critical thinking or make us complacent. In many ways, it's like <em>Up</em> or <em>Brave New World</em>. The question isn't whether AI will control us, but whether we'll choose comfort over growth.</p>
				</div>
			</div>

			<!-- Japan -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium">
					Is Japan perfect? Do you watch anime?
				</div>
				<div class="collapse-content text-base-content/70">
					<p><strong>No</strong>, Japan is not a perfect country without flaws. And <strong>yes</strong>, I watch anime. <em>Cowboy Bebop</em> and <em>Paprika</em> are masterpieces. I will die on this hill.</p>
				</div>
			</div>

			<!-- Coffee vs Tea -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium">
					Coffee or tea?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>Tea. Green tea specifically. And I'm willing to change your mind on this; most green tea in the US is awful (<em>cough cough Lipton</em>). Try the real stuff and we'll talk.</p>
				</div>
			</div>

			<!-- Background surprise -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium">
					Wait, you studied Environmental Engineering?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>Yes. My advisor once said, <em>"Now that you have a degree, I'm honestly surprised you became an engineer."</em> I also did conservation work in Maui helping maintain Waikamoi Preserve (one of the wettest places in the world). Somehow it stayed that way even with my dry humor.</p>
				</div>
			</div>

			<!-- Fun facts -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium">
					Tell me something weird about you
				</div>
				<div class="collapse-content text-base-content/70">
					<ul class="list-disc list-inside space-y-2">
						<li>I can snap on any surface. Tables, walls, my own face. It's a gift.</li>
						<li>I beat Total War: Shogun 2 on Legendary as the Tsu faction (the independent republic). If you know, you know.</li>
						<li>I send postcards to friends around the world. DM me your address, I'm serious.</li>
						<li>My dream is to make enough friends globally that I always have a couch to crash on.</li>
						<li>I can only count to three the German way. My hands physically refuse to do it any other way.</li>
					</ul>
				</div>
			</div>

			<!-- Legal disclaimer joke -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium">
					Are you funny?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>I don't have a sense of humor I can type out. Please don't sue me.</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Hero animation states */
	.hero {
		opacity: 0;
		transform: translateY(16px);
		transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hero.visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Section animation states */
	.section-animate {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.section-animate.visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Avatar glow effect */
	.avatar-glow {
		position: absolute;
		inset: -12px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(0, 113, 227, 0.3) 0%, rgba(88, 86, 214, 0.3) 100%);
		opacity: 0;
		filter: blur(24px);
		transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
		z-index: 0;
	}

	.avatar-glow.active {
		opacity: 0.5;
	}

	/* Float animation on avatar hover */
	.float {
		transform: translateY(-6px) scale(1.02);
	}
</style>
