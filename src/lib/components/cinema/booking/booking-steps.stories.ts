import type { Meta, StoryObj } from '@storybook/svelte';
import BookingSteps from './booking-steps.svelte';

const meta = {
	title: 'Cinema/Booking/BookingSteps',
	component: BookingSteps,
	parameters: {
		layout: 'padded'
	},
	args: {
		step: 'seats'
	},
	tags: ['autodocs']
} satisfies Meta<typeof BookingSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seats: Story = {};

export const Review: Story = {
	args: {
		step: 'review'
	}
};

export const Payment: Story = {
	args: {
		step: 'payment'
	}
};
