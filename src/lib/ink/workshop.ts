import { PROJECTS } from '$data/constants';

// Stable URLs share the site's project records, rather than a second portfolio.
// Two records point at the site's own icon; the workshop shows the real
// Exonians mark, and no logo for Pebblr rather than a wrong one.
const LOGO: Record<string, string | null> = {
	'exonians-in-japan': '/logos/exonians-e.svg',
	pebblr: null
};
// Old work that has no live site still has its code.
const SOURCE: Record<string, string> = { flybyrd: 'https://github.com/hkuwana/flybyrd' };
export const WORKSHOP_PROJECTS = PROJECTS.map((project) => {
	const id = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	return {
		...project,
		id,
		logo: id in LOGO ? LOGO[id] : project.logo,
		href:
			'link' in project
				? project.link
				: 'github' in project
					? project.github
					: (SOURCE[id] ?? null),
		source: 'github' in project ? project.github : (SOURCE[id] ?? null)
	};
});

export function workshopProject(id: string | null) {
	return WORKSHOP_PROJECTS.findIndex((project) => project.id === id);
}

// The places a visitor can go inside: the windmill workshop (projects), the
// notice board (an emaki of essays) and the izakaya (an emaki of the site).
export const ROOMS = ['windmill', 'board', 'izakaya'] as const;
export type Room = (typeof ROOMS)[number];

export function roomOf(href: string): Room | null {
	const place = new URL(href).searchParams.get('place');
	return ROOMS.find((room) => room === place) ?? null;
}

export function roomUrl(href: string, room: Room, project = WORKSHOP_PROJECTS[0].id) {
	const url = new URL(href);
	url.searchParams.set('place', room);
	if (room === 'windmill') url.searchParams.set('project', project);
	else url.searchParams.delete('project');
	return url;
}

export function workshopUrl(href: string, project = WORKSHOP_PROJECTS[0].id) {
	return roomUrl(href, 'windmill', project);
}

export function villageUrl(href: string) {
	const url = new URL(href);
	url.searchParams.delete('place');
	url.searchParams.delete('project');
	return url;
}
