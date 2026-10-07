<script lang="ts">
	// Letter-by-letter reveal of the hero name (a Fancy Components idea).
	// Pure CSS animation with staggered delays, so no library loads at page start.
	import { onMount } from 'svelte';

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const name = document.querySelector<HTMLElement>('[data-split]');
		const first = name?.firstChild;
		if (!name || first?.nodeType !== Node.TEXT_NODE) return;
		const text = first.textContent ?? '';
		const frag = document.createDocumentFragment();
		[...text].forEach((ch, i) => {
			const span = document.createElement('span');
			span.className = 'ch';
			span.setAttribute('aria-hidden', 'true');
			span.style.animationDelay = `${i * 25}ms`;
			span.textContent = ch;
			frag.append(span);
		});
		const label = document.createElement('span');
		label.className = 'sr-only';
		label.textContent = text;
		first.replaceWith(label, frag);
	});
</script>
