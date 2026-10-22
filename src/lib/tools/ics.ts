/**
 * ICS validation and repair, shared by the /tools/ics-formatter page and the
 * public /api/ics/format endpoint. Pure functions, no DOM.
 */

export type IcsIssue = { kind: 'error' | 'warning' | 'fixed'; message: string };

export type IcsEvent = { summary: string; start: string; end: string; rrule?: string };

export type IcsFormatResult = {
	issues: IcsIssue[];
	/** Cleaned, folded ICS output with CRLF line endings. Empty when input is empty. */
	ics: string;
	events: IcsEvent[];
};

function unfold(text: string): string {
	return text
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.replace(/\n[ \t]/g, '');
}

function fold(text: string): string {
	const lines = text.split('\n');
	const out: string[] = [];
	for (const line of lines) {
		if (line.length <= 75) {
			out.push(line);
			continue;
		}
		let remaining = line;
		out.push(remaining.slice(0, 75));
		remaining = remaining.slice(75);
		while (remaining.length > 0) {
			out.push(' ' + remaining.slice(0, 74));
			remaining = remaining.slice(74);
		}
	}
	return out.join('\r\n');
}

function nowStamp(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function makeUid(i: number): string {
	const rand = Math.random().toString(36).slice(2, 10);
	return `${nowStamp()}-${i}-${rand}@hirokuwana.com`;
}

function parseDate(value: string): string {
	// Loose readable rendering of an ICS date-time value
	const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/);
	if (!m) return value;
	const [, y, mo, d, h, mi] = m;
	if (!h) return `${y}-${mo}-${d}`;
	return `${y}-${mo}-${d} ${h}:${mi}`;
}

