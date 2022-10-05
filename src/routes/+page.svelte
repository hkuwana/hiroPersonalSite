<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="Hiro Kuwana" content="Hir" />
</svelte:head>

<section>
	<div class="min-h-screen grid gap-4 content-center">
		<h1>
			<div class="avatar">
				<div class="w-60 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
					<img src={hiroProfile} alt="Hiro's face" />
				</div>
			</div>
		</h1>
		<a class="btn btn-outline btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg" href="/about"
			>Current Project</a
		>

		<a href="/about" class="btn btn-outline btn-secondary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
			>Japan consultation</a
		>
		<a href="/blog" class="btn btn-outline btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg">Blog</a
		>
		<a href="/resume" class="btn btn-outline btn-secondary btn-xs sm:btn-sm md:btn-md lg:btn-lg"
			>Bio</a
		>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
