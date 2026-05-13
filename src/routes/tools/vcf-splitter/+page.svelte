<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE } from '$data/constants';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';

	type Locale = 'en' | 'ja';

	let lang = $derived(($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale);

	type Contact = {
		raw: string;
		fn: string;
		email: string;
		tel: string;
		org: string;
		selected: boolean;
	};

	type ContactName = {
		formatted: string;
		family: string;
		given: string;
		additional: string;
		prefix: string;
		suffix: string;
	};

	type ZipFile = {
		name: string;
		content: string;
	};

	let vcfInput = $state('');
	let contacts = $state<Contact[]>([]);
	let hasSplit = $state(false);
	let isDragging = $state(false);
	let searchQuery = $state('');

	const SAMPLE_VCF = `BEGIN:VCARD
VERSION:3.0
FN:Taro Yamada
N:Yamada;Taro;;;
TEL;TYPE=CELL:+81-90-1234-5678
EMAIL:taro@example.com
ORG:Tokyo Corp
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Sakura Tanaka
N:Tanaka;Sakura;;;
TEL;TYPE=CELL:+81-80-9876-5432
EMAIL:sakura.tanaka@example.com
ORG:Osaka Inc
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:John Smith
N:Smith;John;;;
TEL;TYPE=CELL:+1-555-0123
EMAIL;TYPE=WORK:john.smith@acme.com
ORG:Acme Corp
TITLE:Engineering Manager
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Yuki Sato
N:Sato;Yuki;;;
TEL;TYPE=CELL:+81-70-5555-1234
EMAIL:yuki.sato@startup.jp
ORG:Startup LLC
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Maria Garcia
N:Garcia;Maria;;;
TEL;TYPE=CELL:+34-612-345-678
EMAIL:maria@example.es
ORG:Barcelona Design Studio
END:VCARD`;

	onMount(() => {
		vcfInput = SAMPLE_VCF;
	});

	function extractValue(line: string): string {
		const colonIdx = line.indexOf(':');
		if (colonIdx === -1) return '';
		return line.substring(colonIdx + 1).trim();
	}

	function isPropertyLine(line: string, property: string): boolean {
		const upper = line.toUpperCase();
		const prop = property.toUpperCase();
		return upper.startsWith(`${prop}:`) || upper.startsWith(`${prop};`);
	}

	function escapeVcardText(value: string): string {
		return value
			.replace(/\\/g, '\\\\')
			.replace(/\n/g, '\\n')
			.replace(/;/g, '\\;')
			.replace(/,/g, '\\,');
	}

	function unescapeVcardText(value: string): string {
		return value.replace(/\\([nN,;\\])/g, (_, escaped: string) => {
			if (escaped.toLowerCase() === 'n') return '\n';
			return escaped;
		});
	}

	function splitVcardComponents(value: string): string[] {
		const parts: string[] = [];
		let current = '';
		let escaped = false;

		for (const char of value) {
			if (escaped) {
				current += `\\${char}`;
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === ';') {
				parts.push(current);
				current = '';
			} else {
				current += char;
			}
		}

		parts.push(escaped ? `${current}\\` : current);
		return parts;
	}

	function deriveNameFromFormatted(formatted: string): ContactName {
		const cleaned = formatted.trim().replace(/\s+/g, ' ');
		if (!cleaned) {
			return { formatted: 'Unknown', family: '', given: 'Unknown', additional: '', prefix: '', suffix: '' };
		}

		const parts = cleaned.split(' ');
		if (parts.length === 1) {
			return { formatted: cleaned, family: '', given: cleaned, additional: '', prefix: '', suffix: '' };
		}

		const familyParticles = new Set(['da', 'de', 'del', 'der', 'di', 'du', 'la', 'le', 'van', 'von']);
		let familyStart = parts.length - 1;

		for (let i = parts.length - 2; i >= 0; i -= 1) {
			const normalized = parts[i].replace(/\.$/, '').toLowerCase();
			if (!familyParticles.has(normalized)) break;
			familyStart = i;
		}

		return {
			formatted: cleaned,
			family: parts.slice(familyStart).join(' '),
			given: parts.slice(0, familyStart).join(' '),
			additional: '',
			prefix: '',
			suffix: ''
		};
	}

	function buildContactName(fn: string, structuredName: string): ContactName {
		if (structuredName) {
			const parts = splitVcardComponents(structuredName).map(unescapeVcardText);
			const family = parts[0] ?? '';
			const given = parts[1] ?? '';
			const additional = parts[2] ?? '';
			const prefix = parts[3] ?? '';
			const suffix = parts[4] ?? '';
			const formatted =
				fn ||
				[prefix, given, additional, family, suffix]
					.map((part) => part.trim())
					.filter(Boolean)
					.join(' ') ||
				'Unknown';

			return { formatted, family, given, additional, prefix, suffix };
		}

		return deriveNameFromFormatted(fn);
	}

	function structuredNameLine(name: ContactName): string {
		return `N:${[
			name.family,
			name.given,
			name.additional,
			name.prefix,
			name.suffix
		]
			.map(escapeVcardText)
			.join(';')}`;
	}

	function normalizeVcardBlock(block: string, name: ContactName): string {
		const lines = block
			.trim()
			.split('\n')
			.map((line) => line.trimEnd());
		const fnIndex = lines.findIndex((line) => isPropertyLine(line, 'FN'));
		const versionIndex = lines.findIndex((line) => isPropertyLine(line, 'VERSION'));
		const normalized = [...lines];

		if (fnIndex === -1) {
			const insertAt = versionIndex === -1 ? 1 : versionIndex + 1;
			normalized.splice(insertAt, 0, `FN:${escapeVcardText(name.formatted)}`);
		}

		const freshFnIndex = normalized.findIndex((line) => isPropertyLine(line, 'FN'));
		const freshNIndex = normalized.findIndex((line) => isPropertyLine(line, 'N'));
		const line = structuredNameLine(name);

		if (freshNIndex === -1) {
			normalized.splice(freshFnIndex === -1 ? 1 : freshFnIndex + 1, 0, line);
		} else {
			normalized[freshNIndex] = line;
		}

		return normalized.join('\r\n');
	}

	function parseVcf(text: string): Contact[] {
		const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
		const result: Contact[] = [];
		const regex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(normalized)) !== null) {
			const block = match[0];
			const lines = block.split('\n');
			let fn = '';
			let structuredName = '';
			let email = '';
			let tel = '';
			let org = '';
			for (const line of lines) {
				const upper = line.toUpperCase();
				if (upper.startsWith('FN:') || upper.startsWith('FN;')) {
					fn = extractValue(line);
				} else if (upper.startsWith('N:') || upper.startsWith('N;')) {
					structuredName = extractValue(line);
				} else if (!email && (upper.startsWith('EMAIL:') || upper.startsWith('EMAIL;'))) {
					email = extractValue(line);
				} else if (!tel && (upper.startsWith('TEL:') || upper.startsWith('TEL;'))) {
					tel = extractValue(line);
				} else if (!org && (upper.startsWith('ORG:') || upper.startsWith('ORG;'))) {
					org = extractValue(line).replace(/;+$/, '');
				}
			}
			const name = buildContactName(fn, structuredName);
			result.push({
				raw: normalizeVcardBlock(block, name),
				fn: name.formatted,
				email,
				tel,
				org,
				selected: true
			});
		}
		return result;
	}

	function split() {
		contacts = parseVcf(vcfInput);
		hasSplit = true;
	}

	function loadSample() {
		vcfInput = SAMPLE_VCF;
		hasSplit = false;
		contacts = [];
		searchQuery = '';
	}

	function clearAll() {
		vcfInput = '';
		hasSplit = false;
		contacts = [];
		searchQuery = '';
	}

	function handleFile(file: File | null | undefined) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			vcfInput = (e.target?.result as string) ?? '';
			hasSplit = false;
			contacts = [];
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

	function sanitize(name: string): string {
		return name.replace(/[^a-zA-Z0-9_\-\s.]/g, '').replace(/\s+/g, '_') || 'contact';
	}

	function downloadBlob(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function downloadOne(contact: Contact) {
		const blob = new Blob([contact.raw + '\r\n'], { type: 'text/vcard;charset=utf-8' });
		downloadBlob(blob, `${sanitize(contact.fn)}.vcf`);
	}

	function makeUniqueFilename(base: string, used: Set<string>): string {
		let filename = `${sanitize(base)}.vcf`;
		let index = 2;
		while (used.has(filename.toLowerCase())) {
			filename = `${sanitize(base)}_${index}.vcf`;
			index += 1;
		}
		used.add(filename.toLowerCase());
		return filename;
	}

	const CRC_TABLE = new Uint32Array(256);
	for (let i = 0; i < CRC_TABLE.length; i += 1) {
		let crc = i;
		for (let bit = 0; bit < 8; bit += 1) {
			crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
		}
		CRC_TABLE[i] = crc >>> 0;
	}

	function crc32(data: Uint8Array): number {
		let crc = 0xffffffff;
		for (const byte of data) {
			crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
		}
		return (crc ^ 0xffffffff) >>> 0;
	}

	function uint16(value: number): Uint8Array {
		const bytes = new Uint8Array(2);
		new DataView(bytes.buffer).setUint16(0, value, true);
		return bytes;
	}

	function uint32(value: number): Uint8Array {
		const bytes = new Uint8Array(4);
		new DataView(bytes.buffer).setUint32(0, value, true);
		return bytes;
	}

	function concatBytes(chunks: Uint8Array[]): Uint8Array {
		const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
		const output = new Uint8Array(size);
		let offset = 0;
		for (const chunk of chunks) {
			output.set(chunk, offset);
			offset += chunk.length;
		}
		return output;
	}

	function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
		const buffer = new ArrayBuffer(bytes.byteLength);
		new Uint8Array(buffer).set(bytes);
		return buffer;
	}

	function getDosDateParts(date: Date): { time: number; date: number } {
		const year = Math.max(1980, date.getFullYear());
		return {
			time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
			date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
		};
	}

	function createZip(files: ZipFile[]): Blob {
		const encoder = new TextEncoder();
		const now = getDosDateParts(new Date());
		const localChunks: Uint8Array[] = [];
		const centralChunks: Uint8Array[] = [];
		let offset = 0;

		for (const file of files) {
			const nameBytes = encoder.encode(file.name);
			const contentBytes = encoder.encode(file.content);
			const crc = crc32(contentBytes);
			const localHeader = concatBytes([
				uint32(0x04034b50),
				uint16(20),
				uint16(0),
				uint16(0),
				uint16(now.time),
				uint16(now.date),
				uint32(crc),
				uint32(contentBytes.length),
				uint32(contentBytes.length),
				uint16(nameBytes.length),
				uint16(0),
				nameBytes
			]);
			const centralHeader = concatBytes([
				uint32(0x02014b50),
				uint16(20),
				uint16(20),
				uint16(0),
				uint16(0),
				uint16(now.time),
				uint16(now.date),
				uint32(crc),
				uint32(contentBytes.length),
				uint32(contentBytes.length),
				uint16(nameBytes.length),
				uint16(0),
				uint16(0),
				uint16(0),
				uint16(0),
				uint32(file.name.endsWith('/') ? 0x10 : 0),
				uint32(offset),
				nameBytes
			]);

			localChunks.push(localHeader, contentBytes);
			centralChunks.push(centralHeader);
			offset += localHeader.length + contentBytes.length;
		}

		const centralDirectory = concatBytes(centralChunks);
		const localFileData = concatBytes(localChunks);
		const end = concatBytes([
			uint32(0x06054b50),
			uint16(0),
			uint16(0),
			uint16(files.length),
			uint16(files.length),
			uint32(centralDirectory.length),
			uint32(localFileData.length),
			uint16(0)
		]);

		return new Blob(
			[localFileData, centralDirectory, end].map(bytesToArrayBuffer),
			{ type: 'application/zip' }
		);
	}

	function downloadSelectedFolder() {
		const selected = contacts.filter((c) => c.selected);
		if (selected.length === 0) return;
		const used = new Set<string>();
		const folderName = 'contacts_selected';
		const files: ZipFile[] = [{ name: `${folderName}/`, content: '' }];
		selected.forEach((contact) => {
			files.push({
				name: `${folderName}/${makeUniqueFilename(contact.fn, used)}`,
				content: `${contact.raw}\r\n`
			});
		});
		downloadBlob(createZip(files), 'contacts_selected_vcf_folder.zip');
	}

	function downloadCombinedSelected() {
		const selected = contacts.filter((c) => c.selected);
		if (selected.length === 0) return;
		const combined = selected.map((c) => c.raw).join('\r\n') + '\r\n';
		const blob = new Blob([combined], { type: 'text/vcard;charset=utf-8' });
		downloadBlob(blob, 'contacts_selected.vcf');
	}

	let filtered = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return contacts;
		return contacts.filter(
			(c) =>
				c.fn.toLowerCase().includes(q) ||
				c.email.toLowerCase().includes(q) ||
				c.tel.includes(q) ||
				c.org.toLowerCase().includes(q)
		);
	});

	let selectedCount = $derived(contacts.filter((c) => c.selected).length);

	function selectAllVisible() {
		const visible = new Set(filtered);
		contacts = contacts.map((c) => (visible.has(c) ? { ...c, selected: true } : c));
	}

	function deselectAllVisible() {
		const visible = new Set(filtered);
		contacts = contacts.map((c) => (visible.has(c) ? { ...c, selected: false } : c));
	}
