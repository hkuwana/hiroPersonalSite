<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { SITE } from '$data/constants';
	import {
		detect,
		redact,
		restore,
		REDACTION_TYPES,
		type RedactionMap,
		type RedactionType
	} from '$lib/tools/redact';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';

	type Locale = 'en' | 'ja';

	let lang = $derived(
		($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale
	);

	const MAP_KEY = 'safe-paste-map';

	const TYPE_LABELS: Record<RedactionType, { en: string; ja: string }> = {
		EMAIL: { en: 'Email addresses', ja: 'メールアドレス' },
		PHONE: { en: 'Phone numbers', ja: '電話番号' },
		CARD: { en: 'Card numbers', ja: 'カード番号' },
		IBAN: { en: 'Bank IBANs', ja: '銀行 IBAN' },
		MYNUMBER: { en: 'My Number (JP)', ja: 'マイナンバー' },
		SECRET: { en: 'API keys and tokens', ja: 'API キー · トークン' },
		IP: { en: 'IP addresses', ja: 'IP アドレス' },
		URL: { en: 'URLs with a query string', ja: 'クエリ付き URL' },
		POSTAL: { en: 'Postal codes', ja: '郵便番号' },
		TERM: { en: 'Your own terms', ja: '自分で指定した語' },
		LITERAL: { en: 'Existing placeholders', ja: '既存のプレースホルダ' }
	};

	const SAMPLE = `Hi Sarah,

Following up on the Acme Corp renewal. Send the invoice to
billing@acmecorp.test, or call me on 03-1234-5678.

Card on file: 4111 1111 1111 1111
Bank: GB82WEST12345698765432
Staging key: sk-ant-api03-QkFTRTY0RVhBTVBMRQ
Server: 192.168.1.42
Docs: https://internal.acme.test/renewal?token=abc123xyz

Thanks,
Hiro`;

	let inputText = $state('');
	let termsInput = $state('');
	let replyText = $state('');
	let storedMap = $state<RedactionMap>({});
	let copied = $state('');

	let enabled = $state<Record<RedactionType, boolean>>(
		Object.fromEntries(REDACTION_TYPES.map((t) => [t, true])) as Record<RedactionType, boolean>
	);

	let terms = $derived(
		termsInput
			.split(/[\n,]/)
			.map((t) => t.trim())
			.filter(Boolean)
	);

	let activeTypes = $derived(REDACTION_TYPES.filter((t) => enabled[t]));

	/** Every type scanned, so the counts show what exists even when a box is off. */
	let allMatches = $derived(detect(inputText, { types: REDACTION_TYPES, terms }));

	let counts = $derived.by(() => {
		const tally = {} as Record<RedactionType, number>;
		for (const match of allMatches) tally[match.type] = (tally[match.type] ?? 0) + 1;
		return tally;
	});

	let result = $derived(redact(inputText, { types: activeTypes, terms }));
	let foundCount = $derived(result.matches.length);

	let restored = $derived(restore(replyText, storedMap));
	let heldCount = $derived(Object.keys(storedMap).length);

	// The map is the one object that still holds real values. sessionStorage
	// keeps it inside this tab and drops it when the tab closes.
	$effect(() => {
		const map = result.map;
		if (Object.keys(map).length === 0) return;
		storedMap = map;
		try {
			sessionStorage.setItem(MAP_KEY, JSON.stringify(map));
		} catch {
			// private mode or a full quota: the in-memory map still works
		}
	});

	onMount(() => {
		try {
			const saved = sessionStorage.getItem(MAP_KEY);
			if (saved) storedMap = JSON.parse(saved) as RedactionMap;
		} catch {
			// ignore unreadable storage
		}
	});

	function label(type: RedactionType): string {
		return lang === 'ja' ? TYPE_LABELS[type].ja : TYPE_LABELS[type].en;
	}

	function loadSample() {
		inputText = SAMPLE;
		termsInput = 'Sarah\nAcme Corp\nHiro';
	}

	function clearInput() {
		inputText = '';
		termsInput = '';
	}

	function forgetMap() {
		storedMap = {};
		replyText = '';
		try {
			sessionStorage.removeItem(MAP_KEY);
		} catch {
			// nothing to remove
		}
	}

	async function copy(text: string, which: string) {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			copied = which;
			setTimeout(() => (copied = ''), 1600);
		} catch {
			copied = '';
		}
	}

	function downloadKey() {
		if (heldCount === 0) return;
		const blob = new Blob([JSON.stringify(storedMap, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'safe-paste-key.json';
		anchor.click();
		URL.revokeObjectURL(url);
	}

	function onKeyUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				storedMap = JSON.parse(String(reader.result)) as RedactionMap;
			} catch {
				// leave the current map in place when the file is not valid JSON
			}
		};
		reader.readAsText(file);
	}
