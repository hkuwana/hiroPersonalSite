<script lang="ts">
	import { onMount } from 'svelte';

	type Ripple = {
		x: number;
		y: number;
		born: number;
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
		let dpr = Math.min(window.devicePixelRatio || 1, 2);
		let lastRippleAt = 0;
		let lastAmbientAt = 0;
		let isVisible = true;
		let pageIsVisible = !document.hidden;
		let pointer = { x: -9999, y: -9999, active: false };
		let ripples: Ripple[] = [];
		let inkColor = '#7e8670';
		let accentColor = '#a8442f';

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

		const updateColors = () => {
			const computed = getComputedStyle(document.documentElement);
			inkColor = computed.getPropertyValue('--ink-mute').trim() || '#7e8670';
			accentColor = computed.getPropertyValue('--shu').trim() || '#a8442f';
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.max(1, Math.floor(width * dpr));
			canvas.height = Math.max(1, Math.floor(height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const addRipple = (x: number, y: number, born: number, ambient = false) => {
			ripples.push({ x, y, born, ambient });
			if (ripples.length > 8) ripples = ripples.slice(-8);
		};

		const canAnimate = () =>
			isVisible && pageIsVisible && finePointer.matches && !reducedMotion.matches;

		const draw = () => {
			raf = 0;
			if (!canAnimate()) return;

			const now = performance.now();
			ctx.clearRect(0, 0, width, height);

			if (now - lastAmbientAt > 3600) {
				addRipple(
					width * (0.2 + Math.random() * 0.6),
					height * (0.28 + Math.random() * 0.44),
					now,
					true
				);
				lastAmbientAt = now;
			}

			ctx.strokeStyle = inkColor;
			ripples = ripples.filter((ripple) => now - ripple.born < 3200);

			for (const ripple of ripples) {
				const age = (now - ripple.born) / 3200;
				const radius = 4 + age * (ripple.ambient ? 72 : 118);

				ctx.globalAlpha = (1 - age) * (ripple.ambient ? 0.22 : 0.38);
				ctx.lineWidth = 0.75;
				ctx.beginPath();
				ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
				ctx.stroke();

				ctx.globalAlpha = (1 - age) * (ripple.ambient ? 0.1 : 0.18);
				ctx.beginPath();
				ctx.arc(ripple.x, ripple.y, radius * 0.7, 0, Math.PI * 2);
				ctx.stroke();
			}

			if (pointer.active && finePointer.matches) {
				ctx.globalAlpha = 0.75;
				ctx.fillStyle = accentColor;
				ctx.beginPath();
				ctx.arc(pointer.x, pointer.y, 1.75, 0, Math.PI * 2);
				ctx.fill();

				ctx.globalAlpha = 0.28;
				ctx.strokeStyle = inkColor;
				ctx.beginPath();
				ctx.arc(pointer.x, pointer.y, 8, 0, Math.PI * 2);
				ctx.stroke();
			}

			ctx.globalAlpha = 1;
			raf = requestAnimationFrame(draw);
		};

		const start = () => {
			if (!raf && canAnimate()) raf = requestAnimationFrame(draw);
		};

		const getXY = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
		};

		const onMove = (event: PointerEvent) => {
			if (!finePointer.matches || event.pointerType !== 'mouse') return;
			const point = getXY(event);
			pointer = { ...point, active: true };
			const now = performance.now();
			if (now - lastRippleAt > 180) {
				addRipple(point.x, point.y, now);
				lastRippleAt = now;
			}
			start();
		};

		const onLeave = () => {
			pointer.active = false;
		};

		const onVisibilityChange = () => {
			pageIsVisible = !document.hidden;
			if (pageIsVisible) start();
		};

		const onMotionChange = () => {
			if (reducedMotion.matches) {
				cancelAnimationFrame(raf);
				raf = 0;
				ctx.clearRect(0, 0, width, height);
			} else {
				start();
			}
		};

		const resizeObserver = new ResizeObserver(() => {
			resize();
			start();
		});
		const intersectionObserver = new IntersectionObserver((entries) => {
			isVisible = entries[0]?.isIntersecting ?? true;
			if (isVisible) start();
		});
		const themeObserver = new MutationObserver(updateColors);

		updateColors();
		resize();
		addRipple(width * 0.72, height * 0.36, performance.now(), true);
		lastAmbientAt = performance.now();
		start();

		resizeObserver.observe(canvas);
		intersectionObserver.observe(canvas);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		document.addEventListener('visibilitychange', onVisibilityChange);
		canvas.addEventListener('pointermove', onMove, { passive: true });
		canvas.addEventListener('pointerleave', onLeave);
		reducedMotion.addEventListener('change', onMotionChange);
		finePointer.addEventListener('change', onMotionChange);

		return () => {
			cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			themeObserver.disconnect();
			document.removeEventListener('visibilitychange', onVisibilityChange);
			canvas.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerleave', onLeave);
			reducedMotion.removeEventListener('change', onMotionChange);
			finePointer.removeEventListener('change', onMotionChange);
		};
	});
</script>

<canvas bind:this={canvasEl} class="hero-canvas" aria-hidden="true"></canvas>
