<script lang="ts">
	import { base } from '$app/paths';
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
		subtitle: string;
		role: string;
		summary: string;
		logo: string;
		pos: { left: string; top: string; width: string; rotate: number };
	};

	const COPY: Record<Locale, Record<string, string>> = {
		en: {
			'hero.season': '初夏 · early summer · 2026',
			'hero.vert': '人 を 拡 張 す る 道 具',
			'hero.title.l1': 'Building',
			'hero.title.tools': 'tools',
			'hero.title.l2': 'that augment',
			'hero.title.l3': 'humanity',
			'hero.tagline':
				"I'm Hiro Kuwana (桑名浩行). I make practical, opinionated AI utilities, quietly built and carefully made, for people who would rather think than scroll.",
			'hero.now': 'Open · two seats · this season',
			'hero.about1.a': 'I run a tiny studio of one and take a few focused projects each year, usually with founders building something',
			'hero.about1.strong': 'AI-shaped that needs to feel less like a chatbot',
			'hero.about1.b': 'and more like a tool with taste.',
			'hero.about2':
				'I keep notes here on product, language learning, and the slower questions underneath the work.',
			'hero.meta.based.k': 'Based',
			'hero.meta.based.v': 'Kyoto',
			'hero.meta.since.k': 'Since',
			'hero.meta.since.v': '2019',
			'hero.meta.stack.k': 'Stack',
			'hero.meta.stack.v': 'LLMs · TypeScript · taste',
			'hero.meta.reading.k': 'Reading',
			'hero.meta.reading.v': 'Tanizaki · Berry',
			'hero.scroll': '下へ',
			'work.num': '02',
			'work.title': 'Projects',
			'work.titleEm': '— things I tend, and things I have set down.',
			'work.filter.all': 'All',
			'work.filter.active': 'In hand',
			'work.filter.shipped': 'Shipped',
			'work.filter.sunset': 'Sunset',
			'work.status.active': 'in hand',
			'work.status.shipped': 'shipped',
			'work.status.sunset': 'sunset',
			'work.readMore': 'open →',
			'writing.num': '03',
			'writing.title': 'Two notebooks',
			'writing.titleEm': '— one with the machines, one without.',
			'writing.guides': './ai-guides',
			'writing.guidesJP': '道 具',
			'writing.philo': 'The Long Way',
			'writing.philoJP': '手 書 き',
			'writing.minRead': '~ 6 min',
			'writing.dateAi': '04 · 2026',
			'contact.num': '04',
			'contact.title': 'Stay in touch',
			'contact.titleEm': '— write me, or follow along.',
			'contact.tab.write': 'Write me · お便り',
			'contact.tab.follow': 'Follow new posts · 購読',
			'contact.aside.lead': 'Open for one or two collaborations through autumn. Short engagements, deep work, real outcomes.',
			'contact.aside.hi': 'Or just say hello. I read every message by hand and usually reply within a few days.',
			'contact.write.lead': "Tell me what you're working on. No template, no automation, just you and me.",
			'contact.field.name': 'お名前 · Name',
			'contact.field.email': '電子メール · Email',
			'contact.field.msg': 'ご用件 · Message',
			'contact.field.namePh': 'Your name',
			'contact.field.emailPh': 'you@somewhere.com',
			'contact.field.msgPh': "Tell me what you're working on, or just say hi.",
			'contact.note.write': 'Opens your mail client as a fallback. Nothing is sent to a third party from this page.',
			'contact.btn.send': 'Send · 送る →',
			'contact.btn.sending': 'Sending...',
			'contact.thanks.title': 'Received',
			'contact.thanks.titleEm': '— ありがとう.',
			'contact.thanks.note': 'Your mail client should also open with a copy you can send directly.',
			'contact.thanks.again': 'Send another',
			'sub.lead':
				'I publish a few things a month: slow essays, product notes, and practical AI workflows. One short note when something new goes up.',
			'sub.field.email': '電子メール · Email',
			'sub.field.emailPh': 'you@somewhere.com',
			'sub.choose': 'I want to follow:',
			'sub.opt.both': 'Both',
			'sub.opt.philo': 'The Long Way',
			'sub.opt.guides': './ai-guides',
			'sub.cadence': 'Roughly twice a month. Plain text. Unsubscribe with one click.',
			'sub.btn.go': 'Subscribe · 購読 →',
			'sub.btn.going': 'Subscribing...',
			'sub.thanks.title': 'Subscribed',
			'sub.thanks.titleEm': '— よろしく.',
			'sub.thanks.note': "I'll send a short note when the next piece goes up. That's the entire system.",
			'sub.thanks.again': 'Use a different email'
		},
		ja: {
			'hero.season': '初夏 · 2026年',
			'hero.vert': '人 を 拡 張 す る 道 具',
			'hero.title.l1': '人を',
			'hero.title.tools': '拡張する',
			'hero.title.l2': '',
			'hero.title.l3': '道具をつくる',
			'hero.tagline':
				'桑名浩行 (Hiro Kuwana) です。実用的で意志のある AI の道具を、静かに、丁寧につくっています。スクロールするより、考えたい人のために。',
			'hero.now': '受付中 · 二件 · 今季',
			'hero.about1.a': '一人の小さなスタジオを営んでいます。年に数件、',
			'hero.about1.strong': 'AI を使いながらもチャットボット然としていない',
			'hero.about1.b': '道具をつくる人と仕事をしています。',
			'hero.about2': 'ここには、プロダクト、言語学習、そして作る理由についての覚え書きを置いています。',
			'hero.meta.based.k': '拠点',
			'hero.meta.based.v': '京都',
			'hero.meta.since.k': '開始',
			'hero.meta.since.v': '2019年',
			'hero.meta.stack.k': '手段',
			'hero.meta.stack.v': 'LLM · TypeScript · 趣味',
			'hero.meta.reading.k': '読書',
			'hero.meta.reading.v': '谷崎 · ベリー',
			'hero.scroll': '下へ',
			'work.num': '02',
			'work.title': 'プロジェクト',
			'work.titleEm': '— 手入れしているもの、置いたもの。',
			'work.filter.all': 'すべて',
			'work.filter.active': '手入れ中',
			'work.filter.shipped': '公開済',
			'work.filter.sunset': '手放した',
			'work.status.active': '手入れ中',
			'work.status.shipped': '公開済',
			'work.status.sunset': '手放した',
			'work.readMore': '開く →',
			'writing.num': '03',
			'writing.title': '二冊のノート',
			'writing.titleEm': '— 機械と。機械なしで。',
			'writing.guides': './ai-guides',
			'writing.guidesJP': '道 具',
			'writing.philo': '回り道',
			'writing.philoJP': '手 書 き',
			'writing.minRead': '約 6 分',
			'writing.dateAi': '2026 · 04',
			'contact.num': '04',
			'contact.title': 'これからも',
			'contact.titleEm': '— 手紙でも、購読でも。',
			'contact.tab.write': 'お便りを書く',
			'contact.tab.follow': '更新を購読する',
			'contact.aside.lead': '今季は一、二件のお仕事をお受けしています。短い期間で、深く、確かな成果を。',
			'contact.aside.hi': 'こんにちはの一言でも。届いた便りはすべて手で読み、たいてい数日のうちにお返事します。',
			'contact.write.lead': 'いま手がけていること、よければ聞かせてください。テンプレートも自動化もありません。',
			'contact.field.name': 'お名前',
			'contact.field.email': 'メールアドレス',
			'contact.field.msg': 'ご用件',
			'contact.field.namePh': 'お名前',
			'contact.field.emailPh': 'you@somewhere.com',
			'contact.field.msgPh': '何を作っているか、あるいは一言だけでも。',
			'contact.note.write': 'メールクライアントが開きます。このページから第三者へ送信はしません。',
			'contact.btn.send': '送る →',
			'contact.btn.sending': '送信中...',
			'contact.thanks.title': '届きました',
			'contact.thanks.titleEm': '— ありがとう。',
			'contact.thanks.note': 'メールクライアントにも控えが開きます。そのままお送りいただけます。',
			'contact.thanks.again': 'もう一通',
			'sub.lead': 'ひと月に数本、随筆やプロダクトの覚え書き、AI の実践メモを書いています。新しいものが出たときに短く一通だけ。',
			'sub.field.email': 'メールアドレス',
			'sub.field.emailPh': 'you@somewhere.com',
			'sub.choose': '購読するもの:',
			'sub.opt.both': '両方',
			'sub.opt.philo': '回り道',
			'sub.opt.guides': './ai-guides',
			'sub.cadence': '月に二度ほど。プレーンテキスト。ワンクリックで解除できます。',
			'sub.btn.go': '購読する →',
			'sub.btn.going': '登録中...',
			'sub.thanks.title': '登録しました',
			'sub.thanks.titleEm': '— よろしく。',
			'sub.thanks.note': '次の文章が出たら、短く一通だけ送ります。仕掛けはそれだけです。',
			'sub.thanks.again': '別のメールで登録'
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
			year: '2024 - now',
			href: PERSONAL.companyWebsite,
			external: true,
			title: 'Kaiwa',
			subtitle: 'language learning, reimagined',
			role: 'Founder + Product',
			summary: 'Bite-sized AI conversations for people who want to practice without turning learning into another feed.',
			logo: `${base}/kaiwa_logo.png`,
			pos: { left: '0%', top: '0%', width: '38%', rotate: -2 }
		},
		{
			id: 'exonians',
			status: 'shipped',
			year: '2024',
			href: 'https://exoniansjapan.com/',
			external: true,
			title: 'Exonians in Japan',
			subtitle: 'a fast community platform',
			role: 'Design + Build',
			summary: 'A small, practical alumni site built quickly enough to prove that execution speed can be a design feature.',
			logo: `${base}/icon-512x512.png`,
			pos: { left: '52%', top: '4%', width: '38%', rotate: 1.5 }
		},
		{
			id: 'reddit-scout',
			status: 'active',
			year: '2025',
			href: 'https://github.com/hkuwana/Kaiwa-reddit-scout',
			external: true,
			title: 'Kaiwa Reddit Scout',
			subtitle: 'signal-finding for language learners',
			role: 'Automation + Research',
			summary: 'A local workflow that connects Reddit, Drive, and Gemini to find language learners with real intent.',
			logo: `${base}/kaiwa_logo.png`,
			pos: { left: '8%', top: '38%', width: '36%', rotate: -1 }
		},
		{
			id: 'flybyrd',
			status: 'sunset',
			year: '2023 - 2024',
			href: '#contact',
			title: 'Flybyrd',
			subtitle: 'AI for venture capital',
			role: 'Founder',
			summary: 'A deal-flow and startup analysis product. Useful lessons, deliberately closed to focus the studio.',
			logo: `${base}/flybyrd_logo.png`,
			pos: { left: '54%', top: '46%', width: '40%', rotate: 1 }
		},
		{
			id: 'pebblr',
			status: 'sunset',
			year: '2021 - 2023',
			href: '#contact',
			title: 'Pebblr',
			subtitle: 'connecting nonprofits and donors',
			role: 'Product + Ops',
			summary: 'A nonprofit donor experiment that taught me where human trust matters more than platform mechanics.',
			logo: `${base}/icon-512x512.png`,
			pos: { left: '22%', top: '78%', width: '42%', rotate: -1.5 }
		}
	];

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
				title: 'ローカル中心のプロンプト管理 — テキスト + git だけで',
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
	let subscribeStatus: 'idle' | 'sending' | 'sent' = 'idle';
	let visiblePieces = PIECES;
	let t = (key: string) => COPY[lang]?.[key] ?? COPY.en[key] ?? key;
	let statusLabel = (status: Status) => t(`work.status.${status}`);

	$: lang = ($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale;
	$: visiblePieces = filter === 'all' ? PIECES : PIECES.filter((piece) => piece.status === filter);
	$: t = (key: string) => COPY[lang]?.[key] ?? COPY.en[key] ?? key;
	$: statusLabel = (status: Status) => t(`work.status.${status}`);

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
			observer.disconnect();
		};
	});

	function sendContact(event: SubmitEvent) {
		event.preventDefault();
		if (!contactName || !contactEmail || !contactMessage) return;

		contactStatus = 'sending';
		contactReply =
			lang === 'ja'
				? `${contactName}さん、届きました。Hiro が手で読み、数日のうちに返事をします。まずは、この形で送ってくれてありがとう。`
				: `${contactName}, I received this. Hiro reads every note by hand and usually replies within a few days. Thank you for sending the real shape of the work.`;

		const subject = encodeURIComponent(`From your site - ${contactName}`);
		const body = encodeURIComponent(`From: ${contactName} <${contactEmail}>\n\n${contactMessage}`);

		if (typeof window !== 'undefined') {
			window.open(`mailto:${CONTACT.email}?subject=${subject}&body=${body}`, '_blank');
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

	function subscribe(event: SubmitEvent) {
		event.preventDefault();
		if (!subscribeEmail) return;

		subscribeStatus = 'sending';
		if (typeof window !== 'undefined') {
			localStorage.setItem(
				'hiro_sub',
				JSON.stringify({ email: subscribeEmail, choice: subscribeChoice, at: Date.now() })
			);
		}

		window.setTimeout(() => {
			subscribeStatus = 'sent';
		}, 450);
	}

	function resetSubscribe() {
		subscribeEmail = '';
		subscribeStatus = 'idle';
	}
</script>

<svelte:head>
	<title>Hiro Kuwana — building tools that augment humanity</title>
	<meta
		name="description"
		content="Hiro Kuwana builds practical, opinionated AI tools and writes about product, language learning, and building for the long run."
	/>
	<meta name="keywords" content={SITE.keywords.join(', ')} />
	<meta name="author" content={SITE.author} />
	<meta property="og:type" content="profile" />
	<meta property="og:url" content={SITE.url} />
	<meta property="og:title" content="Hiro Kuwana — building tools that augment humanity" />
	<meta property="og:description" content="A tiny studio of one for practical AI utilities, product notes, and slow essays." />
	<meta property="og:image" content={SITE.image} />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href={SITE.url} />
</svelte:head>

<section class="hero" data-screen-label="01 Landing">
	<HeroCanvas />

	<div class="season-mark">
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

	<div class="scroll-cue">
		<span>{t('hero.scroll')}</span>
		<span class="line"></span>
	</div>
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
							<span class="thumb-label">fig. {i + 1} — {piece.title.toLowerCase()}</span>
						</div>
						<h3>{piece.title} <em>— {piece.subtitle}</em></h3>
						<p class="summary">{piece.summary}</p>
						<div class="meta">
							<span>{piece.role}</span>
							<span>{piece.year}</span>
						</div>
						<span class="read-more">{t('work.readMore')}</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<div class="reveal">
	<section data-screen-label="03 Writing" id="writing" data-philo="journal">
		<div class="section writing-head">
			<div class="sec-head">
				<span class="num-vert">{t('writing.num')}</span>
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
			<span class="num-vert">{t('contact.num')}</span>
			<h2>{t('contact.title')} <em>{t('contact.titleEm')}</em></h2>
		</div>

		<div class="contact-grid">
			<aside class="contact-aside">
				<p>{t('contact.aside.lead')}</p>
				<p>{t('contact.aside.hi')}</p>
				<a class="contact-email" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
				<div class="contact-links">
					<a href={SOCIAL_LINKS.github} target="_blank" rel="noopener">GitHub</a>
					<a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
					<a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener">Twitter</a>
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
