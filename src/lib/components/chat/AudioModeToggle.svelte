<script lang="ts">
	import type { AudioMode } from '$lib/stores/conversation.svelte';

	// Props
	interface Props {
		mode: AudioMode;
		disabled?: boolean;
		onToggle?: (mode: AudioMode) => void;
	}

	let { mode, disabled = false, onToggle }: Props = $props();

	// Derived
	const isPTTMode = $derived(mode === 'ptt');
	const isVADMode = $derived(mode === 'vad');

	function handleToggle() {
		if (disabled) return;
		const newMode: AudioMode = mode === 'ptt' ? 'vad' : 'ptt';
		onToggle?.(newMode);
	}
</script>

<button
	class="audio-mode-toggle"
	class:ptt-active={isPTTMode}
	class:vad-active={isVADMode}
	class:disabled
	onclick={handleToggle}
	{disabled}
	aria-label={`Switch to ${isPTTMode ? 'voice activity detection' : 'push to talk'} mode`}
	title={isPTTMode ? 'Switch to Voice Detection' : 'Switch to Push-to-Talk'}
>
	<span class="toggle-option" class:active={isPTTMode}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<!-- Hand/Touch icon for PTT -->
			<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
			<path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
			<path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
			<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
		</svg>
		<span class="label">Push to Talk</span>
	</span>

	<span class="toggle-option" class:active={isVADMode}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<!-- Waveform/Auto icon for VAD -->
			<path d="M2 12h2" />
			<path d="M6 8v8" />
			<path d="M10 5v14" />
			<path d="M14 8v8" />
			<path d="M18 10v4" />
			<path d="M22 12h-2" />
		</svg>
		<span class="label">Voice Detection</span>
	</span>
</button>

<style>
	.audio-mode-toggle {
		display: flex;
		align-items: center;
		gap: 0;
		padding: 0.25rem;
		background: var(--color-bg-muted, #f5f5f7);
		border: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.audio-mode-toggle:hover:not(:disabled) {
		background: var(--color-bg-subtle, #e8e8ed);
	}

	.audio-mode-toggle.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-option {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		color: var(--color-text-secondary, #6e6e73);
		transition: all 0.2s ease;
	}

	.toggle-option.active {
		background: white;
		color: var(--color-text, #1d1d1f);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.toggle-option svg {
		width: 16px;
		height: 16px;
	}

	.toggle-option .label {
		font-size: 0.8125rem;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Hide labels on small screens */
	@media (max-width: 640px) {
		.toggle-option .label {
			display: none;
		}

		.toggle-option {
			padding: 0.5rem;
		}
	}
</style>
