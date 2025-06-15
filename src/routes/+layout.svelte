<script>
	import Header from '../lib/components/header.svelte';
	import '../style.css';
	let { children } = $props();
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-orange-50">
	<Header />

	{@render children()}

	<footer class="footer footer-center bg-secondary text-base-content p-4">
		<div>
			<p>Copyright © 2025 - All right reserved by Hiro Kuwana</p>
		</div>
	</footer>
</div>
