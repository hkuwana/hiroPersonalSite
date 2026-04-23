import type { RequestHandler } from './$types';
import { getAllEssays } from '$lib/essays/utils/essayIndex';
import { SITE } from '$data/constants';

export const prerender = true;

const rawEssays = import.meta.glob('/src/content/essays/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function stripNonContent(markdown: string): string {
	return markdown
		.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.trim();
}

export const GET: RequestHandler = async () => {
	const essays = getAllEssays();

	const sections = essays
		.map((essay) => {
			const raw = rawEssays[`/src/content/essays/${essay.slug}.md`] ?? '';
			const body = stripNonContent(raw);
			const updated = essay.metadata.updated ? `\nUpdated: ${essay.metadata.updated}` : '';
			return `# ${essay.metadata.title}

Source: ${SITE.url}/essays/${essay.slug}
Published: ${essay.metadata.date}${updated}

${body}`;
		})
		.join('\n\n---\n\n');

	const count = essays.length;
	const body = `# ${SITE.name} — Full essay corpus

${count} published essay${count === 1 ? '' : 's'}, concatenated for deep ingestion by AI crawlers.
Site: ${SITE.url}
Index: ${SITE.url}/llms.txt

---

${sections}
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
