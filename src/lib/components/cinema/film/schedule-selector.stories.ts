import type { Meta, StoryObj } from '@storybook/svelte';
import { sampleSchedules } from '$lib/test/fixtures';
import ScheduleSelector from './schedule-selector.svelte';

const meta = {
	title: 'Cinema/Film/ScheduleSelector',
	component: ScheduleSelector,
	parameters: {
		layout: 'padded'
	},
	args: {
		schedules: sampleSchedules,
		filmId: '7'
	},
	tags: ['autodocs']
} satisfies Meta<typeof ScheduleSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
