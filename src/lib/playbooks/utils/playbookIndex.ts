import { SITE } from '$data/constants';

export interface PlaybookMetadata {
	title: string;
	date: string;
	description: string;
	updated?: string;
	status?: 'draft' | 'published';
	category?: 'automation' | 'education' | 'building' | 'essays';
	tags?: string[];
	heroImage?: string;
	featured?: boolean;
}

export interface Playbook {
	slug: string;
	metadata: PlaybookMetadata;
}

interface PlaybookModule {
	metadata: PlaybookMetadata;
}

const modules = import.meta.glob<PlaybookModule>('/src/content/playbooks/*.md', { eager: true });

function slugFromPath(path: string): string {
	return path.split('/').pop()?.replace('.md', '') ?? '';
}

export interface GetPlaybooksOptions {
	includeDrafts?: boolean;
}

export function getAllPlaybooks(options: GetPlaybooksOptions = {}): Playbook[] {
	const { includeDrafts = false } = options;
	const playbooks: Playbook[] = [];

	for (const [path, mod] of Object.entries(modules)) {
		const slug = slugFromPath(path);
		if (!slug || slug.startsWith('_')) continue;

		const metadata = mod.metadata;
		if (!metadata) continue;

		const status = metadata.status ?? 'published';
		if (!includeDrafts && status === 'draft') continue;

		playbooks.push({ slug, metadata });
	}

	playbooks.sort(
		(a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
	);

	return playbooks;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function generatePlaybookRssItems(
	playbooks: Playbook[],
	siteUrl: string = SITE.url
): string {
	return playbooks
		.map((playbook) => {
			const url = `${siteUrl}/playbooks/${playbook.slug}`;
			const pubDate = new Date(playbook.metadata.date).toUTCString();
			return `		<item>
			<title>${escapeXml(playbook.metadata.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<pubDate>${pubDate}</pubDate>
			<description>${escapeXml(playbook.metadata.description)}</description>
		</item>`;
		})
		.join('\n');
}
