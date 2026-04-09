<script lang="ts">
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';

	const currentLang = $derived(getLocale());
	const currentPath = $derived($page.url.pathname);

	const languages = [
		{ code: 'en', label: 'EN', name: 'English' },
		{ code: 'ja', label: '日本語', name: '日本語' },
		{ code: 'zh', label: '中文', name: '中文' },
		{ code: 'es', label: 'ES', name: 'Español' },
	] as const;

	const currentLabel = $derived(
		languages.find((l) => l.code === currentLang)?.label ?? 'EN'
	);
</script>

<div class="lang-dropdown" role="group" aria-label={m.aria_toggle_language()}>
	<details class="dropdown dropdown-end">
		<summary class="lang-trigger">
			{currentLabel}
			<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="m6 9 6 6 6-6"/>
			</svg>
		</summary>
		<ul class="lang-menu dropdown-content">
			{#each languages as lang}
				<li>
					<a
						href={localizeHref(currentPath, { locale: lang.code })}
						class="lang-item"
						class:active={currentLang === lang.code}
						aria-current={currentLang === lang.code ? 'true' : undefined}
						data-sveltekit-reload
					>
						<span class="lang-code">{lang.label}</span>
						<span class="lang-name">{lang.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</details>
</div>

<style>
	.lang-dropdown {
		position: relative;
	}

	.lang-trigger {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		cursor: pointer;
		list-style: none;
		background: oklch(var(--b2) / 0.5);
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 9999px;
		color: oklch(var(--bc) / 0.7);
		transition: all 0.2s ease;
		min-height: 36px;
		user-select: none;
	}

	.lang-trigger::-webkit-details-marker {
		display: none;
	}

	.lang-trigger:hover {
		color: oklch(var(--bc));
		background: oklch(var(--b2));
		border-color: oklch(var(--bc) / 0.2);
	}

	details[open] .lang-trigger {
		color: oklch(var(--bc));
		background: oklch(var(--b1));
		box-shadow: 0 1px 3px oklch(var(--bc) / 0.1);
	}

	.lang-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 0.375rem);
		min-width: 130px;
		background: oklch(var(--b1));
		border: 1px solid oklch(var(--bc) / 0.12);
		border-radius: 0.75rem;
		box-shadow: 0 8px 24px oklch(var(--bc) / 0.1);
		padding: 0.25rem;
		list-style: none;
		margin: 0;
		z-index: 200;
	}

	.lang-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		text-decoration: none;
		transition: background 0.15s ease;
		color: oklch(var(--bc) / 0.65);
	}

	.lang-item:hover {
		background: oklch(var(--b2));
		color: oklch(var(--bc));
	}

	.lang-item.active {
		color: oklch(var(--p));
		background: oklch(var(--p) / 0.08);
	}

	.lang-code {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		min-width: 1.75rem;
	}

	.lang-name {
		font-size: 0.8rem;
		font-weight: 400;
	}
</style>
