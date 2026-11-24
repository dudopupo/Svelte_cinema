import type { Meta, StoryObj } from '@storybook/svelte';
import EmptyState from './empty-state.svelte';

const meta = {
	title: 'Cinema/Shared/EmptyState',
	component: EmptyState,
	parameters: {
		layout: 'padded'
	},
	args: {
		title: 'Фильмы не найдены',
		description: 'Загляните позже — афиша скоро обновится'
	},
	tags: ['autodocs']
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAlertIcon: Story = {
	args: {
		icon: 'alert',
		title: 'Не удалось загрузить фильмы',
		description: 'Проверьте соединение и попробуйте ещё раз'
	}
};
