// Shelves and tags for the craftsman's desk. Text is Hiro's; JA drafts are
// listed for his review in the PR.
import { PERSONAL } from '$data/constants';

export type L10n = { en: string; ja: string };
export type PaletteKey =
	| 'paper'
	| 'paper2'
	| 'ink'
	| 'inkMute'
	| 'moss'
	| 'mossLight'
	| 'ebicha'
	| 'kon'
	| 'gold'
	| 'wood';
export type ShelfId = 'work' | 'reading' | 'lang' | 'learn' | 'tools' | 'places';

export type DeskItem = {
	id: string;
	kind: 'tag' | 'seal';
	cat: ShelfId;
	label: string;
	sub?: string;
	logo?: string;
	href?: string;
	external?: boolean;
	cta?: L10n;
	desc?: L10n;
	take?: L10n;
	author?: { portrait?: string; descriptor: L10n; wiki: string };
	avatar?: string;
	name?: string;
	nameJa?: string;
};

export const SHELVES: { id: ShelfId; label: L10n; color: PaletteKey }[] = [
	{ id: 'work', label: { en: '作品 Projects', ja: '作品' }, color: 'ebicha' },
	{ id: 'reading', label: { en: '本 Humanities', ja: '本' }, color: 'kon' },
	{ id: 'lang', label: { en: '言葉 Languages', ja: '言葉' }, color: 'moss' },
	{ id: 'learn', label: { en: '学ぶ Learning', ja: '学ぶ' }, color: 'mossLight' },
	{ id: 'tools', label: { en: '道具 Tools', ja: '道具' }, color: 'ink' },
	{ id: 'places', label: { en: '場所 Places', ja: '場所' }, color: 'gold' }
];

const SPEAK: L10n = { en: 'A language I speak.', ja: '話せる言語。' };
const LEARN: L10n = { en: 'A language I am learning.', ja: 'いま学んでいる言語。' };
const GITHUB: L10n = { en: 'View on GitHub', ja: 'GitHub で見る' };
const wiki = (title: string) => `https://en.wikipedia.org/wiki/${title}`;

