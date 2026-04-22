<script lang="ts">
	import { onMount } from 'svelte';
	import { PROOF } from '$data/constants';

	let section: HTMLElement | undefined = $state();
	let visible = $state(false);

	onMount(() => {
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			visible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visible = true;
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
		<p class="proof-eyebrow text-base-content/45">Traction · last 3 months · 100% organic</p>

		<dl class="proof-grid">
			{#each PROOF.primary as stat, i}
				<div class="proof-stat" style="--delay: {i * 0.08}s">
					<dt class="proof-value text-primary">{stat.value}</dt>
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
			One million organic impressions, three thousand clicks, one thousand monthly Kaiwa signups, forty percent email open rate over three months — solo, zero ad spend.
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
		font-size: clamp(1.75rem, 2.5vw + 1rem, 2.5rem);
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
	}

	@media (prefers-reduced-motion: reduce) {
		.proof-stat {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
