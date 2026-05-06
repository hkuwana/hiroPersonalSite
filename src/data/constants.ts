/**
 * Site-wide constants
 * Centralized configuration for personal information and site metadata
 */

// Contact Information
export const CONTACT = {
	email: 'hiro@trykaiwa.com',
	cal: 'https://cal.com/hirokuwana/15min',
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
	quora: 'https://www.quora.com/profile/Hiro-Kuwana',
	linkedin: 'https://www.linkedin.com/in/hiroyuki-kuwana/',
	github: 'https://github.com/hkuwana',
	twitter: 'https://twitter.com/hirokuwana',
} as const;

// Site Metadata
export const SITE = {
	name: 'Hiro Kuwana',
	title: 'Hiro Kuwana - AI Entrepreneur & Founder | Democratizing Education Through Technology',
	description:
		'Hiro Kuwana is a tech entrepreneur building AI solutions to democratize education and empower human potential. Founder of Kaiwa (AI language learning). Making premium tools accessible to everyone.',
	url: 'https://hirokuwana.com',
	image: 'https://hirokuwana.com/hiro-social-preview.jpg',
	author: 'Hiro Kuwana',
	keywords: [
		'Hiro Kuwana',
		'AI entrepreneur',
		'startup founder',
		'educational technology',
		'AI democratization',
		'venture capital AI',
		'language learning app',
		'tech innovation',
		'artificial intelligence',
		'EdTech',
	],
} as const;

// Personal Information
export const PERSONAL = {
	fullName: 'Hiroyuki Kuwana',
	displayName: 'Hiro Kuwana',
	japaneseKanji: '桑名 浩行',
	japaneseKana: 'くわな ひろゆき',
	tagline: 'Building AI as a tool for humanity, not a replacement',
	jobTitle: 'Founder & CEO',
	company: 'Kaiwa',
	companyWebsite: 'https://www.trykaiwa.com/',
	university: 'Brown University',
	nationalities: ['Japanese', 'American'],
} as const;

// Projects
export const PROJECTS = [
	{
		name: 'Kaiwa',
		tagline: 'Language Learning, Reimagined',
		description:
			'Practice languages through bite-sized AI conversations. Real-time translations, social streaks, and 30-second daily sessions.',
		link: PERSONAL.companyWebsite,
		logo: '/kaiwa_logo.png',
		status: 'current',
		color: '#10b981',
	},
	{
		name: 'Exonians in Japan',
		tagline: 'Built in 1.5 Hours',
		description:
			'A community platform connecting Exeter alumni in Japan. Rapid prototype showcasing speed and execution.',
		link: 'https://exoniansjapan.com/',
		github: 'https://github.com/hkuwana/exonians-in-japan',
		logo: '/icon-512x512.png',
		status: 'active',
		color: '#3b82f6',
	},
	{
		name: 'Kaiwa Reddit Scout',
		tagline: 'AI-Powered User Discovery',
		description:
			'Connects Google Drive, Reddit, and Gemini to find potential users interested in language learning.',
		github: 'https://github.com/hkuwana/Kaiwa-reddit-scout',
		logo: '/kaiwa_logo.png',
		status: 'active',
		color: '#8b5cf6',
	},
	{
		name: 'Flybyrd',
		tagline: 'AI for Venture Capital',
		description:
			'Helped VCs discover and analyze startups with AI-powered deal flow analysis. Sunset to focus on new opportunities.',
		logo: '/flybyrd_logo.png',
		status: 'sunset',
		color: '#6b7280',
	},
	{
		name: 'Pebblr',
		tagline: 'Connecting Nonprofits',
		description:
			'Connected nonprofits with younger donors. Sunset after GPT technologies offered more scalable solutions.',
		logo: '/icon-512x512.png',
		status: 'sunset',
		color: '#6b7280',
	},
] as const;

// Expertise Areas
export const EXPERTISE = [
	'Artificial Intelligence',
	'Educational Technology',
	'Venture Capital',
	'Language Learning',
	'Startup Development',
	'Product Design',
	'AI Democratization',
] as const;

// FAQs — visible ones render on /about; all entries (visible + hidden) ship in
// FAQPage JSON-LD for AEO/GEO (Answer Engine / Generative Engine Optimization).
export type Faq = {
	question: string;
	answer: string;
	visible: boolean;
};

