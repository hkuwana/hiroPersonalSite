<!-- Inline SVG: visible in the server response, with no font, image or JS download. -->
<script lang="ts">
	let { ready = false }: { ready?: boolean } = $props();
</script>

<svg class:ready viewBox="0 0 360 400" fill="none" aria-hidden="true">
	<g class="breeze" stroke="var(--ink-mute)" stroke-linecap="round" opacity=".45">
		<path d="M38 162q25-15 49-5" />
		<path d="M264 235q31-16 55-4" />
	</g>
	<g class="kite">
		<g class="tail">
			<path d="M177 228C246 283 98 302 151 378" stroke="var(--ink-mute)" stroke-width="1.4" />
			<path d="m171 281 15-8-2 15Zm-24 49-12-9 1 17Z" fill="var(--ebicha)" />
		</g>
		<path d="m180 38 95 107-98 102-81-105Z" fill="var(--paper)" />
		<path d="m180 38-3 209-81-105Z" fill="var(--ink)" opacity=".06" />
		<path d="m180 38 95 107-96-8Z" fill="var(--ebicha)" opacity=".8" />
		<path d="m177 247 2-110 96 8Z" fill="var(--ebicha)" opacity=".15" />
		<path
			d="m180 38 95 107-98 102-81-105 84-104Zm0 0-3 209M96 142l179 3"
			stroke="var(--ink)"
			stroke-width="1.6"
			stroke-linejoin="round"
		/>
		<path d="M171 185c-35 52-52 85-70 123" stroke="var(--ink)" stroke-width=".8" opacity=".4" />
	</g>
</svg>

<style>
	.kite {
		transform-origin: 180px 145px;
		animation: hover 3.6s ease-in-out infinite;
	}
	.tail {
		transform-origin: 177px 228px;
		animation: trail 2.4s ease-in-out infinite;
	}
	.breeze {
		stroke-dasharray: 22 56;
		animation: wind 2.4s linear infinite;
	}
	.ready .kite,
	.ready .tail,
	.ready .breeze {
		animation-play-state: paused;
	}
	@keyframes hover {
		0%,
		100% {
			transform: translateY(3px) rotate(-3deg);
		}
		50% {
			transform: translateY(-7px) rotate(3deg);
		}
	}
	@keyframes trail {
		0%,
		100% {
			transform: rotate(3deg);
		}
		50% {
			transform: rotate(-5deg);
		}
	}
	@keyframes wind {
		to {
			stroke-dashoffset: -78;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.kite,
		.tail,
		.breeze {
			animation: none;
		}
	}
</style>
