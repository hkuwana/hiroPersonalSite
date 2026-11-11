// Structured data for /tools and each tool page: one WebApplication node per
// tool, an ItemList for the index, and the Home › Tools › tool breadcrumb.
// Output goes through jsonLd() from ./seo, which escapes `<`.
import { breadcrumbs, toolsItemList, webApplication } from './seo';

type Node = Record<string, unknown>;
type Locale = 'en' | 'ja';

export type ToolMeta = {
	name: string;
	// Existing Japanese label from the /tools index. Used for the /ja title and breadcrumb.
	nameJa: string;
	description: string;
	path: string;
};

// Meta descriptions are the pages' existing English ones, kept for both locales.
// TODO(needs Hiro): ja descriptions.
export const TOOL_META = {
	ics: {
		name: 'ICS formatter',
		nameJa: 'ICS フォーマッタ',
		path: '/tools/ics-formatter',
		description:
			'Free in-browser ICS validator and formatter. Fix line endings, line folding, missing UID, DTSTAMP, and other RFC 5545 issues in .ics calendar files. Runs locally, no upload.'
	},
	vcf: {
		name: 'VCF splitter',
		nameJa: 'VCF スプリッタ',
		path: '/tools/vcf-splitter',
		description:
			'Free browser-based VCF splitter. Split a .vcf file with many contacts into individual vCard files. Fix missing structured name fields and download selected contacts as one .vcf or a zip folder. Runs locally.'
	},
	safePaste: {
		name: 'Safe paste',
		nameJa: 'セーフペースト',
		path: '/tools/safe-paste',
		description:
			'Free browser-based redactor. Remove emails, phone numbers, card numbers, API keys and your own names from text before you paste it into ChatGPT or Claude — then put the real values back into the reply. Runs locally, nothing is uploaded.'
	}
} satisfies Record<string, ToolMeta>;

export const TOOLS_INDEX_DESCRIPTION =
	'Small, practical browser utilities by Hiro Kuwana — an ICS formatter, a VCF contact splitter, and Safe paste for redacting text before it goes to AI. Free, private, runs locally.';

const TOOL_ORDER: ToolMeta[] = [TOOL_META.ics, TOOL_META.vcf, TOOL_META.safePaste];

// '/tools' -> '/ja/tools' for the Japanese locale, matching the pages' canonicals.
export const localePath = (path: string, lang: Locale) =>
	lang === 'ja' ? (path === '/' ? '/ja' : `/ja${path}`) : path;

// The WebApplication and ItemList builders live in ./seo (webApplication,
// toolsItemList); these names are the tool pages' entry points to them.
export const webApplicationNode = (tool: { name: string; description: string; path: string }): Node =>
	webApplication(tool);

export const toolsItemListNode = (items: { name: string; path: string }[] = TOOL_ORDER): Node =>
	toolsItemList(items);

// Home › Tools (› tool), with localized names and paths.
export function toolsBreadcrumbs(lang: Locale, tool?: ToolMeta): Node {
	const ja = lang === 'ja';
	const trail = [
		{ name: ja ? 'ホーム' : 'Home', path: localePath('/', lang) },
		{ name: ja ? '道具' : 'Tools', path: localePath('/tools', lang) }
	];
	if (tool) trail.push({ name: ja ? tool.nameJa : tool.name, path: localePath(tool.path, lang) });
	return breadcrumbs(trail);
}

// The tool's WebApplication node plus its breadcrumb trail, for one tool page.
export function toolPageGraph(tool: ToolMeta, lang: Locale): Node[] {
	return [
		webApplicationNode({
			name: tool.name,
			description: tool.description,
			path: localePath(tool.path, lang)
		}),
		toolsBreadcrumbs(lang, tool)
	];
}

// The ItemList of tools plus the Home › Tools trail, for /tools.
export function toolsIndexGraph(lang: Locale): Node[] {
	return [
		toolsItemListNode(TOOL_ORDER.map((t) => ({ name: t.name, path: localePath(t.path, lang) }))),
		toolsBreadcrumbs(lang)
	];
}
