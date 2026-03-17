<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	let visible = $state(false);

	onMount(() => {
		if (sessionStorage.getItem('languageChanged') === 'true') {
			sessionStorage.removeItem('languageChanged');
			visible = true;
			setTimeout(() => {
				visible = false;
			}, 3000);
		}
	});
</script>

{#if visible}
	<div class="toast toast-center toast-bottom z-[200]">
		<div class="alert alert-info shadow-lg">
			<span>{m.toast_language_changed()}</span>
		</div>
	</div>
{/if}
