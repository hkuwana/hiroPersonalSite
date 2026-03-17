<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let icsInput = $state('');
	let issues: { type: 'error' | 'warning' | 'fixed'; message: string }[] = $state([]);
	let fixedIcs = $state('');
	let hasValidated = $state(false);
	let isDragging = $state(false);

	const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FounderSchedule//Tokyo//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:20260317T100001Z-0@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T080000
DTEND;TZID=Asia/Tokyo:20260316T090000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:Morning Routine & Pipeline
DESCRIPTION:8:00-8:30: Coffee/Breakfast. 8:30-9:00: Review Kanban.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-1@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T090000
DTEND;TZID=Asia/Tokyo:20260316T120000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:OUTREACH BLOCK (Walking)
DESCRIPTION:Shibuya/Shimokitazawa calls. Goal: 3-4 calls + 10 messages.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-2@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T120000
DTEND;TZID=Asia/Tokyo:20260316T131500
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:Lunch & Non-Negotiable Nap
DESCRIPTION:12:00-12:45: Lunch. 12:45-1:15: Power nap. Set alarm.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-3@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T131500
DTEND;TZID=Asia/Tokyo:20260316T144500
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:Outreach Block 2
DESCRIPTION:In-person Tokyo visits or follow-ups.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-4@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T150000
DTEND;TZID=Asia/Tokyo:20260316T170000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:Gym & Transition
DESCRIPTION:Gym reset + Shower/Snack.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-5@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T170000
DTEND;TZID=Asia/Tokyo:20260316T193000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:Build Block (The 20%)
DESCRIPTION:One focused task only - ship something small.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-6@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260316T200000
DTEND;TZID=Asia/Tokyo:20260316T223000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE
SUMMARY:Deep Work: Code/Build
DESCRIPTION:Sharpest window. Build features, fix bugs.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-7@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260320T200000
DTEND;TZID=Asia/Tokyo:20260320T223000
RRULE:FREQ=WEEKLY;BYDAY=FR
SUMMARY:Tinker / Research
DESCRIPTION:Try new AI tools, experiment, prototype wild ideas.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-8@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260317T090000
DTEND;TZID=Asia/Tokyo:20260317T103000
RRULE:FREQ=WEEKLY;BYDAY=TU,TH
SUMMARY:Outreach Block (Balanced)
DESCRIPTION:Lighter volume - focus on warm leads.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-9@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260317T103000
DTEND;TZID=Asia/Tokyo:20260317T123000
RRULE:FREQ=WEEKLY;BYDAY=TU,TH
SUMMARY:Build Block 1 (Deep Work)
DESCRIPTION:Uninterrupted feature building.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-10@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260317T153000
DTEND;TZID=Asia/Tokyo:20260317T170000
RRULE:FREQ=WEEKLY;BYDAY=TU,TH
SUMMARY:Build Block 2 (Afternoon)
DESCRIPTION:Ship what you started in the morning.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-11@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260321T090000
DTEND;TZID=Asia/Tokyo:20260321T120000
RRULE:FREQ=WEEKLY;BYDAY=SA
SUMMARY:Momentum Block
DESCRIPTION:Whatever has momentum.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-12@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260322T093000
DTEND;TZID=Asia/Tokyo:20260322T120000
RRULE:FREQ=WEEKLY;BYDAY=SU
SUMMARY:Meal Prep & Clean
DESCRIPTION:Batch cook 3-4 meals.
END:VEVENT
BEGIN:VEVENT
UID:20260317T100001Z-13@founder.com
DTSTAMP:20260317T100001Z
DTSTART;TZID=Asia/Tokyo:20260322T150000
DTEND;TZID=Asia/Tokyo:20260322T170000
RRULE:FREQ=WEEKLY;BYDAY=SU
SUMMARY:WEEK PLANNING
DESCRIPTION:Founder Check-in: Design partners? Hiding in code? Ask who else I should talk to.
END:VEVENT
END:VCALENDAR`;

	// VTIMEZONE definitions for common timezones
	const KNOWN_TIMEZONES: Record<string, string> = {
		'Asia/Tokyo': `BEGIN:VTIMEZONE\nTZID:Asia/Tokyo\nX-LIC-LOCATION:Asia/Tokyo\nBEGIN:STANDARD\nTZOFFSETFROM:+0900\nTZOFFSETTO:+0900\nTZNAME:JST\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE`,
		'Asia/Seoul': `BEGIN:VTIMEZONE\nTZID:Asia/Seoul\nBEGIN:STANDARD\nTZOFFSETFROM:+0900\nTZOFFSETTO:+0900\nTZNAME:KST\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE`,
		'Asia/Shanghai': `BEGIN:VTIMEZONE\nTZID:Asia/Shanghai\nBEGIN:STANDARD\nTZOFFSETFROM:+0800\nTZOFFSETTO:+0800\nTZNAME:CST\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE`,
		'Asia/Singapore': `BEGIN:VTIMEZONE\nTZID:Asia/Singapore\nBEGIN:STANDARD\nTZOFFSETFROM:+0800\nTZOFFSETTO:+0800\nTZNAME:SGT\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE`,
		'America/New_York': `BEGIN:VTIMEZONE\nTZID:America/New_York\nBEGIN:DAYLIGHT\nTZOFFSETFROM:-0500\nTZOFFSETTO:-0400\nTZNAME:EDT\nDTSTART:19700308T020000\nRRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:-0400\nTZOFFSETTO:-0500\nTZNAME:EST\nDTSTART:19701101T020000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\nEND:STANDARD\nEND:VTIMEZONE`,
		'America/Chicago': `BEGIN:VTIMEZONE\nTZID:America/Chicago\nBEGIN:DAYLIGHT\nTZOFFSETFROM:-0600\nTZOFFSETTO:-0500\nTZNAME:CDT\nDTSTART:19700308T020000\nRRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:-0500\nTZOFFSETTO:-0600\nTZNAME:CST\nDTSTART:19701101T020000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\nEND:STANDARD\nEND:VTIMEZONE`,
		'America/Denver': `BEGIN:VTIMEZONE\nTZID:America/Denver\nBEGIN:DAYLIGHT\nTZOFFSETFROM:-0700\nTZOFFSETTO:-0600\nTZNAME:MDT\nDTSTART:19700308T020000\nRRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:-0600\nTZOFFSETTO:-0700\nTZNAME:MST\nDTSTART:19701101T020000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\nEND:STANDARD\nEND:VTIMEZONE`,
		'America/Los_Angeles': `BEGIN:VTIMEZONE\nTZID:America/Los_Angeles\nBEGIN:DAYLIGHT\nTZOFFSETFROM:-0800\nTZOFFSETTO:-0700\nTZNAME:PDT\nDTSTART:19700308T020000\nRRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:-0700\nTZOFFSETTO:-0800\nTZNAME:PST\nDTSTART:19701101T020000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\nEND:STANDARD\nEND:VTIMEZONE`,
		'Europe/London': `BEGIN:VTIMEZONE\nTZID:Europe/London\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+0000\nTZOFFSETTO:+0100\nTZNAME:BST\nDTSTART:19700329T010000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+0100\nTZOFFSETTO:+0000\nTZNAME:GMT\nDTSTART:19701025T020000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10\nEND:STANDARD\nEND:VTIMEZONE`,
		'Europe/Paris': `BEGIN:VTIMEZONE\nTZID:Europe/Paris\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+0100\nTZOFFSETTO:+0200\nTZNAME:CEST\nDTSTART:19700329T020000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+0200\nTZOFFSETTO:+0100\nTZNAME:CET\nDTSTART:19701025T030000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10\nEND:STANDARD\nEND:VTIMEZONE`,
		'Europe/Berlin': `BEGIN:VTIMEZONE\nTZID:Europe/Berlin\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+0100\nTZOFFSETTO:+0200\nTZNAME:CEST\nDTSTART:19700329T020000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+0200\nTZOFFSETTO:+0100\nTZNAME:CET\nDTSTART:19701025T030000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10\nEND:STANDARD\nEND:VTIMEZONE`,
		'Australia/Sydney': `BEGIN:VTIMEZONE\nTZID:Australia/Sydney\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+1000\nTZOFFSETTO:+1100\nTZNAME:AEDT\nDTSTART:19701004T020000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=10\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+1100\nTZOFFSETTO:+1000\nTZNAME:AEST\nDTSTART:19700405T030000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4\nEND:STANDARD\nEND:VTIMEZONE`,
		'Pacific/Auckland': `BEGIN:VTIMEZONE\nTZID:Pacific/Auckland\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+1200\nTZOFFSETTO:+1300\nTZNAME:NZDT\nDTSTART:19700927T020000\nRRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=9\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+1300\nTZOFFSETTO:+1200\nTZNAME:NZST\nDTSTART:19700405T030000\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4\nEND:STANDARD\nEND:VTIMEZONE`,
	};

	// Common invalid TZID aliases -> IANA names
	const TZID_ALIASES: Record<string, string> = {
		'EST': 'America/New_York',
		'CST': 'America/Chicago',
		'MST': 'America/Denver',
		'PST': 'America/Los_Angeles',
		'EDT': 'America/New_York',
		'CDT': 'America/Chicago',
		'MDT': 'America/Denver',
		'PDT': 'America/Los_Angeles',
		'JST': 'Asia/Tokyo',
		'KST': 'Asia/Seoul',
		'SGT': 'Asia/Singapore',
		'GMT': 'Europe/London',
		'BST': 'Europe/London',
		'CET': 'Europe/Paris',
		'CEST': 'Europe/Paris',
		'AEST': 'Australia/Sydney',
		'AEDT': 'Australia/Sydney',
		'NZST': 'Pacific/Auckland',
		'NZDT': 'Pacific/Auckland',
		'US/Eastern': 'America/New_York',
		'US/Central': 'America/Chicago',
		'US/Mountain': 'America/Denver',
		'US/Pacific': 'America/Los_Angeles',
		'Japan': 'Asia/Tokyo',
		'Etc/GMT': 'Europe/London',
	};

	const VALID_FREQ = ['SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
	const VALID_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

	onMount(() => {
		requestAnimationFrame(() => {
			visible = true;
		});
		icsInput = SAMPLE_ICS;
	});

	function normalize(text: string): string {
		// Unfold continuation lines first, then normalize endings
		return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
	}

	function generateUid(): string {
		const now = new Date();
		const ts = now.toISOString().replace(/[-:T.]/g, '').slice(0, 15) + 'Z';
		const rand = Math.random().toString(36).substring(2, 10);
		return `${ts}-${rand}@ics-fixer`;
	}

	function getNowStamp(): string {
		const now = new Date();
		return now.toISOString().replace(/[-:T.]/g, '').slice(0, 15) + 'Z';
	}

	function validateRrule(rrule: string): string | null {
		const parts = rrule.replace('RRULE:', '').split(';');
		const freqPart = parts.find((p) => p.startsWith('FREQ='));
		if (!freqPart) return 'RRULE missing FREQ';
		const freq = freqPart.split('=')[1];
		if (!VALID_FREQ.includes(freq)) return `Invalid FREQ value: ${freq}`;

		const bydayPart = parts.find((p) => p.startsWith('BYDAY='));
		if (bydayPart) {
			const days = bydayPart.split('=')[1].split(',');
			for (const day of days) {
				const cleanDay = day.replace(/^-?\d+/, '');
				if (!VALID_DAYS.includes(cleanDay)) return `Invalid BYDAY value: ${day}`;
			}
		}

		const countPart = parts.find((p) => p.startsWith('COUNT='));
		if (countPart) {
			const count = parseInt(countPart.split('=')[1]);
			if (isNaN(count) || count < 1) return `Invalid COUNT: ${countPart.split('=')[1]}`;
		}

		const intervalPart = parts.find((p) => p.startsWith('INTERVAL='));
		if (intervalPart) {
			const interval = parseInt(intervalPart.split('=')[1]);
			if (isNaN(interval) || interval < 1) return `Invalid INTERVAL: ${intervalPart.split('=')[1]}`;
		}

		return null;
	}

	function validateAndFix() {
		issues = [];
		let content = icsInput.trim();

		if (!content) {
			issues = [{ type: 'error', message: 'No ICS content provided.' }];
			hasValidated = true;
			fixedIcs = '';
			return;
		}

		content = normalize(content);
		let lines = content.split('\n');

		// === STRUCTURAL FIXES ===

		// Fix: Missing BEGIN:VCALENDAR
		if (!lines[0]?.startsWith('BEGIN:VCALENDAR')) {
			lines.unshift('BEGIN:VCALENDAR');
			issues.push({ type: 'fixed', message: 'Added missing BEGIN:VCALENDAR.' });
		}

		// Fix: Missing END:VCALENDAR
		if (!lines[lines.length - 1]?.startsWith('END:VCALENDAR')) {
			lines.push('END:VCALENDAR');
			issues.push({ type: 'fixed', message: 'Added missing END:VCALENDAR.' });
		}

		// Fix: Missing VERSION
		const hasVersion = lines.some((l) => l.startsWith('VERSION:'));
		if (!hasVersion) {
			// Insert after BEGIN:VCALENDAR
			lines.splice(1, 0, 'VERSION:2.0');
			issues.push({ type: 'fixed', message: 'Added missing VERSION:2.0.' });
		}

		// Fix: Missing PRODID
		const hasProdid = lines.some((l) => l.startsWith('PRODID:'));
		if (!hasProdid) {
			const versionIdx = lines.findIndex((l) => l.startsWith('VERSION:'));
			lines.splice(versionIdx + 1, 0, 'PRODID:-//ICS Fixer//EN');
			issues.push({ type: 'fixed', message: 'Added missing PRODID.' });
		}

		// Fix: Missing CALSCALE
		const hasCalscale = lines.some((l) => l.startsWith('CALSCALE:'));
		if (!hasCalscale) {
			const prodidIdx = lines.findIndex((l) => l.startsWith('PRODID:'));
			lines.splice(prodidIdx + 1, 0, 'CALSCALE:GREGORIAN');
			issues.push({ type: 'fixed', message: 'Added missing CALSCALE:GREGORIAN.' });
		}

		// === TIMEZONE ALIAS NORMALIZATION ===
		// Replace invalid TZID aliases (EST, PST, JST, etc.) with IANA names
		const aliasesFixed = new Set<string>();
		lines = lines.map((line) => {
			const match = line.match(/TZID=([^:;]+)/);
			if (match) {
				const tzid = match[1];
				const canonical = TZID_ALIASES[tzid];
				if (canonical) {
					aliasesFixed.add(`${tzid} -> ${canonical}`);
					return line.replace(`TZID=${tzid}`, `TZID=${canonical}`);
				}
			}
			return line;
		});
		for (const alias of aliasesFixed) {
			issues.push({ type: 'fixed', message: `Normalized timezone alias: ${alias}.` });
		}

		// === COLLECT REFERENCED TIMEZONES ===
		const referencedTzids = new Set<string>();
		for (const line of lines) {
			const match = line.match(/TZID=([^:;]+)/);
			if (match) referencedTzids.add(match[1]);
		}

		// Check existing VTIMEZONE definitions
		const definedTzids = new Set<string>();
		for (let i = 0; i < lines.length; i++) {
			if (lines[i] === 'BEGIN:VTIMEZONE') {
				for (let j = i + 1; j < lines.length; j++) {
					if (lines[j] === 'END:VTIMEZONE') break;
					const tzMatch = lines[j].match(/^TZID:(.+)/);
					if (tzMatch) definedTzids.add(tzMatch[1]);
				}
			}
		}

		// Add missing VTIMEZONE blocks
		const missingTzids = [...referencedTzids].filter((tz) => !definedTzids.has(tz));
		if (missingTzids.length > 0) {
			const tzBlocks: string[] = [];
			for (const tz of missingTzids) {
				if (KNOWN_TIMEZONES[tz]) {
					tzBlocks.push(KNOWN_TIMEZONES[tz]);
					issues.push({ type: 'fixed', message: `Added missing VTIMEZONE for ${tz}.` });
				} else {
					issues.push({
						type: 'error',
						message: `TZID "${tz}" referenced but unknown — cannot generate VTIMEZONE. Use an IANA timezone name.`
					});
				}
			}

			if (tzBlocks.length > 0) {
				// Find insert point: after last header property, before first component
				let insertIdx = 0;
				for (let i = 0; i < lines.length; i++) {
					if (/^(VERSION|PRODID|CALSCALE|METHOD|X-):/.test(lines[i])) {
						insertIdx = i;
					}
					if (/^BEGIN:(VEVENT|VTODO|VJOURNAL|VFREEBUSY)$/.test(lines[i])) break;
				}
				const tzLines = tzBlocks.join('\n').split('\n');
				lines.splice(insertIdx + 1, 0, ...tzLines);
			}
		}

		// === VEVENT FIXES ===
		let eventCount = 0;
		const nowStamp = getNowStamp();
		const fixedLines: string[] = [];
		let inComponent = false;
		let componentType = '';
		let componentLines: string[] = [];
		let componentHasUid = false;
		let componentHasDtstamp = false;
		let componentHasDtstart = false;
		let componentHasDtend = false;

		for (const line of lines) {
			if (/^BEGIN:(VEVENT|VTODO|VJOURNAL|VFREEBUSY)$/.test(line)) {
				inComponent = true;
				componentType = line.replace('BEGIN:', '');
				componentLines = [line];
				componentHasUid = false;
				componentHasDtstamp = false;
				componentHasDtstart = false;
				componentHasDtend = false;
				eventCount++;
				continue;
			}

			if (inComponent && line === `END:${componentType}`) {
				// Validate and fix this component
				if (!componentHasUid) {
					componentLines.push(`UID:${generateUid()}`);
					issues.push({ type: 'fixed', message: `${componentType} #${eventCount}: Added missing UID.` });
				}
				if (!componentHasDtstamp) {
					componentLines.push(`DTSTAMP:${nowStamp}`);
					issues.push({ type: 'fixed', message: `${componentType} #${eventCount}: Added missing DTSTAMP.` });
				}
				if (!componentHasDtstart) {
					issues.push({ type: 'error', message: `${componentType} #${eventCount}: Missing DTSTART — cannot auto-fix.` });
				}

				// Validate RRULE if present
				for (const cl of componentLines) {
					if (cl.startsWith('RRULE:')) {
						const rruleError = validateRrule(cl);
						if (rruleError) {
							issues.push({ type: 'warning', message: `${componentType} #${eventCount}: ${rruleError}.` });
						}
					}
				}

				componentLines.push(line);
				fixedLines.push(...componentLines);
				inComponent = false;
				componentLines = [];
				continue;
			}

			if (inComponent) {
				if (line.startsWith('UID:')) componentHasUid = true;
				if (line.startsWith('DTSTAMP:')) componentHasDtstamp = true;
				if (line.startsWith('DTSTART')) componentHasDtstart = true;
				if (line.startsWith('DTEND')) componentHasDtend = true;
				componentLines.push(line);
			} else {
				fixedLines.push(line);
			}
		}

		// === LINE FOLDING ===
		const foldedLines: string[] = [];
		let foldCount = 0;
		for (const line of fixedLines) {
			const encoded = new TextEncoder().encode(line);
			if (encoded.length <= 75) {
				foldedLines.push(line);
			} else {
				foldCount++;
				let remaining = line;
				let first = true;
				while (new TextEncoder().encode(remaining).length > 75) {
					const maxBytes = first ? 75 : 74;
					let cutPoint = 0;
					let byteCount = 0;
					for (let i = 0; i < remaining.length; i++) {
						const charBytes = new TextEncoder().encode(remaining[i]).length;
						if (byteCount + charBytes > maxBytes) break;
						byteCount += charBytes;
						cutPoint = i + 1;
					}
					foldedLines.push((first ? '' : ' ') + remaining.substring(0, cutPoint));
					remaining = remaining.substring(cutPoint);
					first = false;
				}
				if (remaining.length > 0) {
					foldedLines.push((first ? '' : ' ') + remaining);
				}
			}
		}
		if (foldCount > 0) {
			issues.push({ type: 'fixed', message: `Folded ${foldCount} long line(s) to comply with 75-octet limit.` });
		}

		// Convert to CRLF for RFC 5545 compliance
		fixedIcs = foldedLines.join('\r\n') + '\r\n';

		// Summary
		const errors = issues.filter((i) => i.type === 'error').length;
		const warnings = issues.filter((i) => i.type === 'warning').length;
		const fixes = issues.filter((i) => i.type === 'fixed').length;

		if (errors === 0 && warnings === 0 && fixes === 0) {
			issues.push({ type: 'fixed', message: 'ICS file is valid — no issues found!' });
		}

		hasValidated = true;
	}

	function downloadIcs() {
		const content = fixedIcs || icsInput.replace(/\r?\n/g, '\r\n');
		const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'calendar.ics';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			icsInput = (e.target?.result as string) || '';
			hasValidated = false;
			issues = [];
			fixedIcs = '';
		};
		reader.readAsText(file);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			icsInput = (e.target?.result as string) || '';
			hasValidated = false;
			issues = [];
			fixedIcs = '';
		};
		reader.readAsText(file);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function clearInput() {
		icsInput = '';
		hasValidated = false;
		issues = [];
		fixedIcs = '';
	}

	function loadSample() {
		icsInput = SAMPLE_ICS;
		hasValidated = false;
		issues = [];
		fixedIcs = '';
	}
