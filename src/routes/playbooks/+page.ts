import type { PageLoad } from './$types';
import { getAllPlaybooks, type PlaybookLocale } from '$lib/playbooks/utils/playbookIndex';

export const prerender = true;

function localeFromPath(pathname: string): PlaybookLocale {
	return pathname.startsWith('/ja/') || pathname === '/ja' ? 'ja' : 'en';
}

export const load: PageLoad = async ({ url }) => {
	const locale = localeFromPath(url.pathname);
	const playbooks = getAllPlaybooks({ locale, includeDrafts: import.meta.env.DEV }).map(
		(playbook) => ({
			slug: playbook.slug,
			title: playbook.metadata.title,
			date: playbook.metadata.date,
			description: playbook.metadata.description,
			locale: playbook.locale,
			isDraft: playbook.metadata.status === 'draft'
		})
	);

	return { playbooks, requestedLocale: locale };
};
