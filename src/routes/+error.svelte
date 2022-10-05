<script>
	// @ts-nocheck

	import { page } from '$app/stores';
</script>

<div class="min-h-screen grid justify-center">
	<h1>{$page.status}: {$page.error.message}</h1>
	<a href="/" class="btn btn-primary">Go back</a>
</div>
