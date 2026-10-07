import { PERSONAL } from '$data/constants';
import type { L10n, PaletteKey } from './desk-items';

export type Facet = {
	id: 'builder' | 'writer' | 'bridge' | 'nature';
	kanji: string;
	color: PaletteKey;
	title: L10n;
	line: L10n;
	link: { href: string; external?: boolean; label: L10n };
};

// Order = sail order. Sail 0 points up at angle 0.
export const FACETS: Facet[] = [
	{
		id: 'builder',
		kanji: '作',
		color: 'ebicha',
		title: { en: 'Builder', ja: 'つくる' },
		line: {
			en: 'I build AI tools that feel like tools, not like chatbots.',
			ja: 'チャットボットではなく、道具として手になじむ AI をつくっています。'
		},
		link: { href: '#work', label: { en: 'See the projects →', ja: 'プロジェクトを見る →' } }
	},
	{
		id: 'writer',
		kanji: '書',
		color: 'kon',
		title: { en: 'Writer', ja: '書く' },
		line: {
			en: 'Slow essays and practical AI notes, one notebook each.',
			ja: 'じっくり書く随筆と、実践的な AI のメモ。ノートは一冊ずつ。'
		},
		link: { href: '#writing', label: { en: 'Read the writing →', ja: '文章を読む →' } }
	},
	{
		id: 'bridge',
		kanji: '橋',
		color: 'gold',
		title: { en: 'Bridge', ja: '橋渡し' },
		line: {
			en: 'Tokyo and New York. Japanese and American. I build between languages.',
			ja: '東京とニューヨーク。日本とアメリカ。言葉のあいだで、ものをつくっています。'
		},
		link: {
			href: PERSONAL.companyWebsite,
			external: true,
			label: { en: 'About Kaiwa →', ja: 'Kaiwa について →' }
		}
	},
	{
		id: 'nature',
		kanji: '然',
		color: 'moss',
		title: { en: 'Nature', ja: '自然' },
		line: {
			en: 'Nature has run countless iterations of design, each one smoothed to fit its environment. That is where I find my inspiration.',
			ja: '自然は数えきれないほどの試作を重ね、それぞれを環境になじむ形へと磨いてきました。私はそこから着想を得ています。'
		},
		link: { href: '/about', label: { en: 'About me →', ja: '私について →' } }
	}
];
