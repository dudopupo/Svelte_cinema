import type { Preview } from '@storybook/svelte';
import '../src/routes/layout.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		backgrounds: {
			default: 'dark',
			values: [
				{ name: 'dark', value: '#0b0b0b' },
				{ name: 'light', value: '#fbfbfb' }
			]
		}
	},
	globalTypes: {
		theme: {
			description: 'Тема оформления',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: ['dark', 'light'],
				dynamicTitle: true
			}
		}
	},
	decorators: [
		(story, context) => {
			const theme = context.globals.theme === 'light' ? 'light' : 'dark';
			if (typeof document !== 'undefined') {
				document.documentElement.dataset.theme = theme;
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}
			return story();
		}
	]
};

export default preview;
