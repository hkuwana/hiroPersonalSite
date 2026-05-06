<script lang="ts">
	import { onMount } from 'svelte';
	import { PROOF } from '$data/constants';

	let section: HTMLElement | undefined = $state();
	let visible = $state(false);
	let displayValues = $state<string[]>(PROOF.primary.map(() => ''));
	let freshness = $state(formatFreshness(PROOF.updatedAt, new Date()));

	// Honest, warm "updated" label — bucketed so it never lies down to the minute.
	function formatFreshness(updatedAt: string, now: Date): string {
		const updated = new Date(updatedAt + 'T00:00:00Z');
		const days = Math.floor((now.getTime() - updated.getTime()) / 86_400_000);
		if (days <= 0) return 'Updated today';
		if (days === 1) return 'Updated yesterday';
		if (days < 7) return `Updated ${days} days ago`;
		if (days < 14) return 'Updated last week';
		if (days < 35) return `Updated ${Math.round(days / 7)} weeks ago`;
		const months = Math.round(days / 30);
		return months === 1 ? 'Updated last month' : `Updated ${months} months ago`;
	}

	type ParsedValue = {
		final: number;
		suffix: '' | 'K' | 'M';
		trail: '' | '+' | '%';
		hasComma: boolean;
	};

	function parseValue(raw: string): ParsedValue | null {
		const match = raw.match(/^([\d,.]+)\s*([KkMm])?\s*([+%])?$/);
		if (!match) return null;
		const numeric = parseFloat(match[1].replace(/,/g, ''));
		if (Number.isNaN(numeric)) return null;
		const suffixRaw = (match[2] ?? '').toUpperCase() as '' | 'K' | 'M';
		const trail = (match[3] ?? '') as '' | '+' | '%';
		let multiplier = 1;
		if (suffixRaw === 'K') multiplier = 1000;
		if (suffixRaw === 'M') multiplier = 1_000_000;
		return {
			final: numeric * multiplier,
			suffix: suffixRaw,
			trail,
			hasComma: match[1].includes(','),
		};
	}

	function formatValue(current: number, parsed: ParsedValue): string {
		let body: string;
		if (parsed.suffix === 'M') {
			const v = current / 1_000_000;
			body = v >= 1 ? `${Math.round(v)}M` : `${v.toFixed(1)}M`;
		} else if (parsed.suffix === 'K') {
			const v = current / 1000;
			body = `${Math.round(v)}K`;
		} else if (parsed.hasComma) {
			body = Math.round(current).toLocaleString();
		} else {
			body = `${Math.round(current)}`;
		}
		return `${body}${parsed.trail}`;
	}

	function animateCount(index: number, raw: string, duration = 1400, delay = 0) {
		const target = parseValue(raw);
		if (!target) {
			displayValues[index] = raw;
			return;
		}

		const start = performance.now() + delay;
		const ease = (t: number) => 1 - Math.pow(1 - t, 3);

		const tick = (now: number) => {
			const elapsed = now - start;
			if (elapsed < 0) {
				requestAnimationFrame(tick);
				return;
			}
			const t = Math.min(1, elapsed / duration);
			const current = target.final * ease(t);
			displayValues[index] = formatValue(current, target);
			if (t < 1) requestAnimationFrame(tick);
			else displayValues[index] = raw;
		};

		requestAnimationFrame(tick);
	}

	onMount(() => {
		// Recompute on the client so static SSR output doesn't freeze to build-time.
		freshness = formatFreshness(PROOF.updatedAt, new Date());

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			visible = true;
			displayValues = PROOF.primary.map((s) => s.value);
			return;
		}

		// Initialize to "0" with the right suffix shape so layout doesn't jump.
		displayValues = PROOF.primary.map((s) => {
			const parsed = parseValue(s.value);
			return parsed ? formatValue(0, parsed) : s.value;
		});

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visible = true;
						PROOF.primary.forEach((s, i) => {
							animateCount(i, s.value, 1400, i * 120);
						});
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
		);

		if (section) observer.observe(section);
		return () => observer.disconnect();
	});
