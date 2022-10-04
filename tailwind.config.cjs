/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				pebblrTheme: {
					primary: '#375C56',
					secondary: '#77C19D',
					accent: '#d23369',
					neutral: '#1D1D1D',
					'base-100': '#f3f4f6',
					info: '#31CCEC',
					success: '#21BA45',
					warning: '#F2C037',
					error: '#C10015'
				}
			},
			'forest'
		]
	}
};
