import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AuthPhoneForm from './auth-phone-form.svelte';

// The label is responsive ("Продолжить" on mobile, "Войти" on desktop); jsdom
// does not apply the media queries, so both spans contribute to the name.
function submitButton() {
	return screen.getByRole('button', { name: /Продолжить/ });
}

describe('AuthPhoneForm', () => {
	it('submits a formatted phone number', async () => {
		const onSubmit = vi.fn();
		render(AuthPhoneForm, { onSubmit });

		await fireEvent.input(screen.getByLabelText('Телефон'), {
			target: { value: '89131234567' }
		});
		await fireEvent.click(submitButton());

		expect(onSubmit).toHaveBeenCalledWith('+7 913 123 45 67');
	});

	it('blocks an incomplete phone number', async () => {
		const onSubmit = vi.fn();
		render(AuthPhoneForm, { onSubmit });

		await fireEvent.input(screen.getByLabelText('Телефон'), {
			target: { value: '+7 913 123' }
		});
		await fireEvent.click(submitButton());

		expect(screen.getByText('Неверный номер телефона')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('shows a server error', () => {
		render(AuthPhoneForm, { onSubmit: vi.fn(), error: 'Сервис недоступен' });

		expect(screen.getByRole('alert')).toHaveTextContent('Сервис недоступен');
	});
});
