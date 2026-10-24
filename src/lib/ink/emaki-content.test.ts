import { describe, expect, it } from 'vitest';
import { boardEmaki, houseContent, numeral } from './emaki-content';

const essays = [
	{ slug: 'b', title: 'Second', date: '2026-03-01', description: 'Two.' },
	{ slug: 'a', title: 'First', date: '2026-04-01', ja: { title: '最初', desc: '一つ目。' } },
	{ slug: 'c', title: 'Third', date: '2026-02-01' },
	{ slug: 'd', title: 'Fourth', date: '2026-01-01' }
];

const hrefs = (lang: 'en' | 'ja') =>
	[boardEmaki(essays, lang), houseContent(lang)].flatMap((e) =>
		[...e.panels.flatMap((p) => p.actions), ...e.end].flatMap((a) =>
			a.kind === 'link' ? [a.href] : []
		)
	);

describe('board emaki', () => {
	it('unrolls every essay, newest first, each linked to its page', () => {
		const board = boardEmaki(essays, 'en');
		expect(board.panels.map((p) => p.id)).toEqual(['a', 'b', 'c', 'd']);
		expect(board.panels.map((p) => p.mark)).toEqual(['一', '二', '三', '四']);
		expect(board.panels[1]).toMatchObject({ title: 'Second', text: 'Two.' });
		expect(board.panels[0].actions[0]).toMatchObject({ kind: 'link', href: '/essays/a' });
	});

	it('uses Japanese titles where an essay has them', () => {
		const board = boardEmaki(essays, 'ja');
		expect(board.panels[0]).toMatchObject({ title: '最初', text: '一つ目。' });
		expect(board.panels[1].title).toBe('Second');
	});
});

describe('house content', () => {
	it('covers every part of the site and opens the other rooms', () => {
		const house = houseContent('en');
		expect(house.panels.map((p) => p.id)).toEqual([
			'projects',
			'writing',
			'kama',
			'kaiwa',
			'nature',
			'contact'
		]);
		const rooms = house.panels.flatMap((p) => p.actions).filter((a) => a.kind === 'room');
		expect(rooms.map((a) => a.kind === 'room' && a.room)).toEqual(['windmill', 'board']);
	});

	it('keeps the books Hiro recommends on the shelf, Dostoevsky first', () => {
		const books = houseContent('en').panels.find((p) => p.id === 'writing')!;
		expect(books.list?.[0]?.label).toBe('Dostoevsky');
		expect(books.list?.map((b) => b.label)).toContain('Mishima');
		expect(books.list?.every((b) => b.text)).toBe(true);
		// The stack follows the books, under its own heading.
		const stack = books.list?.find((b) => b.group === 'Stack');
		expect(stack?.label).toBe('LLMs');
		expect(books.list?.map((b) => b.label)).toContain('Claude Code');
	});

	it('has the same panels in Japanese', () => {
		expect(houseContent('ja').panels.map((p) => p.id)).toEqual(
			houseContent('en').panels.map((p) => p.id)
		);
	});
});

it('links nowhere to the AI guides', () => {
	for (const lang of ['en', 'ja'] as const)
		expect(hrefs(lang).some((h) => h.startsWith('/ai-guides'))).toBe(false);
});

it('has no profile or about links', () => {
	for (const lang of ['en', 'ja'] as const)
		expect(hrefs(lang).some((h) => h.startsWith('/about'))).toBe(false);
});

it('writes numbers as kanji numerals, then falls back to digits', () => {
	expect(numeral(0)).toBe('一');
	expect(numeral(9)).toBe('十');
	expect(numeral(10)).toBe('11');
});
