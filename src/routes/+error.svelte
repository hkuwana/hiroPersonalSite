<script>
	// @ts-nocheck

	import { page } from '$app/state';
</script>

<div class="grid min-h-screen justify-center">
	<h1>{page.status}: {page.error.message}</h1>
	<a href="/" class="btn btn-primary">Go back</a>
</div>
