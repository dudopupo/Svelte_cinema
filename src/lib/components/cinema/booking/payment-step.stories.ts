import type { Meta, StoryObj } from '@storybook/svelte';
import PaymentStep from './payment-step.svelte';

const meta = {
	title: 'Cinema/Booking/PaymentStep',
	component: PaymentStep,
	parameters: {
		layout: 'centered'
	},
	args: {
		onBack: () => {},
		onPay: async () => null
	},
	tags: ['autodocs']
} satisfies Meta<typeof PaymentStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
