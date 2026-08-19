<script lang="ts">
	import { asset } from '$app/paths';
	import { page } from '$app/stores';
	import { CONTACT, PERSONAL, SITE, SOCIAL_LINKS } from '$data/constants';
	import HeroCanvas from '$lib/components/HeroCanvas.svelte';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';

	type Locale = 'en' | 'ja';
	type Status = 'active' | 'shipped' | 'sunset';
	type Filter = Status | 'all';

	type Piece = {
		id: string;
		status: Status;
		year: string;
		href: string;
		external?: boolean;
		title: string;
		titleJa: string;
		subtitle: string;
		subtitleJa: string;
		role: string;
		roleJa: string;
		summary: string;
		summaryJa: string;
		stats?: string;
		statsJa?: string;
		// Voice slots (Hiro's words only — see COPY_WORKSHEET.md §3).
		lesson?: string;
		lessonJa?: string;
		logo: string;
		pos: { left: string; top: string; width: string; rotate: number };
	};

	// Kaiwa traction, sourced from PostHog (project "Kaiwa PROD").
	// Organic figure is the trailing 30 days; signups are cumulative since
	// the signup event was instrumented. Refresh these before you cite them.
	// Refreshed 2026-08-19: 27,602 organic-search visitors over the trailing
	// 30 days, and 2,043 unique persons on user_signed_up since 2026-02-09.
	const KAIWA_STATS: { value: string; label: string; labelJa: string }[] = [
		{ value: '28,000', label: 'organic visitors a month', labelJa: '自然検索の訪問者 / 月' },
		{ value: '2,000+', label: 'learners signed up', labelJa: '登録した学習者' },
		{ value: 'solo', label: 'built and run by one person', labelJa: 'ひとりで開発・運用' }
	];

	const COPY: Record<Locale, Record<string, string>> = {
		en: {
			'hero.season': '夏 · summer · 2026',
			'hero.vert': '人 を 拡 張 す る 道 具',
			'hero.title.l1': 'Building a',
			'hero.title.tools': 'company',
			'hero.title.l2': 'with AI, while',
			'hero.title.l3': 'keeping judgment human',
			'hero.tagline':
				"I'm Hiro Kuwana (桑名浩行). I build Kaiwa full-time and write down the product calls, systems, mistakes, and small wins along the way.",
			'hero.now': 'Now · Kaiwa, full-time',
			'hero.about1.a':
				'Kaiwa is where I do the real work: product, code, growth, support, and the messy decisions in between. It is a language-learning platform where learners practice with AI and coaches shape the journey. I use AI wherever it helps, but',
			'hero.about1.strong': "I don't hand it the judgment.",
			'hero.about1.b': 'That line is at the heart of what I build.',
			'hero.about2':
				'If you are building with AI on a small team—or no team—I hope these notes save you a few wrong turns.',
			'hero.meta.based.k': 'Based',
			'hero.meta.based.v': 'Tokyo · New York',
			'hero.meta.since.k': 'Since',
			'hero.meta.since.v': '2018',
			'hero.meta.stack.k': 'Stack',
			'hero.meta.stack.v': 'LLMs · TypeScript · Svelte · Python',
			'hero.meta.reading.k': 'Reading',
			'hero.meta.reading.v': 'Bulgakov · Mishima',
			'hero.stats.source': 'PostHog · verified 19 Aug 2026',
			'hero.scroll': 'Scroll',
			'work.num': '02',
			'work.title': 'Projects',
			'work.titleEm': 'Things I tend, and things I have set down.',
			'work.filter.all': 'All',
			'work.filter.active': 'In hand',
			'work.filter.shipped': 'Shipped',
			'work.filter.sunset': 'Sunset',
			'work.status.active': 'in hand',
			'work.status.shipped': 'shipped',
			'work.status.sunset': 'sunset',
			'work.readMore': 'open →',
			'record.title': 'The record',
			'record.titleEm': 'founder cycles since 2018.',
			'record.colophon': 'colophon · how I work',
			'writing.num': '03',
			'writing.title': 'Notes from the build,',
			'writing.titleEm': 'and the questions underneath it.',
			'writing.guides': './ai-guides',
			'writing.guidesJP': '道 具',
			'writing.philo': 'essays',
			'writing.philoJP': '作 文',
			'writing.minRead': '~ 6 min',
			'writing.dateAi': '04 · 2026',
			'contact.num': '04',
			'contact.title': 'Stay in touch',
			'contact.titleEm': 'write me, or follow the build.',
			'contact.tab.write': 'Write to me · お便り',
			'contact.tab.follow': 'Follow the build · 購読',
			'contact.aside.lead':
				"I'm always interested in how other people are building with AI—especially the places where it creates more work instead of less. I'm not taking on outside projects, but thoughtful notes are welcome.",
			'contact.aside.hi':
				'Tell me what you are working on, what surprised you, or where you are stuck. I read every message myself and usually reply within a few days.',
			'contact.tools.title': 'Side tools · 道具',
			'contact.tools.cal.label': 'Tea for 25 minutes',
			'contact.tools.cal.desc': 'Pick a time directly. No pitch deck required.',
			'contact.tools.vcf.label': 'vCard · save my contact',
			'contact.tools.vcf.desc': 'A simple contact card without a public email address.',
			'contact.tools.ics.label': 'Tea on the calendar',
			'contact.tools.ics.desc': 'A 25-minute placeholder with the booking link tucked inside.',
			'contact.email.copy': 'copy address',
			'contact.email.copied': 'copied · ありがとう',
			'contact.email.revealed': 'copy unavailable · address revealed',
			'contact.write.lead':
				'What are you building? What have you tried? Where is AI helping—or getting in the way? A few honest sentences are plenty.',
			'contact.field.name': 'お名前 · Name',
			'contact.field.email': '電子メール · Email',
			'contact.field.msg': 'ご用件 · Message',
			'contact.field.namePh': 'Your name',
			'contact.field.emailPh': 'you@somewhere.com',
			'contact.field.msgPh': 'What you are building, what you have tried, and where you are stuck.',
			'contact.note.write': 'Opens your mail client as a fallback. Nothing is sent to a third party from this page.',
			'contact.btn.send': 'Send · 送る →',
			'contact.btn.sending': 'Sending...',
			'contact.thanks.title': 'Draft ready',
			'contact.thanks.titleEm': 'one last step.',
			'contact.thanks.note': 'Your mail app should be open. Send the draft there to reach me.',
			'contact.thanks.again': 'Send another',
			'sub.lead':
				"I send a note when I have something worth sharing: a product decision, a workflow that held up, a mistake I don't want to repeat, or a longer essay.",
			'sub.field.email': '電子メール · Email',
			'sub.field.emailPh': 'you@somewhere.com',
			'sub.choose': 'Send me:',
			'sub.opt.both': 'Everything',
			'sub.opt.philo': 'Essays',
			'sub.opt.guides': 'Build notes',
			'sub.cadence': 'Usually twice a month. Plain text, no noise. Unsubscribe in one click.',
			'sub.btn.go': 'Follow the build · 購読 →',
			'sub.btn.going': 'Subscribing...',
			'sub.thanks.title': 'Subscribed',
			'sub.thanks.titleEm': 'よろしく.',
			'sub.thanks.note': "You'll hear from me when the next useful note is ready.",
			'sub.thanks.again': 'Use a different email',
			'sub.error': "That didn't go through. Try again in a moment, or use the contact form."
		},
		ja: {
			'hero.season': '夏 · summer · 2026',
			'hero.vert': '人 を 拡 張 す る 道 具',
			'hero.title.l1': 'AI と',
			'hero.title.tools': '会社をつくる',
			'hero.title.l2': '',
			'hero.title.l3': '判断は、人のままで',
			'hero.tagline':
				'桑名浩行 (Hiro Kuwana) です。いまは Kaiwa をフルタイムでつくりながら、プロダクトの判断や仕組み、失敗、小さな前進を書き留めています。',
			'hero.now': 'いま · Kaiwa をフルタイムで',
			'hero.about1.a':
				'Kaiwa は、プロダクト、開発、成長、サポート、その間にある面倒な判断まで、すべてを実地で試す場所です。学習者が AI と会話し、コーチが一人ひとりの学びを設計する語学学習のプラットフォームです。AI は役立つところで使います。でも、',
			'hero.about1.strong': '判断までは渡しません。',
			'hero.about1.b': 'その境目が、つくるものの中心にあります。',
			'hero.about2':
				'AI を使って、小さなチームで、あるいはひとりで何かをつくっているなら、ここにあるメモが少しでも遠回りを減らせたらうれしいです。',
			'hero.meta.based.k': '拠点',
			'hero.meta.based.v': '東京 · ニューヨーク',
			'hero.meta.since.k': '開始',
			'hero.meta.since.v': '2018年',
			'hero.meta.stack.k': '手段',
			'hero.meta.stack.v': 'LLM · TypeScript · Svelte · Python',
			'hero.meta.reading.k': '読書',
			'hero.meta.reading.v': 'ブルガーコフ · 三島',
			'hero.stats.source': 'PostHog · 2026年8月19日 確認',
			'hero.scroll': 'スクロール',
			'work.num': '02',
			'work.title': 'プロジェクト',
			'work.titleEm': '手をかけているもの、置いてきたもの。',
			'work.filter.all': 'すべて',
			'work.filter.active': '進行中',
			'work.filter.shipped': '公開済み',
			'work.filter.sunset': '終了',
			'work.status.active': '進行中',
			'work.status.shipped': '公開済み',
			'work.status.sunset': '終了',
			'work.readMore': '開く →',
			'record.title': '記録',
			'record.titleEm': '2018年から続く、ものづくりのサイクル。',
			'record.colophon': '奥付 · 仕事の流儀',
			'writing.num': '03',
			'writing.title': 'つくりながら書いたこと',
			'writing.titleEm': 'その奥で考えていること。',
			'writing.guides': './ai-guides',
			'writing.guidesJP': '道 具',
			'writing.philo': '回り道',
			'writing.philoJP': '作 文',
			'writing.minRead': '約 6 分',
			'writing.dateAi': '2026 · 04',
			'contact.num': '04',
			'contact.title': 'これからも',
			'contact.titleEm': 'お便りでも、つづきを読むでも。',
			'contact.tab.write': 'お便りを書く · Write',
			'contact.tab.follow': 'つづきを読む · Follow',
			'contact.aside.lead':
				'ほかの人が AI をどう使ってものをつくっているのか、いつも気になります。とくに、仕事が減るはずの AI で、かえって仕事が増えてしまうところ。外部の仕事は受けていませんが、考えのあるお便りは歓迎です。',
			'contact.aside.hi': 'いま何をつくっているか、何を試したか、どこで行き詰まったか。届いたメッセージはすべて自分で読み、たいてい数日以内に返事します。',
			'contact.tools.title': '道具 · side tools',
			'contact.tools.cal.label': '25分、お茶でも',
			'contact.tools.cal.desc': '都合のいい時間を直接選べます。資料はいりません。',
			'contact.tools.vcf.label': 'vCard · 連絡先を保存',
			'contact.tools.vcf.desc': 'メールアドレスを公開しない、シンプルな連絡先カード。',
			'contact.tools.ics.label': '予定にお茶を入れる',
			'contact.tools.ics.desc': '予約リンクを入れた、25分のお茶の予定。',
			'contact.email.copy': 'アドレスをコピー',
			'contact.email.copied': 'コピーしました · copied',
			'contact.email.revealed': 'コピーできません · アドレスを表示',
			'contact.write.lead':
				'何をつくっていますか。何を試しましたか。AI はどこで役立ち、どこで邪魔になっていますか。飾らない数行で十分です。',
			'contact.field.name': '名前 · Name',
			'contact.field.email': 'メール · Email',
			'contact.field.msg': '用件 · Message',
			'contact.field.namePh': '名前',
			'contact.field.emailPh': 'you@somewhere.com',
			'contact.field.msgPh': '何をつくっているか、何を試したか、どこで行き詰まっているか。',
			'contact.note.write': 'お使いのメールアプリが代わりに開きます。このページから第三者には何も送りません。',
			'contact.btn.send': '送る · Send →',
			'contact.btn.sending': '送信中...',
			'contact.thanks.title': '下書きを開きました',
			'contact.thanks.titleEm': 'あとは送るだけ。',
			'contact.thanks.note': 'メールアプリで内容を確認して、そこから送信してください。',
			'contact.thanks.again': 'もう一通',
			'sub.lead': '共有する価値があると思えたときだけ送ります。プロダクトの判断、実際に使えたワークフロー、繰り返したくない失敗、ときどき長い文章。',
			'sub.field.email': 'メール · Email',
			'sub.field.emailPh': 'you@somewhere.com',
			'sub.choose': '読みたいもの:',
			'sub.opt.both': 'すべて',
			'sub.opt.philo': '作文',
			'sub.opt.guides': '開発メモ',
			'sub.cadence': 'だいたい月に二回。プレーンテキストで、余計なものはなし。解除はワンクリック。',
			'sub.btn.go': 'つづきを読む · Follow →',
			'sub.btn.going': '登録中...',
			'sub.thanks.title': '登録しました',
			'sub.thanks.titleEm': 'よろしく。',
			'sub.thanks.note': '次に役立つメモができたら、短いメールを送ります。',
			'sub.thanks.again': '別のメールで登録',
			'sub.error': '送信がうまくいきませんでした。少し待ってもう一度試すか、お便りフォームを使ってください。'
		}
	};

	const STATUS_OPTIONS: { value: Filter; key: string }[] = [
		{ value: 'all', key: 'work.filter.all' },
		{ value: 'active', key: 'work.filter.active' },
		{ value: 'shipped', key: 'work.filter.shipped' },
		{ value: 'sunset', key: 'work.filter.sunset' }
	];

	const PIECES: Piece[] = [
		{
			id: 'kaiwa',
			status: 'active',
			year: '2025 - now',
			href: PERSONAL.companyWebsite,
			external: true,
			title: 'Kaiwa',
			titleJa: 'Kaiwa',
			subtitle: 'augment language coaches',
			subtitleJa: '語学コーチを拡張する',
			role: 'Founder + Product',
			roleJa: 'ファウンダー + プロダクト',
			summary: 'A platform where language learners speak daily with AI, and coaches can architect and individualize learner journeys',
			summaryJa: '学習者が AI と毎日話し、コーチは学習の道筋を設計して一人ひとりに合わせられるプラットフォーム。',
			stats: '28k organic visitors / mo · 2,000+ learners',
			statsJa: '自然検索 28k / 月 · 学習者 2,000+',
			logo: asset('/kaiwa_logo.png'),
			pos: { left: '0%', top: '0%', width: '38%', rotate: -2 }
		},
		{
			id: 'exonians',
			status: 'shipped',
			year: '2026',
			href: 'https://exoniansjapan.com/',
			external: true,
			title: 'Exonians in Japan',
			titleJa: 'Exonians in Japan',
			subtitle: 'a fast community platform',
			subtitleJa: '素早く立ち上げた同窓会サイト',
			role: 'Design + Build',
			roleJa: 'デザイン + 開発',
			summary: 'A small, practical alumni site I built on a subway ride home. Focused on photos and community building',
			summaryJa: '帰りの電車の中で作った、小さくて実用的な同窓会サイト。写真と、人のつながりに集中。',
			logo: asset('/icon-512x512.png'),
			pos: { left: '52%', top: '4%', width: '38%', rotate: 1.5 }
		},
		{
			id: 'reddit-scout',
			status: 'active',
			year: '2025',
			href: 'https://github.com/hkuwana/Kaiwa-reddit-scout',
			external: true,
			title: 'Kaiwa Reddit Scout',
			titleJa: 'Kaiwa Reddit Scout',
			subtitle: 'signal-finding for language learners',
			subtitleJa: '語学学習者のシグナルを探す',
			role: 'Automation + Research',
			roleJa: '自動化 + リサーチ',
			summary: 'A local workflow that connects Reddit, Drive, and Gemini to find language learners with real intent.',
			summaryJa: 'Reddit、Drive、Gemini をつないで、本気で学びたい人を見つけるローカルのワークフロー。',
			logo: asset('/kaiwa_logo.png'),
			pos: { left: '8%', top: '38%', width: '36%', rotate: -1 }
		},
		{
			id: 'flybyrd',
			status: 'sunset',
			year: '2024 - 2025',
			href: '#contact',
			title: 'Flybyrd',
			titleJa: 'Flybyrd',
			subtitle: 'AI for product managers',
			subtitleJa: 'プロダクトマネージャー向け AI',
			role: 'Founder',
			roleJa: 'ファウンダー',
			summary: 'Organizing scattered feedback for product managers. A practical, private dashboard for the signals that matter.',
			summaryJa: 'PM のためにバラバラのフィードバックを整理する、実用的で非公開のダッシュボード。大事なシグナルだけを残す。',
			logo: asset('/flybyrd_logo.png'),
			pos: { left: '54%', top: '46%', width: '40%', rotate: 1 }
		},
		{
			id: 'pebblr',
			status: 'sunset',
			year: '2021 - 2023',
			href: '#contact',
			title: 'Pebblr',
			titleJa: 'Pebblr',
			subtitle: 'connecting nonprofits and donors/volunteers',
			subtitleJa: 'NPO と寄付者・ボランティアをつなぐ',
			role: 'Product + Ops',
			roleJa: 'プロダクト + 運営',
			summary: 'A nonprofit donor experiment that taught me where human trust matters more than platform mechanics.',
			summaryJa: 'NPO の寄付者向けの実験。プラットフォームの仕組みより、人と人の信頼の方がずっと大事だと教えてくれた。',
			logo: asset('/icon-512x512.png'),
			pos: { left: '22%', top: '78%', width: '42%', rotate: -1.5 }
		}
	];

	// The record — founder cycles. Ship lines are factual and functional.
	// Lesson lines are voice slots: Hiro's own words, both languages, from
	// COPY_WORKSHEET.md §2. The whole section stays hidden until every
	// lesson slot is filled. No flag to flip; fill the slots and it appears.
	type Cycle = {
		id: string;
		years: string;
		yearsJa: string;
		name: string;
		ship: string;
		shipJa: string;
		lesson: string;
		lessonJa: string;
	};

	const RECORD_CYCLES: Cycle[] = [
		{
			id: 'pebblr',
			years: '2021 – 2023',
			yearsJa: '2021 – 2023',
			name: 'Pebblr',
			ship: 'Connected nonprofits with donors and volunteers. Product and operations.',
			shipJa: 'NPO と寄付者・ボランティアをつないだ。プロダクトと運営。',
			lesson: '', // voice slot
			lessonJa: '' // voice slot
		},
		{
			id: 'flybyrd',
			years: '2024 – 2025',
			yearsJa: '2024 – 2025',
			name: 'Flybyrd',
			ship: 'Organized scattered feedback into signal for product managers. Founder.',
			shipJa: '散らばったフィードバックを、PM のためのシグナルに整理した。ファウンダー。',
			lesson: '', // voice slot
			lessonJa: '' // voice slot
		},
		{
			id: 'kaiwa',
			years: '2025 – now',
			yearsJa: '2025 – 現在',
			name: 'Kaiwa',
			ship: 'A real-time AI conversation platform for language learners. 28k organic visitors a month, 2,000+ learners. Built and run by one person.',
			shipJa: '学習者が AI と毎日話すリアルタイム会話プラットフォーム。自然検索 28k/月、学習者 2,000+。ひとりで開発・運用。',
			lesson: '', // voice slot
			lessonJa: '' // voice slot
		}
	];

	const CYCLE_NUMERALS = ['一', '二', '三', '四', '五'];

	const COLOPHON: { k: string; kJa: string; v: string; vJa: string }[] = [
		{
			k: 'stack',
			kJa: '技術',
			v: 'LLMs · TypeScript · Svelte · Python',
			vJa: 'LLM · TypeScript · Svelte · Python'
		},
		{
			k: 'solo',
			kJa: 'ひとり',
			v: 'Product, code, growth, support. One person.',
			vJa: 'プロダクト、開発、成長、サポート。すべて一人。'
		},
		{
			k: 'speed',
			kJa: '速さ',
			v: 'Exonians in Japan: an alumni site shipped in 1.5 hours, on the train home.',
			vJa: 'Exonians in Japan：帰りの電車の中、1.5 時間で公開した同窓会サイト。'
		},
		{
			k: 'automation',
			kJa: '自動化',
			v: 'Reddit Scout: a pipeline that finds language learners with real intent.',
			vJa: 'Reddit Scout：本気の学習者を見つける自動化パイプライン。'
		}
	];

	const recordReady = RECORD_CYCLES.every((cycle) => cycle.lesson.trim() !== '' && cycle.lessonJa.trim() !== '');

	const GUIDES = {
		en: [
			{
				tag: 'PROMPT',
				title: 'A self-editing system prompt for technical writing',
				desc: "Turns drafts into clean docs without flattening the author's voice. Iterates on itself in two passes.",
				snippet: 'You are an editor with two jobs:\n1. Preserve voice.\n2. Cut anything you cannot defend.',
				anchor: 'self-editing-system-prompt'
			},
			{
				tag: 'WORKFLOW',
				title: 'How I run a 4-model debate to find a position I trust',
				desc: 'A small harness that lets disagreement keep going until the useful shape appears.',
				snippet: '/debate "Should onboarding ask for the user goal up front?"',
				anchor: 'four-model-debate'
			},
			{
				tag: 'TOOLING',
				title: 'Local-first prompt versioning with plain text + git',
				desc: 'No fancy IDE. Just folders, frontmatter, and diffs that read like edits.',
				snippet: '$ promptkit diff v0.3..v0.4 --semantic',
				anchor: 'prompt-versioning'
			}
		],
		ja: [
			{
				tag: 'プロンプト',
				title: '技術文書のための、自分を編集するシステムプロンプト',
				desc: '下書きを、書き手の声を平たくせずに整える。二度のパスで自分自身に手を入れていく。',
				snippet: '役割は二つ:\n1. 声を残す。\n2. 守れない文を切る。',
				anchor: 'self-editing-system-prompt'
			},
			{
				tag: 'ワークフロー',
				title: '四つのモデルで議論させて、信じられる立場を見つける方法',
				desc: '反対意見の側だけ続けて話させる、小さな仕掛け。',
				snippet: '/debate "オンボーディングで目的を先に聞くべきか"',
				anchor: 'four-model-debate'
			},
			{
				tag: 'ツール',
				title: 'ローカル中心のプロンプト管理（テキスト + git だけ）',
				desc: '凝った IDE はなし。フォルダと frontmatter と、編集として読める差分。',
				snippet: '$ promptkit diff v0.3..v0.4 --semantic',
				anchor: 'prompt-versioning'
			}
		]
	};

	const PHILO = {
		en: [
			{
				date: 'February 2026',
				title: 'Your Funnel Is a Lie',
				desc: 'Why Markov chains are a better mental model for SaaS growth than the traditional sales funnel.',
				href: '/essays/your-funnel-is-a-lie'
			},
			{
				date: 'December 2025',
				title: 'On Building for Decades',
				desc: 'Why simplicity wins in the long run when building personal infrastructure.',
				href: '/essays/on-building-for-decades'
			},
			{
				date: 'Now',
				title: 'What I mean when I say augment',
				desc: 'A working definition with edges. The word does a lot of heavy lifting in my work.',
				href: '/essays'
			}
		],
		ja: [
			{
				date: '2026年2月',
				title: 'ファネルという嘘',
				desc: 'SaaS の成長を、直線ではなく遷移として見るためのメモ。',
				href: '/essays/your-funnel-is-a-lie'
			},
			{
				date: '2025年12月',
				title: '十年単位でつくる',
				desc: '個人のインフラを長く残すなら、なぜ単純さが勝つのか。',
				href: '/essays/on-building-for-decades'
			},
			{
				date: '今',
				title: '「拡張」と言うとき',
				desc: '仕事の中でずいぶん働かせている言葉に、少し輪郭を与える。',
				href: '/essays'
			}
		]
	};

	let lang = getLocale() as Locale;
	let filter: Filter = 'all';
	let contactMode: 'write' | 'follow' = 'write';
	let contactName = '';
	let contactEmail = '';
	let contactMessage = '';
	let contactStatus: 'idle' | 'sending' | 'sent' = 'idle';
	let contactReply = '';
	let subscribeEmail = '';
	let subscribeChoice = 'both';
	let subscribeStatus: 'idle' | 'sending' | 'sent' | 'error' = 'idle';
	let emailCopyStatus: 'idle' | 'copied' | 'revealed' = 'idle';
	let revealedEmail = '';
	let emailStatusTimer: number | undefined;
	let visiblePieces = PIECES;
	let t = (key: string) => COPY[lang]?.[key] ?? COPY.en[key] ?? key;
	let statusLabel = (status: Status) => t(`work.status.${status}`);

	$: lang = ($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale;
	$: visiblePieces = filter === 'all' ? PIECES : PIECES.filter((piece) => piece.status === filter);
	$: t = (key: string) => COPY[lang]?.[key] ?? COPY.en[key] ?? key;
	$: statusLabel = (status: Status) => t(`work.status.${status}`);

	const getContactEmail = () => {
		const [user, domain, topLevelDomain] = CONTACT.emailParts;
		return `${user}@${domain}.${topLevelDomain}`;
	};

	const countFor = (status: Filter) => (status === 'all' ? PIECES.length : PIECES.filter((piece) => piece.status === status).length);
	const scrapStyle = (piece: Piece, index: number) =>
		`left:${piece.pos.left};top:${piece.pos.top};width:${piece.pos.width};transform:rotate(${piece.pos.rotate}deg);z-index:${8 - index}`;

	onMount(() => {
		const elements = document.querySelectorAll<HTMLElement>('.reveal');
		const revealVisible = (element: HTMLElement) => {
			const rect = element.getBoundingClientRect();
			if (rect.top < window.innerHeight && rect.bottom > 0) element.classList.add('in');
		};

		elements.forEach(revealVisible);
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) entry.target.classList.add('in');
				}
			},
			{ threshold: 0, rootMargin: '0px 0px -10% 0px' }
		);

		elements.forEach((element) => observer.observe(element));
		const fallback = window.setTimeout(() => {
			elements.forEach((element) => element.classList.add('in'));
		}, 1500);

		return () => {
			window.clearTimeout(fallback);
			if (emailStatusTimer) window.clearTimeout(emailStatusTimer);
			observer.disconnect();
		};
	});

	async function copyContactEmail() {
		const email = getContactEmail();

		try {
			await navigator.clipboard.writeText(email);
			emailCopyStatus = 'copied';
			if (emailStatusTimer) window.clearTimeout(emailStatusTimer);
			emailStatusTimer = window.setTimeout(() => {
				emailCopyStatus = 'idle';
			}, 3200);
		} catch {
			revealedEmail = email;
			emailCopyStatus = 'revealed';
		}
	}

	function sendContact(event: SubmitEvent) {
		event.preventDefault();
		if (!contactName || !contactEmail || !contactMessage) return;

		contactStatus = 'sending';
		contactReply =
			lang === 'ja'
				? `${contactName}さん、メールの下書きを開きました。内容を確認して、準備ができたら送ってください。`
				: `${contactName}, your note is ready in your mail app. Give it a quick look, then send it when you are ready.`;

		const subject = encodeURIComponent(`From your site - ${contactName}`);
		const body = encodeURIComponent(`From: ${contactName} <${contactEmail}>\n\n${contactMessage}`);

		if (typeof window !== 'undefined') {
			window.open(`mailto:${getContactEmail()}?subject=${subject}&body=${body}`, '_blank');
		}

		window.setTimeout(() => {
			contactStatus = 'sent';
		}, 350);
	}

	function resetContact() {
		contactName = '';
		contactEmail = '';
		contactMessage = '';
		contactReply = '';
		contactStatus = 'idle';
	}

	async function subscribe(event: SubmitEvent) {
		event.preventDefault();
		if (!subscribeEmail) return;

		subscribeStatus = 'sending';
		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email: subscribeEmail, choice: subscribeChoice })
			});
			if (!res.ok) throw new Error(`subscribe failed: ${res.status}`);
			localStorage.setItem(
				'hiro_sub',
				JSON.stringify({ email: subscribeEmail, choice: subscribeChoice, at: Date.now() })
			);
			subscribeStatus = 'sent';
		} catch {
			subscribeStatus = 'error';
		}
	}

	function resetSubscribe() {
		subscribeEmail = '';
		subscribeStatus = 'idle';
	}
