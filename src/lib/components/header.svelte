<script lang="ts">
	import { page } from '$app/stores';
	import { CONTACT, SOCIAL_LINKS } from '$data/constants';
	import GitHubIcon from '$lib/svg/socials-github.svelte';
	import LinkedInIcon from '$lib/svg/socials-linkedin.svelte';
	import TwitterIcon from '$lib/svg/socials-twitter.svelte';
	import { deLocalizeHref, getLocale, localizeHref } from '$lib/paraglide/runtime';
	import ThemeToggle from './ThemeToggle.svelte';

	const lang = $derived(($page.data.locale as 'en' | 'ja' | undefined) ?? getLocale());
	const baseHref = $derived(deLocalizeHref($page.url.pathname));
	const enHref = $derived(localizeHref(baseHref || '/', { locale: 'en' }));
	const jaHref = $derived(localizeHref(baseHref || '/', { locale: 'ja' }));
	const copy = $derived(
		lang === 'ja'
			? { writing: '読みもの', contact: 'お問い合わせ', langTitle: '言語を切り替え' }
			: { writing: 'Writing', contact: 'Contact', langTitle: 'Switch language' }
	);
</script>

<header class="nav">
	<a href={localizeHref('/', { locale: lang })} class="wordmark" aria-label="Hiro Kuwana home">
		<span class="kanji">浩</span>
		<span class="name">Hiro</span>
		<em>Kuwana</em>
	</a>

	<div class="nav-right">
		<a class="nav-section-link" href={localizeHref('/#writing', { locale: lang })}>{copy.writing}</a>
		<a class="nav-section-link" href={localizeHref('/#contact', { locale: lang })}>{copy.contact}</a>

		<div class="lang-toggle" role="group" aria-label={copy.langTitle}>
			<a href={enHref} class:active={lang === 'en'} aria-current={lang === 'en' ? 'true' : undefined}>EN</a>
			<span aria-hidden="true">/</span>
			<a href={jaHref} class:active={lang === 'ja'} aria-current={lang === 'ja' ? 'true' : undefined}>日本語</a>
		</div>

		<a class="icon-link social-link" href={SOCIAL_LINKS.github} target="_blank" rel="noopener" aria-label="GitHub">
			<GitHubIcon />
		</a>
		<a class="icon-link social-link" href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
			<LinkedInIcon />
		</a>
		<a class="icon-link social-link" href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener" aria-label="Twitter">
			<TwitterIcon />
		</a>
		<a class="icon-link text-link mail-link" href={`mailto:${CONTACT.email}`} aria-label="Email Hiro">Mail</a>

		<ThemeToggle />
	</div>
</header>
