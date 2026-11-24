import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AuthOtpForm from './auth-otp-form.svelte';

describe('AuthOtpForm', () => {
	it('submits a six-digit code', async () => {
		const onSubmit = vi.fn();
		render(AuthOtpForm, { onSubmit, onResend: vi.fn() });

		await fireEvent.input(screen.getByPlaceholderText('Введите код'), {
			target: { value: '484041' }
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

		expect(onSubmit).toHaveBeenCalledWith('484041');
	});

	it('rejects a short code before sending it', async () => {
		const onSubmit = vi.fn();
		render(AuthOtpForm, { onSubmit, onResend: vi.fn() });

		await fireEvent.input(screen.getByPlaceholderText('Введите код'), {
			target: { value: '484' }
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

		expect(screen.getByText('Введите 6 цифр')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('shows the resend button when the cooldown is over', async () => {
		const onResend = vi.fn();
		render(AuthOtpForm, { onSubmit: vi.fn(), onResend, seconds: 0 });

		await fireEvent.click(screen.getByRole('button', { name: 'Отправить код повторно' }));

		expect(onResend).toHaveBeenCalledOnce();
	});

	it('shows the countdown instead of the resend button', () => {
		render(AuthOtpForm, { onSubmit: vi.fn(), onResend: vi.fn(), seconds: 65 });

		expect(screen.getByText('Отправить код повторно через 65 сек')).toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Отправить код повторно' })
		).not.toBeInTheDocument();
	});

	it('shows a server error', () => {
		render(AuthOtpForm, { onSubmit: vi.fn(), onResend: vi.fn(), error: 'Неверный код' });

		expect(screen.getByRole('alert')).toHaveTextContent('Неверный код');
	});
});
