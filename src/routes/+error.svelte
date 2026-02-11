<script lang="ts">
	import { page } from '$app/state';

	let clickCount = 0;
	let buttonText = 'This button does nothing';

	function handleUselessClick() {
		clickCount++;
		const messages = [
			'Told you.',
			'Still nothing.',
			'You\'re persistent.',
			'I admire your dedication.',
			'Okay this is getting weird.',
			'Fine. Here\'s a cookie: 🍪',
			'That was the cookie. It\'s gone now.',
			'Why are you still clicking?',
			'Go home. Use the link above.',
			'I\'m running out of messages.',
			'...',
			'You win. I have nothing left.',
		];
		buttonText = messages[Math.min(clickCount - 1, messages.length - 1)];
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-8 bg-base-100">
	<div class="text-center max-w-md">
		<h1 class="text-8xl font-bold text-base-content/20 mb-4">{page.status}</h1>
		<h2 class="text-2xl font-semibold mb-4">Nothing to see here</h2>
		<p class="text-base-content/70 mb-8">
			While you reflect on the life choices that led you here, you could click Home (top left) or...
		</p>

		<div class="space-y-4">
			<a href="/" class="btn btn-primary btn-wide">
				Take me home
			</a>

			<div>
				<button
					class="btn btn-ghost btn-sm text-base-content/50"
					onclick={handleUselessClick}
				>
					{buttonText}
				</button>
			</div>
		</div>

		{#if clickCount >= 6}
			<p class="text-xs text-base-content/30 mt-12">
				Seriously though, thanks for visiting. Even the 404 page.
			</p>
		{/if}
	</div>
</div>
