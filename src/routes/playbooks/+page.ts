import type { PageLoad } from './$types';
import { getAllPlaybooks } from '$lib/playbooks/utils/playbookIndex';

export const prerender = true;

export const load: PageLoad = async () => {
	const playbooks = getAllPlaybooks().map((playbook) => ({
		slug: playbook.slug,
		title: playbook.metadata.title,
		date: playbook.metadata.date,
		description: playbook.metadata.description
	}));

	return { playbooks };
};
