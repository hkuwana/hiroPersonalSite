<script lang="ts">
	// Props
	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		maxLength?: number;
		onSubmit?: (value: string) => void;
		onInput?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Type a message...',
		disabled = false,
		maxLength = 4000,
		onSubmit,
		onInput
	}: Props = $props();

	// State
	let textareaEl: HTMLTextAreaElement | null = null;

	// Derived
	const isEmpty = $derived(!value.trim());
	const characterCount = $derived(value.length);
	const isNearLimit = $derived(characterCount > maxLength * 0.9);

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
		onInput?.(value);
		autoResize();
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Submit on Enter (without Shift)
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submit();
		}
	}

	function submit() {
		if (isEmpty || disabled) return;

		const trimmed = value.trim();
		onSubmit?.(trimmed);
		value = '';
		resetHeight();
	}

	function autoResize() {
		if (!textareaEl) return;
		// Reset height to calculate new scrollHeight
		textareaEl.style.height = 'auto';
		// Set to scrollHeight (capped at max)
		const maxHeight = 200;
		textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, maxHeight)}px`;
	}

	function resetHeight() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
	}

	// Focus method for parent components
	export function focus() {
		textareaEl?.focus();
	}
</script>

<div class="text-input" class:disabled>
	<div class="input-wrapper">
		<textarea
			bind:this={textareaEl}
			{value}
			{placeholder}
			{disabled}
			maxlength={maxLength}
			rows="1"
			oninput={handleInput}
			onkeydown={handleKeyDown}
			aria-label="Message input"
		></textarea>

		<button
			class="send-button"
			onclick={submit}
			disabled={isEmpty || disabled}
			aria-label="Send message"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="22" y1="2" x2="11" y2="13" />
				<polygon points="22 2 15 22 11 13 2 9 22 2" />
			</svg>
		</button>
	</div>

	{#if isNearLimit}
		<div class="character-count" class:over-limit={characterCount >= maxLength}>
			{characterCount}/{maxLength}
		</div>
	{/if}
</div>

<style>
	.text-input {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	.text-input.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.input-wrapper {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--color-bg-muted, #f5f5f7);
		border-radius: 1.5rem;
		border: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
		transition: all 0.2s ease;
	}

	.input-wrapper:focus-within {
		border-color: var(--color-accent, #0071e3);
		box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
	}

	textarea {
		flex: 1;
		min-height: 24px;
		max-height: 200px;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-text, #1d1d1f);
		font-family: inherit;
		font-size: 1rem;
		line-height: 1.5;
		resize: none;
		outline: none;
	}

	textarea::placeholder {
		color: var(--color-text-tertiary, #86868b);
	}

	.send-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--color-accent, #0071e3);
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.send-button:hover:not(:disabled) {
		background: var(--color-accent-hover, #0077ed);
		transform: scale(1.05);
	}

	.send-button:active:not(:disabled) {
		transform: scale(0.95);
	}

	.send-button:disabled {
		background: var(--color-text-tertiary, #86868b);
		cursor: not-allowed;
		opacity: 0.5;
	}

	.send-button svg {
		width: 18px;
		height: 18px;
	}

	.character-count {
		font-size: 0.75rem;
		color: var(--color-text-tertiary, #86868b);
		text-align: right;
		padding-right: 0.5rem;
	}

	.character-count.over-limit {
		color: #ef4444;
	}
</style>
