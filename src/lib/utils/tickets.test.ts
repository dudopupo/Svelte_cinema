import { describe, expect, it } from 'vitest';
import { formatSeatGroups, ticketNumber } from './tickets';

describe('ticket display helpers', () => {
	it('formats a single seat', () => {
		expect(formatSeatGroups([{ row: 1, column: 5 }])).toBe('1 ряд, 5 место');
	});

	it('formats several seats in one row', () => {
		expect(
			formatSeatGroups([
				{ row: 1, column: 6 },
				{ row: 1, column: 5 }
			])
		).toBe('1 ряд, 5 и 6 места');

		expect(
			formatSeatGroups([
				{ row: 1, column: 7 },
				{ row: 1, column: 5 },
				{ row: 1, column: 6 }
			])
		).toBe('1 ряд, 5, 6 и 7 места');
	});

	it('formats multiple rows and plural nouns', () => {
		expect(
			formatSeatGroups([
				{ row: 2, column: 3 },
				{ row: 1, column: 5 },
				{ row: 1, column: 6 }
			])
		).toBe('1 ряд, 5 и 6 места; 2 ряд, 3 место');

		expect(formatSeatGroups([1, 2, 3, 4, 5].map((column) => ({ row: 2, column })))).toBe(
			'2 ряд, 1, 2, 3, 4 и 5 мест'
		);
	});

	it('builds a stable four-digit ticket number', () => {
		const first = ticketNumber('ticket-8931');
		const second = ticketNumber('ticket-8931');

		expect(first).toMatch(/^\d{4}$/);
		expect(second).toBe(first);
		expect(ticketNumber('ticket-5632')).not.toBe(first);
	});
});
