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
		'free ICS validator',
		'VCF splitter',
		'calendar file fixer',
		'vCard splitter',
	],
} as const;

// Personal Information
export const PERSONAL = {
	fullName: 'Hiroyuki Kuwana',
	displayName: 'Hiro Kuwana',
	japaneseKanji: '桑名 浩行',
	japaneseKana: 'くわな ひろゆき',
	tagline: 'Building AI tools to augment humanity',
	jobTitle: 'Founder & CEO',
	company: 'Kaiwa',
	companyWebsite: 'https://www.trykaiwa.com/',
	university: 'Brown University',
	nationalities: ['Japanese', 'American'],
} as const;

// Projects
interface Project {
	name: string;
	tagline: string;
	description: string;
	link?: string;
	github?: string;
	logo: string;
	status: 'current' | 'active' | 'sunset';
	color: string;
}

export const PROJECTS: Project[] = [
	{
		name: 'Kaiwa',
		tagline: 'Language Learning, Reimagined',
		description:
			'Practice languages through bite-sized AI conversations. Real-time translations, social streaks, and 30-second daily sessions.',
		link: PERSONAL.companyWebsite,
		logo: '/kaiwa_logo.webp',
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
		logo: '/exonians-e.svg',
		status: 'active',
		color: '#9E1B32',
	},
	{
		name: 'Kaiwa Reddit Scout',
		tagline: 'AI-Powered User Discovery',
		description:
			'Connects Google Drive, Reddit, and Gemini to find potential users interested in language learning.',
		github: 'https://github.com/hkuwana/Kaiwa-reddit-scout',
		logo: '/kaiwa_logo.webp',
		status: 'active',
		color: '#8b5cf6',
	},
	{
		name: 'Flybyrd',
		tagline: 'AI for Venture Capital',
		description:
			'Helped VCs discover and analyze startups with AI-powered deal flow analysis. Sunset to focus on new opportunities.',
		logo: '/flybyrd_logo.webp',
		status: 'sunset',
		color: '#6b7280',
	},
	{
		name: 'Pebblr',
		tagline: 'Connecting Nonprofits',
		description:
			'Connected nonprofits with younger donors. Sunset after GPT technologies offered more scalable solutions.',
		logo: '/icon-96x96.webp',
		status: 'sunset',
		color: '#6b7280',
	},
];

// Tools & Experiments - One-off projects and utilities
export const TOOLS = [
	{
		name: 'ICS Validator & Fixer',
		description:
			'Paste or upload any .ics calendar file. Auto-fixes missing timezones, UIDs, line folding, and other issues. Includes a weekly calendar preview with timezone conversion.',
		href: '/ics-validator',
		icon: 'calendar',
		color: '#6366f1',
	},
	{
		name: 'VCF File Splitter',
		description:
			'Upload a .vcf file with multiple contacts and split it into individual vCard files. Download as a ZIP for easy iPhone/Android import.',
		href: '/vcf-splitter',
		icon: 'contacts',
		color: '#10b981',
	},
] as const;

// Proof / traction numbers — real metrics for credibility above the fold
interface ProofStat {
	value: string;
	label: string;
	subtext?: string;
}

export const PROOF: {
	primary: readonly ProofStat[];
	secondary: readonly ProofStat[];
	updatedAt: string;
} = {
	primary: [
		{ value: '1M+', label: 'Organic impressions', subtext: '3 months' },
		{ value: '3K+', label: 'Clicks', subtext: 'All organic' },
		{ value: '600+', label: 'Monthly signups', subtext: 'Kaiwa' },
		{ value: '37%', label: 'Cold email open rate', subtext: '300+ sent' }
	],
	secondary: [
		{ value: '1', label: 'Solo founder' },
		{ value: '0', label: 'Ad spend' },
		{ value: '0', label: 'Team members' }
	],
	// Bump this whenever the numbers above are refreshed.
	updatedAt: '2026-04-23'
} as const;

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

// FAQs - Optimized for AEO/GEO (Answer Engine Optimization)
export const FAQS = [
	{
		question: 'Will AI take over the world?',
		answer:
			"No. But I do worry about how it will either force us to sharpen our critical thinking or make us complacent. In many ways, it's like Up or Brave New World. The question isn't whether AI will control us, but whether we'll choose comfort over growth.",
	},
	{
		question: 'Is Japan perfect? Do you watch anime?',
		answer:
			'No, Japan is not a perfect country without flaws. And yes, I watch anime. Cowboy Bebop and Paprika are masterpieces. I will die on this hill.',
	},
	{
		question: 'Coffee or tea?',
		answer:
			"Tea. Green tea specifically. And I'm willing to change your mind on this; most green tea in the US is awful (cough cough Lipton). Try the real stuff and we'll talk.",
	},
	{
		question: 'Wait, you studied Environmental Engineering?',
		answer:
			'Yes. My advisor once said, "Now that you have a degree, I\'m honestly surprised you became an engineer." I also did conservation work in Maui helping maintain Waikamoi Preserve (one of the wettest places in the world). Somehow it stayed that way even with my dry humor.',
	},
	{
		question: 'Tell me something weird about you',
		answer:
			"I can snap on any surface. Tables, walls, my own face. It's a gift. I beat Total War: Shogun 2 on Legendary as the Tsu faction (the independent republic). I send postcards to friends around the world. My dream is to make enough friends globally that I always have a couch to crash on. I can only count to three the German way.",
	},
	{
		question: 'Are you funny?',
		answer: "I grew up in the US of A. I don't have a sense of humour. Please don't sue me.",
	},
	{
		question: "What's a hill you will die on?",
		answer:
			"Cowboy Bebop and Paprika are masterpieces, no debate. Also, if you're anywhere from your late teens through your early thirties, you absolutely must read The Brothers Karamazov. It will change how you see the world.",
	},
	{
		question: 'What is Hiro Kuwana working on?',
		answer:
			'Hiro Kuwana is currently focused on Kaiwa, an AI-powered language learning app that helps people practice languages through bite-sized conversations. Previously, he built Flybyrd (AI for venture capital) and Pebblr (nonprofit donor connections).',
	},
	{
		question: "What is Hiro Kuwana's background?",
		answer:
			'Hiro Kuwana is a Japanese-American entrepreneur born in Japan and raised in the United States. He studied Environmental Engineering at Brown University and has lived across Spain, Estonia, and other countries. His global perspective shapes his work in democratizing education through AI.',
	},
	{
		question: 'How can I contact Hiro Kuwana?',
		answer: `You can reach Hiro Kuwana via email at hiro@trykaiwa.com or schedule a conversation at https://cal.com/hirokuwana/15min. He's also active on LinkedIn and GitHub.`,
	},
] as const;
