import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { sampleOrder } from '$lib/test/fixtures';
import { formatSeanceDateTime } from '$lib/utils/format';
import { ticketNumber } from '$lib/utils/tickets';
import SuccessStep from './success-step.svelte';

describe('SuccessStep', () => {
	it('shows the order summary and ticket numbers', () => {
		render(SuccessStep, { order: sampleOrder, hall: 'Blue' });

		expect(screen.getByRole('heading', { name: 'Оплата прошла успешно' })).toBeInTheDocument();
		expect(screen.getByText('Интерстеллар')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
		expect(screen.getByText(formatSeanceDateTime('23.11.26', '17:10'))).toBeInTheDocument();
		expect(screen.getByText('Синий зал')).toBeInTheDocument();
		expect(screen.getByText('1 ряд, 5 и 6 места')).toBeInTheDocument();
		expect(
			screen.getByText(`${ticketNumber('ticket-8931')}, ${ticketNumber('ticket-5632')}`)
		).toBeInTheDocument();
		expect(screen.getByText('Вся информация была продублирована в SMS')).toBeInTheDocument();
	});

	it('links to the order details and the catalog', () => {
		render(SuccessStep, { order: sampleOrder, hall: 'Blue' });

		expect(screen.getByRole('link', { name: 'Детали заказа' })).toHaveAttribute('href', '/tickets');
		expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute('href', '/');
	});
});
