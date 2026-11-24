import type { Meta, StoryObj } from '@storybook/svelte';
import { sampleHall } from '$lib/test/fixtures';
import SeatMap from './seat-map.svelte';

const meta = {
	title: 'Cinema/Booking/SeatMap',
	component: SeatMap,
	parameters: {
		layout: 'centered'
	},
	args: {
		hall: sampleHall,
		selected: [],
		onToggle: () => {},
		onClear: () => {}
	},
	tags: ['autodocs']
} satisfies Meta<typeof SeatMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
	args: {
		selected: [
			{ row: 1, column: 2, price: 300 },
			{ row: 2, column: 3, price: 400 }
		]
	}
};