/** Validate an ICS text, repair what is repairable, and report every issue. */
export function formatIcs(input: string): IcsFormatResult {
	const log: IcsIssue[] = [];
	if (!input.trim()) {
		return {
			issues: [
				{ kind: 'error', message: 'Input is empty. Paste an .ics file or load the sample.' }
			],
			ics: '',
			events: []
		};
	}

	const lineEndingChanged = /\r(?!\n)|(?<!\r)\n/.test(input) && !/\r\n/.test(input);
	if (lineEndingChanged)
		log.push({ kind: 'fixed', message: 'Normalized line endings to CRLF (RFC 5545 §3.1).' });

	const unfolded = unfold(input);
	const lines = unfolded
		.split('\n')
		.map((l) => l.trimEnd())
		.filter((l) => l.length > 0);

	// Track block structure
	const calBegin = lines.findIndex((l) => l.toUpperCase() === 'BEGIN:VCALENDAR');
	const calEnd = lines.findIndex((l) => l.toUpperCase() === 'END:VCALENDAR');
	if (calBegin === -1) log.push({ kind: 'error', message: 'Missing BEGIN:VCALENDAR.' });
	if (calEnd === -1) log.push({ kind: 'error', message: 'Missing END:VCALENDAR.' });

	// Required calendar headers
	const hasVersion = lines.some((l) => /^VERSION:/i.test(l));
	const hasProdId = lines.some((l) => /^PRODID:/i.test(l));
	if (!hasVersion)
		log.push({ kind: 'fixed', message: 'Added VERSION:2.0 (required by RFC 5545).' });
	if (!hasProdId) log.push({ kind: 'fixed', message: 'Added a PRODID line.' });

	// Walk through events
	const output: string[] = [];
	output.push('BEGIN:VCALENDAR');
	output.push('VERSION:2.0');
	output.push('PRODID:-//Hiro Kuwana//ICS Formatter//EN');
	output.push('CALSCALE:GREGORIAN');

	const eventList: IcsEvent[] = [];

	let i = 0;
	let eventIndex = 0;
	const pendingVtimezones: string[] = [];
	while (i < lines.length) {
		const line = lines[i];
		const upper = line.toUpperCase();

		if (upper === 'BEGIN:VTIMEZONE') {
			const tzBlock: string[] = [line];
			i++;
			while (i < lines.length && lines[i].toUpperCase() !== 'END:VTIMEZONE') {
				tzBlock.push(lines[i]);
				i++;
			}
			if (i < lines.length) tzBlock.push(lines[i]);
			pendingVtimezones.push(tzBlock.join('\r\n'));
			i++;
			continue;
		}

		if (upper === 'BEGIN:VEVENT') {
			const block: string[] = [];
			i++;
			while (i < lines.length && lines[i].toUpperCase() !== 'END:VEVENT') {
				block.push(lines[i]);
				i++;
			}
			if (i >= lines.length) {
				log.push({
					kind: 'error',
					message: `VEVENT block #${eventIndex + 1} is missing END:VEVENT.`
				});
			}
			i++; // skip END:VEVENT

			let uid = '';
			let dtstamp = '';
			let dtstart = '';
			let dtend = '';
			let summary = '';
			let rrule = '';
			const out: string[] = [];

			for (const raw of block) {
				const u = raw.toUpperCase();
				if (u.startsWith('UID:') || u.startsWith('UID;')) uid = raw.split(':').slice(1).join(':');
				else if (u.startsWith('DTSTAMP:') || u.startsWith('DTSTAMP;'))
					dtstamp = raw.split(':').slice(1).join(':');
				else if (u.startsWith('DTSTART:') || u.startsWith('DTSTART;'))
					dtstart = raw.split(':').slice(1).join(':');
				else if (u.startsWith('DTEND:') || u.startsWith('DTEND;'))
					dtend = raw.split(':').slice(1).join(':');
				else if (u.startsWith('SUMMARY:') || u.startsWith('SUMMARY;'))
					summary = raw.split(':').slice(1).join(':');
				else if (u.startsWith('RRULE:')) rrule = raw.slice(6);
				out.push(raw);
			}

			const label = summary || `event #${eventIndex + 1}`;
			if (!uid) {
				out.unshift(`UID:${makeUid(eventIndex)}`);
				log.push({ kind: 'fixed', message: `Added missing UID for ${label}.` });
			}
			if (!dtstamp) {
				out.unshift(`DTSTAMP:${nowStamp()}`);
				log.push({ kind: 'fixed', message: `Added missing DTSTAMP for ${label}.` });
			}
			if (!dtstart)
				log.push({
					kind: 'error',
					message: `${label} is missing DTSTART. Events without DTSTART will not import.`
				});
			if (dtstart && !dtend)
				log.push({
					kind: 'warning',
					message: `${label} has DTSTART but no DTEND. Some clients will interpret as all-day.`
				});
			if (!summary)
				log.push({
					kind: 'warning',
					message: `${label} has no SUMMARY. It will appear as “(No title).”`
				});

			output.push('BEGIN:VEVENT');
			for (const l of out) output.push(l);
			output.push('END:VEVENT');

			eventList.push({
				summary: summary || '(no title)',
				start: parseDate(dtstart.replace(/^.*:/, '')),
				end: parseDate(dtend.replace(/^.*:/, '')),
				rrule: rrule || undefined
			});
			eventIndex++;
			continue;
		}

		i++;
	}

	if (eventIndex === 0)
		log.push({ kind: 'warning', message: 'No VEVENT blocks were found in the calendar.' });

	// Insert VTIMEZONEs after PRODID
	if (pendingVtimezones.length > 0) {
		// reconstruct: output currently starts with BEGIN:VCALENDAR + headers, then events
		const headerEnd = output.findIndex((l) => l.startsWith('CALSCALE')) + 1;
		output.splice(headerEnd, 0, ...pendingVtimezones.flatMap((b) => b.split('\r\n')));
	}

	output.push('END:VCALENDAR');

	if (log.length === 0) {
		log.push({
			kind: 'fixed',
			message: 'Looks clean. Nothing material to fix — output is canonicalized only.'
		});
	}

	return { issues: log, ics: fold(output.join('\n')), events: eventList };
}
