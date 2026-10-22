// Resolve when the element comes within `margin` of the viewport, so heavy
// libraries (matter-js, gsap) load only when an island is about to be seen.
export function whenVisible(el: Element, margin = '200px'): Promise<void> {
	return new Promise((resolve) => {
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					io.disconnect();
					resolve();
				}
			},
			{ rootMargin: margin }
		);
		io.observe(el);
	});
}