</script>

<svelte:head>
	<title>Safe paste · redact before you paste into AI · Hiro Kuwana</title>
	<meta
		name="description"
		content="Free browser-based redactor. Remove emails, phone numbers, card numbers, API keys and your own names from text before you paste it into ChatGPT or Claude — then put the real values back into the reply. Runs locally, nothing is uploaded."
	/>
	<meta
		name="keywords"
		content="pii redaction, redact before chatgpt, remove personal data from text, anonymize text, privacy scanner, redact api keys, local redaction tool"
	/>
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE.url}/tools/safe-paste`} />
	<meta property="og:title" content="Safe paste · Hiro Kuwana" />
	<meta
		property="og:description"
		content="Redact personal data before you paste text into an AI, then restore the real values in the answer. Runs entirely in your browser."
	/>
	<meta property="og:image" content={SITE.image} />
	<meta name="twitter:card" content="summary" />
	<link rel="canonical" href={`${SITE.url}/tools/safe-paste`} />
	<link rel="alternate" hreflang="en" href={`${SITE.url}/tools/safe-paste`} />
	<link rel="alternate" hreflang="ja" href={`${SITE.url}/ja/tools/safe-paste`} />
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}/tools/safe-paste`} />
	{#if !dev}
		<!-- The page makes no network request. This header makes the browser enforce it. -->
		<meta http-equiv="content-security-policy" content="connect-src 'none'" />
	{/if}
</svelte:head>

<article class="tool-page" data-sveltekit-reload data-sveltekit-preload-data="off">
	<header class="tool-head">
		<span class="eyebrow">{lang === 'ja' ? '道具 · 03' : 'tools · 03'}</span>
		<h1>Safe paste<span class="seal">守</span></h1>
		<p class="lede">
			{lang === 'ja'
				? 'AI に貼り付ける前に、個人情報を伏せ字にします。返ってきた答えを貼り戻すと、本当の値が元に戻ります。'
				: 'Hide personal data before you paste text into an AI. Paste the answer back, and the real values return.'}
		</p>
		<p class="sub">
			{lang === 'ja'
				? 'このページは通信を一切しません。ブラウザの Network タブを開けば確認できます。'
				: 'This page makes no network request at all. Open your browser network tab and check.'}
		</p>
	</header>

	<section class="panel">
		<div class="panel-head">
			<span class="num">01</span>
			<h2>
				{lang === 'ja' ? '入力' : 'Input'}
				<em>{lang === 'ja' ? 'AI に送りたい文章' : 'the text you want to send'}</em>
			</h2>
		</div>

		<div class="actions">
			<button type="button" class="btn ghost" onclick={loadSample}>
				{lang === 'ja' ? 'サンプル' : 'Load sample'}
			</button>
			<button type="button" class="btn ghost" onclick={clearInput}>
				{lang === 'ja' ? 'クリア' : 'Clear'}
			</button>
		</div>

		<textarea
			class="box"
			rows="12"
			bind:value={inputText}
			spellcheck="false"
			placeholder={lang === 'ja'
				? 'ここに文章を貼り付けてください。'
				: 'Paste your text here.'}
		></textarea>
	</section>

	<section class="panel">
		<div class="panel-head">
			<span class="num">02</span>
			<h2>
				{lang === 'ja' ? '名前を教える' : 'Name the names'}
				<em>{lang === 'ja' ? '人名や社名は検出できません' : 'people and companies are not detected'}</em>
			</h2>
		</div>

		<p class="api-note">
			{lang === 'ja'
				? '正規表現では人名を確実に見つけられません。推測すると、静かに見落とします。だから人名 · 社名 · 案件名はご自身で入れてください。ほかの項目は検査桁や固定の接頭辞で確実に判定します。'
				: 'No regular expression finds a name without guessing, and a guess fails silently. So you supply the names, companies, and project words. Everything else is confirmed by a checksum or a fixed prefix.'}
		</p>

		<textarea
			class="box small"
			rows="3"
			bind:value={termsInput}
			spellcheck="false"
			placeholder={lang === 'ja'
				? '一行にひとつ、またはカンマ区切り　例: 田中さん, Acme Corp'
				: 'One per line, or comma separated. For example: Sarah, Acme Corp'}
		></textarea>
	</section>

	<section class="panel">
		<div class="panel-head">
			<span class="num">03</span>
			<h2>
				{lang === 'ja' ? '見つかったもの' : 'What was found'}
				<em>{foundCount} {lang === 'ja' ? '件を伏せ字にします' : 'will be hidden'}</em>
			</h2>
		</div>

		<ul class="types">
			{#each REDACTION_TYPES as type}
				<li class="type" class:found={(counts[type] ?? 0) > 0}>
					<label>
						<input type="checkbox" bind:checked={enabled[type]} />
						<span class="type-name">{label(type)}</span>
						<span class="type-count">{counts[type] ?? 0}</span>
					</label>
				</li>
			{/each}
			<li class="type terms" class:found={(counts.TERM ?? 0) > 0}>
				<span class="type-name">{label('TERM')}</span>
				<span class="type-count">{counts.TERM ?? 0}</span>
			</li>
		</ul>
	</section>

	<section class="panel">
		<div class="panel-head">
			<span class="num">04</span>
			<h2>
				{lang === 'ja' ? '伏せ字にした文章' : 'Redacted text'}
				<em>{lang === 'ja' ? 'これを AI に貼る' : 'paste this into the AI'}</em>
			</h2>
		</div>

		<textarea class="box" rows="12" readonly value={result.text} spellcheck="false"></textarea>

		<div class="actions actions-primary">
			<button
				type="button"
				class="btn primary"
				disabled={!result.text}
				onclick={() => copy(result.text, 'redacted')}
			>
				{copied === 'redacted'
					? lang === 'ja'
						? 'コピーしました'
						: 'Copied'
					: lang === 'ja'
						? 'コピー'
						: 'Copy'}
			</button>
		</div>
	</section>

	<section class="panel">
		<div class="panel-head">
			<span class="num">05</span>
			<h2>
				{lang === 'ja' ? '答えを元に戻す' : 'Restore the answer'}
				<em>{lang === 'ja' ? 'AI の返事を貼る' : "paste the AI's reply"}</em>
			</h2>
		</div>

		<div class="keybar">
			<span class="key-count">
				{heldCount}
				{lang === 'ja' ? '件の実値をこのタブが保持しています' : 'real values held in this tab'}
			</span>
			<div class="toolbar-actions">
				<button type="button" class="btn small ghost" disabled={heldCount === 0} onclick={downloadKey}>
					{lang === 'ja' ? '鍵を保存' : 'Download key'}
				</button>
				<label class="btn small ghost">
					{lang === 'ja' ? '鍵を読み込む' : 'Load key'}
					<input type="file" accept="application/json,.json" onchange={onKeyUpload} hidden />
				</label>
				<button type="button" class="btn small ghost" disabled={heldCount === 0} onclick={forgetMap}>
					{lang === 'ja' ? '忘れる' : 'Forget'}
				</button>
			</div>
		</div>

		<textarea
			class="box"
			rows="10"
			bind:value={replyText}
			spellcheck="false"
			placeholder={lang === 'ja' ? 'AI の返事をここに貼り付けてください。' : "Paste the AI's reply here."}
		></textarea>

		{#if replyText}
			<textarea class="box" rows="10" readonly value={restored.text} spellcheck="false"></textarea>

			<div class="actions actions-primary">
				<button type="button" class="btn primary" onclick={() => copy(restored.text, 'restored')}>
					{copied === 'restored'
						? lang === 'ja'
							? 'コピーしました'
							: 'Copied'
						: lang === 'ja'
							? 'コピー'
							: 'Copy'}
				</button>
			</div>

			{#if restored.missing.length > 0}
				<p class="footnote">
					{lang === 'ja' ? '返事に出てこなかったもの: ' : 'Not present in the reply: '}
					{restored.missing.join(', ')}
				</p>
			{/if}
		{/if}
	</section>

	<section class="panel">
		<div class="panel-head">
			<span class="num">06</span>
			<h2>{lang === 'ja' ? 'API' : 'API'} <em>{lang === 'ja' ? 'エージェント向け' : 'for agents'}</em></h2>
		</div>

		<p class="api-note">
			{lang === 'ja'
				? 'この処理は API からも呼べます。エージェントが文章を転送やログに出す前に伏せ字にする用途です。復元用のエンドポイントはありません。復元には実値が必要なので、ブラウザの中だけに残します。'
				: 'An agent can call the same redaction over HTTP, to scrub text before it forwards or logs that text. There is no restore endpoint. Reversal needs the real values, so it stays in this browser.'}
		</p>

		<pre class="api-snippet">curl -X POST {SITE.url}/api/text/redact \
  -H "content-type: application/json" \
  -d '{'{'}"text": "call me on 03-1234-5678", "terms": ["Acme Corp"]{'}'}'</pre>

		<p class="footnote">
			{lang === 'ja' ? '入力は保存されません。60 リクエスト / 分 / IP。' : 'Input is not stored. 60 requests per minute per IP.'}
		</p>
	</section>

	<footer class="tool-foot">
		<a class="back-link" href={localizeHref('/tools', { locale: lang })}
			>← {lang === 'ja' ? '道具に戻る' : 'Back to tools'}</a
		>
	</footer>
</article>

<style>
	.tool-page {
		max-width: 880px;
		margin: 0 auto;
		padding: 5rem 1.75rem 6rem;
		font-family: var(--f-body);
		color: var(--color-text);
	}

	.tool-head {
		margin-bottom: 3rem;
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

	.panel {
		margin: 3rem 0 0;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.panel-head {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.num {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
	}

	.panel-head h2 {
		font-weight: 500;
		font-size: 1.45rem;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.panel-head h2 em {
		font-style: italic;
		font-weight: 400;
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin-left: 0.4rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin: 0 0 1rem;
	}

	.actions-primary {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--f-mono);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.6rem 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-subtle);
		color: var(--color-text);
		cursor: pointer;
		transition:
			background var(--duration-fast) ease,
			color var(--duration-fast) ease,
			border-color var(--duration-fast) ease,
			transform var(--duration-fast) ease;
	}

	.btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.btn:active {
		transform: translateY(1px);
	}

	.btn[disabled] {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.btn.ghost {
		background: transparent;
	}

	.btn.small {
		padding: 0.4rem 0.75rem;
		font-size: 0.7rem;
	}

	.btn.primary {
		background: var(--color-accent);
		color: #fff7ed;
		border-color: var(--color-accent);
	}

	.btn.primary:hover {
		filter: brightness(1.05);
		color: #fff7ed;
	}

	.box {
		width: 100%;
		font-family: var(--f-mono);
		font-size: 0.85rem;
		line-height: 1.6;
		padding: 1rem 1.1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		color: var(--color-text);
		resize: vertical;
		margin-bottom: 0.75rem;
	}

	.box:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.box.small {
		font-size: 0.85rem;
	}

	.types {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.5rem;
	}

	.type {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.55rem 0.8rem;
		opacity: 0.55;
		transition: opacity var(--duration-fast) ease, border-color var(--duration-fast) ease;
	}

	.type.found {
		opacity: 1;
		border-color: var(--color-accent);
	}

	.type label {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		cursor: pointer;
	}

	.type.terms {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-style: italic;
	}

	.type-name {
		flex: 1;
		font-size: 0.9rem;
	}

	.type-count {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.keybar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding: 0.75rem 0.9rem;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
	}

	.key-count {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary);
	}

	.toolbar-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.footnote {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		color: var(--color-text-tertiary);
		margin: 0.5rem 0 0;
	}

	.api-note {
		margin: 0 0 1rem;
		max-width: 60ch;
	}

	.api-snippet {
		font-family: var(--f-mono);
		font-size: 0.8rem;
		line-height: 1.6;
		padding: 1rem 1.1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		overflow-x: auto;
		margin: 0 0 0.75rem;
		white-space: pre;
	}

	.tool-foot {
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
		.tool-page {
			padding: 3.5rem 1.25rem 4rem;
		}
	}
</style>
