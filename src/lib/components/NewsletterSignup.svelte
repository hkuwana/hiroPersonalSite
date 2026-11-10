<script lang="ts">
	import { track } from '$lib/analytics';

	type Locale = 'en' | 'ja';
	type Status = 'idle' | 'sending' | 'ok' | 'error';

	let { lang = 'en', source }: { lang?: Locale; source: string } = $props();

	const COPY = {
		en: {
			label: 'Get new essays by email',
			micro: 'Email',
			placeholder: 'you@example.com',
			submit: 'Subscribe',
			sending: 'Sending…',
			ok: 'Thanks. You are on the list.',
			invalid: 'Please check the address and try again.',
			unavailable: 'Email signup is not available right now. Please try again later.',
			failed: 'Something went wrong. Please try again.'
		},
		ja: {
			label: '新しいエッセイをメールで受け取る',
			micro: 'メール',
			placeholder: 'you@example.com',
			submit: '登録する',
			sending: '送信中…',
			ok: 'ありがとうございます。登録しました。',
			invalid: 'メールアドレスをご確認のうえ、もう一度お試しください。',
			unavailable: '現在メール登録をご利用いただけません。時間をおいてお試しください。',
			failed: 'うまくいきませんでした。もう一度お試しください。'
		}
	} as const;

	const copy = $derived(COPY[lang] ?? COPY.en);
	const inputId = $derived(`newsletter-email-${source}`);

	let email = $state('');
	let status = $state<Status>('idle');
	let message = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (status === 'sending') return;
		status = 'sending';
		message = '';
		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, choice: 'both' })
			});
			if (res.ok) {
				status = 'ok';
				message = copy.ok;
				email = '';
				track('newsletter_subscribed', { locale: lang, choice: 'both', destination: source });
				return;
			}
			status = 'error';
			message =
				res.status === 400 ? copy.invalid : res.status === 503 ? copy.unavailable : copy.failed;
		} catch {
			status = 'error';
			message = copy.failed;
		}
	}
</script>

<section class="signup" aria-labelledby="{inputId}-label">
	<form class="signup-form" method="POST" action="/api/subscribe" onsubmit={submit}>
		<label id="{inputId}-label" class="signup-label" for={inputId}>
			<span class="micro" aria-hidden="true">{copy.micro}</span>
			<span class="label-text">{copy.label}</span>
		</label>
		<div class="signup-row">
			<input
				id={inputId}
				class="signup-input"
				type="email"
				name="email"
				required
				autocomplete="email"
				inputmode="email"
				spellcheck="false"
				placeholder={copy.placeholder}
				bind:value={email}
				disabled={status === 'sending'}
				aria-invalid={status === 'error' ? 'true' : undefined}
				aria-describedby="{inputId}-status"
			/>
			<button class="signup-submit" type="submit" disabled={status === 'sending'}>
				{status === 'sending' ? copy.sending : copy.submit}
			</button>
		</div>
		<p
			id="{inputId}-status"
			class="signup-status"
			class:is-error={status === 'error'}
			class:is-ok={status === 'ok'}
			aria-live="polite"
		>
			{message}
		</p>
	</form>
</section>

<style>
	.signup {
		margin: 4rem 0 0;
		padding: 1.5rem 0 0;
		border-top: 1px solid var(--rule);
	}

	.signup-label {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 0.875rem;
	}

	.micro {
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.label-text {
		font-family: var(--f-display);
		font-weight: 400;
		font-size: 1.375rem;
		line-height: 1.3;
		color: var(--ink);
	}

	.signup-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.signup-input {
		flex: 1 1 16rem;
		min-width: 0;
		min-height: 2.75rem;
		padding: 0.5rem 0.75rem;
		font-family: var(--f-body);
		font-size: 1rem;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--ink-mute);
		border-radius: var(--radius-sm);
	}

	.signup-input::placeholder {
		color: var(--ink-mute);
		opacity: 1;
	}

	.signup-input:focus-visible {
		outline: 2px solid var(--shu);
		outline-offset: 2px;
		border-color: var(--shu);
	}

	.signup-input[aria-invalid='true'] {
		border-color: var(--shu);
	}

	.signup-submit {
		flex: 0 0 auto;
		min-height: 2.75rem;
		min-width: 2.75rem;
		padding: 0.5rem 1.25rem;
		font-family: var(--f-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--paper);
		background: var(--shu);
		border: 1px solid var(--shu);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			background var(--duration-normal) var(--ease-out-expo),
			color var(--duration-normal) var(--ease-out-expo);
	}

	.signup-submit:hover:not(:disabled) {
		background: var(--ink);
		border-color: var(--ink);
	}

	.signup-submit:focus-visible {
		outline: 2px solid var(--shu);
		outline-offset: 3px;
	}

	.signup-submit:disabled {
		cursor: progress;
		opacity: 0.75;
	}

	/* Dark shu on dark paper falls just under 4.5:1 as a text fill, so the
	   dark theme keeps shu as the border and uses ink for the label. */
	:global([data-theme='dark']) .signup-submit {
		color: var(--ink);
		background: transparent;
	}

	:global([data-theme='dark']) .signup-submit:hover:not(:disabled) {
		color: var(--paper);
		background: var(--ink);
	}

	.signup-status {
		min-height: 1.5rem;
		margin: 0.75rem 0 0;
		font-family: var(--f-body);
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--ink-soft);
	}

	.signup-status.is-error,
	.signup-status.is-ok {
		color: var(--ink);
	}

	.signup-status.is-error::before,
	.signup-status.is-ok::before {
		content: '';
		display: inline-block;
		width: 0.75rem;
		height: 1px;
		margin-right: 0.5rem;
		vertical-align: middle;
		background: var(--shu);
	}

	@media (prefers-reduced-motion: reduce) {
		.signup-submit {
			transition: none;
		}
	}
</style>
