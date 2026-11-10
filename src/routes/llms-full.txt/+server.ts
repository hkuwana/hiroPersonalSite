import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';

export const prerender = true;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

// Reads `key: "value"` / `key: value` lines from a simple YAML frontmatter block.
const readFrontmatter = (raw: string) => {
	const fields: Record<string, string> = {};
	const match = raw.match(FRONTMATTER);
	if (match) {
		for (const line of match[1].split(/\r?\n/)) {
			const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
			if (!kv) continue;
			let value = kv[2].trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			fields[kv[1]] = value;
		}
	}
	return { fields, body: raw.replace(FRONTMATTER, '').trim() };
};

const section = (title: string, date: string, url: string, body: string) =>
	`# ${title}\n\nDate: ${date}\nURL: ${url}\n\n${body}\n`;

export const GET: RequestHandler = async () => {
	const essayFiles = import.meta.glob(['/src/content/essays/*.md', '!/src/content/essays/_*.md'], {
		eager: true,
		query: '?raw',
		import: 'default'
	}) as Record<string, string>;
	const guideFiles = import.meta.glob('/src/content/ai-guides/index.md', {
		eager: true,
		query: '?raw',
		import: 'default'
	}) as Record<string, string>;

	const essays = Object.entries(essayFiles)
		.map(([path, raw]) => {
			const slug = path.split('/').pop()?.replace('.md', '') || '';
			const { fields, body } = readFrontmatter(raw);
			return {
				title: fields.title ?? slug,
				date: fields.date ?? '',
				url: `${SITE.url}/essays/${slug}`,
				body
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const guides = Object.values(guideFiles).map((raw) => {
		const { fields, body } = readFrontmatter(raw);
		return {
			title: fields.title ?? 'AI guides',
			date: fields.updated ?? fields.date ?? '',
			url: `${SITE.url}/ai-guides`,
			body
		};
	});

	const parts = [...essays, ...guides].map((p) => section(p.title, p.date, p.url, p.body));

	return new Response(parts.join('\n---\n\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
