<script lang="ts">
	import { ChatContainer } from '$lib/components/chat';
	import { createConversationStore } from '$lib/stores/conversation.svelte';

	// Create a conversation store for this page
	const conversation = createConversationStore({
		defaultInputMode: 'text',
		defaultAudioMode: 'ptt',
		vadSensitivity: 0.3,
		vadSilenceTimeout: 1500
	});

	// Demo: Simulate responses (replace with actual API integration)
	function handleSend(message: { content: string; type: 'text' | 'audio' }) {
		console.log('Message sent:', message);

		// Simulate a response after a delay
		setTimeout(() => {
			const responses = [
				"That's interesting! Tell me more.",
				"I understand. How can I help you with that?",
				"Great question! Let me think about that.",
				"Thanks for sharing. Is there anything specific you'd like to know?",
				"I'm here to help. What else would you like to discuss?"
			];
			const randomResponse = responses[Math.floor(Math.random() * responses.length)];
			conversation.addAssistantMessage(randomResponse);
		}, 1000);
	}
</script>

<svelte:head>
	<title>Chat - Hiro Kuwana</title>
	<meta name="description" content="Have a conversation with AI" />
</svelte:head>

<div class="chat-page">
	<header class="chat-header">
		<a href="/" class="back-link">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="15 18 9 12 15 6" />
			</svg>
			Back
		</a>
		<h1>Chat</h1>
		<div class="header-spacer"></div>
	</header>

	<main class="chat-main">
		<ChatContainer
			store={conversation}
			defaultInputMode="text"
			defaultAudioMode="ptt"
			enableRealtime={false}
			showConnectionStatus={false}
			onSend={handleSend}
		/>
	</main>

	<aside class="chat-info">
		<div class="info-card">
			<h2>Input Modes</h2>
			<ul>
				<li><strong>Text:</strong> Type your message and press Enter or click Send</li>
				<li><strong>Audio:</strong> Use your microphone to record voice messages</li>
			</ul>
		</div>

		<div class="info-card">
			<h2>Audio Modes</h2>
			<ul>
				<li>
					<strong>Push to Talk:</strong> Hold the button (or spacebar) while speaking, release to send
				</li>
				<li>
					<strong>Voice Detection:</strong> Automatically detects when you start and stop speaking
				</li>
			</ul>
		</div>
	</aside>
</div>

<style>
	.chat-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--color-bg, #ffffff);
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
		background: var(--color-bg, #ffffff);
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--color-accent, #0071e3);
		text-decoration: none;
		font-size: 0.9375rem;
		transition: opacity 0.2s ease;
	}

	.back-link:hover {
		opacity: 0.8;
	}

	.back-link svg {
		width: 20px;
		height: 20px;
	}

	.chat-header h1 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text, #1d1d1f);
	}

	.header-spacer {
		width: 60px;
	}

	.chat-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 800px;
		width: 100%;
		margin: 0 auto;
		height: calc(100vh - 200px);
	}

	.chat-info {
		display: none;
		padding: 1.5rem;
		border-top: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
		background: var(--color-bg-subtle, #f5f5f7);
	}

	.info-card {
		background: var(--color-bg, #ffffff);
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.info-card:last-child {
		margin-bottom: 0;
	}

	.info-card h2 {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
		color: var(--color-text, #1d1d1f);
	}

	.info-card ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.8125rem;
		color: var(--color-text-secondary, #6e6e73);
		line-height: 1.6;
	}

	.info-card li {
		margin-bottom: 0.5rem;
	}

	.info-card li:last-child {
		margin-bottom: 0;
	}

	.info-card strong {
		color: var(--color-text, #1d1d1f);
	}

	/* Show info panel on larger screens */
	@media (min-width: 1024px) {
		.chat-page {
			flex-direction: row;
		}

		.chat-header {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10;
		}

		.chat-main {
			flex: 1;
			padding-top: 60px;
			height: 100vh;
		}

		.chat-info {
			display: block;
			width: 300px;
			padding-top: 80px;
			border-top: none;
			border-left: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
			height: 100vh;
			overflow-y: auto;
		}
	}
</style>
