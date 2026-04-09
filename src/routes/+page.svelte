<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.webp';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { CONTACT, PERSONAL, PROJECTS, SITE, SOCIAL_LINKS, EXPERTISE, FAQS, TOOLS } from '$data/constants';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

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

		// If the user prefers reduced motion, make all sections visible immediately
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			for (let i = 0; i < sections.length; i++) {
				visibleSections.add(i);
			}
			visibleSections = visibleSections;
			return;
		}

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

<!-- Hero Section - Tighter to get to projects faster -->
<section
	class="hero relative flex items-center justify-center px-5 sm:px-8 py-14 md:py-20 bg-base-100"
	bind:this={sections[0]}
	class:visible={visibleSections.has(0)}
>
	<div class="flex flex-col items-center text-center gap-6 md:gap-8 max-w-xl">
		<!-- Avatar + Name row -->
		<div class="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
			<div
				class="avatar relative shrink-0"
				role="img"
				aria-label="Hiro Kuwana profile photo"
			>
				<div class="w-28 h-28 md:w-36 md:h-36 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 shadow-lg hover:shadow-2xl transition-[transform,box-shadow] duration-500 ease-out hover:scale-[1.03] cursor-default">
					<img src={hiroProfile} alt="Hiro Kuwana" class="rounded-full" width="144" height="144" fetchpriority="high" />
				</div>
			</div>

			<div class="flex flex-col items-center sm:items-start gap-2">
				<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight animate-fade-in-up text-primary">
					{PERSONAL.displayName}
				</h1>

				<button
					class="btn btn-ghost btn-sm gap-2.5 rounded-full border border-base-300 hover:border-base-content/20 animate-fade-in-up delay-1 transition-all duration-300"
					onclick={() => (showMeaning = !showMeaning)}
					aria-expanded={showMeaning}
					aria-label={m.hero_show_pronunciation()}
				>
					<span class="text-base font-medium tracking-wide">{PERSONAL.japaneseKanji}</span>
					{#if showMeaning}
						<span class="text-sm text-primary italic font-medium">{PERSONAL.japaneseKana}</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Tagline + CTA -->
		<div class="flex flex-col items-center gap-4">
			<p class="text-base-content/70 text-lg max-w-sm leading-relaxed animate-fade-in-up delay-2">
				{m.hero_tagline()}
			</p>

			<a href={CONTACT.cal} target="_blank" rel="noopener" class="btn btn-outline btn-primary gap-2 animate-fade-in-up delay-3">
				{m.hero_lets_talk()}
				<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
			</a>
		</div>
	</div>
</section>

<!-- Projects Section -->
<section
	class="section-animate py-24 md:py-28 px-5 sm:px-8 bg-base-200/50"
	bind:this={sections[1]}
	class:visible={visibleSections.has(1)}
>
	<div class="max-w-5xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-12 tracking-tight text-primary">
			{m.projects_heading()}
		</h2>

		<!-- Featured Project: Kaiwa -->
		{#each projects.filter(p => p.status === 'current') as project}
			<a
				href={project.link}
				target="_blank"
				rel="noopener"
				class="group card border-2 border-success/30 bg-gradient-to-br from-success/10 via-base-100 to-base-100 hover:border-success/50 hover:shadow-2xl hover:shadow-success/10 transition-all duration-300 mb-8"
			>
				<div class="card-body flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 md:p-8">
					<div class="avatar shrink-0">
						<div class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl shadow-md overflow-hidden bg-base-100 dark:bg-base-300">
							<img src={project.logo} alt="{project.name} logo" width="80" height="80" loading="lazy" class="w-full h-full object-contain" />
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-3 mb-1 flex-wrap">
							<h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-base-content group-hover:text-primary transition-colors">{project.name}</h3>
							<div class="badge badge-success badge-sm font-semibold uppercase tracking-wide">{m.project_status_current()}</div>
						</div>
						<p class="text-primary font-medium text-sm sm:text-base mb-1 sm:mb-2">{project.tagline}</p>
						<p class="text-base-content/60 text-sm sm:text-base leading-relaxed group-hover:text-base-content/80 transition-colors">{project.description}</p>
					</div>
					<div class="shrink-0 self-start sm:self-center">
						<span class="btn btn-primary btn-sm gap-1.5 group-hover:gap-2 transition-all">
							{m.project_visit({ name: project.name })}
							<span class="icon-[mdi--arrow-top-right] w-4 h-4"></span>
						</span>
					</div>
				</div>
			</a>
		{/each}

		<!-- Other Projects -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each projects.filter(p => p.status !== 'current') as project, i}
				<div
					class="card border transition-all duration-300 group bg-base-100 border-base-300/50 hover:border-base-300 hover:bg-base-200/50"
					style="animation-delay: {i * 0.1}s"
				>
					<div class="card-body">
						<!-- Header -->
						<div class="flex justify-between items-start mb-3">
							<div class="avatar">
								{#if project.logo}
									<div class="w-12 h-12 rounded-lg shadow-sm overflow-hidden bg-base-100 dark:bg-base-300">
										<img
											src={project.logo}
											alt="{project.name} logo"
											width="48"
											height="48"
											loading="lazy"
											class="w-full h-full object-contain opacity-80 group-hover:opacity-100"
										/>
									</div>
								{:else}
									<!-- Fallback letter logo -->
									<div class="w-12 h-12 rounded-lg shadow-sm flex items-center justify-center font-bold text-xl"
										style="background: {project.color}; color: white;">
										{project.name.charAt(0)}
									</div>
								{/if}
							</div>
							<div
								class="badge badge-sm font-semibold uppercase tracking-wide"
								class:badge-ghost={true}
							>
								{project.status === 'sunset' ? m.project_status_sunset() : m.project_status_active()}
							</div>
						</div>

						<h3 class="card-title text-xl text-base-content group-hover:text-primary transition-colors">{project.name}</h3>
						<p class="text-sm font-medium text-base-content/70 group-hover:text-base-content">{project.tagline}</p>
						<p class="text-sm leading-relaxed text-base-content/60 group-hover:text-base-content/80 transition-colors">{project.description}</p>

						{#if project.link || project.github}
							<div class="card-actions mt-4 flex flex-wrap gap-3">
								{#if project.link}
									<a href={project.link} target="_blank" rel="noopener" class="link link-primary text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2 transition-all">
										{m.project_visit({ name: project.name })}
										<span class="icon-[mdi--arrow-top-right] w-3.5 h-3.5"></span>
									</a>
								{/if}
								{#if project.github}
									<a href={project.github} target="_blank" rel="noopener" class="link link-secondary text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2 transition-all">
										GitHub
										<span class="icon-[mdi--github] w-3.5 h-3.5"></span>
									</a>
								{/if}
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
	class="section-animate py-24 md:py-28 px-5 sm:px-8 bg-base-100"
	bind:this={sections[2]}
	class:visible={visibleSections.has(2)}
>
	<div class="max-w-2xl mx-auto text-center">
		<h2 class="text-2xl md:text-3xl font-semibold mb-10 tracking-tight text-primary">{m.bio_heading()}</h2>

		<div class="text-left space-y-5">
			<p class="text-base-content/70 text-lg leading-relaxed">
				{@html m.bio_p1()}
			</p>

			<p class="text-base-content/70 text-lg leading-relaxed">
				{@html m.bio_p2()}
			</p>

			<p class="text-base-content/70 text-lg leading-relaxed">
				{m.bio_p3()}
			</p>

			<blockquote class="py-12 md:py-16 text-center">
				<div class="w-12 h-px bg-primary/30 mx-auto mb-8"></div>
				<p class="text-xl md:text-3xl font-semibold tracking-tight text-primary leading-snug italic">
					"{m.bio_quote()}"
				</p>
				<div class="w-12 h-px bg-primary/30 mx-auto mt-8"></div>
			</blockquote>
		</div>

		<a href={CONTACT.cal} target="_blank" rel="noopener" class="btn btn-outline btn-primary mt-8">
			{m.bio_schedule()}
		</a>
	</div>
</section>

<!-- AI Consulting Section -->
<section
	class="section-animate py-24 md:py-28 px-5 sm:px-8 bg-base-200/50"
	bind:this={sections[3]}
	class:visible={visibleSections.has(3)}
>
	<div class="max-w-3xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-3 tracking-tight text-primary">
			{m.consulting_heading()}
		</h2>
		<p class="text-base-content/60 text-center mb-12 text-lg max-w-lg mx-auto leading-relaxed">
			{m.consulting_subheading()}
		</p>

		<div class="consulting-services space-y-4 mb-12">
			<div class="flex items-start gap-4 p-5 rounded-xl border border-base-300/50 bg-base-100 hover:border-primary/20 transition-colors duration-200">
				<span class="text-primary text-lg mt-0.5 shrink-0">01</span>
				<div>
					<h3 class="font-semibold text-base text-base-content mb-1">{m.consulting_service_strategy()}</h3>
					<p class="text-sm text-base-content/60 leading-relaxed">{m.consulting_service_strategy_desc()}</p>
				</div>
			</div>

			<div class="flex items-start gap-4 p-5 rounded-xl border border-base-300/50 bg-base-100 hover:border-primary/20 transition-colors duration-200">
				<span class="text-primary text-lg mt-0.5 shrink-0">02</span>
				<div>
					<h3 class="font-semibold text-base text-base-content mb-1">{m.consulting_service_build()}</h3>
					<p class="text-sm text-base-content/60 leading-relaxed">{m.consulting_service_build_desc()}</p>
				</div>
			</div>

			<div class="flex items-start gap-4 p-5 rounded-xl border border-base-300/50 bg-base-100 hover:border-primary/20 transition-colors duration-200">
				<span class="text-primary text-lg mt-0.5 shrink-0">03</span>
				<div>
					<h3 class="font-semibold text-base text-base-content mb-1">{m.consulting_service_training()}</h3>
					<p class="text-sm text-base-content/60 leading-relaxed">{m.consulting_service_training_desc()}</p>
				</div>
			</div>
		</div>

		<div class="text-center">
			<a href={CONTACT.cal} target="_blank" rel="noopener" class="btn btn-outline btn-primary gap-2">
				{m.consulting_cta()}
				<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
			</a>
		</div>
	</div>
</section>

<!-- Tools & Experiments Section -->
<section
	id="tools"
	class="section-animate py-24 md:py-28 px-5 sm:px-8 bg-base-100 scroll-mt-16"
	bind:this={sections[4]}
	class:visible={visibleSections.has(4)}
>
	<div class="max-w-4xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-3 tracking-tight text-primary">
			{m.tools_heading()}
		</h2>
		<p class="text-base-content/60 text-center mb-12 text-sm max-w-md mx-auto">
			{m.tools_subheading()}
		</p>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			{#each TOOLS as tool, i}
				<a
					href={tool.href}
					class="group card bg-base-100 border border-base-300/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
					style="animation-delay: {i * 0.1}s"
				>
					<div class="card-body gap-3">
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
								style="background: {tool.color}15; color: {tool.color};"
							>
								{#if tool.icon === 'calendar'}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
										<line x1="16" y1="2" x2="16" y2="6" />
										<line x1="8" y1="2" x2="8" y2="6" />
										<line x1="3" y1="10" x2="21" y2="10" />
										<path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
									</svg>
								{:else}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
									</svg>
								{/if}
							</div>
							<h3 class="font-semibold text-base text-base-content group-hover:text-primary transition-colors">{tool.name}</h3>
						</div>
						<p class="text-sm text-base-content/60 leading-relaxed group-hover:text-base-content/80 transition-colors">{tool.description}</p>
						<div class="flex items-center gap-1.5 text-primary text-sm font-medium mt-auto pt-2">
							<span>{m.tools_try()}</span>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform">
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</div>
					</div>
				</a>
			{/each}

		</div>
	</div>
</section>

<!-- FAQ Section -->
<section
	class="section-animate py-28 md:py-36 px-5 sm:px-8 bg-base-200/50"
	bind:this={sections[5]}
	class:visible={visibleSections.has(5)}
>
	<div class="max-w-2xl mx-auto">
		<h2 class="text-2xl md:text-3xl font-semibold text-center mb-4 tracking-tight text-primary">
			{m.faq_heading()}
		</h2>
		<p class="text-base-content/60 text-center mb-12 text-sm">
			{m.faq_subheading()}
		</p>

		<div class="space-y-3">
			<!-- AI Hot Take -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_ai_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_ai_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					<p>{@html m.faq_ai_a()}</p>
				</div>
			</div>

			<!-- Japan -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_japan_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_japan_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					<p>{@html m.faq_japan_a()}</p>
				</div>
			</div>

			<!-- Coffee vs Tea -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_tea_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_tea_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					<p>{@html m.faq_tea_a()}</p>
				</div>
			</div>

			<!-- Background surprise -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_engineering_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_engineering_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					<p>{@html m.faq_engineering_a()}</p>
				</div>
			</div>

			<!-- Fun facts -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_weird_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_weird_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					{@html m.faq_weird_a()}
				</div>
			</div>

			<!-- Legal disclaimer joke -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_funny_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_funny_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					<p>{@html m.faq_funny_a()}</p>
				</div>
			</div>

			<!-- Hills to die on -->
			<div class="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl">
				<input type="checkbox" aria-label={m.faq_hill_q()} />
				<div class="collapse-title font-medium text-primary min-h-[52px]">
					{m.faq_hill_q()}
				</div>
				<div class="collapse-content text-base-content/70">
					<p>{@html m.faq_hill_a()}</p>
				</div>
			</div>
		</div>

		<p class="text-center mt-8 text-sm text-base-content/70">
			{m.faq_corporate_joke()} <button onclick={() => goto('/corporate')} class="btn btn-error text-error-content gap-2">{m.faq_corporate_link()}</button>
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
