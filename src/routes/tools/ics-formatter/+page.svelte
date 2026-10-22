<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE } from '$data/constants';
	import { formatIcs } from '$lib/tools/ics';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';

	type Locale = 'en' | 'ja';

	let lang = $derived(($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale);

	type Issue = { kind: 'error' | 'warning' | 'fixed'; message: string };

	let icsInput = $state('');
	let issues = $state<Issue[]>([]);
	let fixedIcs = $state('');
	let events = $state<{ summary: string; start: string; end: string; rrule?: string }[]>([]);
	let hasValidated = $state(false);
	let isDragging = $state(false);
	let copied = $state(false);

	const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hiro//Tools//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:demo-1@hirokuwana.com
DTSTAMP:20260601T100000Z
DTSTART;TZID=Asia/Tokyo:20260602T080000
DTEND;TZID=Asia/Tokyo:20260602T090000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
SUMMARY:Morning routine
DESCRIPTION:Coffee, review kanban, plan the day.
END:VEVENT
BEGIN:VEVENT
DTSTART:20260603T100000
DTEND:20260603T120000
SUMMARY:Build block
END:VEVENT
END:VCALENDAR`;

	onMount(() => {
		icsInput = SAMPLE_ICS;
	});

	function validateAndFix() {
		const result = formatIcs(icsInput);
		issues = result.issues;
		fixedIcs = result.ics;
		events = result.events;
		hasValidated = true;
	}

	function loadSample() {
		icsInput = SAMPLE_ICS;
		hasValidated = false;
		issues = [];
		fixedIcs = '';
		events = [];
	}

	function clearAll() {
		icsInput = '';
		hasValidated = false;
		issues = [];
		fixedIcs = '';
		events = [];
	}

	function handleFile(file: File | null | undefined) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			icsInput = (e.target?.result as string) ?? '';
			hasValidated = false;
			issues = [];
			fixedIcs = '';
			events = [];
		};
		reader.readAsText(file);
	}

	function onUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		handleFile(input.files?.[0]);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		handleFile(event.dataTransfer?.files?.[0]);
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function onDragLeave() {
		isDragging = false;
	}

	async function copyOutput() {
		if (!fixedIcs) return;
		try {
			await navigator.clipboard.writeText(fixedIcs);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* ignore */
		}
	}

	function downloadOutput() {
		if (!fixedIcs) return;
		const blob = new Blob([fixedIcs], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'calendar.ics';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>ICS formatter · validate & fix calendar files · Hiro Kuwana</title>
	<meta
		name="description"
		content="Free in-browser ICS validator and formatter. Fix line endings, line folding, missing UID, DTSTAMP, and other RFC 5545 issues in .ics calendar files. Runs locally, no upload."
	/>
	<meta name="keywords" content="ics validator, ics formatter, ics fixer, ical validator, calendar file fixer, rfc 5545, vcalendar, vevent" />
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE.url}/tools/ics-formatter`} />
	<meta property="og:title" content="ICS formatter · Hiro Kuwana" />
	<meta property="og:description" content="Paste a broken .ics file. Get a clean one. Fixes line endings, missing UID/DTSTAMP, and RFC 5545 details. Runs locally." />
	<meta property="og:image" content={SITE.image} />
	<meta name="twitter:card" content="summary" />
	<link rel="canonical" href={`${SITE.url}/tools/ics-formatter`} />
	<link rel="alternate" hreflang="en" href={`${SITE.url}/tools/ics-formatter`} />
	<link rel="alternate" hreflang="ja" href={`${SITE.url}/ja/tools/ics-formatter`} />
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}/tools/ics-formatter`} />
</svelte:head>

<article class="tool-page">
	<header class="tool-head">
		<span class="eyebrow">{lang === 'ja' ? '道具 · 01' : 'tools · 01'}</span>
		<h1>ICS formatter<span class="seal">形</span></h1>
		<p class="lede">
			{lang === 'ja'
				? '壊れた .ics を貼り付けて、きれいな .ics に直します。改行、行折り、UID や DTSTAMP の欠落、BEGIN / END のずれなど、RFC 5545 の細かい不具合を静かに直します。'
				: 'Paste a broken .ics file. Get a clean one back. This tool fixes line endings, line folding, missing UID and DTSTAMP, and the small RFC 5545 details that quietly break imports.'}
		</p>
		<p class="sub">
			{lang === 'ja'
				? 'すべてブラウザ内で処理します。サーバーには何も送られません。'
				: 'Everything runs in your browser. Your calendar never leaves the page.'}
		</p>
	</header>

	<section class="panel">
		<div class="panel-head">
			<span class="num">01</span>
			<h2>{lang === 'ja' ? '入力' : 'Input'} <em>{lang === 'ja' ? '.ics を貼るかドロップ' : 'paste or drop your .ics'}</em></h2>
		</div>

		<div class="actions">
			<label class="btn">
				{lang === 'ja' ? '.ics をアップロード' : 'Upload .ics'}
				<input type="file" accept=".ics,text/calendar" onchange={onUpload} hidden />
			</label>
			<button type="button" class="btn ghost" onclick={loadSample}>
				{lang === 'ja' ? 'サンプル' : 'Load sample'}
			</button>
			<button type="button" class="btn ghost" onclick={clearAll}>
				{lang === 'ja' ? 'クリア' : 'Clear'}
			</button>
		</div>

		<div
			class="dropzone"
			class:dragging={isDragging}
			ondrop={onDrop}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			role="region"
			aria-label="ICS input"
		>
			<textarea
				class="ics-input"
				rows="14"
				bind:value={icsInput}
				placeholder={lang === 'ja'
					? '.ics の中身をここに貼り付けるか、ファイルをドロップしてください。'
					: 'Paste your .ics contents here, or drop a file in.'}
				spellcheck="false"
			></textarea>
			{#if isDragging}
				<div class="drop-overlay">{lang === 'ja' ? 'ここにドロップ' : 'Drop your .ics file'}</div>
			{/if}
		</div>

		<div class="actions actions-primary">
			<button type="button" class="btn primary" onclick={validateAndFix}>
				{lang === 'ja' ? '検査して整える →' : 'Validate & fix →'}
			</button>
		</div>
	</section>

	{#if hasValidated}
		<section class="panel">
			<div class="panel-head">
				<span class="num">02</span>
				<h2>{lang === 'ja' ? '所見' : 'Findings'} <em>{issues.length} {lang === 'ja' ? '件' : 'note' + (issues.length === 1 ? '' : 's')}</em></h2>
			</div>

			<ul class="issues">
				{#each issues as issue}
					<li class={`issue issue-${issue.kind}`}>
						<span class="issue-kind">{issue.kind}</span>
						<span class="issue-msg">{issue.message}</span>
					</li>
				{/each}
			</ul>
		</section>

		{#if events.length > 0}
			<section class="panel">
				<div class="panel-head">
					<span class="num">03</span>
					<h2>{lang === 'ja' ? '予定' : 'Events'} <em>{events.length} {lang === 'ja' ? '件' : events.length === 1 ? 'block' : 'blocks'}</em></h2>
				</div>

				<ol class="event-list">
					{#each events as event, idx}
						<li>
							<span class="event-num">fig. {idx + 1}</span>
							<div class="event-body">
								<h3>{event.summary}</h3>
								<p class="event-meta">
									<span>{event.start || '—'}</span>
									<span aria-hidden="true">→</span>
									<span>{event.end || '—'}</span>
									{#if event.rrule}<span class="rrule">{event.rrule}</span>{/if}
								</p>
							</div>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if fixedIcs}
			<section class="panel">
				<div class="panel-head">
					<span class="num">04</span>
					<h2>{lang === 'ja' ? '出力' : 'Output'} <em>{lang === 'ja' ? '整えた .ics' : 'cleaned .ics'}</em></h2>
				</div>

				<textarea class="ics-output" rows="14" readonly value={fixedIcs} spellcheck="false"></textarea>

				<div class="actions">
					<button type="button" class="btn primary" onclick={downloadOutput}>
						{lang === 'ja' ? 'ダウンロード · .ics' : 'Download .ics'}
					</button>
					<button type="button" class="btn" onclick={copyOutput}>
						{copied ? (lang === 'ja' ? 'コピーしました' : 'Copied') : lang === 'ja' ? 'コピー' : 'Copy to clipboard'}
					</button>
				</div>
			</section>
		{/if}
	{/if}

	<section class="panel">
		<div class="panel-head">
			<span class="num">API</span>
			<h2>API <em>{lang === 'ja' ? 'エージェントやスクリプトから' : 'for agents and scripts'}</em></h2>
		</div>
		<p class="api-note">
			{lang === 'ja'
				? '同じ処理を POST でも使えます。入力はメモリ上で処理し、保存しません。'
				: 'The same logic runs over POST. Input is processed in memory and not stored.'}
		</p>
		<pre class="api-snippet">curl -X POST {SITE.url}/api/ics/format \
  --data-binary @calendar.ics</pre>
		<p class="footnote">
			{lang === 'ja'
				? 'JSON で issues · events · 整えた ics が返ります。?output=ics を付けると text/calendar で返ります。GET で使い方の JSON が返ります。'
				: 'Returns JSON with issues, events, and the repaired ics. Append ?output=ics for raw text/calendar. GET the endpoint for usage as JSON.'}
		</p>
	</section>

	<footer class="tool-foot">
		<a class="back-link" href={localizeHref('/tools', { locale: lang })}>← {lang === 'ja' ? '道具に戻る' : 'Back to tools'}</a>
	</footer>
</article>

<style>
	.tool-page {
		max-width: 880px;
		margin: 0 auto;
		padding: calc(var(--nav-h) + 2.5rem) 1.75rem 6rem;
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
		margin-top: 1.25rem;
		margin-bottom: 0;
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
		text-decoration: none;
		transition: background var(--duration-fast) ease, color var(--duration-fast) ease,
			border-color var(--duration-fast) ease, transform var(--duration-fast) ease;
	}

	.btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.btn:active {
		transform: translateY(1px);
	}

	.btn.ghost {
		background: transparent;
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

	.dropzone {
		position: relative;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		transition: border-color var(--duration-fast) ease, background var(--duration-fast) ease;
	}

	.dropzone.dragging {
		border-color: var(--color-accent);
		background: color-mix(in oklab, var(--color-accent) 8%, var(--color-bg-subtle));
	}

	.ics-input,
	.ics-output {
		width: 100%;
		display: block;
		font-family: var(--f-mono);
		font-size: 0.85rem;
		line-height: 1.55;
		padding: 1rem 1.1rem;
		border: 0;
		background: transparent;
		color: var(--color-text);
		resize: vertical;
		min-height: 220px;
	}

	.ics-input:focus,
	.ics-output:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: -1px;
	}

	.ics-output {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
	}

	.drop-overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--f-mono);
		font-size: 0.85rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
		background: color-mix(in oklab, var(--color-bg-subtle) 88%, transparent);
		pointer-events: none;
		border-radius: var(--radius-lg);
	}

	.issues {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.issue {
		display: grid;
		grid-template-columns: 5rem 1fr;
		align-items: baseline;
		gap: 0.85rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-subtle);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.issue-kind {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
	}

	.issue-error .issue-kind {
		color: var(--color-accent);
	}
	.issue-warning .issue-kind {
		color: oklch(0.65 0.14 70);
	}
	.issue-fixed .issue-kind {
		color: var(--moss-green);
	}

	.issue-msg {
		color: var(--color-text);
	}

	.event-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-list li {
		display: grid;
		grid-template-columns: 5rem 1fr;
		gap: 0.85rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-subtle);
	}

	.event-num {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
		padding-top: 0.25em;
	}

	.event-body h3 {
		font-weight: 500;
		font-size: 1.05rem;
		margin: 0 0 0.25rem;
	}

	.event-meta {
		margin: 0;
		font-family: var(--f-mono);
		font-size: 0.78rem;
		color: var(--color-text-secondary);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
	}

	.event-meta .rrule {
		color: var(--color-accent);
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

	.footnote {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		color: var(--color-text-tertiary);
		margin: 0.5rem 0 0;
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
			padding: calc(var(--nav-h) + 1.5rem) 1.25rem 4rem;
		}
		.issue,
		.event-list li {
			grid-template-columns: 1fr;
		}
	}
</style>
