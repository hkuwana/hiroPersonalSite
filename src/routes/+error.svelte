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

<div class="err-page">
	<div class="err-card">
		<h1 class="err-status">{page.status}<span class="err-seal">浩</span></h1>
		<h2>Nothing to see here</h2>
		<p class="err-lede">
			While you reflect on the life choices that led you here, you could click Home (top left) or...
		</p>

		<div class="err-actions">
			<a href="/" class="err-home">Take me home</a>
			<button type="button" class="err-useless" onclick={handleUselessClick}>
				{buttonText}
			</button>
		</div>

		{#if clickCount >= 6}
			<p class="err-ps">Seriously though, thanks for visiting. Even the 404 page.</p>
		{/if}
	</div>
</div>

<style>
	.err-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: var(--paper);
		color: var(--ink);
	}

	.err-card {
		text-align: center;
		max-width: 28rem;
	}

	.err-status {
		font-family: var(--f-display);
		font-size: clamp(5rem, 18vw, 8rem);
		font-weight: 500;
		line-height: 1;
		margin: 0 0 1rem;
		color: var(--ink);
		opacity: 0.18;
		display: inline-flex;
		align-items: baseline;
		gap: 0.15em;
	}

	.err-seal {
		font-family: var(--f-jp);
		font-size: 0.22em;
		background: var(--shu);
		color: #fff7ed;
		padding: 0.1em 0.3em;
		border-radius: 2px;
		opacity: 1;
	}

	h2 {
		font-family: var(--f-display);
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1rem;
	}

	.err-lede {
		font-family: var(--f-body);
		color: var(--ink-soft);
		line-height: 1.6;
		margin: 0 0 2rem;
	}

	.err-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.err-home {
		display: inline-block;
		background: var(--ink);
		color: var(--paper);
		font-family: var(--f-mono);
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		padding: 0.85rem 2.5rem;
		border-radius: 2px;
		transition: background var(--duration-normal) var(--ease-out-quart);
	}

	.err-home:hover {
		background: var(--shu);
	}

	.err-useless {
		appearance: none;
		border: 0;
		background: transparent;
		cursor: pointer;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		color: var(--ink-mute);
		padding: 0.5rem 1rem;
		transition: color var(--duration-fast) ease;
	}

	.err-useless:hover {
		color: var(--ink-soft);
	}

	.err-ps {
		font-family: var(--f-body);
		font-style: italic;
		font-size: 0.75rem;
		color: var(--ink-mute);
		margin-top: 3rem;
	}
</style>
