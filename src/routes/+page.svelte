<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';
	import { base } from '$app/paths';

	const calLink = 'https://cal.com/hirokuwana/15min';
	function submit() {
		console.log('submitted!');
	}
</script>

<svelte:head>
	<title>Hiro Kuwana - AI Entrepreneur & Founder | Democratizing Education Through Technology</title
	>
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

<section>
	<div class="flex min-h-screen flex-col items-center gap-4">
		<h1 class="text-center">
			<div class="avatar">
				<div class="ring-primary ring-offset-base-100 w-60 rounded-full ring ring-offset-2">
					<img src={hiroProfile} alt="Hiro's face" />
				</div>
			</div>
		</h1>
		<h1 class="text-center font-bold text-zinc-900 sm:text-3xl">Hiro (Hiro) Kuwana</h1>
		<h1 class="text-center font-bold text-stone-700 sm:text-2xl">桑名　浩行</h1>

		<a
			href={calLink}
			target="_blank"
			class="btn btn-outline btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
			>Consultation Session</a
		>
	</div>
	<div class="hero min-h-screen bg-green-200" id="current_project">
		<div class="hero-content flex-col lg:flex-row">
			<div class="avatar">
				<div class="w-48 rounded-xl sm:w-72">
					<img
						src={`${base}/flybyrd_logo.png`}
						class="max-w-sm rounded-lg shadow-2xl"
						alt="Flybyrd logo"
					/>
				</div>
			</div>

			<div>
				<h1 class="text-accent text-5xl font-bold">Flybyrd</h1>
				<p class="py-6 font-semibold sm:text-xl">
					Flybyrd is an AI-powered assistant that helps VCs analyze startup deals, screen founders,
					and streamline the investment process. We're building the future of automated VC deal flow
					analysis to make investment decisions faster and more data-driven.
				</p>
				<a
					href="https://www.flybyrd.io"
					class="btn btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
					title="Check out Flybyrd">Visit Flybyrd</a
				>
			</div>
		</div>
	</div>
	<div class="hero min-h-screen" id="past_project_1">
		<div class="hero-content flex-col lg:flex-row">
			<div class="avatar mb-6 lg:mr-8 lg:mb-0">
				<div class="w-48 rounded-xl sm:w-72">
					<img src={`${base}/kaiwa_logo.png`} class="rounded-lg shadow-2xl" alt="Kaiwa logo" />
				</div>
			</div>

			<div class="text-center lg:text-left">
				<h1 class="text-accent text-4xl font-bold sm:text-5xl">Kaiwa</h1>
				<p class="py-6 text-lg font-semibold sm:text-xl">
					Kaiwa helps you practice languages through bite-sized AI conversations. See your friends'
					streaks, get real-time translations, and improve daily through just 30-second sessions.
					Making language learning fun, social, and achievable for everyone.
				</p>
				<a
					href="https://www.trykaiwa.com/"
					class="btn btn-secondary sm:btn-sm md:btn-md lg:btn-lg mt-4"
					title="Check out Kaiwa">Go to Kaiwa</a
				>
			</div>
		</div>
	</div>
	<div class="hero min-h-screen bg-green-200" id="past_project_2">
		<div class="hero-content flex-col lg:flex-row">
			<div class="avatar">
				<div class="w-48 rounded-xl sm:w-72">
					<img src={`${base}/icon-512x512.png`} class="rounded-lg shadow-2xl" alt="Pebblr logo" />
				</div>
			</div>

			<div class="text-center lg:ml-8 lg:text-left">
				<h1 class="text-accent text-4xl font-bold lg:text-5xl">Pebblr</h1>
				<p class="py-4 font-medium sm:text-xl">
					Pebblr aimed to connect nonprofits with younger donors and foster collaboration. However,
					the rise of GPT technologies offered more efficient and scalable solutions, leading to
					Pebblr's closure.
				</p>
			</div>
		</div>
	</div>

	<div class="hero bg-base-200 min-h-screen" id="Bio">
		<div class="hero-content text-center">
			<div class="flex flex-col gap-y-4 text-center font-semibold md:px-8 lg:text-left">
				<h1 class="text-4xl font-bold sm:text-5xl">Bridging Cultures Through Technology</h1>
				<p class="text-lg leading-relaxed">
					<strong>Born in Japan and raised in the U.S.</strong>, Hiro Kuwana brings a global
					perspective to tech entrepreneurship. As founder of Flybyrd, he creates specialized AI
					agents for venture capitalists to discover startups that align with their investment
					criteria.
				</p>

				<p class="text-lg leading-relaxed">
					With experience across <strong>Spain, Estonia, Japan, and the U.S.</strong> and a
					background in Environmental Engineering from Brown University, Hiro's diverse journey has
					shaped his conviction that <strong>AI should be humanity's great equalizer</strong>—making
					premium education and sophisticated tools accessible to everyone, not just the wealthy.
				</p>

				<p class="text-lg leading-relaxed">
					Hiro's mission is to ensure that AI assistants and tutors that were once available to only
					a fraction of people become accessible to everyone—to make AI "the glider for everyone's
					mind."
				</p>

				<a href={calLink} class="btn btn-primary mt-6">Schedule a call</a>
			</div>
		</div>
	</div>
</section>
