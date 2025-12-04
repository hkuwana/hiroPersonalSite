<script>
	import { page } from '$app/state';
	import Socials from '$lib/components/socials.svelte';
</script>

<header>
	<div class="grid pt-9">
		<nav class="mb-4 flex justify-center gap-6">
			<a href="/" class="nav-link">Home</a>
			<a href="/essays" class="nav-link">Essays</a>
		</nav>
		<div class="mb-9 flex justify-center">
			<Socials />
		</div>
	</div>
</header>

<style>
	.nav-link {
		color: #666;
		text-decoration: none;
		font-size: 0.95rem;
		font-family: Georgia, 'Times New Roman', serif;
	}

	.nav-link:hover {
		color: #333;
	}
</style>
