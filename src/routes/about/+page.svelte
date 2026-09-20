<script lang="ts">
	import { asset } from '$app/paths';
	import { FAQS, PERSONAL, SITE, SOCIAL_LINKS } from '$data/constants';
	import { optimisticLocale } from '$lib/locale-state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';

	type Locale = 'en' | 'ja';

	$: lang = ($optimisticLocale ?? (($page.data.locale as Locale | undefined) ?? getLocale())) as Locale;

	const visibleFaqs = FAQS.filter((faq) => faq.visible);

	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: FAQS.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	};

	const aboutJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		url: `${SITE.url}/about`,
		mainEntity: {
			'@type': 'Person',
			name: PERSONAL.displayName,
			alternateName: [PERSONAL.japaneseKanji, PERSONAL.fullName],
			jobTitle: PERSONAL.jobTitle,
			worksFor: { '@type': 'Organization', name: PERSONAL.company, url: PERSONAL.companyWebsite },
			alumniOf: { '@type': 'CollegeOrUniversity', name: PERSONAL.university },
			sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github, SOCIAL_LINKS.twitter, SOCIAL_LINKS.quora]
		}
	};

	$: copy =
		lang === 'ja'
			? {
					eyebrow: '自己紹介 · about',
					title: '少しだけ、自分のこと',
					lede:
						'桑名浩行 (Hiro Kuwana) です。日本生まれ、アメリカ育ち。いまは Kaiwa をほぼひとりで、フルタイムでつくっています。ここには、実際の仕事から学んだことを書き留めています。プロダクト、語学学習、そして AI に必要以上の判断を預けずに使う方法について。',
					sub: '実用的な答えもあれば、まだ考え終えていない問いもあります。',
					backHome: 'ホームに戻る',
					contactPrompt: '話してみたい、書いてみたい、そんな方は',
					contactCta: 'お便りを書く →',
					photoAlt: '山道を歩く桑名浩行',
					photoCaption: 'fig. 0 · 山にいるほうの私'
				}
			: {
					eyebrow: 'about · 自己紹介',
					title: 'A little about me',
					lede:
						"I'm Hiro Kuwana (桑名浩行). Born in Japan, raised in the United States. I build Kaiwa full-time, mostly on my own. This is where I write down what the work is teaching me—about product, language learning, and using AI without giving it more authority than it deserves.",
					sub: "Some answers are practical. Some are questions I haven't finished thinking through.",
					backHome: 'Back to home',
					contactPrompt: 'Rather just talk?',
					contactCta: 'Write to me →',
					photoAlt: 'Hiro Kuwana on a mountain trail',
					photoCaption: 'fig. 0 · the one behind the seal'
				};
</script>

