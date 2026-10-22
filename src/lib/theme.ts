/** Reveal the new palette like night crossing the sky, without moving the content. */
export async function changeTheme(dark: boolean, update: () => void | Promise<void>) {
	const root = document.documentElement;
	if (
		!document.startViewTransition ||
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		await update();
		return;
	}
	root.dataset.themeTransition = dark ? 'sunset' : 'sunrise';
	try {
		const transition = document.startViewTransition(update);
		// A hidden tab can skip its snapshot; the theme update still runs.
		void transition.ready.catch(() => {});
		await transition.finished;
	} catch {
		await update();
	} finally {
		delete root.dataset.themeTransition;
	}
}
