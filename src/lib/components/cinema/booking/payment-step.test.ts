import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import PaymentStep from './payment-step.svelte';

function renderStep(onPay = vi.fn().mockResolvedValue(null)) {
	const onBack = vi.fn();
	render(PaymentStep, { onBack, onPay });
	return { onBack, onPay };
}

async function fillCard() {
	await fireEvent.input(screen.getByLabelText('Номер карты*'), {
		target: { value: '1111111111111111' }
	});
	await fireEvent.input(screen.getByLabelText('Срок*'), { target: { value: '1225' } });
	await fireEvent.input(screen.getByLabelText('CVV*'), { target: { value: '123' } });
}

describe('PaymentStep', () => {
	it('requires all card fields', async () => {
		const { onPay } = renderStep();

		await fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

		expect(screen.getAllByText('Поле обязательно для заполнения')).toHaveLength(3);
		expect(onPay).not.toHaveBeenCalled();
	});

	it('formats the card fields while typing', async () => {
		renderStep();
		await fillCard();

		expect(screen.getByLabelText('Номер карты*')).toHaveValue('1111 1111 1111 1111');
		expect(screen.getByLabelText('Срок*')).toHaveValue('12/25');
		expect(screen.getByLabelText('CVV*')).toHaveValue('123');
	});

	it('submits formatted card data', async () => {
		const { onPay } = renderStep();
		await fillCard();

		await fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

		await waitFor(() => {
			expect(onPay).toHaveBeenCalledWith({
				pan: '1111 1111 1111 1111',
				expireDate: '12/25',
				cvv: '123'
			});
		});
	});

	it('shows a payment error returned by the API', async () => {
		const onPay = vi.fn().mockResolvedValue('Место уже куплено');
		renderStep(onPay);
		await fillCard();

		await fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

		expect(await screen.findByRole('alert')).toHaveTextContent('Место уже куплено');
	});

	it('reports invalid card data', async () => {
		renderStep();

		await fireEvent.input(screen.getByLabelText('Номер карты*'), {
			target: { value: '1111' }
		});
		await fireEvent.input(screen.getByLabelText('Срок*'), { target: { value: '13' } });
		await fireEvent.input(screen.getByLabelText('CVV*'), { target: { value: '12' } });

		await fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

		expect(screen.getByText('Неверный формат карты')).toBeInTheDocument();
		expect(screen.getByText('Формат должен быть ММ/ГГ')).toBeInTheDocument();
		expect(screen.getByText('CVV должен состоять из 3 цифр')).toBeInTheDocument();
	});

	it('returns to the previous step from the desktop button', async () => {
		const { onBack } = renderStep();

		await fireEvent.click(screen.getByRole('button', { name: 'Назад' }));

		expect(onBack).toHaveBeenCalledOnce();
	});
});
