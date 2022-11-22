<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';

	function submit() {
		console.log('submitted!');
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="Hiro Kuwana" content="Hiro Kuwana's personal site" />
</svelte:head>

<section>
	<div class="min-h-screen grid gap-4 content-center justify-center">
		<h1 class="text-center">
			<div class="avatar  ">
				<div class="w-60 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 ">
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
		<a
			href="#Consultiation_session"
			class="btn btn-outline btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
			>Consultation Session</a
		>
		<a href="#Bio" class="btn btn-outline btn-secondary btn-xs sm:btn-sm md:btn-md lg:btn-lg">Bio</a
		>

		<a href="/blog" class="btn btn-outline btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg">Blog</a
		>
	</div>
	<div class="hero min-h-screen bg-green-200" id="Current_Project">
		<div class="hero-content flex-col lg:flex-row">
			<div class="avatar">
				<div class="sm:w-72 w-48 rounded-xl">
					<img src="/icon-512x512.png" class="max-w-sm rounded-lg shadow-2xl" alt="Pebblr logo" />
				</div>
			</div>

			<div>
				<h1 class="text-5xl font-bold text-accent">Pebblr</h1>
				<p class="sm:text-xl font-semibold py-6">
					Pebblr is focused on connecting nonprofits with younger donors. The hope is to expand this
					into volunteers, connect nonprofits with each other and create an ecosystem where all
					altruistic people can connect with one another.
				</p>
				<a
					href="https://www.pebblr.org/"
					class="btn btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
					title="Check out Pebblr">Go to Pebblr</a
				>
			</div>
		</div>
	</div>
	<div class="hero min-h-screen" id="Current_Project">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<div class="text-center lg:text-left ">
				<p class="text-5xl font-bold sm:text-4xl">Response within 48 hours!</p>
				<div class="font-semibold">
					<p class="py-6">
						Interested in doing business in Japan? Need help planning an itinerary in the country?
						Any other aspects bridging both cultures?
					</p>
					<p>Please explain your needs and goals below to let us know!</p>
					<p>
						Afterwards, Hiro will reach out to schedule a consultation call and discuss next steps!
					</p>
				</div>
			</div>
			<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
				<div class="card-body">
					<form action="">
						<fieldset class="">
							<span class=" font-semibold label-text">First Name: *</span>
							<label class="label">
								<input
									class="input input-bordered"
									type="text"
									for="firstName"
									placeholder="First Name"
								/>
							</label>
						</fieldset>
						<fieldset class="form-control">
							<span class="font-semibold label-text">Last Name: *</span>
							<label class="label">
								<input
									class="input input-bordered"
									type="text"
									for="lastName"
									placeholder="Last Name"
								/>
							</label>
						</fieldset>
						<fieldset class="form-control">
							<span class="font-semibold label-text">Email: *</span>
							<label class="label">
								<input class="input input-bordered" type="text" for="email" placeholder="Email" />
							</label>
						</fieldset>

						<fieldset class=" form-control">
							<span class="font-semibold"
								>Please select which service(s) you are interested in: *</span
							>
							<label class="label cursor-pointer">
								<span class="label-text">Japan Business Consulting</span>
								<input
									type="radio"
									name="interests"
									class="radio checked:bg-primary"
									checked
									required
								/>
							</label>
							<label class="label cursor-pointer">
								<span class="label-text">Japan Travel Consulting</span>
								<input type="radio" name="interests" class="radio checked:bg-primary" />
							</label>
							<label class="label cursor-pointer">
								<span class="label-text">Japanese learning Consulting</span>
								<input type="radio" name="interests" class="radio checked:bg-primary" />
							</label>
							<label class="label cursor-pointer">
								<span class="label-text">Web Development Consulting</span>
								<input type="radio" name="interests" class="radio checked:bg-primary" />
							</label>
						</fieldset>
						<fieldset class="form-control">
							<span class="font-semibold">How did you hear about Hiro?* </span>
							<label class="label cursor-pointer">
								<span class="label-text">Tik Tok</span>
								<input type="radio" name="radio-6" class="radio checked:bg-secondary" checked />
							</label>
							<label class="label cursor-pointer">
								<span class="label-text">Quora</span>
								<input type="radio" name="radio-6" class="radio checked:bg-secondary" checked />
							</label>
							<label class="label cursor-pointer">
								<span class="label-text">Friend</span>
								<input type="radio" name="radio-6" class="radio checked:bg-secondary" checked />
							</label>
							<label class="label cursor-pointer">
								<span class="label-text">Other</span>
								<input type="radio" name="radio-6" class="radio checked:bg-secondary" checked />
							</label>
						</fieldset>
						<div class="form-control" />
						<fieldset>
							<span class="label-text">Your message</span>
							<label class="label">
								<textarea
									class="textarea textarea-bordered textarea-secondary h-24"
									placeholder="What can Hiro help you solve?"
								/>
							</label>
						</fieldset>
						<div class="form-control mt-6">
							<button on:click|preventDefault={submit} type="submit" class="btn btn-primary"
								>Send</button
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	<div class="hero min-h-screen bg-green-200" id="Bio">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl" />
			<div class="font-semibold">
				<h1 class="text-5xl font-bold">Born in Japan, raised in the US.</h1>
				<p class="py-6">
					Hiro Kuwana graduated Brown University with a degree in Environmental Engineering. He has
					previously worked in Tokyo at a Japanese Venture Capital firm, Sunbridge, researching on
					US Software as a Service (SAAS) companies entering into the Japanese market, identifying
					key points of success and failures.
				</p>
				He also developed an internal wallet for developers in a Japanese-Estonian blockchain company.
				Through both experiences, he has been able to understand the Japanese market and come to appreciate
				the nuances of emerging Japanese companies.
				<p />
			</div>
		</div>
	</div>
</section>
