<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';

	const beehiivMagicLink =
		'https://magic.beehiiv.com/v1/158c8333-ef4a-4a74-b5e1-9cac1aac57e3?email={{email}}';
	function submit() {
		console.log('submitted!');
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="Hiro Kuwana" content="Hiro Kuwana's personal site" />
</svelte:head>

<section>
	<div class="min-h-screen flex flex-col items-center gap-4">
		<h1 class="text-center">
			<div class="avatar">
				<div class="w-60 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
					<img src={hiroProfile} alt="Hiro's face" />
				</div>
			</div>
		</h1>
		<h1 class="sm:text-3xl text-zinc-900 text-center font-bold">Hiroyuki (Hiro) Kuwana</h1>
		<h1 class="sm:text-2xl text-stone-700 text-center font-bold">桑名　浩行</h1>
		<a
			href="#Current_Project"
			class="btn btn-outline btn-secondary btn-xs sm:btn-sm md:btn-md lg:btn-lg">Current Project</a
		>
		<a href="#past_project_1" class="btn btn-outline btn-xs sm:btn-sm md:btn-md lg:btn-lg"
			>Past Project</a
		>
		<a
			href="https://cal.com/hiro-flybyrd/15min"
			target="_blank"
			class="btn btn-outline btn-secondary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
			>Consultation Session</a
		>
		<a href="#Bio" class="btn btn-outline btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg">Bio</a>
	</div>
	<div class="hero min-h-screen bg-green-200" id="current_project">
		<div class="hero-content flex-col lg:flex-row">
			<div class="avatar">
				<div class="sm:w-72 w-48 rounded-xl">
					<img src="/flybyrd_logo.png" class="max-w-sm rounded-lg shadow-2xl" alt="Pebblr logo" />
				</div>
			</div>

			<div>
				<h1 class="text-5xl font-bold text-accent">Flybyrd</h1>
				<p class="sm:text-xl font-semibold py-6">
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
			<div class="avatar mb-6 lg:mb-0 lg:mr-8">
				<div class="w-48 sm:w-72 rounded-xl">
					<img src="/kaiwa_logo.png" class="rounded-lg shadow-2xl" alt="Kaiwa logo" />
				</div>
			</div>

			<div class="text-center lg:text-left">
				<h1 class="text-4xl sm:text-5xl font-bold text-accent">Kaiwa</h1>
				<p class="text-lg sm:text-xl font-semibold py-6">
					Kaiwa helps you practice languages through bite-sized AI conversations. See your friends'
					streaks, get real-time translations, and improve daily from just 30-second sessions.
					Making language learning fun, social, and achievable for everyone.
				</p>
				<a
					href="https://www.kaiwa.ai/"
					class="btn btn-secondary mt-4 sm:btn-sm md:btn-md lg:btn-lg"
					title="Check out Kaiwa">Go to Kaiwa</a
				>
			</div>
		</div>
	</div>
	<div class="hero min-h-screen bg-green-200" id="past_project_2">
		<div class="hero-content flex-col lg:flex-row">
			<div class="avatar">
				<div class="w-48 sm:w-72 rounded-xl">
					<img src="/icon-512x512.png" class="rounded-lg shadow-2xl" alt="Pebblr logo" />
				</div>
			</div>

			<div class="lg:ml-8 text-center lg:text-left">
				<h1 class="text-4xl lg:text-5xl font-bold text-accent">Pebblr</h1>
				<p class="sm:text-xl font-medium py-4">
					Pebblr aimed to connect nonprofits with younger donors and foster collaboration. However,
					the rise of GPT technologies offered more efficient and scalable solutions, leading to
					Pebblr's closure.
				</p>
				<a href="https://www.pebblr.org/" class="btn btn-primary mt-4" title="Check out Pebblr"
					>Visit Pebblr</a
				>
			</div>
		</div>
	</div>

	<div class="hero min-h-screen" id="Bio">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<div class="md:px-8 font-semibold text-center lg:text-left">
				<h1 class="text-4xl sm:text-5xl font-bold">Bridging Cultures Through Technology</h1>
				<p class="pt-6 sm:text-lg">
					<strong>Born in Japan, raised in the U.S.</strong>, Hiro Kuwana brings a global
					perspective to tech entrepreneurship. As Co-founder of Flybyrd, he transforms user
					feedback into actionable insights for B2C companies.
				</p>

				<p class="pt-6 sm:text-lg">
					With experience across <strong>Spain, Estonia, Japan, and the U.S.</strong> and a background
					in Environmental Engineering from Brown University, Hiro's diverse journey fuels his passion
					for innovation.
				</p>

				<p class="pt-6 sm:text-lg">
					Hiro's mission is to <strong>build tools that empower businesses</strong> to turn user needs
					into effective solutions, enhancing product creation and development.
				</p>

				<p class="pt-6 sm:text-lg">
					Through his newsletter, Hiro is <strong>demystifying Japanese innovation</strong> and bridging
					Eastern and Western approaches to technology.
				</p>
				<a href={beehiivMagicLink} class="btn btn-primary mt-6">Subscribe to Newsletter</a>
			</div>
		</div>
	</div>
</section>
