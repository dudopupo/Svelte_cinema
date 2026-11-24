import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { sampleOrder } from '$lib/test/fixtures';
import TicketsBoard from './tickets-board.svelte';

describe('TicketsBoard', () => {
	it('shows the active orders and both tabs', () => {
		render(TicketsBoard, { orders: [sampleOrder], tab: 'active', onTabChange: vi.fn() });

		expect(screen.getAllByRole('tab')).toHaveLength(2);
		expect(screen.getByText('1 ряд, 5 и 6 места')).toBeInTheDocument();
	});

	it('requests the history tab when it is selected', async () => {
		const onTabChange = vi.fn();
		render(TicketsBoard, { orders: [sampleOrder], tab: 'active', onTabChange });

		await fireEvent.click(screen.getByRole('tab', { name: 'История' }));

		expect(onTabChange).toHaveBeenCalledWith('history');
	});

	it('shows the empty state for a tab without orders', () => {
		render(TicketsBoard, { orders: [], tab: 'history', onTabChange: vi.fn() });

		expect(screen.getByText('История покупок пуста')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Перейти в каталог' })).toBeInTheDocument();
	});
});
