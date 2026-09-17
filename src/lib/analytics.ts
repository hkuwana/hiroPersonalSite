type Event =
	| 'contact_submit_started'
	| 'contact_submit_succeeded'
	| 'contact_submit_failed'
	| 'newsletter_submit_started'
	| 'newsletter_submit_succeeded'
	| 'newsletter_submit_failed'
	| 'outbound_link_clicked'
	| 'contact_email_copied';

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
