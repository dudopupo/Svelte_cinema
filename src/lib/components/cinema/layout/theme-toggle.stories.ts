import type { Meta, StoryObj } from '@storybook/svelte';
import ThemeToggle from './theme-toggle.svelte';

const meta = {
	title: 'Cinema/Layout/ThemeToggle',
	component: ThemeToggle,
	parameters: {
		layout: 'centered'
	},
	tags: ['autodocs']
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
