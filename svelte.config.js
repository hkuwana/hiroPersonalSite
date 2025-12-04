import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const mdsvexConfig = {
	extensions: ['.md', '.svx']
};

const config = {
	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
	kit: {
		adapter: adapter(),
		paths: {
			relative: false
		}
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
