<script lang="ts">
	import { onMount } from 'svelte';
	import JSZip from 'jszip';

	let visible = $state(false);
	let vcfInput = $state('');
	let isDragging = $state(false);
	let searchQuery = $state('');
	let selectAll = $state(true);
	let hasSplit = $state(false);
	let activeTab = $state<'editor' | 'contacts'>('editor');

	interface Contact {
		raw: string;
		fn: string;
		email: string;
		tel: string;
		org: string;
		selected: boolean;
	}

	let contacts: Contact[] = $state([]);

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
		vcfInput = SAMPLE_VCF;
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
		const colonIdx = line.indexOf(':');
		if (colonIdx === -1) return '';
		return line.substring(colonIdx + 1).trim();
	}

	function splitContacts() {
		contacts = parseVcf(vcfInput);
		selectAll = true;
		hasSplit = true;
		if (contacts.length > 0) {
			activeTab = 'contacts';
		}
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			vcfInput = (e.target?.result as string) || '';
			hasSplit = false;
			contacts = [];
		};
		reader.readAsText(file);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			vcfInput = (e.target?.result as string) || '';
			hasSplit = false;
			contacts = [];
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
		vcfInput = SAMPLE_VCF;
		hasSplit = false;
		contacts = [];
		activeTab = 'editor';
	}

	function clearInput() {
		vcfInput = '';
		hasSplit = false;
		contacts = [];
		searchQuery = '';
		selectAll = true;
		activeTab = 'editor';
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
		a.download = 'contacts_split.zip';
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

	let contactStats = $derived.by(() => {
		if (contacts.length === 0) return null;
		const withEmail = contacts.filter((c) => c.email).length;
		const withPhone = contacts.filter((c) => c.tel).length;
		const withOrg = contacts.filter((c) => c.org).length;
		return { withEmail, withPhone, withOrg };
	});
</script>

<svelte:head>
	<title>VCF Splitter & Contact Exporter - Hiro Kuwana</title>
	<meta
		name="description"
		content="Split a single VCF file containing multiple contacts into individual vCard files. Perfect for importing contacts to iPhone, Android, or any device. Free, private, runs entirely in your browser."
	/>
</svelte:head>

<article class="vcf-page" class:visible>
	<header class="page-header">
		<h1 class="page-title text-primary">VCF File Splitter</h1>
		<p class="page-subtitle text-secondary">
			Paste or upload a .vcf file with multiple contacts. Split them into individual vCard files
			and download as a ZIP for easy iPhone, Android, or iCloud import.
		</p>
	</header>

	<div class="vcf-container">
		<!-- Tab navigation -->
		<div role="tablist" class="tabs tabs-bordered tabs-lg">
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'editor'}
				onclick={() => activeTab = 'editor'}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
				</svg>
				Editor
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'contacts'}
				onclick={() => activeTab = 'contacts'}
				disabled={contacts.length === 0}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
					<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
					<circle cx="8.5" cy="7" r="4" />
					<line x1="20" y1="8" x2="20" y2="14" />
					<line x1="23" y1="11" x2="17" y2="11" />
				</svg>
				Contacts
				{#if contacts.length > 0}
					<span class="badge badge-sm badge-primary ml-2">{contacts.length}</span>
				{/if}
			</button>
		</div>

		<!-- Editor tab -->
		{#if activeTab === 'editor'}
			<div
				class="input-section"
				class:dragging={isDragging}
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				role="region"
				aria-label="VCF file input"
			>
				<div class="input-actions">
					<label class="btn btn-sm btn-outline btn-secondary upload-btn">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						Upload .vcf
						<input
							type="file"
							accept=".vcf,.vcard"
							onchange={handleFileUpload}
							class="hidden"
						/>
					</label>
					<button class="btn btn-sm btn-outline btn-secondary" onclick={loadSample}>
						Load Sample
					</button>
					<button class="btn btn-sm btn-ghost text-secondary" onclick={clearInput}>Clear</button>
				</div>

				<div class="textarea-wrapper" class:dragging={isDragging}>
					{#if isDragging}
						<div class="drop-overlay">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<span>Drop your .vcf file here</span>
						</div>
					{/if}
					<textarea
						class="textarea textarea-bordered vcf-textarea"
						placeholder="Paste your .vcf file content here, or drag & drop a file..."
						bind:value={vcfInput}
						rows="18"
					></textarea>
				</div>
			</div>
		{/if}

		<!-- Contacts tab -->
		{#if activeTab === 'contacts' && contacts.length > 0}
			<!-- Stats bar -->
			<div class="stats-bar">
				<div class="stats-info">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
						<circle cx="8.5" cy="7" r="4" />
						<line x1="20" y1="8" x2="20" y2="14" />
						<line x1="23" y1="11" x2="17" y2="11" />
					</svg>
					<span class="stats-label">{contacts.length} contact{contacts.length !== 1 ? 's' : ''} found</span>
				</div>

				{#if contactStats}
					<div class="stats-badges">
						<div class="badge badge-outline gap-1">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
							{contactStats.withEmail} with email
						</div>
						<div class="badge badge-outline gap-1">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
							{contactStats.withPhone} with phone
						</div>
						{#if contactStats.withOrg > 0}
							<div class="badge badge-outline gap-1">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg>
								{contactStats.withOrg} with org
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Search + download bar -->
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
						<span>Select All</span>
					</label>
				</div>

				{#each filteredContacts as contact}
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
							class="btn btn-sm btn-ghost btn-circle"
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
		{/if}

		<!-- Action buttons -->
		<div class="action-buttons">
			<button class="btn btn-primary btn-lg" onclick={splitContacts} disabled={!vcfInput.trim()}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
					<circle cx="8.5" cy="7" r="4" />
					<line x1="20" y1="8" x2="20" y2="14" />
					<line x1="23" y1="11" x2="17" y2="11" />
				</svg>
				Split Contacts
			</button>
			{#if contacts.length > 0}
				<button class="btn btn-accent btn-lg" onclick={downloadAllZip} disabled={selectedCount === 0}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					Download ZIP ({selectedCount})
				</button>
			{/if}
		</div>

		<!-- Results section -->
		{#if hasSplit}
			<div class="results-section">
				<div class="collapse collapse-arrow bg-base-100 border border-base-300">
					<input type="checkbox" checked />
					<div class="collapse-title">
						<div class="results-header">
							<h2 class="results-title text-primary">Split Results</h2>
							<div class="results-summary">
								{#if contacts.length > 0}
									<span class="result-badge badge-success">{contacts.length} contact{contacts.length !== 1 ? 's' : ''} found</span>
								{:else}
									<span class="result-badge badge-error">No contacts found</span>
								{/if}
								{#if contacts.length > 0 && contactStats}
									{#if contactStats.withEmail > 0}
										<span class="result-badge badge-info">{contactStats.withEmail} with email</span>
									{/if}
									{#if contactStats.withPhone > 0}
										<span class="result-badge badge-info">{contactStats.withPhone} with phone</span>
									{/if}
								{/if}
							</div>
						</div>
					</div>
					<div class="collapse-content">
						<div class="issues-list">
							{#if contacts.length === 0}
								<div class="issue-item issue-error">
									<span class="issue-icon">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
										</svg>
									</span>
									<span>No BEGIN:VCARD / END:VCARD blocks found. Make sure your file is a valid .vcf file.</span>
								</div>
							{:else}
								<div class="issue-item issue-fixed">
									<span class="issue-icon">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
										</svg>
									</span>
									<span>Successfully split {contacts.length} contact{contacts.length !== 1 ? 's' : ''} into individual vCard files.</span>
								</div>
								{#each contacts as contact, i}
									<div class="issue-item issue-fixed">
										<span class="issue-icon">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
											</svg>
										</span>
										<span>Contact #{i + 1}: {contact.fn}{contact.email ? ` (${contact.email})` : ''}{contact.tel ? ` — ${contact.tel}` : ''}</span>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Info section -->
		<div class="info-section">
			<h3 class="info-title text-primary">How to import contacts to iPhone</h3>
			<div class="info-grid">
				<div class="info-card">
					<strong>1. Upload</strong>
					<span class="text-secondary">Paste or drop your .vcf file in the editor tab</span>
				</div>
				<div class="info-card">
					<strong>2. Split</strong>
					<span class="text-secondary">Click "Split Contacts" to separate each contact into its own file</span>
				</div>
				<div class="info-card">
					<strong>3. Review</strong>
					<span class="text-secondary">Switch to the Contacts tab to verify names, emails, and phone numbers</span>
				</div>
				<div class="info-card">
					<strong>4. Download ZIP</strong>
					<span class="text-secondary">Download all contacts as individual .vcf files in a ZIP archive</span>
				</div>
				<div class="info-card">
					<strong>5. Import</strong>
					<span class="text-secondary">Unzip and AirDrop each .vcf to your iPhone, or import via iCloud Contacts</span>
				</div>
				<div class="info-card">
					<strong>Privacy</strong>
					<span class="text-secondary">All processing runs locally in your browser — nothing is uploaded to any server</span>
				</div>
			</div>
		</div>
	</div>

	<footer class="page-footer">
		<a href="/" class="back-link text-secondary hover:text-accent">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path
					d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span>Back to home</span>
		</a>
	</footer>
</article>

<style>
	.vcf-page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 4rem 2rem 6rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.vcf-page.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.75rem;
		letter-spacing: -0.03em;
	}

	.page-subtitle {
		font-size: 1rem;
		margin: 0;
		max-width: 540px;
		margin-inline: auto;
		line-height: 1.6;
	}

	.vcf-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Tabs */
	.tabs {
		margin-bottom: 0.5rem;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Input section */
	.input-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.input-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.upload-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.textarea-wrapper {
		position: relative;
		border-radius: 1rem;
		transition: box-shadow 0.2s ease;
	}

	.textarea-wrapper.dragging {
		box-shadow: 0 0 0 3px oklch(0.7 0.15 250 / 0.4);
	}

	.drop-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: oklch(0.95 0.03 250 / 0.95);
		border-radius: 1rem;
		z-index: 10;
		font-weight: 500;
		color: oklch(0.5 0.15 250);
		pointer-events: none;
	}

	.vcf-textarea {
		font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Cascadia Code', monospace;
		font-size: 0.8125rem;
		line-height: 1.5;
		resize: vertical;
		min-height: 200px;
		width: 100%;
	}

	/* Action buttons */
	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.action-buttons .btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Stats bar */
	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: oklch(var(--b2));
		border-radius: 1rem;
		border: 1px solid oklch(var(--bc) / 0.08);
	}

	.stats-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.stats-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	/* Toolbar */
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		flex: 1;
		min-width: 180px;
		max-width: 400px;
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

	/* Contact list */
	.contact-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 1rem;
		overflow: hidden;
		background: oklch(var(--b1));
	}

	.contact-list-header {
		padding: 0.625rem 1rem;
		background: oklch(var(--b2));
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

	.no-results {
		padding: 2rem;
		text-align: center;
		color: oklch(var(--bc) / 0.5);
		font-size: 0.875rem;
	}

	/* Results section */
	.results-section {
		border-radius: 1rem;
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.results-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.results-summary {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.result-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
	}

	.result-badge.badge-error {
		background: oklch(0.93 0.06 25);
		color: oklch(0.45 0.15 25);
	}

	.result-badge.badge-success {
		background: oklch(0.93 0.06 150);
		color: oklch(0.4 0.12 150);
	}

	.result-badge.badge-info {
		background: oklch(0.93 0.06 250);
		color: oklch(0.4 0.12 250);
	}

	.issues-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.issue-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.issue-icon {
		flex-shrink: 0;
		margin-top: 1px;
	}

	.issue-error {
		background: oklch(0.95 0.04 25);
		color: oklch(0.45 0.15 25);
	}

	.issue-fixed {
		background: oklch(0.95 0.04 150);
		color: oklch(0.4 0.12 150);
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
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

		.info-grid {
			grid-template-columns: 1fr;
		}

		.results-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.stats-bar {
			flex-direction: column;
			align-items: flex-start;
		}

		.stats-badges {
			width: 100%;
		}

		.contact-details {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
