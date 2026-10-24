import { PROJECTS } from '$data/constants';

// Stable URLs share the site's project records, rather than a second portfolio.
export const WORKSHOP_PROJECTS = PROJECTS.map((project) => ({
	...project,
	id: project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
	href: 'link' in project ? project.link : 'github' in project ? project.github : null,
	source: 'github' in project ? project.github : null
}));

export function workshopProject(id: string | null) {
	return WORKSHOP_PROJECTS.findIndex((project) => project.id === id);
}

export function workshopUrl(href: string, project = WORKSHOP_PROJECTS[0].id) {
	const url = new URL(href);
	url.searchParams.set('place', 'windmill');
	url.searchParams.set('project', project);
	return url;
}

export function villageUrl(href: string) {
	const url = new URL(href);
	url.searchParams.delete('place');
	url.searchParams.delete('project');
	return url;
}