</script>

<section
	class="proof-band"
	class:visible
	bind:this={section}
	aria-label="Traction over the last three months"
>
	<div class="proof-inner">
		<p class="proof-eyebrow text-base-content/55">
			<span class="freshness-dot" aria-hidden="true"></span>
			<span class="proof-freshness">{freshness}</span>
			<span class="proof-eyebrow-sep" aria-hidden="true">·</span>
			<span>Last 3 months</span>
			<span class="proof-eyebrow-sep" aria-hidden="true">·</span>
			<span class="proof-eyebrow-accent">100% organic</span>
		</p>

		<dl class="proof-grid">
			{#each PROOF.primary as stat, i}
				<div class="proof-stat" style="--delay: {i * 0.08}s">
					<dt class="proof-value text-primary" aria-label={stat.value}>
						<span aria-hidden="true">{displayValues[i] || stat.value}</span>
					</dt>
					<dd class="proof-label text-base-content/70">
						{stat.label}
						{#if stat.subtext}
							<span class="proof-subtext text-base-content/40">· {stat.subtext}</span>
						{/if}
					</dd>
				</div>
			{/each}
		</dl>

		<p class="sr-only">
			One million organic impressions, three thousand clicks, six hundred monthly Kaiwa signups, thirty seven percent cold email open rate over three months — solo, zero ad spend.
		</p>
	</div>
</section>

<style>
	.proof-band {
		padding: 3.5rem 1.25rem 4rem;
		background: oklch(var(--b1));
		border-top: 1px solid oklch(var(--bc) / 0.06);
		border-bottom: 1px solid oklch(var(--bc) / 0.06);
	}

	.proof-inner {
		max-width: 56rem;
		margin: 0 auto;
		text-align: center;
	}

	.proof-eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0 0 2rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.proof-eyebrow-accent {
		color: oklch(var(--p));
		font-weight: 600;
		letter-spacing: 0.14em;
	}

	.proof-eyebrow-sep {
		opacity: 0.5;
	}

	.proof-freshness {
		font-variant-numeric: tabular-nums;
	}

	/* Quiet, honest punctuation — not a "live" indicator, just a visual anchor. */
	.freshness-dot {
		display: inline-block;
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 9999px;
		background: oklch(var(--p) / 0.55);
		margin-right: 0.125rem;
	}

	.proof-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin: 0;
	}

	.proof-stat {
		padding: 0 0.5rem;
		position: relative;
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) var(--delay),
			transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) var(--delay);
	}

	.proof-band.visible .proof-stat {
		opacity: 1;
		transform: translateY(0);
	}

	/* Dividers between stats */
	.proof-stat + .proof-stat::before {
		content: '';
		position: absolute;
		left: 0;
		top: 15%;
		bottom: 15%;
		width: 1px;
		background: oklch(var(--bc) / 0.08);
	}

	.proof-value {
		font-size: clamp(1.875rem, 2.6vw + 1rem, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
		margin: 0 0 0.5rem;
		font-variant-numeric: tabular-nums;
	}

	.proof-label {
		font-size: 0.8125rem;
		line-height: 1.45;
		margin: 0;
		font-weight: 500;
	}

	.proof-subtext {
		display: block;
		font-size: 0.75rem;
		font-weight: 400;
		margin-top: 0.125rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.proof-band {
			padding: 2.5rem 1rem 3rem;
		}
		.proof-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 2rem 1rem;
		}
		.proof-stat + .proof-stat::before {
			display: none;
		}
		.proof-stat:nth-child(3),
		.proof-stat:nth-child(4) {
			padding-top: 0;
		}
		/* Drop the middle clause on narrow screens so the eyebrow stays one line. */
		.proof-eyebrow > span:nth-child(3),
		.proof-eyebrow > span:nth-child(4) {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.proof-stat {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
