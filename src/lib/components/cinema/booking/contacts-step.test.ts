import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { BookingContacts } from '$lib/stores/booking.svelte';
import ContactsStep from './contacts-step.svelte';

const validContacts: BookingContacts = {
	firstname: 'Иван',
	lastname: 'Иванов',
	middlename: 'Иванович',
	phone: '+7 999 999 99 99',
	city: 'Москва',
	email: 'ivan@mail.ru'
};

const emptyContacts: BookingContacts = {
	firstname: '',
	lastname: '',
	middlename: '',
	phone: '',
	city: '',
	email: ''
};

function renderStep(contacts: BookingContacts = validContacts) {
	const onUpdate = vi.fn();
	const onBack = vi.fn();
	const onContinue = vi.fn();

	render(ContactsStep, { contacts, onUpdate, onBack, onContinue });

	return { onUpdate, onBack, onContinue };
}

describe('ContactsStep', () => {
	it('renders the prefilled contacts', () => {
		renderStep();

		expect(screen.getByLabelText('Фамилия*')).toHaveValue('Иванов');
		expect(screen.getByLabelText('Имя*')).toHaveValue('Иван');
		expect(screen.getByLabelText('Отчество*')).toHaveValue('Иванович');
		expect(screen.getByLabelText('Телефон*')).toHaveValue('+7 999 999 99 99');
		expect(screen.getByLabelText('Город')).toHaveValue('Москва');
		expect(screen.getByLabelText('Email')).toHaveValue('ivan@mail.ru');
	});

	it('blocks an empty form and explains which fields are required', async () => {
		const { onContinue } = renderStep(emptyContacts);

		await fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));

		expect(screen.getAllByText('Поле обязательно для заполнения')).toHaveLength(4);
		expect(onContinue).not.toHaveBeenCalled();
		expect(screen.getByLabelText('Фамилия*')).toHaveAttribute('aria-invalid', 'true');
	});

	it('reports an invalid phone and email', async () => {
		const { onContinue } = renderStep({ ...validContacts, phone: '123', email: 'ivan@mail' });

		await fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));

		expect(screen.getByText('Неверный номер телефона')).toBeInTheDocument();
		expect(screen.getByText('Некорректный email')).toBeInTheDocument();
		expect(onContinue).not.toHaveBeenCalled();
	});

	it('submits a valid form', async () => {
		const { onContinue, onBack } = renderStep();

		await fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));

		expect(onContinue).toHaveBeenCalledOnce();
		expect(onBack).not.toHaveBeenCalled();
	});

	it('propagates typing to the booking store', async () => {
		const { onUpdate } = renderStep(emptyContacts);

		await fireEvent.input(screen.getByLabelText('Фамилия*'), {
			target: { value: 'Петров' }
		});

		expect(onUpdate).toHaveBeenCalledWith({ lastname: 'Петров' });
	});

	it('returns to the previous step from the desktop button', async () => {
		const { onBack } = renderStep();

		await fireEvent.click(screen.getByRole('button', { name: 'Назад' }));

		expect(onBack).toHaveBeenCalledOnce();
	});
});