<svelte:head>
	<title>About · Hiro Kuwana</title>
	<meta
		name="description"
		content="About Hiro Kuwana, a solo founder building Kaiwa and writing field notes on product, AI workflows, language learning, and human judgment."
	/>
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<meta property="og:type" content="profile" />
	<meta property="og:url" content={`${SITE.url}/about`} />
	<meta property="og:title" content="About · Hiro Kuwana" />
	<meta property="og:description" content="A solo founder building Kaiwa and writing down what the work is teaching him." />
	<meta property="og:image" content={SITE.image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About · Hiro Kuwana" />
	<meta name="twitter:description" content="A solo founder building Kaiwa and writing down what the work is teaching him." />
	<link rel="canonical" href={`${SITE.url}/about`} />
	<link rel="alternate" hreflang="en" href={`${SITE.url}/about`} />
	<link rel="alternate" hreflang="ja" href={`${SITE.url}/ja/about`} />
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}/about`} />
	{@html `<` + `script type="application/ld+json">${JSON.stringify(faqJsonLd)}</` + `script>`}
	{@html `<` + `script type="application/ld+json">${JSON.stringify(aboutJsonLd)}</` + `script>`}
</svelte:head>

<article class="about-page">
	<header class="about-head">
		<div class="about-intro">
			<span class="eyebrow">{copy.eyebrow}</span>
			<h1>{copy.title}<span class="seal">浩</span></h1>
			<p class="lede">{copy.lede}</p>
			<p class="sub">{copy.sub}</p>
		</div>
		<figure class="about-photo">
			<img src={asset('/hiro-avatar.jpg')} alt={copy.photoAlt} width="640" height="640" loading="lazy" />
			<figcaption>{copy.photoCaption}</figcaption>
		</figure>
	</header>

	<section class="faq-list" aria-label="Frequently asked questions">
		{#each visibleFaqs as faq, i}
			<details class="faq-item" open={i < 2}>
				<summary>
					<span class="q-num">{String(i + 1).padStart(2, '0')}</span>
					<span class="q-text">{faq.question}</span>
					<span class="q-marker" aria-hidden="true">+</span>
				</summary>
				<div class="answer">
					<p>{faq.answer}</p>
				</div>
			</details>
		{/each}
	</section>

	<footer class="about-foot">
		<p class="contact-prompt">
			<span>{copy.contactPrompt}</span>
			<a href={localizeHref('/#contact', { locale: lang })}>{copy.contactCta}</a>
		</p>
		<a class="back-link" href={localizeHref('/', { locale: lang })}>← {copy.backHome}</a>
	</footer>
</article>

<style>
	.about-page {
		max-width: 760px;
		margin: 0 auto;
		padding: 5rem 1.75rem 6rem;
		font-family: var(--font-serif, 'Newsreader', Georgia, serif);
		color: var(--color-text);
	}

	.about-head {
		margin-bottom: 3.5rem;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2.5rem;
		align-items: start;
	}

	.about-photo {
		margin: 0.5rem 0 0;
		width: 200px;
		transform: rotate(1.5deg);
	}

	.about-photo img {
		display: block;
		width: 100%;
		height: auto;
		background: #fff;
		padding: 8px 8px 10px;
		box-shadow: var(--shadow-md, 0 0.75rem 2rem rgba(21, 23, 15, 0.08));
	}

	.about-photo figcaption {
		margin-top: 0.6rem;
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		color: var(--color-text-tertiary, #888);
		text-align: center;
	}

	.eyebrow {
		display: inline-block;
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-tertiary, #888);
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
		font-family: 'Shippori Mincho', serif;
		font-size: 0.55em;
		background: var(--color-accent, #b85042);
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
		color: var(--color-text);
	}

	.sub {
		font-size: 1rem;
		font-style: italic;
		color: var(--color-text-secondary, #666);
		margin: 0;
		max-width: 60ch;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--color-border, rgba(120, 120, 120, 0.18));
	}

	.faq-item {
		border-bottom: 1px solid var(--color-border, rgba(120, 120, 120, 0.18));
		padding: 0;
	}

	.faq-item summary {
		list-style: none;
		cursor: pointer;
		display: grid;
		grid-template-columns: 3rem 1fr auto;
		align-items: baseline;
		gap: 1rem;
		padding: 1.5rem 0.25rem;
		font-size: 1.15rem;
		line-height: 1.4;
		color: var(--color-text);
		transition: color 200ms ease;
	}

	.faq-item summary::-webkit-details-marker {
		display: none;
	}

	.faq-item summary:hover {
		color: var(--color-accent, #b85042);
	}

	.q-num {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.7rem;
		letter-spacing: 0.15em;
		color: var(--color-text-tertiary, #999);
		padding-top: 0.35em;
	}

	.q-text {
		font-weight: 500;
	}

	.q-marker {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 1.15rem;
		color: var(--color-text-tertiary, #999);
		transition: transform 250ms ease;
	}

	.faq-item[open] .q-marker {
		transform: rotate(45deg);
	}

	.answer {
		padding: 0 0.25rem 1.75rem 4rem;
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--color-text-secondary, #555);
		max-width: 60ch;
	}

	.answer p {
		margin: 0;
	}

	.about-foot {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border, rgba(120, 120, 120, 0.18));
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.contact-prompt {
		font-size: 1rem;
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.contact-prompt a {
		color: var(--color-accent, #b85042);
		text-decoration: none;
		font-weight: 500;
	}

	.contact-prompt a:hover {
		text-decoration: underline;
	}

	.back-link {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-tertiary, #888);
		text-decoration: none;
		transition: color 200ms ease;
	}

	.back-link:hover {
		color: var(--color-accent, #b85042);
	}

	@media (max-width: 640px) {
		.about-page {
			padding: 3.5rem 1.25rem 4rem;
		}

		.about-head {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.about-photo {
			width: 180px;
		}

		.faq-item summary {
			grid-template-columns: 2.25rem 1fr auto;
			padding: 1.25rem 0;
			font-size: 1.05rem;
		}

		.answer {
			padding-left: 2.25rem;
			padding-right: 0;
			font-size: 1rem;
		}
	}
</style>
