<script lang="ts">
	import type { InputMode } from '$lib/stores/conversation.svelte';

	// Props
	interface Props {
		mode: InputMode;
		disabled?: boolean;
		onToggle?: (mode: InputMode) => void;
	}

	let { mode, disabled = false, onToggle }: Props = $props();

	// Derived
	const isTextMode = $derived(mode === 'text');
	const isAudioMode = $derived(mode === 'audio');

	function handleToggle() {
		if (disabled) return;
		const newMode: InputMode = mode === 'text' ? 'audio' : 'text';
		onToggle?.(newMode);
	}
</script>

<button
	class="input-mode-toggle"
	class:text-active={isTextMode}
	class:audio-active={isAudioMode}
	class:disabled
	onclick={handleToggle}
	{disabled}
	aria-label={`Switch to ${isTextMode ? 'audio' : 'text'} input`}
>
	<span class="toggle-option" class:active={isTextMode}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
			<polyline points="22,6 12,13 2,6" />
		</svg>
		<span class="label">Text</span>
	</span>

	<span class="toggle-option" class:active={isAudioMode}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
			<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
			<line x1="12" y1="19" x2="12" y2="23" />
			<line x1="8" y1="23" x2="16" y2="23" />
		</svg>
		<span class="label">Audio</span>
	</span>
</button>

<style>
	.input-mode-toggle {
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

	.input-mode-toggle:hover:not(:disabled) {
		background: var(--color-bg-subtle, #e8e8ed);
	}

	.input-mode-toggle.disabled {
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
	}

	/* Hide labels on small screens */
	@media (max-width: 480px) {
		.toggle-option .label {
			display: none;
		}

		.toggle-option {
			padding: 0.5rem;
		}
	}
</style>
