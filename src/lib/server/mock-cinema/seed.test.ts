import { describe, expect, it } from 'vitest';
import { buildSchedule, findSeance, formatScheduleDate, getScheduleDates } from './seed';

const FIXED_NOW = new Date(2026, 10, 23, 12, 0, 0);

describe('cinema schedule', () => {
	it('builds seven days with twelve seances each', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);

		expect(schedule).toHaveLength(7);
		for (const day of schedule) {
			expect(day.seances).toHaveLength(12);
			expect(day.date).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
		}
		expect(schedule[0].date).toBe('23.11.26');
		expect(schedule[6].date).toBe('29.11.26');
	});

	it('generates schedules for films missing from the seed', () => {
		for (const filmId of ['11', '12', '18']) {
			const schedule = buildSchedule(filmId, [], FIXED_NOW);
			expect(schedule).toHaveLength(7);
			expect(schedule[0].seances).toHaveLength(12);
		}
	});

	it('marks only matching paid seats', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const seance = schedule[0].seances[0];

		const marked = buildSchedule(
			'1',
			[
				{ date: schedule[0].date, time: seance.time, row: 3, column: 1 },
				{ date: schedule[0].date, time: seance.time, row: 1, column: 1 }
			],
			FIXED_NOW
		);

		expect(marked[0].seances[0].hall.places[2][0].type).toBe('paid');
		// Blocked seats are never turned into paid seats.
		expect(marked[0].seances[0].hall.places[0][0].type).toBe('blocked');
	});

	it('finds a seance by date and time', () => {
		const schedule = buildSchedule('2', [], FIXED_NOW);
		const expected = schedule[2].seances[3];

		expect(findSeance('2', schedule[2].date, expected.time, { now: FIXED_NOW })?.hall.name).toBe(
			expected.hall.name
		);
		expect(findSeance('2', schedule[2].date, '99:99', { now: FIXED_NOW })).toBeUndefined();
	});

	it('disambiguates seances with the same time in different halls', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const day = schedule[0];
		const duplicate = day.seances.find((seance, index) =>
			day.seances.some((other, otherIndex) => otherIndex !== index && other.time === seance.time)
		);

		expect(duplicate).toBeDefined();

		const found = findSeance('1', day.date, duplicate!.time, {
			hall: duplicate!.hall.name,
			now: FIXED_NOW
		});
		expect(found?.hall.name).toBe(duplicate!.hall.name);
	});

	it('formats dates and returns seven consecutive days', () => {
		expect(formatScheduleDate(FIXED_NOW)).toBe('23.11.26');
		expect(getScheduleDates(FIXED_NOW)).toEqual([
			'23.11.26',
			'24.11.26',
			'25.11.26',
			'26.11.26',
			'27.11.26',
			'28.11.26',
			'29.11.26'
		]);
	});
});
