import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { sampleUser } from '$lib/test/fixtures';
import ProfileForm from './profile-form.svelte';

describe('ProfileForm', () => {
	it('saves the edited profile and reports success', async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		render(ProfileForm, { user: sampleUser, onSave, onLogout: vi.fn() });

		await fireEvent.input(screen.getByLabelText('Город'), { target: { value: 'Казань' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Обновить данные' }));

		await waitFor(() =>
			expect(onSave).toHaveBeenCalledWith({
				lastname: 'Иванов',
				firstname: 'Иван',
				middlename: 'Иванович',
				city: 'Казань',
				email: 'ivan@mail.ru'
			})
		);
		expect(await screen.findByText('Данные обновлены')).toBeInTheDocument();
	});

	it('blocks an invalid email before saving', async () => {
		const onSave = vi.fn();
		render(ProfileForm, { user: sampleUser, onSave, onLogout: vi.fn() });

		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'not-an-email' }
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Обновить данные' }));

		expect(await screen.findByText('Некорректный email')).toBeInTheDocument();
		expect(onSave).not.toHaveBeenCalled();
	});

	it('keeps the phone read-only', () => {
		render(ProfileForm, { user: sampleUser, onSave: vi.fn(), onLogout: vi.fn() });

		expect(screen.getByLabelText('Телефон')).toHaveAttribute('readonly');
	});
});
