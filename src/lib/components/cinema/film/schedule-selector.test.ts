import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { FilmSchedule } from '$lib/api/types';
import { sampleSchedules } from '$lib/test/fixtures';
import ScheduleSelector from './schedule-selector.svelte';

describe('ScheduleSelector', () => {
	it('renders date tabs and groups seances by hall', () => {
		render(ScheduleSelector, { schedules: sampleSchedules, filmId: '7' });

		expect(screen.getByRole('button', { name: 'Пн, 23 ноя' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect(screen.getByText('Красный зал')).toBeInTheDocument();
		expect(screen.getByText('Синий зал')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '12:40' })).toBeInTheDocument();
	});

	it('selects a seance and enables the continue button', async () => {
		render(ScheduleSelector, { schedules: sampleSchedules, filmId: '7' });

		const continueButton = screen.getByRole('button', { name: 'Продолжить' });
		expect(continueButton).toBeDisabled();

		const seance = screen.getByRole('button', { name: '12:15' });
		await fireEvent.click(seance);

		expect(seance).toHaveAttribute('aria-pressed', 'true');
		expect(continueButton).toBeEnabled();

		await fireEvent.click(seance);
		expect(seance).toHaveAttribute('aria-pressed', 'false');
		expect(continueButton).toBeDisabled();
	});

	it('resets the selection when another date is chosen', async () => {
		render(ScheduleSelector, { schedules: sampleSchedules, filmId: '7' });

		await fireEvent.click(screen.getByRole('button', { name: '12:40' }));
		expect(screen.getByRole('button', { name: 'Продолжить' })).toBeEnabled();

		await fireEvent.click(screen.getByRole('button', { name: 'Вт, 24 ноя' }));

		expect(screen.getByRole('button', { name: 'Продолжить' })).toBeDisabled();
		expect(screen.getByText('Зелёный зал')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: '12:40' })).not.toBeInTheDocument();
	});

	it('distinguishes seances with the same time in different halls', async () => {
		const schedules: FilmSchedule[] = [
			{
				date: '23.11.26',
				seances: [
					{ time: '13:10', hall: { name: 'Red', places: [] } },
					{ time: '13:10', hall: { name: 'Blue', places: [] } }
				]
			}
		];

		render(ScheduleSelector, { schedules, filmId: '7' });

		const [redSeance, blueSeance] = screen.getAllByRole('button', { name: '13:10' });

		await fireEvent.click(redSeance);
		expect(redSeance).toHaveAttribute('aria-pressed', 'true');
		expect(blueSeance).toHaveAttribute('aria-pressed', 'false');

		await fireEvent.click(blueSeance);
		expect(redSeance).toHaveAttribute('aria-pressed', 'false');
		expect(blueSeance).toHaveAttribute('aria-pressed', 'true');
	});
});
