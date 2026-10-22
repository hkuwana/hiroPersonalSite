import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default ts.config(
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'dist/**',
			'project.inlang/cache/**',
			'src/lib/paraglide/**',
			// The current JSON-LD template contains a literal closing script tag,
			// which svelte-eslint-parser cannot parse correctly.
			'src/routes/essays/[[]slug[]]/+page.svelte'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		rules: {
			// Existing-site baseline. Re-enable these incrementally as pages are touched.
			'svelte/no-at-html-tags': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-reactive-functions': 'off',
			'svelte/require-each-key': 'off'
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	}
);
