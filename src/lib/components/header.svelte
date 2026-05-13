<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { SOCIAL_LINKS } from '$data/constants';
	import { optimisticLocale, type SiteLocale } from '$lib/locale-state';
	import GitHubIcon from '$lib/svg/socials-github.svelte';
	import LinkedInIcon from '$lib/svg/socials-linkedin.svelte';
	import TwitterIcon from '$lib/svg/socials-twitter.svelte';
	import { deLocalizeHref, getLocale, localizeHref, setLocale } from '$lib/paraglide/runtime';
	import ThemeToggle from './ThemeToggle.svelte';

	const routeLang = $derived(($page.data.locale as SiteLocale | undefined) ?? getLocale());
	const lang = $derived($optimisticLocale ?? routeLang);
	const baseHref = $derived(deLocalizeHref($page.url.pathname) || '/');
	const enHref = $derived(localizeHref(baseHref, { locale: 'en' }));
	const jaHref = $derived(localizeHref(baseHref, { locale: 'ja' }));
	const copy = $derived(
		lang === 'ja'
			? { writing: '読みもの', tools: '道具', about: '自己紹介', contact: 'お問い合わせ', langTitle: '言語を切り替え' }
			: { writing: 'Writing', tools: 'Tools', about: 'About', contact: 'Contact', langTitle: 'Switch language' }
	);

	function switchLocale(event: MouseEvent, locale: SiteLocale, href: string) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

		event.preventDefault();
		optimisticLocale.set(locale);
		setLocale(locale, { reload: false });

		if (typeof document !== 'undefined') {
			document.documentElement.lang = locale;
		}

		void goto(href, { noScroll: true, keepFocus: true });
	}
</script>

<header class="nav">
	<a href={localizeHref('/', { locale: lang })} class="wordmark" aria-label="Hiro Kuwana home">
		<span class="kanji">浩</span>
		<span class="name">Hiro</span>
		<em>Kuwana</em>
	</a>

	<div class="nav-right">
		<a class="nav-section-link" href={localizeHref('/#writing', { locale: lang })}>{copy.writing}</a>
		<a class="nav-section-link" href={localizeHref('/tools', { locale: lang })}>{copy.tools}</a>
		<a class="nav-section-link" href={localizeHref('/about', { locale: lang })}>{copy.about}</a>
		<a class="nav-section-link" href={localizeHref('/#contact', { locale: lang })}>{copy.contact}</a>

		<div class="lang-toggle" role="group" aria-label={copy.langTitle}>
			<a
				href={enHref}
				class:active={lang === 'en'}
				aria-current={lang === 'en' ? 'true' : undefined}
				onclick={(event) => switchLocale(event, 'en', enHref)}
			>
				EN
			</a>
			<span aria-hidden="true">/</span>
			<a
				href={jaHref}
				class:active={lang === 'ja'}
				aria-current={lang === 'ja' ? 'true' : undefined}
				onclick={(event) => switchLocale(event, 'ja', jaHref)}
			>
				日本語
			</a>
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

		<ThemeToggle />
	</div>
</header>