export const DESK_ITEMS: DeskItem[] = [
	{
		id: 'kaiwa',
		kind: 'tag',
		cat: 'work',
		label: 'Kaiwa',
		logo: '/kaiwa_logo.png',
		href: PERSONAL.companyWebsite,
		external: true,
		cta: { en: 'Visit trykaiwa.com', ja: 'trykaiwa.com へ' },
		desc: {
			en: 'A platform where language learners speak daily with AI, and coaches shape each learner journey.',
			ja: '学習者が AI と毎日話し、コーチが一人ひとりの学びの道筋をつくるプラットフォーム。'
		}
	},
	{
		id: 'exonians',
		kind: 'tag',
		cat: 'work',
		label: 'Exonians',
		logo: '/logos/exonians-e.svg',
		href: 'https://exoniansjapan.com/',
		external: true,
		cta: { en: 'Visit exoniansjapan.com', ja: 'exoniansjapan.com へ' },
		desc: {
			en: 'A small, practical alumni site I built on a subway ride home.',
			ja: '帰りの電車で作った、小さくて実用的な同窓会サイト。'
		}
	},
	{
		id: 'reddit-scout',
		kind: 'tag',
		cat: 'work',
		label: 'Reddit Scout',
		logo: '/logos/reddit.svg',
		href: 'https://github.com/hkuwana/Kaiwa-reddit-scout',
		external: true,
		cta: GITHUB,
		desc: {
			en: 'Sunset. A local workflow that connected Reddit, Drive, and Gemini to find learners with real intent.',
			ja: '終了。Reddit、Drive、Gemini をつないで、本気で学びたい人を探したローカルのワークフロー。'
		}
	},
	{
		id: 'flybyrd',
		kind: 'tag',
		cat: 'work',
		label: 'Flybyrd',
		logo: '/flybyrd_logo.png',
		href: 'https://github.com/hkuwana/flybyrd',
		external: true,
		cta: GITHUB,
		desc: {
			en: 'Sunset. AI that organized scattered feedback for product managers.',
			ja: '終了。PM のために散らばったフィードバックを整理した AI。'
		}
	},

	{
		id: 'mishima',
		kind: 'tag',
		cat: 'reading',
		label: 'Mishima',
		author: {
			portrait: '/portraits/mishima.jpg',
			wiki: wiki('Yukio_Mishima'),
			descriptor: { en: 'Japanese author (1925–1970)', ja: '日本の作家（1925–1970）' }
		},
		take: {
			en: 'Literature in small moments: sentences that become poetry. I really enjoy the structure of his essays and his descriptions of nature.',
			ja: '小さな瞬間の文学。文が詩になる。三島の随筆の構成と、自然の描写がとても好きです。'
		}
	},
	{
		id: 'bulgakov',
		kind: 'tag',
		cat: 'reading',
		label: 'Bulgakov',
		author: {
			portrait: '/portraits/bulgakov.jpg',
			wiki: wiki('Mikhail_Bulgakov'),
			descriptor: {
				en: 'Russian and Soviet author (1891–1940)',
				ja: 'ロシア・ソビエトの作家（1891–1940）'
			}
		},
		take: {
			en: 'My introduction to Bolshevism: how its views shaped society, and the implications underneath. Bulgakov shows all of it through satire.',
			ja: 'ボリシェヴィズムへの入口。その思想が社会をどう形づくり、その下に何があったのか。ブルガーコフはそれを風刺で描きます。'
		}
	},
	{
		id: 'dostoevsky',
		kind: 'tag',
		cat: 'reading',
		label: 'Dostoevsky',
		author: {
			portrait: '/portraits/dostoevsky.jpg',
			wiki: wiki('Fyodor_Dostoevsky'),
			descriptor: {
				en: 'Russian novelist and philosopher (1821–1881)',
				ja: 'ロシアの小説家・思想家（1821–1881）'
			}
		},
		take: {
			en: 'The Russian author I return to most. I sincerely recommend The Brothers Karamazov to everyone. It gave me умиление (umilenie): what it means to choose to be kind, to choose to be human, and to choose what is right, even when the world does not make it easy.',
			ja: '何度も戻ってくるロシアの作家。『カラマーゾフの兄弟』は心からすべての人に薦めます。умиление（ウミレーニエ）を教えてくれた本です。世界がそれを簡単にしてくれないときでも、優しさを選び、人間であることを選び、正しいことを選ぶという意味を。'
		}
	},
	{
		id: 'chekhov',
		kind: 'tag',
		cat: 'reading',
		label: 'Chekhov',
		author: {
			portrait: '/portraits/chekhov.jpg',
			wiki: wiki('Anton_Chekhov'),
			descriptor: {
				en: 'Russian playwright and writer (1860–1904)',
				ja: 'ロシアの劇作家・作家（1860–1904）'
			}
		},
		take: {
			en: "Chekhov's gun: everything in a story should have a purpose, or at least be relevant to it. When I share a story, I try to keep only what earns its place.",
			ja: 'チェーホフの銃。物語の中のすべては目的を持つか、少なくとも物語に関わっているべきだ。話をするとき、私も意味のあるものだけを残すようにしています。'
		}
	},
	{
		id: 'hemingway',
		kind: 'tag',
		cat: 'reading',
		label: 'Hemingway',
		author: {
			portrait: '/portraits/hemingway.jpg',
			wiki: wiki('Ernest_Hemingway'),
			descriptor: {
				en: 'American novelist and journalist (1899–1961)',
				ja: 'アメリカの小説家・記者（1899–1961）'
			}
		},
		take: {
			en: "I love the iceberg theory: what is left unsaid often evokes more than what is said. The reader's imagination does the work, and not everything has to be explicit.",
			ja: '氷山理論が大好きです。書かれないことのほうが、書かれたことより多くを呼び起こすことがある。想像力が仕事をしてくれるので、すべてを明示しなくていい。'
		}
	},

	{
		id: 'kotoba',
		kind: 'tag',
		cat: 'lang',
		label: '言葉',
		sub: 'words',
		desc: {
			en: '言葉 (kotoba): words. The 葉 means leaf. The Kokinshū preface calls poems the leaves of words that grow from the human heart.',
			ja: '言葉の「葉」は木の葉。古今集の仮名序は、歌を「人の心を種として、よろづの言の葉とぞなれりける」と書いています。'
		}
	},
	{ id: 'japanese', kind: 'tag', cat: 'lang', label: '日本語', sub: 'Japanese', desc: SPEAK },
	{ id: 'english', kind: 'tag', cat: 'lang', label: 'English', desc: SPEAK },
	{ id: 'mandarin', kind: 'tag', cat: 'lang', label: '中文', sub: 'Mandarin', desc: SPEAK },
	{ id: 'spanish', kind: 'tag', cat: 'learn', label: 'Español', sub: 'Spanish', desc: LEARN },
	{ id: 'dutch', kind: 'tag', cat: 'learn', label: 'Nederlands', sub: 'Dutch', desc: LEARN },

	{
		id: 'llms',
		kind: 'tag',
		cat: 'tools',
		label: 'LLMs',
		href: '/ai-guides',
		cta: { en: 'Read ./ai-guides', ja: './ai-guides を読む' },
		desc: {
			en: 'My daily material. Prompts, workflows, and notes.',
			ja: '毎日の素材。プロンプト、ワークフロー、メモ。'
		}
	},
	{
		id: 'typescript',
		kind: 'tag',
		cat: 'tools',
		label: 'TypeScript',
		href: 'https://www.typescriptlang.org/',
		external: true,
		cta: { en: 'typescriptlang.org', ja: 'typescriptlang.org' },
		desc: {
			en: 'The language most of my tools are written in.',
			ja: '私の道具の多くを書いている言語。'
		}
	},
	{
		id: 'svelte',
		kind: 'tag',
		cat: 'tools',
		label: 'Svelte',
		href: 'https://svelte.dev/',
		external: true,
		cta: { en: 'svelte.dev', ja: 'svelte.dev' },
		desc: {
			en: 'The framework I build interactive parts with.',
			ja: '動く部分をつくるフレームワーク。'
		}
	},
	{
		id: 'python',
		kind: 'tag',
		cat: 'tools',
		label: 'Python',
		href: 'https://www.python.org/',
		external: true,
		cta: { en: 'python.org', ja: 'python.org' },
		desc: {
			en: 'For scripts, data work, and automation pipelines.',
			ja: 'スクリプト、データ処理、自動化のパイプラインに。'
		}
	},
	{
		id: 'claude',
		kind: 'tag',
		cat: 'tools',
		label: 'Claude',
		href: 'https://www.anthropic.com/claude',
		external: true,
		cta: { en: 'anthropic.com/claude', ja: 'anthropic.com/claude' },
		desc: {
			en: 'The model I write and build with most days.',
			ja: 'ほぼ毎日、書くときもつくるときも使うモデル。'
		}
	},
	{
		id: 'vps',
		kind: 'tag',
		cat: 'tools',
		label: 'VPS',
		desc: {
			en: 'A small server of my own, for jobs that run all day.',
			ja: '一日中動かす仕事のための、自分の小さなサーバー。'
		}
	},

	{
		id: 'tokyo-ny',
		kind: 'tag',
		cat: 'places',
		label: 'Tokyo · NY',
		desc: { en: 'Two home cities, two ways of seeing.', ja: 'ふたつの拠点、ふたつの見方。' }
	},
	{
		id: 'seal',
		kind: 'seal',
		cat: 'places',
		label: '浩',
		avatar: '/hiro-avatar.jpg',
		name: 'Hiroyuki (Hiro) Kuwana',
		nameJa: '桑名浩行',
		href: '/about',
		cta: { en: 'About me', ja: '私について' },
		desc: { en: 'Yep, that’s me.', ja: 'はい、私です。' }
	}
];
