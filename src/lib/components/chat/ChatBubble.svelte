<script lang="ts">
	import type { Message } from '$lib/stores/conversation.svelte';
	import { formatDuration } from '$lib/utils/audio';

	// Props
	interface Props {
		message: Message;
		showTimestamp?: boolean;
		onPlayAudio?: (audioUrl: string) => void;
	}

	let { message, showTimestamp = true, onPlayAudio }: Props = $props();

	// State
	let isPlaying = $state(false);
	let audioEl: HTMLAudioElement | null = null;

	// Derived
	const isUser = $derived(message.role === 'user');
	const isAssistant = $derived(message.role === 'assistant');
	const isAudioMessage = $derived(message.type === 'audio');
	const isStreaming = $derived(message.status === 'streaming');
	const isSending = $derived(message.status === 'sending');
	const hasError = $derived(message.status === 'error');
	const formattedTime = $derived(
		message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);

	function toggleAudioPlayback() {
		if (!message.audioUrl) return;

		if (isPlaying && audioEl) {
			audioEl.pause();
			audioEl.currentTime = 0;
			isPlaying = false;
		} else {
			onPlayAudio?.(message.audioUrl);
			// Create and play audio
			audioEl = new Audio(message.audioUrl);
			audioEl.onplay = () => (isPlaying = true);
			audioEl.onended = () => (isPlaying = false);
			audioEl.onpause = () => (isPlaying = false);
			audioEl.play();
		}
	}
</script>

<div class="chat-bubble" class:user={isUser} class:assistant={isAssistant} class:error={hasError}>
	<div class="bubble-content">
		{#if isAudioMessage && message.audioUrl}
			<!-- Audio Message -->
			<button class="audio-player" onclick={toggleAudioPlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>
				<span class="play-icon">
					{#if isPlaying}
						<svg viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="4" width="4" height="16" rx="1" />
							<rect x="14" y="4" width="4" height="16" rx="1" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" fill="currentColor">
							<polygon points="5 3 19 12 5 21 5 3" />
						</svg>
					{/if}
				</span>
				<span class="audio-waveform">
					{#each Array(12) as _, i}
						<span
							class="wave-bar"
							class:playing={isPlaying}
							style="animation-delay: {i * 0.05}s"
						></span>
					{/each}
				</span>
				{#if message.audioDuration}
					<span class="audio-duration">{formatDuration(message.audioDuration)}</span>
				{/if}
			</button>
			{#if message.content}
				<p class="transcript">{message.content}</p>
			{/if}
		{:else}
			<!-- Text Message -->
			<p class="text-content">
				{message.content}
				{#if isStreaming}
					<span class="typing-cursor"></span>
				{/if}
			</p>
		{/if}
	</div>

	<!-- Message Meta -->
	<div class="bubble-meta">
		{#if showTimestamp}
			<span class="timestamp">{formattedTime}</span>
		{/if}
		{#if isSending}
			<span class="status sending">Sending...</span>
		{:else if hasError}
			<span class="status error">Failed to send</span>
		{/if}
	</div>
</div>

<style>
	.chat-bubble {
		display: flex;
		flex-direction: column;
		max-width: 80%;
		gap: 0.25rem;
		animation: slide-in 0.3s ease-out;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.chat-bubble.user {
		align-self: flex-end;
		align-items: flex-end;
	}

	.chat-bubble.assistant {
		align-self: flex-start;
		align-items: flex-start;
	}

	.bubble-content {
		padding: 0.875rem 1rem;
		border-radius: 1.25rem;
		word-wrap: break-word;
	}

	.chat-bubble.user .bubble-content {
		background: var(--color-accent, #0071e3);
		color: white;
		border-bottom-right-radius: 0.25rem;
	}

	.chat-bubble.assistant .bubble-content {
		background: var(--color-bg-muted, #f5f5f7);
		color: var(--color-text, #1d1d1f);
		border-bottom-left-radius: 0.25rem;
	}

	.chat-bubble.error .bubble-content {
		background: #fef2f2;
		border: 1px solid #fecaca;
	}

	/* Text Content */
	.text-content {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	/* Typing Cursor */
	.typing-cursor {
		display: inline-block;
		width: 2px;
		height: 1em;
		background: currentColor;
		margin-left: 2px;
		vertical-align: text-bottom;
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	/* Audio Player */
	.audio-player {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		width: 100%;
	}

	.play-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		flex-shrink: 0;
	}

	.chat-bubble.assistant .play-icon {
		background: rgba(0, 0, 0, 0.05);
	}

	.play-icon svg {
		width: 16px;
		height: 16px;
	}

	/* Audio Waveform */
	.audio-waveform {
		display: flex;
		align-items: center;
		gap: 2px;
		height: 24px;
		flex: 1;
	}

	.wave-bar {
		width: 3px;
		height: 8px;
		background: currentColor;
		border-radius: 1px;
		opacity: 0.4;
	}

	.wave-bar.playing {
		animation: wave 0.6s ease-in-out infinite;
	}

	@keyframes wave {
		0%,
		100% {
			height: 8px;
		}
		50% {
			height: 20px;
		}
	}

	.audio-duration {
		font-size: 0.75rem;
		opacity: 0.8;
		flex-shrink: 0;
	}

	/* Transcript */
	.transcript {
		margin: 0.5rem 0 0;
		font-size: 0.8125rem;
		opacity: 0.8;
		font-style: italic;
	}

	/* Meta */
	.bubble-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0.25rem;
	}

	.timestamp {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary, #86868b);
	}

	.status {
		font-size: 0.6875rem;
	}

	.status.sending {
		color: var(--color-text-tertiary, #86868b);
	}

	.status.error {
		color: #ef4444;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.chat-bubble {
			max-width: 90%;
		}

		.bubble-content {
			padding: 0.75rem 0.875rem;
		}
	}
</style>
