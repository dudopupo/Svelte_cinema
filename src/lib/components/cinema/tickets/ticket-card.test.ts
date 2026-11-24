import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { CinemaOrder } from '$lib/api/types';
import { sampleOrder } from '$lib/test/fixtures';
import TicketCard from './ticket-card.svelte';

const canceledOrder: CinemaOrder = {
	...sampleOrder,
	status: 'canceled',
	tickets: sampleOrder.tickets.map((ticket) => ({ ...ticket, status: 'cancelled' }))
};

describe('TicketCard', () => {
	it('shows the paid status, seance, hall and seats', () => {
		render(TicketCard, { order: sampleOrder, number: 1 });

		expect(screen.getByText('Билет')).toBeInTheDocument();
		expect(screen.getByText('оплачен')).toBeInTheDocument();
		expect(screen.getByText('Пн, 23 ноя, 17:10')).toBeInTheDocument();
		expect(screen.getByText('Синий')).toBeInTheDocument();
		expect(screen.getByText('1 ряд, 5 и 6 места')).toBeInTheDocument();
	});

	it('returns the order when the return button is pressed', async () => {
		const onReturn = vi.fn();
		render(TicketCard, { order: sampleOrder, number: 1, onReturn });

		await fireEvent.click(screen.getByRole('button', { name: 'Вернуть билет' }));

		expect(onReturn).toHaveBeenCalledWith(sampleOrder);
	});

	it('hides the return action for canceled tickets', () => {
		render(TicketCard, { order: canceledOrder, number: 1, onReturn: vi.fn() });

		expect(screen.getByText('отменён')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Вернуть билет' })).not.toBeInTheDocument();
	});
});
