<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { CONTACT, PERSONAL, PROJECTS, SITE, SOCIAL_LINKS, EXPERTISE, FAQS } from '$data/constants';
	import * as m from '$lib/paraglide/messages';

	// For the playful Japanese name easter egg
	let showMeaning = false;

	// Intersection Observer for scroll animations
	let sections: HTMLElement[] = [];
	let visibleSections = new Set<number>();

	onMount(() => {
		// Easter egg for curious developers
		console.log('%c👋 Hey there, curious one!', 'font-size: 16px; font-weight: bold;');
		console.log(`%cWhile you're here, reach out if you're curious about how I built this: ${CONTACT.email}`, 'font-size: 12px;');
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

	// Map projects to include base path for logos
	const projects = PROJECTS.map((p) => ({
		...p,
		logo: `${base}${p.logo}`,
	}));
</script>

<svelte:head>
	<title>{SITE.title}</title>
	<meta name="description" content={SITE.description} />
	<meta name="keywords" content={SITE.keywords.join(', ')} />
	<meta name="author" content={SITE.author} />
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

	<!-- Geo tags for local SEO -->
	<meta name="geo.region" content="US" />
	<meta name="geo.placename" content="United States" />

	<!-- Language and locale -->
	<meta property="og:locale" content="en_US" />
	<meta property="og:locale:alternate" content="ja_JP" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="profile" />
	<meta property="og:url" content={SITE.url} />
	<meta property="og:title" content={SITE.title} />
	<meta property="og:description" content={SITE.description} />
	<meta property="og:image" content={SITE.image} />
	<meta property="og:image:alt" content="{PERSONAL.displayName} - AI Entrepreneur headshot" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="profile:first_name" content="Hiro" />
	<meta property="profile:last_name" content="Kuwana" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={SITE.url} />
	<meta name="twitter:title" content={SITE.title} />
	<meta name="twitter:description" content={SITE.description} />
	<meta name="twitter:image" content={SITE.image} />
	<meta name="twitter:image:alt" content="{PERSONAL.displayName} - AI Entrepreneur headshot" />
	<meta name="twitter:creator" content="@hirokuwana" />

	<!-- Additional SEO -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta charset="UTF-8" />
	<link rel="canonical" href={SITE.url} />

	<!-- Preconnect to improve performance -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />

	<!-- Mobile app meta tags -->
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<meta name="format-detection" content="telephone=no" />

	<!-- Structured Data for Person -->
	<script type="application/ld+json">
		{
			JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'Person',
				name: PERSONAL.fullName,
				alternateName: PERSONAL.displayName,
				description: SITE.description,
				url: SITE.url,
				image: SITE.image,
				email: CONTACT.email,
				jobTitle: PERSONAL.jobTitle,
				worksFor: {
					'@type': 'Organization',
					name: PERSONAL.company,
					url: PERSONAL.companyWebsite,
				},
				alumniOf: {
					'@type': 'EducationalOrganization',
					name: PERSONAL.university,
				},
				nationality: PERSONAL.nationalities,
				knowsAbout: EXPERTISE,
				sameAs: [PERSONAL.companyWebsite, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github],
			})
		}
	</script>

	<!-- Structured Data for Website -->
	<script type="application/ld+json">
		{
			JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: SITE.name,
				url: SITE.url,
				description: SITE.description,
				author: {
					'@type': 'Person',
					name: PERSONAL.fullName,
				},
				inLanguage: 'en-US',
			})
		}
	</script>

	<!-- Structured Data for Breadcrumbs -->
	<script type="application/ld+json">
		{
			JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Home',
						item: SITE.url,
					},
				],
			})
		}
	</script>

	<!-- Structured Data for FAQ - AEO/GEO Optimization -->
	<script type="application/ld+json">
		{
			JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: FAQS.map((faq) => ({
					'@type': 'Question',
					name: faq.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: faq.answer,
					},
				})),
			})
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
			class="avatar relative"
			role="img"
			aria-label="Hiro Kuwana profile photo"
		>
			<div class="w-40 h-40 md:w-44 md:h-44 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.03] cursor-default">
				<img src={hiroProfile} alt="Hiro Kuwana" class="rounded-full" />
			</div>
		</div>

		<!-- Hero Text -->
		<div class="flex flex-col items-center gap-3.5">
			<h1 class="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-in-up text-primary">
				{PERSONAL.displayName}
			</h1>

			<button
				class="btn btn-ghost btn-sm gap-2.5 rounded-full border border-base-300 hover:border-base-content/20 animate-fade-in-up delay-1 transition-all duration-300"
				on:click={() => (showMeaning = !showMeaning)}
				aria-expanded={showMeaning}
				aria-label={m.hero_show_pronunciation()}
			>
				<span class="text-base font-medium tracking-wide">{PERSONAL.japaneseKanji}</span>
				{#if showMeaning}
					<span class="text-sm text-primary italic font-medium">{PERSONAL.japaneseKana}</span>
				{/if}
			</button>

			<p class="text-base-content/70 text-lg max-w-sm mt-1 leading-relaxed animate-fade-in-up delay-2">
				{PERSONAL.tagline}
			</p>

			<a href={CONTACT.cal} target="_blank" class="btn btn-primary mt-5 gap-2 animate-fade-in-up delay-3">
				{m.hero_lets_talk()}
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		</div>
	</div>

	<!-- Scroll Indicator - Subtle pulse -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up delay-4">
		<div class="w-6 h-10 rounded-full border-2 border-base-content/20 flex justify-center pt-2">
			<div class="w-1 h-2 rounded-full bg-base-content/40 animate-scroll-hint"></div>
		</div>
	</div>
</section>

<!-- Projects Section -->
<section
	class="section-animate py-24 md:py-28 px-8 bg-base-200/50"
	bind:this={sections[1]}
	class:visible={visibleSections.has(1)}
>
	<div class="max-w-5xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-12 tracking-tight text-primary">
			{m.projects_heading()}
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each projects as project, i}
				<div
					class="card border transition-all duration-300 {project.status === 'current'
						? 'bg-gradient-to-b from-success/10 via-base-100 to-base-100 border-success/30 hover:border-success/50 hover:shadow-xl hover:shadow-success/10 hover:-translate-y-2 md:scale-[1.02]'
						: 'bg-base-100/60 border-base-300/50 hover:border-base-300 hover:bg-base-100 opacity-75 hover:opacity-100'}"
					style="animation-delay: {i * 0.1}s"
				>
					<div class="card-body">
						<!-- Header -->
						<div class="flex justify-between items-start mb-3">
							<div class="avatar">
								<div class="w-12 h-12 rounded-lg shadow-sm overflow-hidden {project.status === 'current' ? 'bg-white' : 'bg-base-200'}">
									<img
										src={project.logo}
										alt="{project.name} logo"
										class="w-full h-full object-contain {project.status !== 'current' ? 'opacity-60 grayscale-[30%]' : ''}"
									/>
								</div>
							</div>
							<div
								class="badge badge-sm font-semibold uppercase tracking-wide"
								class:badge-success={project.status === 'current'}
								class:badge-ghost={project.status !== 'current'}
							>
								{project.status === 'current' ? m.project_status_current() : project.status === 'sunset' ? m.project_status_sunset() : m.project_status_active()}
							</div>
						</div>

						<h3 class="card-title text-xl {project.status === 'current' ? 'text-neutral' : 'text-neutral/70'}">{project.name}</h3>
						<p class="text-sm font-medium {project.status === 'current' ? 'text-primary' : 'text-base-content/50'}">{project.tagline}</p>
						<p class="text-sm leading-relaxed {project.status === 'current' ? 'text-neutral/70' : 'text-neutral/50'}">{project.description}</p>

						{#if project.link}
							<div class="card-actions mt-4">
								<a href={project.link} target="_blank" rel="noopener" class="link link-primary text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2 transition-all">
									{m.project_visit({ name: project.name })}
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
		<h2 class="text-2xl md:text-3xl font-semibold mb-10 tracking-tight text-primary">The Story</h2>

		<div class="text-left space-y-5">
			<p class="text-base-content/70 text-lg leading-relaxed">
				<strong class="text-base-content font-semibold">Born in Japan, raised in the U.S.</strong> I've lived across Spain, Estonia, and beyond.
				This global perspective shapes everything I build.
			</p>

			<p class="text-base-content/70 text-lg leading-relaxed">
				After studying Environmental Engineering at Brown, I discovered my real passion:
				<em class="text-accent not-italic font-medium">making powerful tools accessible to everyone</em>.
			</p>

			<p class="text-base-content/70 text-lg leading-relaxed">
				I believe AI should be humanity's great equalizer: the tutors, advisors, and assistants
				once reserved for the privileged few should be available to all.
			</p>

			<blockquote class="py-12 md:py-16 text-center">
				<div class="w-16 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent mx-auto mb-8 rounded-full opacity-60"></div>
				<p class="text-2xl md:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary leading-relaxed">
					"AI as the glider for everyone's mind."
				</p>
				<div class="w-16 h-0.5 bg-gradient-to-r from-accent via-secondary to-primary mx-auto mt-8 rounded-full opacity-60"></div>
			</blockquote>
		</div>

		<a href={CONTACT.cal} target="_blank" class="btn btn-outline btn-primary mt-8">
			Schedule a conversation
		</a>
	</div>
</section>

<!-- FAQ Section -->
<section
	class="section-animate py-28 md:py-36 px-8 bg-base-200/50"
	bind:this={sections[3]}
	class:visible={visibleSections.has(3)}
>
	<div class="max-w-2xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-4 tracking-tight text-primary">
			Frequently Asked Questions
		</h2>
		<p class="text-base-content/60 text-center mb-12 text-sm">
			Questions I get asked more than I'd like.
		</p>

		<div class="space-y-4">
			<!-- AI Hot Take -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium text-primary">
					Will AI take over the world?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>No. But I do worry about how it will either force us to sharpen our critical thinking or make us complacent. In many ways, it's like <em>Up</em> or <em>Brave New World</em>. The question isn't whether AI will control us, but whether we'll choose comfort over growth.</p>
				</div>
			</div>

			<!-- Japan -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium text-primary">
					Is Japan perfect? Do you watch anime?
				</div>
				<div class="collapse-content text-base-content/70">
					<p><strong>No</strong>, Japan is not a perfect country without flaws. And <strong>yes</strong>, I watch anime. <em>Cowboy Bebop</em> and <em>Paprika</em> are masterpieces. I will die on this hill.</p>
				</div>
			</div>

			<!-- Coffee vs Tea -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium text-primary">
					Coffee or tea?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>Tea. Green tea specifically. And I'm willing to change your mind on this; most green tea in the US is awful (<em>cough cough Lipton</em>). Try the real stuff and we'll talk.</p>
				</div>
			</div>

			<!-- Background surprise -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium text-primary">
					Wait, you studied Environmental Engineering?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>Yes. My advisor once said, <em>"Now that you have a degree, I'm honestly surprised you became an engineer."</em> I also did conservation work in Maui helping maintain Waikamoi Preserve (one of the wettest places in the world). Somehow it stayed that way even with my dry humor.</p>
				</div>
			</div>

			<!-- Fun facts -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium text-primary">
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
				<div class="collapse-title font-medium text-primary">
					Are you funny?
				</div>
				<div class="collapse-content text-base-content/70">
					<p>I grew up in the US of A. I don't have a sense of humour. Please don't sue me.</p>
				</div>
			</div>

			<!-- Hills to die on -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300">
				<input type="radio" name="faq-accordion" />
				<div class="collapse-title font-medium text-primary">
					What's a hill you will die on?
				</div>
				<div class="collapse-content text-base-content/70">
					<p><em>Cowboy Bebop</em> and <em>Paprika</em> are masterpieces—no debate. Also, if you're anywhere from your late teens through your early thirties, you absolutely must read <em>The Brothers Karamazov</em>. It will change how you see the world.</p>
				</div>
			</div>
		</div>

		<p class="text-center mt-8 text-sm text-base-content/70">
			If this site isn't serious enough for you, <a href="/corporate" class="underline hover:text-base-content">click here</a>.
		</p>
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

	/* Scroll indicator animation */
	@keyframes scroll-hint {
		0%, 100% {
			opacity: 0.4;
			transform: translateY(0);
		}
		50% {
			opacity: 0.8;
			transform: translateY(4px);
		}
	}

	:global(.animate-scroll-hint) {
		animation: scroll-hint 2s ease-in-out infinite;
	}
</style>
