/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'apple-blue': {
					400: '#7aadff',
					500: '#4d91ff',
					600: '#3d7ce6'
				}
			}
		}
	},
	plugins: []
};
