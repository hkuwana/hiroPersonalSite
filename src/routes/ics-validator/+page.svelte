<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let icsInput = $state('');
	let issues: { type: 'error' | 'warning' | 'fixed'; message: string }[] = $state([]);
	let fixedIcs = $state('');
	let hasValidated = $state(false);
	let isDragging = $state(false);
	let activeTab = $state<'editor' | 'preview'>('editor');
	let selectedTimezone = $state('Asia/Tokyo');
	let showResults = $state(false);

	// Parsed events for calendar preview
	interface CalendarEvent {
		summary: string;
		description: string;
		dtstart: Date;
		dtend: Date;
		rrule?: string;
		days?: string[];
		tzid?: string;
	}

	let parsedEvents: CalendarEvent[] = $state([]);

	const TIMEZONE_OPTIONS = [
		{ value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
		{ value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 9 },
		{ value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
		{ value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
		{ value: 'America/New_York', label: 'New York (ET)', offset: -5 },
		{ value: 'America/Chicago', label: 'Chicago (CT)', offset: -6 },
		{ value: 'America/Denver', label: 'Denver (MT)', offset: -7 },
		{ value: 'America/Los_Angeles', label: 'Los Angeles (PT)', offset: -8 },
		{ value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
		{ value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
		{ value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
		{ value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 10 },
		{ value: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: 12 },
	];

	const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const RRULE_DAY_MAP: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

	// Color palette for events
	const EVENT_COLORS = [
		'bg-primary/15 border-primary/30 text-primary',
		'bg-secondary/15 border-secondary/30 text-secondary',
		'bg-accent/15 border-accent/30 text-accent',
		'bg-info/15 border-info/30 text-info',
		'bg-success/15 border-success/30 text-success',
		'bg-warning/15 border-warning/30 text-warning',
		'bg-error/15 border-error/30 text-error',
	];

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
		// Try to detect user's timezone
		try {
			const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const match = TIMEZONE_OPTIONS.find(tz => tz.value === userTz);
			if (match) selectedTimezone = userTz;
		} catch {
			// keep default
		}
	});

	function normalize(text: string): string {
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

	// Parse ICS datetime string like 20260316T080000
	function parseIcsDate(dtStr: string): Date {
		const year = parseInt(dtStr.substring(0, 4));
		const month = parseInt(dtStr.substring(4, 6)) - 1;
		const day = parseInt(dtStr.substring(6, 8));
		const hour = parseInt(dtStr.substring(9, 11));
		const minute = parseInt(dtStr.substring(11, 13));
		return new Date(year, month, day, hour, minute);
	}

	// Convert time between timezones (simplified offset-based)
	function getTimezoneOffset(tz: string): number {
		const found = TIMEZONE_OPTIONS.find(t => t.value === tz);
		return found ? found.offset : 0;
	}

	function convertTime(hour: number, minute: number, fromTz: string, toTz: string): { hour: number; minute: number } {
		const fromOffset = getTimezoneOffset(fromTz);
		const toOffset = getTimezoneOffset(toTz);
		const diff = toOffset - fromOffset;
		let newHour = hour + diff;
		let newMinute = minute;
		if (newHour < 0) newHour += 24;
		if (newHour >= 24) newHour -= 24;
		return { hour: newHour, minute: newMinute };
	}

	function formatTime(hour: number, minute: number): string {
		return formatTime24(hour, minute);
	}

	function formatTime24(hour: number, minute: number): string {
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	}

	function toGmt(hour: number, minute: number): { hour: number; minute: number } {
		const offset = getTimezoneOffset(selectedTimezone);
		let gmtHour = hour - offset;
		if (gmtHour < 0) gmtHour += 24;
		if (gmtHour >= 24) gmtHour -= 24;
		return { hour: gmtHour, minute };
	}

	// Parse events from ICS text for preview
	function parseEventsFromIcs(text: string) {
		const content = normalize(text);
		const lines = content.split('\n');
		const events: CalendarEvent[] = [];
		let inEvent = false;
		let currentEvent: Partial<CalendarEvent> = {};
		let currentTzid = '';

		for (const line of lines) {
			if (line === 'BEGIN:VEVENT') {
				inEvent = true;
				currentEvent = {};
				currentTzid = '';
				continue;
			}
			if (line === 'END:VEVENT') {
				if (currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
					currentEvent.tzid = currentTzid || 'Asia/Tokyo';
					events.push(currentEvent as CalendarEvent);
				}
				inEvent = false;
				continue;
			}
			if (!inEvent) continue;

			if (line.startsWith('SUMMARY:')) {
				currentEvent.summary = line.substring(8);
			} else if (line.startsWith('DESCRIPTION:')) {
				currentEvent.description = line.substring(12);
			} else if (line.startsWith('DTSTART')) {
				const tzMatch = line.match(/TZID=([^:;]+)/);
				if (tzMatch) currentTzid = TZID_ALIASES[tzMatch[1]] || tzMatch[1];
				const dateMatch = line.match(/(\d{8}T\d{6})/);
				if (dateMatch) currentEvent.dtstart = parseIcsDate(dateMatch[1]);
			} else if (line.startsWith('DTEND')) {
				const dateMatch = line.match(/(\d{8}T\d{6})/);
				if (dateMatch) currentEvent.dtend = parseIcsDate(dateMatch[1]);
			} else if (line.startsWith('RRULE:')) {
				currentEvent.rrule = line.substring(6);
				const bydayMatch = line.match(/BYDAY=([^;]+)/);
				if (bydayMatch) {
					currentEvent.days = bydayMatch[1].split(',').map(d => d.replace(/^-?\d+/, ''));
				}
			}
		}

		parsedEvents = events;
	}

	// Get events for a specific day of the week (0=Sun, 6=Sat) converted to selected timezone
	function getEventsForDay(dayIndex: number): { event: CalendarEvent; startHour: number; startMin: number; endHour: number; endMin: number; colorClass: string }[] {
		const dayCode = VALID_DAYS[dayIndex];
		const result: { event: CalendarEvent; startHour: number; startMin: number; endHour: number; endMin: number; colorClass: string }[] = [];

		for (let i = 0; i < parsedEvents.length; i++) {
			const ev = parsedEvents[i];
			const eventDays = ev.days || [];

			if (!eventDays.includes(dayCode)) continue;

			const startH = ev.dtstart.getHours();
			const startM = ev.dtstart.getMinutes();
			const endH = ev.dtend.getHours();
			const endM = ev.dtend.getMinutes();

			const fromTz = ev.tzid || 'Asia/Tokyo';
			const converted_start = convertTime(startH, startM, fromTz, selectedTimezone);
			const converted_end = convertTime(endH, endM, fromTz, selectedTimezone);

			result.push({
				event: ev,
				startHour: converted_start.hour,
				startMin: converted_start.minute,
				endHour: converted_end.hour,
				endMin: converted_end.minute,
				colorClass: EVENT_COLORS[i % EVENT_COLORS.length],
			});
		}

		// Sort by start time
		result.sort((a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin));
		return result;
	}

	// Get stats from parsed events
	function getEventStats() {
		if (parsedEvents.length === 0) return null;

		let totalMinutesPerWeek = 0;
		const dayDistribution: Record<string, number> = {};

		for (const ev of parsedEvents) {
			const duration = (ev.dtend.getTime() - ev.dtstart.getTime()) / (1000 * 60);
			const days = ev.days || [];
			totalMinutesPerWeek += duration * days.length;

			for (const d of days) {
				dayDistribution[d] = (dayDistribution[d] || 0) + duration;
			}
		}

		const busiestDay = Object.entries(dayDistribution).sort((a, b) => b[1] - a[1])[0];
		const busiestDayName = busiestDay ? DAY_FULL_NAMES[RRULE_DAY_MAP[busiestDay[0]]] : 'N/A';

		return {
			totalEvents: parsedEvents.length,
			totalHoursPerWeek: Math.round(totalMinutesPerWeek / 60 * 10) / 10,
			busiestDay: busiestDayName,
			busiestDayHours: busiestDay ? Math.round(busiestDay[1] / 60 * 10) / 10 : 0,
		};
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
		if (!lines[0]?.startsWith('BEGIN:VCALENDAR')) {
			lines.unshift('BEGIN:VCALENDAR');
			issues.push({ type: 'fixed', message: 'Added missing BEGIN:VCALENDAR.' });
		}

		if (!lines[lines.length - 1]?.startsWith('END:VCALENDAR')) {
			lines.push('END:VCALENDAR');
			issues.push({ type: 'fixed', message: 'Added missing END:VCALENDAR.' });
		}

		const hasVersion = lines.some((l) => l.startsWith('VERSION:'));
		if (!hasVersion) {
			lines.splice(1, 0, 'VERSION:2.0');
			issues.push({ type: 'fixed', message: 'Added missing VERSION:2.0.' });
		}

		const hasProdid = lines.some((l) => l.startsWith('PRODID:'));
		if (!hasProdid) {
			const versionIdx = lines.findIndex((l) => l.startsWith('VERSION:'));
			lines.splice(versionIdx + 1, 0, 'PRODID:-//ICS Fixer//EN');
			issues.push({ type: 'fixed', message: 'Added missing PRODID.' });
		}

		const hasCalscale = lines.some((l) => l.startsWith('CALSCALE:'));
		if (!hasCalscale) {
			const prodidIdx = lines.findIndex((l) => l.startsWith('PRODID:'));
			lines.splice(prodidIdx + 1, 0, 'CALSCALE:GREGORIAN');
			issues.push({ type: 'fixed', message: 'Added missing CALSCALE:GREGORIAN.' });
		}

		// === TIMEZONE ALIAS NORMALIZATION ===
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
						message: `TZID "${tz}" referenced but unknown. Cannot generate VTIMEZONE. Use an IANA timezone name.`
					});
				}
			}

			if (tzBlocks.length > 0) {
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

		for (const line of lines) {
			if (/^BEGIN:(VEVENT|VTODO|VJOURNAL|VFREEBUSY)$/.test(line)) {
				inComponent = true;
				componentType = line.replace('BEGIN:', '');
				componentLines = [line];
				componentHasUid = false;
				componentHasDtstamp = false;
				componentHasDtstart = false;
				eventCount++;
				continue;
			}

			if (inComponent && line === `END:${componentType}`) {
				if (!componentHasUid) {
					componentLines.push(`UID:${generateUid()}`);
					issues.push({ type: 'fixed', message: `${componentType} #${eventCount}: Added missing UID.` });
				}
				if (!componentHasDtstamp) {
					componentLines.push(`DTSTAMP:${nowStamp}`);
					issues.push({ type: 'fixed', message: `${componentType} #${eventCount}: Added missing DTSTAMP.` });
				}
				if (!componentHasDtstart) {
					issues.push({ type: 'error', message: `${componentType} #${eventCount}: Missing DTSTART. Cannot auto-fix.` });
				}

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

		fixedIcs = foldedLines.join('\r\n') + '\r\n';

		const errors = issues.filter((i) => i.type === 'error').length;
		const warnings = issues.filter((i) => i.type === 'warning').length;
		const fixes = issues.filter((i) => i.type === 'fixed').length;

		if (errors === 0 && warnings === 0 && fixes === 0) {
			issues.push({ type: 'fixed', message: 'ICS file is valid. No issues found!' });
		}

		// Parse events for preview
		parseEventsFromIcs(fixedIcs || icsInput);

		hasValidated = true;
		showResults = true;
		// Switch to preview tab after validation
		if (parsedEvents.length > 0) {
			activeTab = 'preview';
		}
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
			parsedEvents = [];
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
			parsedEvents = [];
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
		parsedEvents = [];
		showResults = false;
		activeTab = 'editor';
	}

	function loadSample() {
		icsInput = SAMPLE_ICS;
		hasValidated = false;
		issues = [];
		fixedIcs = '';
		parsedEvents = [];
		showResults = false;
	}

	// Generate time slots from 6 AM to 11 PM
	const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

	let selectedEvent = $state<CalendarEvent | null>(null);
</script>

<svelte:head>
	<title>ICS Validator & Fixer - Hiro Kuwana</title>
	<meta
		name="description"
		content="Validate and fix .ics calendar files for Google Calendar, Apple Calendar, and Outlook. Auto-fixes missing VTIMEZONE, UID, line folding, and more."
	/>

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hirokuwana.com/ics-validator" />
	<meta property="og:title" content="ICS Validator & Fixer - Hiro Kuwana" />
	<meta property="og:description" content="Validate and fix .ics calendar files for Google Calendar, Apple Calendar, and Outlook. Auto-fixes missing VTIMEZONE, UID, line folding, and more." />
	<meta property="og:image" content="https://hirokuwana.com/hiro-social-preview.jpg" />
	<meta property="og:site_name" content="Hiro Kuwana" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="ICS Validator & Fixer - Hiro Kuwana" />
	<meta name="twitter:description" content="Validate and fix .ics calendar files for Google Calendar, Apple Calendar, and Outlook. Auto-fixes missing timezones, UIDs, and more." />
	<meta name="twitter:image" content="https://hirokuwana.com/hiro-social-preview.jpg" />

	<link rel="canonical" href="https://hirokuwana.com/ics-validator" />
</svelte:head>

<article class="ics-page" class:visible>
	<header class="page-header">
		<h1 class="page-title text-primary">ICS Validator & Fixer</h1>
		<p class="page-subtitle text-secondary">
			Paste or upload any .ics file. Auto-fixes missing timezones, UIDs, line folding, and other
			issues that break Google Calendar, Outlook, and Apple Calendar imports.
		</p>
	</header>

	<div class="ics-container">
		<!-- Tab navigation -->
		<div role="tablist" class="tabs tabs-bordered tabs-lg">
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'editor'}
				onclick={() => activeTab = 'editor'}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
				</svg>
				Editor
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'preview'}
				onclick={() => activeTab = 'preview'}
				disabled={parsedEvents.length === 0}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
				Week Preview
				{#if parsedEvents.length > 0}
					<span class="badge badge-sm badge-primary ml-2">{parsedEvents.length}</span>
				{/if}
			</button>
		</div>

		<!-- Editor tab -->
		{#if activeTab === 'editor'}
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
		{/if}

		<!-- Preview tab -->
		{#if activeTab === 'preview' && parsedEvents.length > 0}
			<!-- Timezone selector -->
			<div class="tz-bar">
				<div class="tz-selector">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<line x1="2" y1="12" x2="22" y2="12" />
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
					</svg>
					<select
						class="select select-bordered select-sm"
						bind:value={selectedTimezone}
					>
						{#each TIMEZONE_OPTIONS as tz}
							<option value={tz.value}>
								{tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})
							</option>
						{/each}
					</select>
				</div>

				<!-- Stats badges -->
				{#if getEventStats()}
					{@const stats = getEventStats()}
					{#if stats}
						<div class="stats-badges">
							<div class="badge badge-outline gap-1">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
								{stats.totalEvents} events
							</div>
							<div class="badge badge-outline gap-1">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
								{stats.totalHoursPerWeek}h/week
							</div>
							<div class="badge badge-outline gap-1">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
								Busiest: {stats.busiestDay} ({stats.busiestDayHours}h)
							</div>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Weekly calendar grid -->
			<div class="calendar-container">
				<div class="calendar-grid">
					<!-- Time column -->
					<div class="time-column">
						<div class="day-header-cell time-header-dual">
							<span class="tz-gmt-label">GMT</span>
							<span class="tz-local-label">{TIMEZONE_OPTIONS.find(t => t.value === selectedTimezone)?.label.split(' ')[0] ?? 'Local'}</span>
						</div>
						{#each timeSlots as hour}
							{@const gmt = toGmt(hour, 0)}
							<div class="time-label time-label-dual">
								<span class="time-gmt">{formatTime24(gmt.hour, gmt.minute)}</span>
								<span class="time-local">{formatTime24(hour, 0)}</span>
							</div>
						{/each}
					</div>

					<!-- Day columns -->
					{#each [0, 1, 2, 3, 4, 5, 6] as dayIdx}
						{@const dayEvents = getEventsForDay(dayIdx)}
						<div class="day-column">
							<div class="day-header-cell">
								<span class="day-name">{DAY_NAMES[dayIdx]}</span>
								{#if dayEvents.length > 0}
									<span class="day-event-count">{dayEvents.length}</span>
								{/if}
							</div>
							<div class="day-slots">
								{#each timeSlots as hour}
									<div class="time-slot"></div>
								{/each}

								<!-- Overlay events -->
								{#each dayEvents as ev}
									{@const startMinutes = (ev.startHour - 6) * 60 + ev.startMin}
									{@const endMinutes = (ev.endHour - 6) * 60 + ev.endMin}
									{@const duration = endMinutes - startMinutes}
									{@const topPercent = (startMinutes / (18 * 60)) * 100}
									{@const heightPercent = (duration / (18 * 60)) * 100}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="calendar-event {ev.colorClass}"
										style="top: {topPercent}%; height: {heightPercent}%;"
										onclick={() => selectedEvent = selectedEvent === ev.event ? null : ev.event}
									>
										<span class="event-time">{formatTime(ev.startHour, ev.startMin)}</span>
										<span class="event-title">{ev.event.summary}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Event detail popover -->
			{#if selectedEvent}
				<div class="event-detail card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex justify-between items-start">
							<h3 class="card-title text-primary">{selectedEvent.summary}</h3>
							<button class="btn btn-sm btn-ghost btn-circle" onclick={() => selectedEvent = null}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
							</button>
						</div>
						{#if selectedEvent.description}
							<p class="text-sm text-secondary">{selectedEvent.description}</p>
						{/if}
						<div class="event-meta">
							{#if selectedEvent.days}
								<div class="meta-item">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
									<span>{selectedEvent.days.map(d => DAY_NAMES[RRULE_DAY_MAP[d]]).join(', ')}</span>
								</div>
							{/if}
							<div class="meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
								<span>
									{formatTime(
										convertTime(selectedEvent.dtstart.getHours(), selectedEvent.dtstart.getMinutes(), selectedEvent.tzid || 'Asia/Tokyo', selectedTimezone).hour,
										convertTime(selectedEvent.dtstart.getHours(), selectedEvent.dtstart.getMinutes(), selectedEvent.tzid || 'Asia/Tokyo', selectedTimezone).minute
									)} - {formatTime(
										convertTime(selectedEvent.dtend.getHours(), selectedEvent.dtend.getMinutes(), selectedEvent.tzid || 'Asia/Tokyo', selectedTimezone).hour,
										convertTime(selectedEvent.dtend.getHours(), selectedEvent.dtend.getMinutes(), selectedEvent.tzid || 'Asia/Tokyo', selectedTimezone).minute
									)}
									({Math.round((selectedEvent.dtend.getTime() - selectedEvent.dtstart.getTime()) / (1000 * 60))} min)
								</span>
							</div>
							<div class="meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
								<span>{TIMEZONE_OPTIONS.find(t => t.value === selectedTimezone)?.label || selectedTimezone}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}

		<!-- Action buttons -->
		<div class="action-buttons">
			<button class="btn btn-primary btn-lg" onclick={validateAndFix} disabled={!icsInput.trim()}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				Validate & Fix
			</button>
			{#if fixedIcs}
				<button class="btn btn-accent btn-lg" onclick={downloadIcs}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					Download Fixed .ics
				</button>
			{/if}
		</div>

		<!-- Results section -->
		{#if hasValidated && showResults}
			<div class="results-section">
				<div class="collapse collapse-arrow bg-base-100 border border-base-300">
					<input type="checkbox" checked />
					<div class="collapse-title">
						<div class="results-header">
							<h2 class="results-title text-primary">Validation Results</h2>
							<div class="results-summary">
								{#if issues.filter((i) => i.type === 'error').length > 0}
									<span class="result-badge badge-error">{issues.filter((i) => i.type === 'error').length} error{issues.filter((i) => i.type === 'error').length > 1 ? 's' : ''}</span>
								{/if}
								{#if issues.filter((i) => i.type === 'warning').length > 0}
									<span class="result-badge badge-warning">{issues.filter((i) => i.type === 'warning').length} warning{issues.filter((i) => i.type === 'warning').length > 1 ? 's' : ''}</span>
								{/if}
								{#if issues.filter((i) => i.type === 'fixed').length > 0}
									<span class="result-badge badge-success">{issues.filter((i) => i.type === 'fixed').length} fix{issues.filter((i) => i.type === 'fixed').length > 1 ? 'es' : ''} applied</span>
								{/if}
							</div>
						</div>
					</div>
					<div class="collapse-content">
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
					</div>
				</div>
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
		max-width: 1100px;
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

	/* Tabs */
	.tabs {
		margin-bottom: 0.5rem;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Timezone bar */
	.tz-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: oklch(var(--b2));
		border-radius: 1rem;
		border: 1px solid oklch(var(--bc) / 0.08);
	}

	.tz-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stats-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	/* Calendar grid */
	.calendar-container {
		overflow-x: auto;
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 1rem;
		background: oklch(var(--b1));
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: 120px repeat(7, 1fr);
		min-width: 740px;
	}

	.time-column {
		border-right: 1px solid oklch(var(--bc) / 0.1);
	}

	.day-header-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.75rem 0.5rem;
		font-weight: 600;
		font-size: 0.8125rem;
		border-bottom: 2px solid oklch(var(--bc) / 0.1);
		background: oklch(var(--b2));
		position: sticky;
		top: 0;
		z-index: 5;
	}

	.day-name {
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.day-event-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		font-size: 0.625rem;
		font-weight: 700;
		background: oklch(var(--p) / 0.15);
		color: oklch(var(--p));
		border-radius: 9999px;
	}

	.time-label {
		height: 48px;
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		padding: 2px 8px 0 0;
		font-size: 0.6875rem;
		color: oklch(var(--bc) / 0.45);
		font-variant-numeric: tabular-nums;
		border-bottom: 1px solid oklch(var(--bc) / 0.05);
	}

	.time-label-dual {
		justify-content: space-between;
		padding: 2px 6px 0 6px;
		gap: 4px;
	}

	.time-gmt {
		color: oklch(var(--bc) / 0.3);
		font-size: 0.625rem;
	}

	.time-local {
		color: oklch(var(--bc) / 0.6);
		font-weight: 600;
		font-size: 0.6875rem;
	}

	.time-header-dual {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 6px;
	}

	.tz-gmt-label,
	.tz-local-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
	}

	.tz-gmt-label {
		color: oklch(var(--bc) / 0.3);
	}

	.tz-local-label {
		color: oklch(var(--bc) / 0.6);
	}

	.day-column {
		border-right: 1px solid oklch(var(--bc) / 0.05);
		position: relative;
	}

	.day-column:last-child {
		border-right: none;
	}

	.day-slots {
		position: relative;
	}

	.time-slot {
		height: 48px;
		border-bottom: 1px solid oklch(var(--bc) / 0.05);
	}

	.time-slot:nth-child(even) {
		background: oklch(var(--bc) / 0.015);
	}

	/* Calendar events */
	.calendar-event {
		position: absolute;
		left: 2px;
		right: 2px;
		border-radius: 6px;
		border-left: 3px solid;
		padding: 3px 6px;
		cursor: pointer;
		overflow: hidden;
		z-index: 2;
		transition: all 0.15s ease;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.calendar-event:hover {
		z-index: 3;
		box-shadow: 0 2px 8px oklch(var(--bc) / 0.15);
		transform: scale(1.02);
	}

	.event-time {
		font-size: 0.5625rem;
		font-weight: 600;
		opacity: 0.8;
		white-space: nowrap;
	}

	.event-title {
		font-size: 0.625rem;
		font-weight: 500;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	/* Event detail card */
	.event-detail {
		animation: fadeInUp 0.3s var(--ease-out-expo) forwards;
	}

	.event-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid oklch(var(--bc) / 0.1);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.7);
	}

	/* Input section */
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
		border-radius: 1rem;
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
		border-radius: 1rem;
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
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.action-buttons .btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Results section */
	.results-section {
		border-radius: 1rem;
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.results-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.results-summary {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.result-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
	}

	.result-badge.badge-error {
		background: oklch(0.93 0.06 25);
		color: oklch(0.45 0.15 25);
	}

	.result-badge.badge-warning {
		background: oklch(0.93 0.06 85);
		color: oklch(0.45 0.12 85);
	}

	.result-badge.badge-success {
		background: oklch(0.93 0.06 150);
		color: oklch(0.4 0.12 150);
	}

	.issues-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
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

	/* Info section */
	.info-section {
		margin-top: 1rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.1);
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
		border: 1px solid oklch(var(--bc) / 0.1);
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
		border-top: 1px solid oklch(var(--bc) / 0.1);
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

		.tz-bar {
			flex-direction: column;
			align-items: flex-start;
		}

		.stats-badges {
			width: 100%;
		}
	}
</style>
