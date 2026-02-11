<script lang="ts">
	import mermaid from 'mermaid';
	import { onMount } from 'svelte';

	let { chart = '' } = $props();
	let container: HTMLDivElement;
	let renderId = 'mermaid-' + Math.random().toString(36).slice(2, 9);

	onMount(async () => {
		mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
		await renderChart();
	});

	async function renderChart() {
		if (!container) return;
		try {
			const { svg } = await mermaid.render(renderId, chart);
			container.innerHTML = svg;
		} catch (error) {
			console.error('Mermaid render error:', error);
			if (container) container.innerHTML = `<pre class="text-red-500">${error}</pre>`;
		}
	}

	$effect(() => {
		if (chart) renderChart();
	});
</script>

<div bind:this={container} class="mermaid my-8 flex justify-center overflow-x-auto"></div>
