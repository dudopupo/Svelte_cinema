import type { Meta, StoryObj } from '@storybook/svelte';
import ContactsStep from './contacts-step.svelte';

const meta = {
	title: 'Cinema/Booking/ContactsStep',
	component: ContactsStep,
	parameters: {
		layout: 'centered'
	},
	args: {
		contacts: {
			firstname: 'Иван',
			lastname: 'Иванов',
			middlename: 'Иванович',
			phone: '+7 999 999 99 99',
			city: 'Москва',
			email: 'ivan@mail.ru'
		},
		onUpdate: () => {},
		onBack: () => {},
		onContinue: () => {}
	},
	tags: ['autodocs']
} satisfies Meta<typeof ContactsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prefilled: Story = {};

export const Empty: Story = {
	args: {
		contacts: {
			firstname: '',
			lastname: '',
			middlename: '',
			phone: '',
			city: '',
			email: ''
		}
	}
};
