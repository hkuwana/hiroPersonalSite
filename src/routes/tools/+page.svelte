<script lang="ts">
	import { SITE } from '$data/constants';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';

	type Locale = 'en' | 'ja';

	$: lang = ($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale;

	$: copy =
		lang === 'ja'
			? {
					eyebrow: '道具 · tools',
					title: '小さな道具',
					lede: 'ブラウザの中だけで動く、地味だけど実用的なユーティリティ。アップロードなし、ログイン不要、追跡なし。',
					sub: '自分で必要になってつくったもの。よければお使いください。',
					backHome: 'ホームに戻る'
				}
			: {
					eyebrow: 'tools · 道具',
					title: 'Small tools',
					lede: 'Quiet, practical utilities that run entirely in your browser. No uploads, no accounts, no tracking.',
					sub: 'Things I needed myself, kept here in case you do too.',
					backHome: 'Back to home'
				};

	const TOOLS = [
		{
			num: '01',
			href: '/tools/ics-formatter',
			titleEn: 'ICS formatter',
			titleJa: 'ICS フォーマッタ',
			subEn: 'validate & fix calendar files',
			subJa: 'カレンダー (.ics) を整える',
			descEn:
				'Paste a broken .ics file. Get back a clean one. Fixes line endings, line folding, missing UID and DTSTAMP, mismatched BEGIN/END blocks, and the small RFC 5545 details that quietly break imports.',
			descJa:
				'壊れた .ics を貼り付けると、きれいな .ics が返ってきます。改行、行折り、UID や DTSTAMP の欠落、BEGIN / END のずれなど、RFC 5545 の細かい不具合を静かに直します。',
			stamp: '形'
		},
		{
			num: '02',
			href: '/tools/vcf-splitter',
			titleEn: 'VCF splitter',
			titleJa: 'VCF スプリッタ',
			subEn: 'one vCard per contact',
			subJa: '連絡先を一人ずつに分ける',
			descEn:
				'Split a single .vcf file containing many contacts into individual vCard files. Search, select, and download — useful for moving contacts between iPhone, Android, and Google.',
			descJa:
				'複数の連絡先がまとまった .vcf ファイルを、ひとつずつの vCard に分けます。検索 · 選択 · ダウンロード。iPhone・Android・Google の間で連絡先を移すときに。',
			stamp: '名'
		}
	];
</script>

<svelte:head>
	<title>Tools · Hiro Kuwana</title>
	<meta
		name="description"
		content="Small, practical browser utilities by Hiro Kuwana — an ICS formatter and a VCF contact splitter. Free, private, runs locally."
	/>
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE.url}/tools`} />
	<meta property="og:title" content="Tools · Hiro Kuwana" />
	<meta property="og:description" content="Small, practical browser utilities. Free, private, runs locally." />
	<meta property="og:image" content={SITE.image} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Tools · Hiro Kuwana" />
	<meta name="twitter:description" content="Small, practical browser utilities. Free, private, runs locally." />
	<link rel="canonical" href={`${SITE.url}/tools`} />
	<link rel="alternate" hreflang="en" href={`${SITE.url}/tools`} />
	<link rel="alternate" hreflang="ja" href={`${SITE.url}/ja/tools`} />
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}/tools`} />
</svelte:head>

<article class="tools-page">
	<header class="tools-head">
		<span class="eyebrow">{copy.eyebrow}</span>
		<h1>{copy.title}<span class="seal">浩</span></h1>
		<p class="lede">{copy.lede}</p>
		<p class="sub">{copy.sub}</p>
	</header>

	<section class="tool-list" aria-label="Available tools">
		{#each TOOLS as tool}
			<a class="tool-card" href={localizeHref(tool.href, { locale: lang })}>
				<div class="tool-card-head">
					<span class="num">{tool.num}</span>
					<span class="stamp" aria-hidden="true">{tool.stamp}</span>
				</div>
				<h2>
					{lang === 'ja' ? tool.titleJa : tool.titleEn}
					<em>{lang === 'ja' ? tool.subJa : tool.subEn}</em>
				</h2>
				<p>{lang === 'ja' ? tool.descJa : tool.descEn}</p>
				<span class="open">{lang === 'ja' ? '開く →' : 'open →'}</span>
			</a>
		{/each}
	</section>

	<footer class="tools-foot">
		<a class="back-link" href={localizeHref('/', { locale: lang })}>← {copy.backHome}</a>
	</footer>
</article>

<style>
	.tools-page {
		max-width: 880px;
		margin: 0 auto;
		padding: 5rem 1.75rem 6rem;
		font-family: var(--f-body);
		color: var(--color-text);
	}

	.tools-head {
		margin-bottom: 3.5rem;
	}

	.eyebrow {
		display: inline-block;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
		margin-bottom: 1.25rem;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 3.25rem);
		line-height: 1.05;
		font-weight: 500;
		letter-spacing: -0.02em;
		margin: 0 0 1.5rem;
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.seal {
		font-family: var(--f-jp);
		font-size: 0.55em;
		background: var(--color-accent);
		color: #fff7ed;
		padding: 0.05em 0.25em;
		border-radius: 2px;
		transform: translateY(-0.15em);
	}

	.lede {
		font-size: 1.2rem;
		line-height: 1.55;
		margin: 0 0 1rem;
		max-width: 60ch;
	}

	.sub {
		font-size: 1rem;
		font-style: italic;
		color: var(--color-text-secondary);
		margin: 0;
		max-width: 60ch;
	}

	.tool-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	.tool-card {
		display: block;
		text-decoration: none;
		color: inherit;
		padding: 1.75rem 1.75rem 1.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		transition: transform var(--duration-normal) var(--ease-out-quart),
			border-color var(--duration-normal) ease,
			box-shadow var(--duration-normal) ease;
	}

	.tool-card:hover {
		transform: translateY(-2px);
		border-color: var(--color-accent);
		box-shadow: var(--shadow-md);
	}

	.tool-card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.85rem;
	}

	.num {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		color: var(--color-text-tertiary);
	}

	.stamp {
		font-family: var(--f-jp);
		background: var(--color-accent);
		color: #fff7ed;
		padding: 0.1em 0.4em;
		font-size: 0.9rem;
		border-radius: 2px;
	}

	.tool-card h2 {
		font-family: var(--f-body);
		font-weight: 500;
		font-size: 1.5rem;
		line-height: 1.25;
		margin: 0 0 0.65rem;
		letter-spacing: -0.01em;
	}

	.tool-card h2 em {
		display: block;
		font-style: italic;
		font-weight: 400;
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin-top: 0.2rem;
		letter-spacing: 0;
	}

	.tool-card p {
		margin: 0 0 1rem;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		max-width: 62ch;
	}

	.open {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
	}

	.tools-foot {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.back-link {
		font-family: var(--f-mono);
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
		text-decoration: none;
		transition: color var(--duration-normal) ease;
	}

	.back-link:hover {
		color: var(--color-accent);
	}

	@media (max-width: 640px) {
		.tools-page {
			padding: 3.5rem 1.25rem 4rem;
		}
		.tool-card {
			padding: 1.5rem 1.25rem 1.25rem;
		}
	}
</style>
