<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<div class="avatar">
			<div class="w-24 rounded-xl">
				<img src={hiroProfile} alt="Welcome" />
			</div>
		</div>
		<div class="avatar">
			<div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
				<img src="https://placeimg.com/192/192/people" />
			</div>
		</div>
		<button class="btn btn-outline btn-info">Info</button>
		<button class="btn btn-outline btn-success">Success</button>
		<button class="btn btn-outline btn-warning">Warning</button>
		<button class="btn btn-outline btn-error">Error</button>
	</h1>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<Counter />
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
