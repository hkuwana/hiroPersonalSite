/**
 * VCF parsing and normalization, shared by the /tools/vcf-splitter page and
 * the public /api/vcf/split endpoint. Pure functions, no DOM.
 */

export type VcfName = {
	formatted: string;
	family: string;
	given: string;
	additional: string;
	prefix: string;
	suffix: string;
};

export type VcfContact = {
	/** Normalized vCard block (CRLF line endings, FN and N guaranteed). */
	vcf: string;
	fn: string;
	email: string;
	tel: string;
	org: string;
};

function extractValue(line: string): string {
	const colonIdx = line.indexOf(':');
	if (colonIdx === -1) return '';
	return line.substring(colonIdx + 1).trim();
}

function isPropertyLine(line: string, property: string): boolean {
	const upper = line.toUpperCase();
	const prop = property.toUpperCase();
	return upper.startsWith(`${prop}:`) || upper.startsWith(`${prop};`);
}

function escapeVcardText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,');
}

function unescapeVcardText(value: string): string {
	return value.replace(/\\([nN,;\\])/g, (_, escaped: string) => {
		if (escaped.toLowerCase() === 'n') return '\n';
		return escaped;
	});
}

function splitVcardComponents(value: string): string[] {
	const parts: string[] = [];
	let current = '';
	let escaped = false;

	for (const char of value) {
		if (escaped) {
			current += `\\${char}`;
			escaped = false;
		} else if (char === '\\') {
			escaped = true;
		} else if (char === ';') {
			parts.push(current);
			current = '';
		} else {
			current += char;
		}
	}

	parts.push(escaped ? `${current}\\` : current);
	return parts;
}

function deriveNameFromFormatted(formatted: string): VcfName {
	const cleaned = formatted.trim().replace(/\s+/g, ' ');
	if (!cleaned) {
		return {
			formatted: 'Unknown',
			family: '',
			given: 'Unknown',
			additional: '',
			prefix: '',
			suffix: ''
		};
	}

	const parts = cleaned.split(' ');
	if (parts.length === 1) {
		return {
			formatted: cleaned,
			family: '',
			given: cleaned,
			additional: '',
			prefix: '',
			suffix: ''
		};
	}

	const familyParticles = new Set(['da', 'de', 'del', 'der', 'di', 'du', 'la', 'le', 'van', 'von']);
	let familyStart = parts.length - 1;

	for (let i = parts.length - 2; i >= 0; i -= 1) {
		const normalized = parts[i].replace(/\.$/, '').toLowerCase();
		if (!familyParticles.has(normalized)) break;
		familyStart = i;
	}

	return {
		formatted: cleaned,
		family: parts.slice(familyStart).join(' '),
		given: parts.slice(0, familyStart).join(' '),
		additional: '',
		prefix: '',
		suffix: ''
	};
}

function buildContactName(fn: string, structuredName: string): VcfName {
	if (structuredName) {
		const parts = splitVcardComponents(structuredName).map(unescapeVcardText);
		const family = parts[0] ?? '';
		const given = parts[1] ?? '';
		const additional = parts[2] ?? '';
		const prefix = parts[3] ?? '';
		const suffix = parts[4] ?? '';
		const formatted =
			fn ||
			[prefix, given, additional, family, suffix]
				.map((part) => part.trim())
				.filter(Boolean)
				.join(' ') ||
			'Unknown';

		return { formatted, family, given, additional, prefix, suffix };
	}

	return deriveNameFromFormatted(fn);
}

function structuredNameLine(name: VcfName): string {
	return `N:${[name.family, name.given, name.additional, name.prefix, name.suffix]
		.map(escapeVcardText)
		.join(';')}`;
}

function normalizeVcardBlock(block: string, name: VcfName): string {
	const lines = block
		.trim()
		.split('\n')
		.map((line) => line.trimEnd());
	const fnIndex = lines.findIndex((line) => isPropertyLine(line, 'FN'));
	const versionIndex = lines.findIndex((line) => isPropertyLine(line, 'VERSION'));
	const normalized = [...lines];

	if (fnIndex === -1) {
		const insertAt = versionIndex === -1 ? 1 : versionIndex + 1;
		normalized.splice(insertAt, 0, `FN:${escapeVcardText(name.formatted)}`);
	}

	const freshFnIndex = normalized.findIndex((line) => isPropertyLine(line, 'FN'));
	const freshNIndex = normalized.findIndex((line) => isPropertyLine(line, 'N'));
	const line = structuredNameLine(name);

	if (freshNIndex === -1) {
		normalized.splice(freshFnIndex === -1 ? 1 : freshFnIndex + 1, 0, line);
	} else {
		normalized[freshNIndex] = line;
	}

	return normalized.join('\r\n');
}

/** Split a multi-contact VCF text into normalized single-contact vCards. */
export function splitVcf(text: string): VcfContact[] {
	const normalized = text
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.replace(/\n[ \t]/g, '');
	const result: VcfContact[] = [];
	const regex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(normalized)) !== null) {
		const block = match[0];
		const lines = block.split('\n');
		let fn = '';
		let structuredName = '';
		let email = '';
		let tel = '';
		let org = '';
		for (const line of lines) {
			const upper = line.toUpperCase();
			if (upper.startsWith('FN:') || upper.startsWith('FN;')) {
				fn = extractValue(line);
			} else if (upper.startsWith('N:') || upper.startsWith('N;')) {
				structuredName = extractValue(line);
			} else if (!email && (upper.startsWith('EMAIL:') || upper.startsWith('EMAIL;'))) {
				email = extractValue(line);
			} else if (!tel && (upper.startsWith('TEL:') || upper.startsWith('TEL;'))) {
				tel = extractValue(line);
			} else if (!org && (upper.startsWith('ORG:') || upper.startsWith('ORG;'))) {
				org = extractValue(line).replace(/;+$/, '');
			}
		}
		const name = buildContactName(fn, structuredName);
		result.push({
			vcf: normalizeVcardBlock(block, name),
			fn: name.formatted,
			email,
			tel,
			org
		});
	}
	return result;
}
