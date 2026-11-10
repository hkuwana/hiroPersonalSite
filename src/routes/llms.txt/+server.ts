import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';

export const prerender = true;

interface EssayMetadata {
	title: string;
	date: string;
	description: string;
}

// Anchors are the <h2 id> values in src/content/ai-guides/index.md.
const AI_GUIDES = [
	{ id: 'self-editing-system-prompt', title: 'A self-editing system prompt for technical writing' },
	{ id: 'four-model-debate', title: 'How I run a 4-model debate to find a position I trust' },
	{ id: 'prompt-versioning', title: 'Local-first prompt versioning with plain text + git' },
	{ id: 'three-line-context', title: 'Give AI the right context in three lines' },
	{ id: 'show-me-where-youre-guessing', title: 'The "show me where you\'re guessing" prompt' },
	{ id: 'weekly-ai-checkin', title: 'A 20-minute weekly AI check-in' }
] as const;

const HEAD = `# Hiro Kuwana — hirokuwana.com

> Personal site of Hiro Kuwana, solo founder of Kaiwa (https://www.trykaiwa.com), a real-time AI conversation platform for language learners, and co-founder of Otterd (https://otterd.co), which builds custom AI workflows for private equity and hedge fund teams. The site holds essays, practical AI guides, and a small public tool API for calendar (.ics) files, contact (.vcf) files, and cleaning and redacting text before it reaches a model.

## Tool API

No auth. No storage: input is processed in memory only. Rate limit: 60 requests per minute per IP. Max body: 2 MB. CORS is open. Each endpoint answers GET with its own usage description in JSON.

- [API index](https://hirokuwana.com/api): JSON list of all endpoints and limits
- [OpenAPI 3.1 spec](https://hirokuwana.com/api/openapi.json): full request and response schemas
- POST https://hirokuwana.com/api/ics/format — validate and repair an ICS calendar (RFC 5545). Accepts raw .ics text or {"ics": "..."}. Returns JSON with issues, parsed events, and the repaired ics. Append ?output=ics to get raw text/calendar back, ready to save as a file.
- POST https://hirokuwana.com/api/vcf/split — split a multi-contact VCF into normalized single-contact vCards. Accepts raw .vcf text or {"vcf": "..."}. Returns JSON with fn, email, tel, org, and the vcf block per contact.
- POST https://hirokuwana.com/api/text/redact — replace personal data in text with reversible placeholders such as [EMAIL_1]. Accepts raw text or {"text": "...", "types": [...], "terms": [...]}. Returns JSON with the redacted text, the placeholder map, and counts per type. Detects only what a checksum or a fixed prefix confirms: card numbers (Luhn), IBANs (mod-97), Japan My Number, API keys and JWTs, emails, phone numbers, IP addresses, query URLs, postal codes. Person names are never detected. Pass them in "terms". There is no restore endpoint: reversal needs the real values, so it stays in the browser at /tools/safe-paste.
- POST https://hirokuwana.com/api/text/clean — remove characters that hide inside text: zero-width marks, text-direction overrides (Trojan Source), Unicode tag characters, control characters, private-use characters, look-alike spaces, and look-alike letters. Accepts raw text or {"text": "...", "types": [...]}. Returns JSON with the cleaned text, findings (type, codepoints, offsets), and counts. A TAG finding also carries "decoded": the ASCII the hidden run spells. Run this before untrusted text reaches a model, because a hidden instruction can travel this way. Deliberately keeps a zero-width joiner between emoji, a zero-width non-joiner in a joining script, and U+3000 (the ordinary Japanese space).

Examples:

    curl -X POST https://hirokuwana.com/api/ics/format --data-binary @calendar.ics
    curl -X POST "https://hirokuwana.com/api/ics/format?output=ics" --data-binary @broken.ics -o fixed.ics
    curl -X POST https://hirokuwana.com/api/vcf/split --data-binary @contacts.vcf
    curl -X POST https://hirokuwana.com/api/text/redact -H "content-type: application/json" -d '{"text": "call me on 03-1234-5678", "terms": ["Acme Corp"]}'
    curl -X POST https://hirokuwana.com/api/text/clean --data-binary @pasted.txt

## Content

- [Essays](https://hirokuwana.com/essays): product, language learning, human-centric AI
- [AI guides](https://hirokuwana.com/ai-guides): practical prompts and workflows
- [About](https://hirokuwana.com/about): who Hiro is, frequently asked questions
- [Tools](https://hirokuwana.com/tools): browser versions of the API tools
`;

const CONTACT = `## Contact

- Email: hiro [at] trykaiwa [dot] com
- Calendar: https://cal.com/hiro-kuwana/25-min?user=hiro-kuwana
`;

export const GET: RequestHandler = async () => {
	const essayFiles = import.meta.glob(['/src/content/essays/*.md', '!/src/content/essays/_*.md'], {
		eager: true
	});

	const essays = Object.entries(essayFiles)
		.map(([path, module]) => {
			const slug = path.split('/').pop()?.replace('.md', '') || '';
			const { metadata } = module as { metadata: EssayMetadata };
			return {
				slug,
				title: metadata?.title ?? slug,
				date: metadata?.date ?? '',
				description: metadata?.description ?? ''
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const essayLines = essays.map(
		(e) => `- [${e.title}](${SITE.url}/essays/${e.slug}): ${e.description} (${e.date})`
	);
	const guideLines = AI_GUIDES.map((g) => `- [${g.title}](${SITE.url}/ai-guides#${g.id})`);

	const body = `${HEAD}
## Essays

${essayLines.join('\n')}

## AI guides

${guideLines.join('\n')}

## Feeds

- [RSS](${SITE.url}/rss.xml): essays feed
- [llms-full.txt](${SITE.url}/llms-full.txt): full text of essays and AI guides

${CONTACT}`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
