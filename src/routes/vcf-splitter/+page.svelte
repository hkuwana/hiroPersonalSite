<script lang="ts">
	import { onMount } from 'svelte';
	import JSZip from 'jszip';

	let visible = $state(false);
	let isDragging = $state(false);
	let searchQuery = $state('');
	let selectAll = $state(true);

	interface Contact {
		raw: string;
		fn: string;
		email: string;
		tel: string;
		org: string;
		selected: boolean;
	}

	let contacts: Contact[] = $state([]);
	let fileName = $state('');

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
TEL;TYPE=WORK:+1-555-0456
EMAIL;TYPE=WORK:john.smith@acme.com
EMAIL;TYPE=HOME:john@gmail.com
ORG:Acme Corp
TITLE:Engineering Manager
ADR;TYPE=WORK:;;123 Main St;San Francisco;CA;94105;US
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
		requestAnimationFrame(() => {
			visible = true;
		});
	});

	function parseVcf(text: string): Contact[] {
		// Normalize line endings and unfold continuation lines
		const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');

		const result: Contact[] = [];
		const vcardRegex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
		let match;

		while ((match = vcardRegex.exec(normalized)) !== null) {
			const block = match[0];
			const lines = block.split('\n');

			let fn = '';
			let email = '';
			let tel = '';
			let org = '';

			for (const line of lines) {
				const upper = line.toUpperCase();

				if (upper.startsWith('FN:') || upper.startsWith('FN;')) {
					fn = extractValue(line);
				} else if (!fn && (upper.startsWith('N:') || upper.startsWith('N;'))) {
					// Fallback: construct from N field (Last;First;Middle;Prefix;Suffix)
					const parts = extractValue(line).split(';');
					const first = parts[1] || '';
					const last = parts[0] || '';
					fn = `${first} ${last}`.trim();
				} else if (!email && (upper.startsWith('EMAIL:') || upper.startsWith('EMAIL;'))) {
					email = extractValue(line);
				} else if (!tel && (upper.startsWith('TEL:') || upper.startsWith('TEL;'))) {
					tel = extractValue(line);
				} else if (!org && (upper.startsWith('ORG:') || upper.startsWith('ORG;'))) {
					org = extractValue(line).replace(/;+$/, '');
				}
			}

			result.push({
				raw: block.trim(),
				fn: fn || 'Unknown',
				email,
				tel,
				org,
				selected: true,
			});
		}

		return result;
	}

	function extractValue(line: string): string {
		// Handle property parameters: PROP;PARAM=VAL:actual value
		const colonIdx = line.indexOf(':');
		if (colonIdx === -1) return '';
		return line.substring(colonIdx + 1).trim();
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		fileName = file.name;
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = (e.target?.result as string) || '';
			contacts = parseVcf(text);
			selectAll = true;
		};
		reader.readAsText(file);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;
		fileName = file.name;
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = (e.target?.result as string) || '';
			contacts = parseVcf(text);
			selectAll = true;
		};
		reader.readAsText(file);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function loadSample() {
		contacts = parseVcf(SAMPLE_VCF);
		fileName = 'sample-contacts.vcf';
		selectAll = true;
	}

	function clearAll() {
		contacts = [];
		fileName = '';
		searchQuery = '';
		selectAll = true;
	}

	function sanitizeFilename(name: string): string {
		return name.replace(/[^a-zA-Z0-9_\-\s.]/g, '').replace(/\s+/g, '_') || 'contact';
	}

	function downloadSingle(contact: Contact) {
		const blob = new Blob([contact.raw + '\r\n'], { type: 'text/vcard;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${sanitizeFilename(contact.fn)}.vcf`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function downloadAllZip() {
		const selected = contacts.filter((c) => c.selected);
		if (selected.length === 0) return;

		const zip = new JSZip();
		const usedNames = new Map<string, number>();

		for (const contact of selected) {
			let name = sanitizeFilename(contact.fn);
			const count = usedNames.get(name) || 0;
			if (count > 0) {
				name = `${name}_${count}`;
			}
			usedNames.set(sanitizeFilename(contact.fn), count + 1);
			zip.file(`${name}.vcf`, contact.raw + '\r\n');
		}

		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const baseName = fileName ? fileName.replace(/\.vcf$/i, '') : 'contacts';
		a.download = `${baseName}_split.zip`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function toggleSelectAll() {
		selectAll = !selectAll;
		for (const c of filteredContacts) {
			c.selected = selectAll;
		}
	}

	let filteredContacts = $derived.by(() => {
		if (!searchQuery.trim()) return contacts;
		const q = searchQuery.toLowerCase();
		return contacts.filter(
			(c) =>
				c.fn.toLowerCase().includes(q) ||
				c.email.toLowerCase().includes(q) ||
				c.tel.includes(q) ||
				c.org.toLowerCase().includes(q)
		);
	});

	let selectedCount = $derived(contacts.filter((c) => c.selected).length);
</script>

<svelte:head>
	<title>VCF Splitter - Split Contacts into Individual Files - Hiro Kuwana</title>
	<meta
		name="description"
		content="Split a single VCF file containing multiple contacts into individual vCard files. Perfect for importing contacts to iPhone, Android, or any device. Free, private, runs entirely in your browser."
	/>
	<meta name="keywords" content="vcf splitter, vcard splitter, split contacts, vcf to individual files, iphone contacts import, vcard converter" />
	<meta property="og:title" content="VCF Splitter - Split Contacts into Individual Files" />
	<meta property="og:description" content="Split a multi-contact VCF file into individual vCard files for easy import to iPhone, Android, or any device." />
	<meta property="og:type" content="website" />
</svelte:head>

<article class="vcf-page" class:visible>
	<header class="page-header">
		<h1 class="page-title text-primary">VCF File Splitter</h1>
		<p class="page-subtitle text-secondary">
			Upload a .vcf file with multiple contacts and split it into individual vCard files.
			Download them all as a ZIP or one at a time. Everything runs in your browser — no data leaves your device.
		</p>
	</header>

	<div class="vcf-container">
		<!-- Upload section -->
		<div
			class="upload-section"
			class:dragging={isDragging}
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="region"
			aria-label="VCF file upload"
		>
			{#if contacts.length === 0}
				<div class="upload-zone" class:dragging={isDragging}>
					{#if isDragging}
						<div class="drop-overlay">
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<span>Drop your .vcf file here</span>
						</div>
					{:else}
						<div class="upload-prompt">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
								<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="8.5" cy="7" r="4" />
								<line x1="20" y1="8" x2="20" y2="14" />
								<line x1="23" y1="11" x2="17" y2="11" />
							</svg>
							<p class="upload-text">Drag & drop your .vcf file here</p>
							<p class="upload-hint">or use the buttons below</p>
							<div class="upload-actions">
								<label class="btn btn-primary upload-btn">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
										<polyline points="17 8 12 3 7 8" />
										<line x1="12" y1="3" x2="12" y2="15" />
									</svg>
									Upload .vcf File
									<input
										type="file"
										accept=".vcf,.vcard"
										onchange={handleFileUpload}
										class="hidden"
									/>
								</label>
								<button class="btn btn-outline btn-secondary" onclick={loadSample}>
									Load Sample
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Results section -->
				<div class="results-section">
					<div class="results-header">
						<div class="results-info">
							<h2 class="results-title">
								{contacts.length} Contact{contacts.length !== 1 ? 's' : ''} Found
							</h2>
							{#if fileName}
								<span class="file-badge badge badge-outline badge-sm gap-1">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
										<polyline points="14 2 14 8 20 8" />
									</svg>
									{fileName}
								</span>
							{/if}
						</div>
						<div class="results-actions">
							<label class="btn btn-sm btn-outline btn-secondary upload-btn">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="17 8 12 3 7 8" />
									<line x1="12" y1="3" x2="12" y2="15" />
								</svg>
								New File
								<input
									type="file"
									accept=".vcf,.vcard"
									onchange={handleFileUpload}
									class="hidden"
								/>
							</label>
							<button class="btn btn-sm btn-ghost text-secondary" onclick={clearAll}>Clear</button>
						</div>
					</div>

					<!-- Search and actions bar -->
					<div class="toolbar">
						<div class="search-box">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
								<circle cx="11" cy="11" r="8" />
								<line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
							<input
								type="text"
								class="input input-bordered input-sm search-input"
								placeholder="Search contacts..."
								bind:value={searchQuery}
							/>
						</div>
						<div class="bulk-actions">
							<button
								class="btn btn-sm btn-primary gap-2"
								onclick={downloadAllZip}
								disabled={selectedCount === 0}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								Download ZIP ({selectedCount})
							</button>
						</div>
					</div>

					<!-- Contact list -->
					<div class="contact-list">
						<div class="contact-list-header">
							<label class="select-all-label">
								<input
									type="checkbox"
									class="checkbox checkbox-sm checkbox-primary"
									checked={selectAll}
									onchange={toggleSelectAll}
								/>
								<span class="select-all-text">Select All</span>
							</label>
						</div>

						{#each filteredContacts as contact, i}
							<div class="contact-card" class:selected={contact.selected}>
								<label class="contact-checkbox">
									<input
										type="checkbox"
										class="checkbox checkbox-sm checkbox-primary"
										bind:checked={contact.selected}
									/>
								</label>
								<div class="contact-avatar">
									<span>{contact.fn.charAt(0).toUpperCase()}</span>
								</div>
								<div class="contact-info">
									<div class="contact-name">{contact.fn}</div>
									<div class="contact-details">
										{#if contact.email}
											<span class="detail-item">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
													<polyline points="22,6 12,13 2,6" />
												</svg>
												{contact.email}
											</span>
										{/if}
										{#if contact.tel}
											<span class="detail-item">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
												</svg>
												{contact.tel}
											</span>
										{/if}
										{#if contact.org}
											<span class="detail-item">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
													<line x1="3" y1="6" x2="21" y2="6" />
												</svg>
												{contact.org}
											</span>
										{/if}
									</div>
								</div>
								<button
									class="btn btn-sm btn-ghost btn-circle download-btn"
									onclick={() => downloadSingle(contact)}
									title="Download {contact.fn}.vcf"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
										<polyline points="7 10 12 15 17 10" />
										<line x1="12" y1="15" x2="12" y2="3" />
									</svg>
								</button>
							</div>
						{/each}

						{#if filteredContacts.length === 0 && searchQuery}
							<div class="no-results">
								<p>No contacts match "{searchQuery}"</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- How it works section -->
		<div class="info-section">
			<h2 class="info-title">How to Import Contacts to iPhone</h2>
			<div class="info-grid">
				<div class="info-card">
					<strong>1. Upload</strong>
					<span>Drop your .vcf file above or tap "Upload"</span>
				</div>
				<div class="info-card">
					<strong>2. Review</strong>
					<span>Check the contacts found and deselect any you don't need</span>
				</div>
				<div class="info-card">
					<strong>3. Download ZIP</strong>
					<span>Download all selected contacts as individual .vcf files in a ZIP</span>
				</div>
				<div class="info-card">
					<strong>4. Import</strong>
					<span>Unzip and open each .vcf file on your iPhone, or use iCloud Contacts import</span>
				</div>
			</div>
		</div>

		<!-- Privacy note -->
		<div class="privacy-note">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
			<span>Your data stays private. All processing happens locally in your browser — nothing is uploaded to any server.</span>
		</div>
	</div>

	<!-- Footer -->
	<footer class="page-footer">
		<a href="/" class="back-link text-secondary">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</svg>
			Back to Home
		</a>
	</footer>
</article>

<style>
	/* Page base */
	.vcf-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 5rem 2rem 4rem;
		opacity: 0;
		transform: translateY(16px);
		transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.vcf-page.visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Header */
	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-title {
		font-size: 2.25rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		margin: 0 0 0.75rem;
	}

	.page-subtitle {
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
		max-width: 600px;
	}

	/* Container */
	.vcf-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Upload zone */
	.upload-zone {
		border: 2px dashed oklch(var(--bc) / 0.15);
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		transition: all 0.2s ease;
		position: relative;
	}

	.upload-zone.dragging {
		border-color: oklch(0.6 0.2 250);
		background: oklch(0.95 0.03 250 / 0.5);
	}

	.upload-zone:hover {
		border-color: oklch(var(--bc) / 0.25);
	}

	.upload-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.upload-icon {
		color: oklch(var(--bc) / 0.3);
	}

	.upload-text {
		font-size: 1.0625rem;
		font-weight: 600;
		margin: 0;
	}

	.upload-hint {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.5);
		margin: 0;
	}

	.upload-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.upload-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.drop-overlay {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem;
		font-weight: 500;
		color: oklch(0.5 0.15 250);
	}

	/* Results */
	.results-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.results-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.results-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
	}

	.results-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	/* Toolbar */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		flex: 1;
		min-width: 180px;
		max-width: 320px;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: oklch(var(--bc) / 0.4);
		pointer-events: none;
	}

	.search-input {
		padding-left: 2.25rem;
		width: 100%;
	}

	.bulk-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Contact list */
	.contact-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.contact-list-header {
		padding: 0.625rem 1rem;
		background: oklch(var(--bc) / 0.03);
		border-bottom: 1px solid oklch(var(--bc) / 0.1);
	}

	.select-all-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.6);
	}

	.contact-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid oklch(var(--bc) / 0.06);
		transition: background 0.15s ease;
	}

	.contact-card:last-child {
		border-bottom: none;
	}

	.contact-card:hover {
		background: oklch(var(--bc) / 0.02);
	}

	.contact-card.selected {
		background: oklch(var(--p) / 0.03);
	}

	.contact-checkbox {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.contact-avatar {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: oklch(var(--p) / 0.12);
		color: oklch(var(--p));
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.contact-info {
		flex: 1;
		min-width: 0;
	}

	.contact-name {
		font-weight: 600;
		font-size: 0.9375rem;
		line-height: 1.3;
	}

	.contact-details {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.125rem;
	}

	.detail-item {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.55);
	}

	.download-btn {
		flex-shrink: 0;
	}

	.no-results {
		padding: 2rem;
		text-align: center;
		color: oklch(var(--bc) / 0.5);
		font-size: 0.875rem;
	}

	/* Info section */
	.info-section {
		margin-top: 1rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.1);
	}

	.info-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 1rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 0.75rem;
	}

	.info-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.875rem 1rem;
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 8px;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.info-card strong {
		font-size: 0.875rem;
	}

	/* Privacy note */
	.privacy-note {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		background: oklch(0.95 0.03 150 / 0.5);
		border-radius: 8px;
		font-size: 0.8125rem;
		color: oklch(0.4 0.1 150);
		line-height: 1.4;
	}

	.privacy-note svg {
		flex-shrink: 0;
	}

	/* Footer */
	.page-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid oklch(var(--bc) / 0.1);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.back-link:hover svg {
		transform: translateX(-4px);
	}

	.back-link svg {
		transition: transform 0.2s ease;
	}

	.hidden {
		display: none;
	}

	@media (max-width: 640px) {
		.vcf-page {
			padding: 3rem 1.25rem 4rem;
		}

		.page-title {
			font-size: 1.75rem;
		}

		.upload-zone {
			padding: 2rem 1rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.toolbar {
			flex-direction: column;
			align-items: stretch;
		}

		.search-box {
			max-width: none;
		}

		.bulk-actions {
			justify-content: stretch;
		}

		.bulk-actions .btn {
			flex: 1;
		}

		.results-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.contact-details {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
