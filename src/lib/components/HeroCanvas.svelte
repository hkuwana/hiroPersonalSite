<script lang="ts">
	import { onMount } from 'svelte';

	type Ripple = {
		x: number;
		y: number;
		t: number;
		ambient?: boolean;
	};

	let canvasEl: HTMLCanvasElement;

	onMount(() => {
		const canvas = canvasEl;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let raf = 0;
		let width = 0;
		let height = 0;
		let dpr = window.devicePixelRatio || 1;
		let lastRippleAt = 0;
		let lastAmbientAt = 0;
		let mouse = { x: -9999, y: -9999, active: false };
		let ripples: Ripple[] = [];

		const color = () => {
			const computed = getComputedStyle(document.documentElement);
			return computed.getPropertyValue('--ink-mute').trim() || '#7e8670';
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			dpr = window.devicePixelRatio || 1;
			width = rect.width;
			height = rect.height;
			canvas.width = Math.max(1, Math.floor(width * dpr));
			canvas.height = Math.max(1, Math.floor(height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const draw = () => {
			const now = performance.now();
			ctx.clearRect(0, 0, width, height);

			if (mouse.active && now - lastRippleAt > 220) {
				ripples.push({ x: mouse.x, y: mouse.y, t: now });
				lastRippleAt = now;
			}

			if (now - lastAmbientAt > 1800) {
				ripples.push({
					x: width * (0.2 + Math.random() * 0.6),
					y: height * (0.3 + Math.random() * 0.5),
					t: now,
					ambient: true
				});
				lastAmbientAt = now;
			}

			ctx.strokeStyle = color();
			ripples = ripples.filter((ripple) => now - ripple.t < 4000);

			for (const ripple of ripples) {
				const age = (now - ripple.t) / 4000;
				const radius = 4 + age * (ripple.ambient ? 90 : 140);

				ctx.globalAlpha = (1 - age) * 0.5;
				ctx.lineWidth = 0.8;
				ctx.beginPath();
				ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
				ctx.stroke();

				ctx.globalAlpha = (1 - age) * 0.25;
				ctx.beginPath();
				ctx.arc(ripple.x, ripple.y, radius * 0.7, 0, Math.PI * 2);
				ctx.stroke();
			}

			ctx.globalAlpha = 1;
			raf = requestAnimationFrame(draw);
		};

		const getXY = (event: MouseEvent | TouchEvent) => {
			const rect = canvas.getBoundingClientRect();
			const point = 'touches' in event ? event.touches[0] : event;
			return {
				x: point.clientX - rect.left,
				y: point.clientY - rect.top
			};
		};

		const onMove = (event: MouseEvent | TouchEvent) => {
			const point = getXY(event);
			mouse = { ...point, active: true };
		};

		const onLeave = () => {
			mouse.active = false;
		};

		resize();
		draw();

		window.addEventListener('resize', resize);
		canvas.addEventListener('mousemove', onMove);
		canvas.addEventListener('mouseleave', onLeave);
		canvas.addEventListener('touchmove', onMove, { passive: true });
		canvas.addEventListener('touchend', onLeave);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			canvas.removeEventListener('mousemove', onMove);
			canvas.removeEventListener('mouseleave', onLeave);
			canvas.removeEventListener('touchmove', onMove);
			canvas.removeEventListener('touchend', onLeave);
		};
	});
</script>

<canvas bind:this={canvasEl} class="hero-canvas" aria-hidden="true"></canvas>