</script>

<svelte:head>
	<title>VCF splitter · one vCard per contact · Hiro Kuwana</title>
	<meta
		name="description"
		content="Free browser-based VCF splitter. Split a .vcf file with many contacts into individual vCard files. Fix missing structured name fields and download selected contacts as one .vcf or a zip folder. Runs locally."
	/>
	<meta name="keywords" content="vcf splitter, vcard splitter, split vcf file, split contacts, vcard tool, contact splitter, iphone contacts, android contacts" />
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE.url}/tools/vcf-splitter`} />
	<meta property="og:title" content="VCF splitter · Hiro Kuwana" />
	<meta
		property="og:description"
		content="Split a multi-contact .vcf into individual vCards. Fix structured name fields, search, select, and download. Runs locally in your browser."
	/>
	<meta property="og:image" content={SITE.image} />
	<meta name="twitter:card" content="summary" />
	<link rel="canonical" href={`${SITE.url}/tools/vcf-splitter`} />
	<link rel="alternate" hreflang="en" href={`${SITE.url}/tools/vcf-splitter`} />
	<link rel="alternate" hreflang="ja" href={`${SITE.url}/ja/tools/vcf-splitter`} />
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}/tools/vcf-splitter`} />
</svelte:head>

<article class="tool-page">
	<header class="tool-head">
		<span class="eyebrow">{lang === 'ja' ? '道具 · 02' : 'tools · 02'}</span>
		<h1>VCF splitter<span class="seal">名</span></h1>
		<p class="lede">
			{lang === 'ja'
				? '複数の連絡先がまとまった .vcf ファイルを、ひとりずつの vCard に分けます。名前フィールドを整え、検索 · 選択 · ダウンロードできます。'
				: 'Split a single .vcf file containing many contacts into individual vCard files. It also fixes missing structured name fields before download.'}
		</p>
		<p class="sub">
			{lang === 'ja'
				? 'すべてブラウザ内で処理します。連絡先はサーバーに送られません。'
				: 'Everything runs in your browser. Your contacts never leave the page.'}
		</p>
	</header>

	<section class="panel">
		<div class="panel-head">
			<span class="num">01</span>
			<h2>{lang === 'ja' ? '入力' : 'Input'} <em>{lang === 'ja' ? '.vcf を貼るかドロップ' : 'paste or drop your .vcf'}</em></h2>
		</div>

		<div class="actions">
			<label class="btn">
				{lang === 'ja' ? '.vcf をアップロード' : 'Upload .vcf'}
				<input type="file" accept=".vcf,.vcard,text/vcard" onchange={onUpload} hidden />
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
			aria-label="VCF input"
		>
			<textarea
				class="vcf-input"
				rows="14"
				bind:value={vcfInput}
				placeholder={lang === 'ja'
					? '.vcf の中身をここに貼り付けるか、ファイルをドロップしてください。'
					: 'Paste your .vcf contents here, or drop a file in.'}
				spellcheck="false"
			></textarea>
			{#if isDragging}
				<div class="drop-overlay">{lang === 'ja' ? 'ここにドロップ' : 'Drop your .vcf file'}</div>
			{/if}
		</div>

		<div class="actions actions-primary">
			<button type="button" class="btn primary" onclick={split}>
				{lang === 'ja' ? '連絡先に分ける →' : 'Split into contacts →'}
			</button>
		</div>
	</section>

	{#if hasSplit}
		{#if contacts.length === 0}
			<section class="panel">
				<div class="panel-head">
					<span class="num">02</span>
					<h2>{lang === 'ja' ? '結果' : 'Result'} <em>{lang === 'ja' ? '見つかりません' : 'nothing found'}</em></h2>
				</div>
				<p class="empty">
					{lang === 'ja'
						? 'BEGIN:VCARD … END:VCARD のブロックが見つかりませんでした。入力をご確認ください。'
						: 'No BEGIN:VCARD … END:VCARD blocks were found. Check the input.'}
				</p>
			</section>
		{:else}
			<section class="panel">
				<div class="panel-head">
					<span class="num">02</span>
					<h2>
						{lang === 'ja' ? '連絡先' : 'Contacts'}
						<em>
							{selectedCount} / {contacts.length}
							{lang === 'ja' ? '選択中' : 'selected'}
						</em>
					</h2>
				</div>

				<div class="toolbar">
					<input
						class="search"
						type="search"
						bind:value={searchQuery}
						placeholder={lang === 'ja' ? '名前 · メール · 電話 · 会社で絞り込み' : 'Filter by name, email, phone, or org'}
					/>
					<div class="toolbar-actions">
						<button type="button" class="btn ghost small" onclick={selectAllVisible}>
							{lang === 'ja' ? '表示中をすべて選択' : 'Select visible'}
						</button>
						<button type="button" class="btn ghost small" onclick={deselectAllVisible}>
							{lang === 'ja' ? '選択解除' : 'Clear selection'}
						</button>
					</div>
				</div>

				<ul class="contact-list">
					{#each filtered as contact, idx (contact.raw)}
						<li class="contact" class:selected={contact.selected}>
							<label class="contact-check">
								<input type="checkbox" bind:checked={contact.selected} />
								<span class="check-num">{String(idx + 1).padStart(2, '0')}</span>
							</label>
							<div class="contact-body">
								<h3>{contact.fn}</h3>
								<p class="contact-meta">
									{#if contact.org}<span>{contact.org}</span>{/if}
									{#if contact.email}<span>{contact.email}</span>{/if}
									{#if contact.tel}<span>{contact.tel}</span>{/if}
								</p>
							</div>
							<button type="button" class="btn ghost small" onclick={() => downloadOne(contact)}>
								{lang === 'ja' ? '.vcf' : '.vcf'}
							</button>
						</li>
					{/each}
				</ul>

				{#if filtered.length === 0}
					<p class="empty">{lang === 'ja' ? '一致する連絡先がありません。' : 'No contacts match that filter.'}</p>
				{/if}

				<div class="actions actions-primary">
					<button type="button" class="btn primary" disabled={selectedCount === 0} onclick={downloadCombinedSelected}>
						{lang === 'ja' ? '選択をひとつの .vcf に' : 'Download selected as one .vcf'}
					</button>
					<button type="button" class="btn" disabled={selectedCount === 0} onclick={downloadSelectedFolder}>
						{lang === 'ja' ? '選択をフォルダ .zip に' : 'Download selected folder .zip'}
					</button>
				</div>
				<p class="footnote">
					{lang === 'ja'
						? '.zip には、選択した連絡先ごとの .vcf がひとつのフォルダに入ります。'
						: 'The .zip contains one folder with one fixed .vcf file per selected contact.'}
				</p>
			</section>
		{/if}
	{/if}

	<footer class="tool-foot">
		<a class="back-link" href={localizeHref('/tools', { locale: lang })}>← {lang === 'ja' ? '道具に戻る' : 'Back to tools'}</a>
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

	.vcf-input {
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

	.vcf-input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: -1px;
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

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.search {
		flex: 1 1 16rem;
		padding: 0.65rem 0.9rem;
		font-family: var(--f-body);
		font-size: 0.95rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-subtle);
		color: var(--color-text);
	}

	.search:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: -1px;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.5rem;
	}

	.contact-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.contact {
		display: grid;
		grid-template-columns: 3rem 1fr auto;
		gap: 0.85rem;
		align-items: center;
		padding: 0.85rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-subtle);
		transition: border-color var(--duration-fast) ease, background var(--duration-fast) ease;
	}

	.contact.selected {
		border-color: var(--color-accent);
	}

	.contact-check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.contact-check input {
		accent-color: var(--color-accent);
	}

	.check-num {
		font-family: var(--f-mono);
		font-size: 0.7rem;
		letter-spacing: 0.15em;
		color: var(--color-text-tertiary);
	}

	.contact-body h3 {
		font-weight: 500;
		font-size: 1.05rem;
		margin: 0 0 0.2rem;
	}

	.contact-meta {
		margin: 0;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.empty {
		font-style: italic;
		color: var(--color-text-secondary);
		margin: 0;
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
			padding: 3.5rem 1.25rem 4rem;
		}
		.contact {
			grid-template-columns: 1fr;
		}
	}
</style>
