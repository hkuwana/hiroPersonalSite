// What the two emaki (picture scrolls) show. The notice board unrolls every
// essay; the izakaya (Hiro's house in the village) unrolls the whole site.
// Sentences come from copy that already lives on the site; only the short
// labels and the two intros are new. No profile or about links: Hiro asked
// to keep the village to the work itself.
import { CONTACT, PERSONAL } from '$data/constants';
import { DESK_ITEMS } from '$lib/home/desk-items';
import { FACETS, type Facet } from '$lib/home/facets';
import type { Essay, Locale } from './place-content';
import type { Room } from './workshop';

export type EmakiAction =
	| { kind: 'link'; label: string; href: string; external?: boolean }
	| { kind: 'room'; label: string; room: Room }
	| { kind: 'brush'; label: string };
export type EmakiPanel = {
	id: string;
	mark: string; // the large brush character at the top of the panel
	meta?: string;
	title: string;
	text?: string;
	// A short list under the text, such as the books on the shelf. Items with
	// a `group` start a new heading (Books, Stack).
	list?: { label: string; href?: string; meta?: string; text?: string; group?: string }[];
	actions: EmakiAction[];
};
export type Emaki = {
	room: Exclude<Room, 'windmill'>;
	kanji: string;
	title: string;
	intro: string;
	panels: EmakiPanel[];
	end: EmakiAction[];
};

const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export const numeral = (i: number) => NUMERALS[i] ?? String(i + 1);

const facet = (id: Facet['id']) => FACETS.find((f) => f.id === id)!;
// The reading row of the desk, the one Hiro recommends most first, and the
// tools row: his stack.
const READING = DESK_ITEMS.filter((item) => item.cat === 'reading').sort(
	(a, b) => Number(b.id === 'dostoevsky') - Number(a.id === 'dostoevsky')
);
const STACK = DESK_ITEMS.filter((item) => item.cat === 'tools');

export function essayDate(date: string, lang: Locale) {
	return new Date(`${date}T00:00:00`).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
		year: 'numeric',
		month: 'long'
	});
}

// 高札 The notice board: every essay, newest first.
export function boardEmaki(essays: Essay[], lang: Locale): Emaki {
	const ja = lang === 'ja';
	const sorted = [...essays].sort((a, b) => b.date.localeCompare(a.date));
	return {
		room: 'board',
		kanji: '書',
		title: ja ? '高札 · 書いたもの' : 'The notice board',
		intro: facet('writer').line[lang],
		panels: sorted.map((e, i) => ({
			id: e.slug,
			mark: numeral(i),
			meta: essayDate(e.date, lang),
			title: (ja && e.ja?.title) || e.title,
			text: (ja && e.ja?.desc) || e.description,
			actions: [{ kind: 'link', label: ja ? '読む' : 'Read', href: `/essays/${e.slug}` }]
		})),
		end: [{ kind: 'link', label: ja ? 'すべてのエッセイ →' : 'All essays →', href: '/essays' }]
	};
}

// 家 The house behind the izakaya: the whole site, one object for each part
// (house-scene.ts builds them in this order).
export function houseContent(lang: Locale): Emaki {
	const ja = lang === 'ja';
	const builder = facet('builder');
	const bridge = facet('bridge');
	const nature = facet('nature');
	return {
		room: 'izakaya',
		kanji: '家',
		title: ja ? 'いらっしゃい · サイトのすべて' : 'Irasshai · the whole site',
		intro: ja
			? 'どうぞ中へ。サイトのすべてが、この部屋にあります。'
			: 'Come in. Every part of the site is in this room.',
		panels: [
			{
				id: 'projects',
				mark: builder.kanji,
				title: builder.title[lang],
				text: builder.line[lang],
				actions: [
					{ kind: 'room', label: ja ? '風車の工房に入る' : 'Enter the workshop', room: 'windmill' },
					{ kind: 'link', label: builder.link.label[lang], href: '/#work' }
				]
			},
			{
				// The essays live on the notice board; the house keeps the books
				// Hiro returns to and the stack he builds with, with his own
				// notes from the desk.
				id: 'writing',
				mark: '本',
				title: ja ? '本と道具' : 'Books and my stack',
				text: ja
					? '何度も読み返す作家と、毎日使っている道具。'
					: 'The authors I read again and again, and the tools I build with every day.',
				list: [
					...READING.map((item, i) => ({
						group: i === 0 ? (ja ? '本' : 'Books') : undefined,
						label: item.label,
						href: item.author?.wiki,
						meta: item.author?.descriptor[lang],
						text: item.take?.[lang]
					})),
					...STACK.map((item, i) => ({
						group: i === 0 ? (ja ? '道具' : 'Stack') : undefined,
						label: item.label,
						href: item.href,
						text: (item.take ?? item.desc)?.[lang]
					}))
				],
				actions: [
					{ kind: 'room', label: ja ? '高札でエッセイを読む' : 'Read my essays', room: 'board' }
				]
			},
			{
				// 釜 The hearth in the middle of the house, and what Hiro cooks.
				id: 'kama',
				mark: '釜',
				title: ja ? '囲炉裏の釜' : 'The kama on the hearth',
				text: ja
					? 'インスタントポットの料理が大好きです。圧力鍋でつくる、鍋ひとつの夕ごはん。'
					: 'I love making Instant Pot meals: high-pressure cooking, a whole dinner from one pot.',
				actions: []
			},
			{
				id: 'kaiwa',
				mark: bridge.kanji,
				title: bridge.title[lang],
				text: bridge.line[lang],
				actions: [
					{
						kind: 'link',
						label: bridge.link.label[lang],
						href: PERSONAL.companyWebsite,
						external: true
					}
				]
			},
			{
				id: 'nature',
				mark: nature.kanji,
				title: nature.title[lang],
				text: nature.line[lang],
				actions: [{ kind: 'brush', label: ja ? '外に出て、筆で描く' : 'Go outside and paint' }]
			},
			{
				id: 'contact',
				mark: '文',
				title: ja ? 'これからも' : 'Stay in touch',
				text: ja
					? '都合のいい時間を直接選べます。資料はいりません。'
					: 'Pick a time directly. No pitch deck required.',
				actions: [
					{
						kind: 'link',
						label: ja ? '25分、お茶でも' : 'Tea for 25 minutes',
						href: CONTACT.cal,
						external: true
					},
					{ kind: 'link', label: ja ? 'お便りを書く →' : 'Write to me →', href: '/#contact' }
				]
			}
		],
		end: []
	};
}
