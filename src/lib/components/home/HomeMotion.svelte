<script lang="ts">
	// Letter-by-letter reveal of the hero name (a Fancy Components idea, built with GSAP).
	// Scroll reveals stay on the page's IntersectionObserver.
	import { onMount } from 'svelte';

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const name = document.querySelector<HTMLElement>('[data-split]');
		const first = name?.firstChild;
		if (!name || first?.nodeType !== Node.TEXT_NODE) return;
		const text = first.textContent ?? '';
		const frag = document.createDocumentFragment();
		for (const ch of text) {
			const span = document.createElement('span');
			span.className = 'ch';
			span.setAttribute('aria-hidden', 'true');
			span.textContent = ch;
			frag.append(span);
		}
		const label = document.createElement('span');
		label.className = 'sr-only';
		label.textContent = text;
		first.replaceWith(label, frag);
		let stop = () => {};
		import('gsap').then(({ gsap }) => {
			const tween = gsap.from(name.querySelectorAll('.ch'), { yPercent: 60, opacity: 0, duration: 0.6, stagger: 0.025, ease: 'power3.out' });
			stop = () => tween.kill();
		});
		return () => stop();
	});
</script>
