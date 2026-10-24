type Event =
	| 'outbound_link_clicked'
	| 'contact_email_copied'
	| 'contact_email_revealed'
	// Ink village: which fidelity a visitor got and why ("hi:capable"), and
	// which part of the work they opened. For the hi-fi / lo-fi comparison.
	| 'village_fidelity'
	| 'village_project_selected'
	| 'village_place_opened';

type Properties = { locale?: string; choice?: string; destination?: string };

/** Analytics must never prevent a message, navigation, or signup. No form values. */
export function track(event: Event, properties: Properties = {}) {
	try {
		if (typeof window === 'undefined') return;
		const client = (
			window as Window & { posthog?: { capture: (name: string, properties: Properties) => void } }
		).posthog;
		client?.capture(event, properties);
	} catch {
		// Blocked analytics should be invisible to visitors.
	}
}

export function trackOutboundClick(event: MouseEvent) {
	if (!(event.target instanceof Element)) return;
	const link = event.target.closest('a');
	if (!link) return;
	const destination = new URL(link.href, window.location.href);
	if (
		!['https:', 'http:'].includes(destination.protocol) ||
		destination.origin === window.location.origin
	)
		return;
	track('outbound_link_clicked', { destination: destination.origin + destination.pathname });
}