export const FAQS: Faq[] = [
	{
		question: 'Will AI take over the world?',
		answer:
			"No. But I do worry about how it will either force us to sharpen our critical thinking or make us complacent. In many ways, it's like Up or Brave New World. The question isn't whether AI will control us, but whether we'll choose comfort over growth.",
		visible: true,
	},
	{
		question: 'Will AI replace us?',
		answer:
			"AI will replace a lot of jobs, the way the tractor let one farmer do the work of ten, or how the printing press meant we didn't have to copy every book by hand. I'm excited about the future it enables (with proper safety guidance and alignment), but I worry about the transition. In the current system, the transition itself will lead to a lot of people suffering. I think the best tool during a massive technological shift is human capital: reeducate, build a stronger baseline, so people can keep contributing to society in interesting ways.",
		visible: true,
	},
	{
		question: 'What does an ideal world with AI in it look like?',
		answer:
			"First, AI as a tool. Something we use to help ourselves become better, to learn faster or in our own way, so we can be smarter, healthier, and kinder to one another. Further out, AI as a companion: humanity exploring the universe alongside something we built, as equals. There will be a point where AI is better than us at cognition and many other things, so it's in our interest to make sure we pass on the cultural memories we'd want any next generation to hold. Kind but firm. Loving and respectful. Forgiving but fair in how it thinks about what counts as a consciousness. AI should care about conscious beings, and hold that as a fundamental principle.",
		visible: true,
	},
	{
		question: 'Can you fall in love with a language?',
		answer:
			"You can fall in love with anything, I think. But with a language, it's usually not the language itself. It's the story carried inside it. The grammar of Latin, fixed in time. The sound of French that makes someone want to live in a small village on the outskirts of Provence. The festive air of Spanish on Cinco de Mayo. The echo of a Japanese haiku read in a garden. What we fall in love with is a cultural moment, a story passed down from an earlier generation. That's the language we end up loving.",
		visible: true,
	},
	{
		question: "What's a question you've been carrying for years?",
		answer:
			"The connection between memory and education. Is learning Latin in the West a way to filter for people who can learn a specific, logical way? What about someone who could reach the same understanding through speaking instead? Same with math. Is there a way to move people from \"I'm bad at math\" to \"if you appreciate waves, you already understand the intuition of a sinusoid\"? There's so much overlap in how people learn the same idea. It isn't binary, even though that's how most people have it in their head.",
		visible: true,
	},
	{
		question: 'Why build slowly in a world that rewards speed?',
		answer:
			"You need to build quickly, but the ideas and strategies behind the building don't show up overnight like flipping a lightbulb. They're more like an ember that takes time to grow into a fireplace. You don't notice it at first, but it spreads, and eventually it warms you up.",
		visible: true,
	},
	{
		question: 'Coffee or tea?',
		answer:
			"Tea. Green tea mostly. And I'm willing to change your mind on this; try some delicious Jasmine, Gyokuro, or Sencha from a local tea shop, brewed at 75~90 degrees celsius (roughly 167~194 degrees fahrenheit). Or just have tea with me and we'll see.",
		visible: true,
	},
	{
		question: 'Wait, you studied Environmental Engineering?',
		answer:
			'Yes. My advisor once said, "Now that you have a degree, I\'m honestly surprised you became an engineer." I also did conservation work in Maui helping maintain Waikamoi Preserve (one of the wettest places in the world). Somehow it stayed that way even with my dry humor.',
		visible: true,
	},
	{
		question: 'Are you funny?',
		answer: "I grew up in the US, so I don't have a sense of humour. This page is for informational purpose only. Please don't sue me.",
		visible: true,
	},
	{
		question: "What's a hill you will die on?",
		answer:
			"Cowboy Bebop and Paprika are masterpieces, no debate. Also, if you're anywhere from your late teens through your early thirties, you absolutely must read The Brothers Karamazov. It will change how you see the world.",
		visible: true,
	},
	{
		question: 'What is Hiro Kuwana working on?',
		answer:
			'Hiro Kuwana is currently focused on Kaiwa, an AI-powered language learning app that helps people practice languages through bite-sized conversations. Previously, he built Flybyrd (AI for venture capital) and Pebblr (nonprofit donor connections).',
		visible: false,
	},
	{
		question: "What is Hiro Kuwana's background?",
		answer:
			'Hiro Kuwana is a Japanese-American entrepreneur born in Japan and raised in the United States. He studied Environmental Engineering at Brown University and has lived across Spain, Estonia, and other countries. His global perspective shapes his work in democratizing education through AI.',
		visible: false,
	},
	{
		question: 'How can I contact Hiro Kuwana?',
		answer: `You can reach Hiro Kuwana via email at hiro@trykaiwa.com or schedule a conversation at https://cal.com/hirokuwana/15min. He's also active on LinkedIn and GitHub.`,
		visible: false,
	},
];