</script>

<svelte:head>
	<title>{SITE.title}</title>
	<meta
		name="description"
		content={SITE.description}
	/>
	<meta name="keywords" content={SITE.keywords.join(', ')} />
	<meta name="author" content={SITE.author} />
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
	<meta name="googlebot" content="index, follow" />
	<meta property="og:type" content="profile" />
	<meta property="og:url" content={SITE.url} />
	<meta property="og:title" content={SITE.title} />
	<meta property="og:description" content={SITE.description} />
	<meta property="og:image" content={SITE.image} />
	<meta property="og:locale" content={lang === 'ja' ? 'ja_JP' : 'en_US'} />
	<meta property="og:locale:alternate" content={lang === 'ja' ? 'en_US' : 'ja_JP'} />
	<meta property="profile:first_name" content="Hiro" />
	<meta property="profile:last_name" content="Kuwana" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={SITE.title} />
	<meta name="twitter:description" content={SITE.description} />
	<meta name="twitter:image" content={SITE.image} />
	<link rel="canonical" href={SITE.url} />
	<link rel="alternate" hreflang="en" href={SITE.url} />
	<link rel="alternate" hreflang="ja" href={`${SITE.url}/ja`} />
	<link rel="alternate" hreflang="x-default" href={SITE.url} />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Hiro Kuwana',
		alternateName: ['桑名浩行', 'Hiroyuki Kuwana'],
		url: SITE.url,
		image: SITE.image,
		jobTitle: 'Founder & Product Designer',
		worksFor: { '@type': 'Organization', name: 'Kaiwa', url: PERSONAL.companyWebsite },
		alumniOf: { '@type': 'CollegeOrUniversity', name: 'Brown University' },
		nationality: ['Japanese', 'American'],
		knowsAbout: ['Artificial Intelligence', 'Educational Technology', 'Language Learning', 'Product Design', 'Startups'],
		sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github, SOCIAL_LINKS.twitter, SOCIAL_LINKS.quora]
	})}</` + `script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Hiro Kuwana',
		url: SITE.url,
		inLanguage: ['en', 'ja'],
		author: { '@type': 'Person', name: 'Hiro Kuwana' },
		potentialAction: {
			'@type': 'SearchAction',
			target: `${SITE.url}/essays?q={query}`,
			'query-input': 'required name=query'
		}
	})}</` + `script>`}
</svelte:head>

<section class="hero" data-screen-label="01 Landing">
	<HeroCanvas />

	<div class="season-mark mb-2">
		<span class="stamp">浩</span>
		<span>{t('hero.season')}</span>
	</div>
	<div class="vert-mark">{t('hero.vert')}</div>

	<div class="hero-content">
		{#if lang === 'ja'}
			<h1 class="h1-ja">
				{t('hero.title.l1')}<span class="ital">{t('hero.title.tools')}</span><br />
				{t('hero.title.l3')}<span class="seal">浩</span>
			</h1>
		{:else}
			<h1>
				{t('hero.title.l1')} <span class="ital">{t('hero.title.tools')}</span><br />
				{t('hero.title.l2')}<br />
				{t('hero.title.l3')}<span class="seal">浩</span>
			</h1>
		{/if}
		<p class="hero-tagline">{t('hero.tagline')}</p>
	</div>

	<aside class="hero-side">
		<span class="now-pill">{t('hero.now')}</span>
		<p>
			{t('hero.about1.a')}
			<strong>{t('hero.about1.strong')}</strong>
			{t('hero.about1.b')}
		</p>
		<p>{t('hero.about2')}</p>
		<dl class="now-stats" aria-describedby="kaiwa-stats-source">
			{#each KAIWA_STATS as stat}
				<div class="now-stat">
					<dt>{stat.value}</dt>
					<dd>{lang === 'ja' ? stat.labelJa : stat.label}</dd>
				</div>
			{/each}
		</dl>
		<p class="stats-source" id="kaiwa-stats-source">{t('hero.stats.source')}</p>
		<dl class="hero-meta">
			<dt>{t('hero.meta.based.k')}</dt>
			<dd>{t('hero.meta.based.v')}</dd>
			<dt>{t('hero.meta.since.k')}</dt>
			<dd>{t('hero.meta.since.v')}</dd>
			<dt>{t('hero.meta.stack.k')}</dt>
			<dd>{t('hero.meta.stack.v')}</dd>
			<dt>{t('hero.meta.reading.k')}</dt>
			<dd>{t('hero.meta.reading.v')}</dd>
		</dl>
	</aside>

	<a class="scroll-cue" href="#work" aria-label={lang === 'ja' ? 'プロジェクトへスクロール' : 'Scroll to projects'}>
		<span>{t('hero.scroll')}</span>
		<span class="line" aria-hidden="true"></span>
	</a>
</section>

<div class="reveal">
	<section class="section" id="work" data-screen-label="02 Projects">
		<div class="sec-head">
			<span class="num-vert">{t('work.num')}</span>
			<h2>{t('work.title')} <em>{t('work.titleEm')}</em></h2>
		</div>

		<div class="proj-filter" role="tablist" aria-label="Project status filter">
			{#each STATUS_OPTIONS as option}
				<button
					type="button"
					role="tab"
					aria-selected={filter === option.value}
					class={`proj-chip status-${option.value} ${filter === option.value ? 'is-on' : ''}`}
					onclick={() => (filter = option.value)}
				>
					<span class="dot"></span>
					{t(option.key)}
					<span class="count">{countFor(option.value)}</span>
				</button>
			{/each}
		</div>

		<div class="scrap layout-scrapbook">
			{#each visiblePieces as piece, i}
				<a
					href={piece.href}
					class={`scrap-piece status-${piece.status}`}
					style={scrapStyle(piece, i)}
					target={piece.external ? '_blank' : undefined}
					rel={piece.external ? 'noopener' : undefined}
				>
					<div class="frame">
						<div class="thumb">
							<span class={`status-pill status-${piece.status}`}>
								<span class="dot"></span>
								{statusLabel(piece.status)}
							</span>
							<img src={piece.logo} alt="{piece.title} logo" class="project-logo" loading="lazy" />
							<span class="thumb-label">fig. {i + 1} · {piece.title.toLowerCase()}</span>
						</div>
						<h3>{lang === 'ja' ? piece.titleJa : piece.title} <em>{lang === 'ja' ? piece.subtitleJa : piece.subtitle}</em></h3>
						<p class="summary">{lang === 'ja' ? piece.summaryJa : piece.summary}</p>
						{#if piece.stats}
							<p class="piece-stats">{lang === 'ja' ? piece.statsJa : piece.stats}</p>
						{/if}
						{#if piece.lesson && piece.lessonJa}
							<p class="piece-lesson">{lang === 'ja' ? piece.lessonJa : piece.lesson}</p>
						{/if}
						<div class="meta">
							<span>{lang === 'ja' ? piece.roleJa : piece.role}</span>
							<span>{piece.year}</span>
						</div>
						<span class="read-more">{t('work.readMore')}</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

{#if recordReady}
	<div class="reveal">
		<section class="section" id="record" data-screen-label="03 Record">
			<div class="sec-head">
				<span class="num-vert">03</span>
				<h2>{t('record.title')} <em>{t('record.titleEm')}</em></h2>
			</div>

			<div class="record">
				<ol class="cycles">
					{#each RECORD_CYCLES as cycle, i}
						<li class="cycle">
							<span class="cycle-no" aria-hidden="true">{CYCLE_NUMERALS[i]}</span>
							<div class="cycle-body">
								<div class="cycle-head">
									<h3>{cycle.name}</h3>
									<span class="cycle-years">{lang === 'ja' ? cycle.yearsJa : cycle.years}</span>
								</div>
								<p class="cycle-ship">{lang === 'ja' ? cycle.shipJa : cycle.ship}</p>
								<p class="cycle-lesson">{lang === 'ja' ? cycle.lessonJa : cycle.lesson}</p>
							</div>
						</li>
					{/each}
				</ol>

				<aside class="colophon">
					<span class="colophon-title">{t('record.colophon')}</span>
					<dl>
						{#each COLOPHON as item}
							<div class="colophon-item">
								<dt>{lang === 'ja' ? item.kJa : item.k}</dt>
								<dd>{lang === 'ja' ? item.vJa : item.v}</dd>
							</div>
						{/each}
					</dl>
				</aside>
			</div>
		</section>
	</div>
{/if}

<div class="reveal">
	<section data-screen-label="03 Writing" id="writing" data-philo="journal">
		<div class="section writing-head">
			<div class="sec-head">
				<span class="num-vert">{recordReady ? '04' : t('writing.num')}</span>
				<h2>{t('writing.title')} <em>{t('writing.titleEm')}</em></h2>
			</div>
		</div>

		<div class="dual-blog">
			<div class="col-guides">
				<div class="blog-col-head">
					<h3>{t('writing.guides')}</h3>
					<span class="col-jp">{t('writing.guidesJP')}</span>
				</div>
				<div class="post-list">
					{#each GUIDES[lang] as guide}
						<a class="post" href={localizeHref(`/ai-guides#${guide.anchor}`, { locale: lang })}>
							<div class="post-meta">
								<span class="tag">{guide.tag}</span>
								<span>{t('writing.dateAi')}</span>
								<span>{t('writing.minRead')}</span>
							</div>
							<h4>{guide.title}</h4>
							<p>{guide.desc}</p>
							<div class="prompt-snippet">{guide.snippet}</div>
						</a>
					{/each}
				</div>
			</div>

			<div class="col-philo">
				<div class="blog-col-head">
					<h3>{t('writing.philo')}</h3>
					<span class="col-jp">{t('writing.philoJP')}</span>
				</div>
				<div class="post-list">
					{#each PHILO[lang] as post}
						<a class="post" href={localizeHref(post.href, { locale: lang })}>
							<div class="post-meta">{post.date}</div>
							<h4>{post.title}</h4>
							<p>{post.desc}</p>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>
</div>

<div class="reveal">
	<section class="section contact-sec" id="contact" data-screen-label="04 Contact">
		<div class="sec-head">
			<span class="num-vert">{recordReady ? '05' : t('contact.num')}</span>
			<h2>{t('contact.title')} <em>{t('contact.titleEm')}</em></h2>
		</div>

		<div class="contact-grid">
			<aside class="contact-aside">
				<p>{t('contact.aside.lead')}</p>
				<p>{t('contact.aside.hi')}</p>
				<button
					type="button"
					class:copied={emailCopyStatus === 'copied'}
					class="contact-email"
					onclick={copyContactEmail}
					aria-label={lang === 'ja' ? 'Hiro のメールアドレスをコピー' : "Copy Hiro's email address"}
				>
					<span class="contact-email-address">
						{emailCopyStatus === 'revealed' ? revealedEmail : CONTACT.emailLabel}
					</span>
					<span class="contact-email-action" aria-live="polite">
						{emailCopyStatus === 'copied'
							? t('contact.email.copied')
							: emailCopyStatus === 'revealed'
								? t('contact.email.revealed')
								: t('contact.email.copy')}
					</span>
				</button>
				<div class="contact-links">
					<a href={SOCIAL_LINKS.github} target="_blank" rel="noopener">GitHub</a>
					<a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
					<a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener">X</a>
				</div>

				<div class="contact-tools">
					<span class="tools-eyebrow">{t('contact.tools.title')}</span>
					<ul class="tools-list">
						<li>
							<a href={CONTACT.cal} target="_blank" rel="noopener">{t('contact.tools.cal.label')} →</a>
							<span>{t('contact.tools.cal.desc')}</span>
						</li>
						<li>
							<a href={asset('/hiro-kuwana.vcf')} download>{t('contact.tools.vcf.label')}</a>
							<span>{t('contact.tools.vcf.desc')}</span>
						</li>
						<li>
							<a href={asset('/tea-with-hiro.ics')} download>{t('contact.tools.ics.label')}</a>
							<span>{t('contact.tools.ics.desc')}</span>
						</li>
					</ul>
				</div>
			</aside>

			<div class="contact-stack">
				<div class="contact-tabs" role="tablist" aria-label="Contact options">
					<button
						type="button"
						role="tab"
						aria-selected={contactMode === 'write'}
						class={`contact-tab ${contactMode === 'write' ? 'is-active' : ''}`}
						onclick={() => (contactMode = 'write')}
					>
						<span class="tab-num">01</span>
						<span class="tab-label">{t('contact.tab.write')}</span>
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={contactMode === 'follow'}
						class={`contact-tab ${contactMode === 'follow' ? 'is-active' : ''}`}
						onclick={() => (contactMode = 'follow')}
					>
						<span class="tab-num">02</span>
						<span class="tab-label">{t('contact.tab.follow')}</span>
					</button>
				</div>

				{#if contactMode === 'write'}
					{#if contactStatus === 'sent'}
						<div class="contact-thanks">
							<div class="thanks-stamp">浩</div>
							<h3>{t('contact.thanks.title')} <em>{t('contact.thanks.titleEm')}</em></h3>
							<p class="ack">{contactReply}</p>
							<p class="ack-note">{t('contact.thanks.note')}</p>
							<button type="button" class="contact-btn ghost" onclick={resetContact}>
								{t('contact.thanks.again')}
							</button>
						</div>
					{:else}
						<form class="contact-form" onsubmit={sendContact}>
							<p class="contact-lead">{t('contact.write.lead')}</p>
							<label class="field">
								<span class="field-label">{t('contact.field.name')}</span>
								<input type="text" required bind:value={contactName} placeholder={t('contact.field.namePh')} />
							</label>
							<label class="field">
								<span class="field-label">{t('contact.field.email')}</span>
								<input type="email" required bind:value={contactEmail} placeholder={t('contact.field.emailPh')} />
							</label>
							<label class="field">
								<span class="field-label">{t('contact.field.msg')}</span>
								<textarea required rows="6" bind:value={contactMessage} placeholder={t('contact.field.msgPh')}></textarea>
							</label>
							<div class="contact-row">
								<span class="contact-note">{t('contact.note.write')}</span>
								<button type="submit" class="contact-btn" disabled={contactStatus === 'sending'}>
									{contactStatus === 'sending' ? t('contact.btn.sending') : t('contact.btn.send')}
								</button>
							</div>
						</form>
					{/if}
				{:else if subscribeStatus === 'sent'}
					<div class="contact-thanks subscribe-thanks">
						<div class="thanks-stamp">購</div>
						<h3>{t('sub.thanks.title')} <em>{t('sub.thanks.titleEm')}</em></h3>
						<p class="ack">{t('sub.thanks.note')}</p>
						<button type="button" class="contact-btn ghost" onclick={resetSubscribe}>
							{t('sub.thanks.again')}
						</button>
					</div>
				{:else}
					<form class="contact-form sub-form" onsubmit={subscribe}>
						<p class="contact-lead">{t('sub.lead')}</p>
						<label class="field">
							<span class="field-label">{t('sub.field.email')}</span>
							<input type="email" required bind:value={subscribeEmail} placeholder={t('sub.field.emailPh')} />
						</label>

						<fieldset class="sub-choice">
							<legend class="field-label">{t('sub.choose')}</legend>
							<div class="sub-choice-row">
								{#each ['both', 'philo', 'guides'] as choice}
									<label class={`sub-chip ${subscribeChoice === choice ? 'is-on' : ''}`}>
										<input type="radio" name="sub-choice" value={choice} bind:group={subscribeChoice} />
										<span>{t(`sub.opt.${choice}`)}</span>
									</label>
								{/each}
							</div>
						</fieldset>

						{#if subscribeStatus === 'error'}
							<p class="sub-error" role="alert">{t('sub.error')}</p>
						{/if}

						<div class="contact-row">
							<span class="contact-note">{t('sub.cadence')}</span>
							<button type="submit" class="contact-btn" disabled={subscribeStatus === 'sending'}>
								{subscribeStatus === 'sending' ? t('sub.btn.going') : t('sub.btn.go')}
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</section>
</div>
