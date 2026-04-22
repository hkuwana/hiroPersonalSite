import type { RequestHandler } from './$types';
import { getAllEssays } from '$lib/essays/utils/essayIndex';
import { SITE, PERSONAL, TOOLS, CONTACT } from '$data/constants';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const essays = getAllEssays();

	const essaysList = essays
		.map(
			(essay) =>
				`- [${essay.metadata.title}](${SITE.url}/essays/${essay.slug}) — ${essay.metadata.description}`
		)
		.join('\n');

	const toolsList = TOOLS.map((tool) => `- [${tool.name}](${SITE.url}${tool.href}) — ${tool.description}`).join(
		'\n'
	);

	const body = `# ${SITE.name}

> ${SITE.description}

Personal site of ${PERSONAL.fullName} (${PERSONAL.displayName}). ${PERSONAL.tagline}.

${PERSONAL.displayName} is a Japanese-American entrepreneur and self-taught developer. Founder of ${PERSONAL.company} (${PERSONAL.companyWebsite}). Studied Environmental Engineering at ${PERSONAL.university}. Writing essays on AI, automation, and building alone.

## Essays

${essaysList}

## Tools

${toolsList}

## Contact

- Email: ${CONTACT.email}
- Book a call: ${CONTACT.cal}
- Site: ${SITE.url}

## Optional

- [Essays feed (RSS)](${SITE.url}/feed.xml)
- [Sitemap](${SITE.url}/sitemap.xml)
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