</script>

<svelte:head>
	<title>ICS Validator & Fixer - Hiro Kuwana</title>
	<meta
		name="description"
		content="Validate and fix .ics calendar files for Google Calendar, Apple Calendar, and Outlook. Auto-fixes missing VTIMEZONE, UID, line folding, and more."
	/>
</svelte:head>

<article class="ics-page" class:visible>
	<header class="page-header">
		<h1 class="page-title text-primary">ICS Validator & Fixer</h1>
		<p class="page-subtitle text-secondary">
			Paste or upload any .ics file — auto-fixes missing timezones, UIDs, line folding, and other
			issues that break Google Calendar, Outlook, and Apple Calendar imports.
		</p>
	</header>

	<div class="ics-container">
		<!-- Input section -->
		<div
			class="input-section"
			class:dragging={isDragging}
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="region"
			aria-label="ICS file input"
		>
			<div class="input-actions">
				<label class="btn btn-sm btn-outline btn-secondary upload-btn">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" y1="3" x2="12" y2="15" />
					</svg>
					Upload .ics
					<input
						type="file"
						accept=".ics,.ical,.ifb,.icalendar"
						onchange={handleFileUpload}
						class="hidden"
					/>
				</label>
				<button class="btn btn-sm btn-outline btn-secondary" onclick={loadSample}>
					Load Sample
				</button>
				<button class="btn btn-sm btn-ghost text-secondary" onclick={clearInput}>Clear</button>
			</div>

			<div class="textarea-wrapper" class:dragging={isDragging}>
				{#if isDragging}
					<div class="drop-overlay">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						<span>Drop your .ics file here</span>
					</div>
				{/if}
				<textarea
					class="textarea textarea-bordered ics-textarea"
					placeholder="Paste your .ics file content here, or drag & drop a file..."
					bind:value={icsInput}
					rows="18"
				></textarea>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="action-buttons">
			<button class="btn btn-primary btn-lg" onclick={validateAndFix} disabled={!icsInput.trim()}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				Validate & Fix
			</button>
		</div>

		<!-- Results section -->
		{#if hasValidated}
			<div class="results-section">
				<div class="results-header">
					<h2 class="results-title text-primary">Results</h2>
					<div class="results-summary">
						{#if issues.filter((i) => i.type === 'error').length > 0}
							<span class="badge badge-error">{issues.filter((i) => i.type === 'error').length} error{issues.filter((i) => i.type === 'error').length > 1 ? 's' : ''}</span>
						{/if}
						{#if issues.filter((i) => i.type === 'warning').length > 0}
							<span class="badge badge-warning">{issues.filter((i) => i.type === 'warning').length} warning{issues.filter((i) => i.type === 'warning').length > 1 ? 's' : ''}</span>
						{/if}
						{#if issues.filter((i) => i.type === 'fixed').length > 0}
							<span class="badge badge-success">{issues.filter((i) => i.type === 'fixed').length} fix{issues.filter((i) => i.type === 'fixed').length > 1 ? 'es' : ''} applied</span>
						{/if}
					</div>
				</div>

				<div class="issues-list">
					{#each issues as issue}
						<div class="issue-item issue-{issue.type}">
							<span class="issue-icon">
								{#if issue.type === 'error'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
									</svg>
								{:else if issue.type === 'warning'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
									</svg>
								{:else}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
									</svg>
								{/if}
							</span>
							<span class="issue-message">{issue.message}</span>
						</div>
					{/each}
				</div>

				{#if fixedIcs}
					<button class="btn btn-accent btn-lg download-btn" onclick={downloadIcs}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Download Fixed .ics
					</button>
				{/if}
			</div>
		{/if}

		<!-- Info section -->
		<div class="info-section">
			<h3 class="info-title text-primary">What gets fixed automatically</h3>
			<div class="info-grid">
				<div class="info-card">
					<strong>Missing VTIMEZONE</strong>
					<span class="text-secondary">Adds timezone definitions for referenced TZIDs (Asia/Tokyo, America/New_York, etc.)</span>
				</div>
				<div class="info-card">
					<strong>Invalid Timezone Names</strong>
					<span class="text-secondary">Converts aliases like EST, PST, JST to proper IANA names</span>
				</div>
				<div class="info-card">
					<strong>Missing UID / DTSTAMP</strong>
					<span class="text-secondary">Auto-generates unique IDs and timestamps for each event</span>
				</div>
				<div class="info-card">
					<strong>Line Folding</strong>
					<span class="text-secondary">Wraps lines exceeding 75 octets per RFC 5545</span>
				</div>
				<div class="info-card">
					<strong>Missing Headers</strong>
					<span class="text-secondary">Adds VERSION, PRODID, CALSCALE if missing</span>
				</div>
				<div class="info-card">
					<strong>RRULE Validation</strong>
					<span class="text-secondary">Checks recurrence rules for valid FREQ, BYDAY, COUNT, INTERVAL</span>
				</div>
			</div>
		</div>
	</div>

	<footer class="page-footer">
		<a href="/" class="back-link text-secondary hover:text-accent">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path
					d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span>Back to home</span>
		</a>
	</footer>
</article>

<style>
	.ics-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 4rem 2rem 6rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.ics-page.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.75rem;
		letter-spacing: -0.03em;
	}

	.page-subtitle {
		font-size: 1rem;
		margin: 0;
		max-width: 540px;
		margin-inline: auto;
		line-height: 1.6;
	}

	.ics-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.input-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.upload-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.textarea-wrapper {
		position: relative;
		border-radius: var(--radius-lg, 12px);
		transition: box-shadow 0.2s ease;
	}

	.textarea-wrapper.dragging {
		box-shadow: 0 0 0 3px oklch(0.7 0.15 250 / 0.4);
	}

	.drop-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: oklch(0.95 0.03 250 / 0.95);
		border-radius: var(--radius-lg, 12px);
		z-index: 10;
		font-weight: 500;
		color: oklch(0.5 0.15 250);
		pointer-events: none;
	}

	.ics-textarea {
		font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Cascadia Code', monospace;
		font-size: 0.8125rem;
		line-height: 1.5;
		resize: vertical;
		min-height: 200px;
		width: 100%;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
	}

	.action-buttons .btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.results-section {
		border: 1px solid var(--color-border, oklch(0.85 0 0));
		border-radius: var(--radius-lg, 12px);
		padding: 1.5rem;
		background: var(--color-bg-subtle, oklch(0.97 0 0));
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.results-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.results-summary {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
	}

	.badge-error {
		background: oklch(0.93 0.06 25);
		color: oklch(0.45 0.15 25);
	}

	.badge-warning {
		background: oklch(0.93 0.06 85);
		color: oklch(0.45 0.12 85);
	}

	.badge-success {
		background: oklch(0.93 0.06 150);
		color: oklch(0.4 0.12 150);
	}

	.issues-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 1.5rem;
	}

	.issue-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.issue-icon {
		flex-shrink: 0;
		margin-top: 1px;
	}

	.issue-error {
		background: oklch(0.95 0.04 25);
		color: oklch(0.45 0.15 25);
	}

	.issue-warning {
		background: oklch(0.95 0.04 85);
		color: oklch(0.45 0.12 85);
	}

	.issue-fixed {
		background: oklch(0.95 0.04 150);
		color: oklch(0.4 0.12 150);
	}

	.download-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 auto;
	}

	/* Info section */
	.info-section {
		margin-top: 1rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border, oklch(0.85 0 0));
	}

	.info-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 1rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.info-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.875rem 1rem;
		border: 1px solid var(--color-border, oklch(0.88 0 0));
		border-radius: 8px;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.info-card strong {
		font-size: 0.875rem;
	}

	/* Footer */
	.page-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border, oklch(0.85 0 0));
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.back-link:hover svg {
		transform: translateX(-4px);
	}

	.back-link svg {
		transition: transform 0.2s ease;
	}

	.hidden {
		display: none;
	}

	@media (max-width: 640px) {
		.ics-page {
			padding: 3rem 1.25rem 4rem;
		}

		.page-title {
			font-size: 1.75rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.results-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
