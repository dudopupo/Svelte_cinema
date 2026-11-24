import type { Meta, StoryObj } from '@storybook/svelte';
import { sampleOrder } from '$lib/test/fixtures';
import SuccessStep from './success-step.svelte';

const meta = {
	title: 'Cinema/Booking/SuccessStep',
	component: SuccessStep,
	parameters: {
		layout: 'centered'
	},
	args: {
		order: sampleOrder,
		hall: 'Blue'
	},
	tags: ['autodocs']
} satisfies Meta<typeof SuccessStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
