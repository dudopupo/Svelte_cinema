import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { BookingSeat } from '$lib/stores/booking.svelte';
import { sampleHall } from '$lib/test/fixtures';
import SeatMap from './seat-map.svelte';

function renderMap(selected: BookingSeat[] = []) {
	const onToggle = vi.fn();
	const onClear = vi.fn();
	render(SeatMap, { hall: sampleHall, selected, onToggle, onClear });
	return { onToggle, onClear };
}

describe('SeatMap', () => {
	it('renders available and paid seats, skipping blocked cells', () => {
		renderMap();

		expect(screen.getAllByRole('button')).toHaveLength(18);
		expect(screen.getByRole('button', { name: '1 ряд, 2 место — доступно' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /1 ряд, 1 место/ })).not.toBeInTheDocument();
	});

	it('marks paid seats as disabled', () => {
		renderMap();

		expect(screen.getByRole('button', { name: '3 ряд, 2 место — занято' })).toBeDisabled();
	});

	it('reports a clicked seat', async () => {
		const { onToggle } = renderMap();

		await fireEvent.click(screen.getByRole('button', { name: '1 ряд, 3 место — доступно' }));

		expect(onToggle).toHaveBeenCalledWith(1, 3);
	});

	it('marks selected seats and shows their price tooltip', () => {
		renderMap([{ row: 1, column: 2, price: 300 }]);

		const seat = screen.getByRole('button', { name: '1 ряд, 2 место — выбрано' });
		expect(seat).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByText('300 ₽')).toBeInTheDocument();
		expect(screen.getByText('1 ряд, 2 место')).toBeInTheDocument();
	});

	it('removes a seat from the tooltip', async () => {
		const { onToggle } = renderMap([{ row: 1, column: 2, price: 300 }]);

		await fireEvent.click(screen.getByRole('button', { name: 'Убрать место 1 ряд, 2 место' }));

		expect(onToggle).toHaveBeenCalledWith(1, 2);
	});

	it('clears the whole selection from the total row', async () => {
		const { onClear } = renderMap([
			{ row: 1, column: 2, price: 300 },
			{ row: 2, column: 3, price: 400 }
		]);

		await fireEvent.click(screen.getByRole('button', { name: 'Сбросить выбор' }));

		expect(onClear).toHaveBeenCalledOnce();
	});

	it('hides the clear action while nothing is selected', () => {
		renderMap();

		expect(screen.queryByRole('button', { name: 'Сбросить выбор' })).not.toBeInTheDocument();
	});

	it('disables free seats when the selection limit is reached', () => {
		const selected: BookingSeat[] = [
			{ row: 1, column: 2, price: 300 },
			{ row: 1, column: 3, price: 300 },
			{ row: 1, column: 4, price: 300 },
			{ row: 2, column: 1, price: 300 },
			{ row: 2, column: 2, price: 400 },
			{ row: 2, column: 3, price: 400 },
			{ row: 2, column: 4, price: 400 },
			{ row: 2, column: 5, price: 300 },
			{ row: 3, column: 1, price: 300 },
			{ row: 3, column: 3, price: 300 }
		];

		renderMap(selected);

		expect(screen.getByRole('button', { name: '3 ряд, 4 место — доступно' })).toBeDisabled();
		expect(screen.getByRole('button', { name: '1 ряд, 2 место — выбрано' })).toBeEnabled();
	});
});
