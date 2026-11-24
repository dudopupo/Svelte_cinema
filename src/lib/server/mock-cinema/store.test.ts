import { beforeEach, describe, expect, it } from 'vitest';
import type { CreateCinemaPaymentPayload } from '$lib/api/types';
import { buildSchedule } from './seed';
import {
	cancelOrder,
	createPayment,
	getPaidSeats,
	listOrders,
	MockCinemaError,
	resetCinemaStore
} from './store';

const FIXED_NOW = new Date(2026, 10, 23, 12, 0, 0);

function availableSeats(filmId: string, date: string, time: string, count: number) {
	const day = buildSchedule(filmId, [], FIXED_NOW).find((item) => item.date === date);
	const seance = day?.seances.find((item) => item.time === time);
	if (!seance) throw new Error('Seance not found');

	const seats: Array<{ row: number; column: number }> = [];
	seance.hall.places.forEach((row, rowIndex) => {
		row.forEach((cell, columnIndex) => {
			if (cell.type === 'econom' || cell.type === 'comfort') {
				seats.push({ row: rowIndex + 1, column: columnIndex + 1 });
			}
		});
	});

	return seats.slice(0, count);
}

function makePayload(
	seats: Array<{ row: number; column: number }>,
	date: string,
	time: string,
	phone = '89990009999'
): CreateCinemaPaymentPayload {
	return {
		filmId: '1',
		person: {
			firstname: 'Иван',
			lastname: 'Иванов',
			middlename: 'Иванович',
			phone
		},
		debitCard: { pan: '1111 1111', expireDate: '11/11', cvv: '111' },
		seance: { date, time },
		tickets: seats
	};
}

describe('cinema store', () => {
	beforeEach(() => {
		resetCinemaStore();
	});

	it('creates a paid order and marks seats as paid', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const { date } = schedule[0];
		const { time } = schedule[0].seances[0];
		const seats = availableSeats('1', date, time, 2);

		const order = createPayment(makePayload(seats, date, time), FIXED_NOW);

		expect(order.status).toBe('paid');
		expect(order.tickets).toHaveLength(2);
		expect(order.tickets.every((ticket) => ticket.status === 'paid')).toBe(true);
		expect(order.orderNumber).toBeGreaterThanOrEqual(0);
		expect(getPaidSeats('1')).toEqual(seats.map((seat) => ({ ...seat, date, time })));

		const marked = buildSchedule('1', getPaidSeats('1'), FIXED_NOW);
		for (const seat of seats) {
			expect(marked[0].seances[0].hall.places[seat.row - 1][seat.column - 1].type).toBe('paid');
		}
	});

	it('creates a payment for the hall requested when times repeat', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const day = schedule[0];
		const duplicate = day.seances.find(
			(seance, index) => day.seances.findIndex((other) => other.time === seance.time) !== index
		);
		expect(duplicate).toBeDefined();

		const first = day.seances.find((seance) => seance.time === duplicate!.time)!;
		const second = duplicate!;

		let seat: { row: number; column: number } | undefined;
		second.hall.places.forEach((row, rowIndex) => {
			row.forEach((cell, columnIndex) => {
				const firstCell = first.hall.places[rowIndex]?.[columnIndex];
				if (!seat && firstCell?.type === 'blocked' && cell.type !== 'blocked') {
					seat = { row: rowIndex + 1, column: columnIndex + 1 };
				}
			});
		});
		expect(seat).toBeDefined();

		const payload = makePayload([seat!], day.date, duplicate!.time);
		payload.seance.hall = second.hall.name;

		const order = createPayment(payload, FIXED_NOW);

		expect(order.tickets[0]).toMatchObject({ row: seat!.row, column: seat!.column });
	});

	it('rejects already purchased seats', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const { date } = schedule[0];
		const { time } = schedule[0].seances[0];
		const [seat] = availableSeats('1', date, time, 1);

		createPayment(makePayload([seat], date, time), FIXED_NOW);

		expect(() => createPayment(makePayload([seat], date, time), FIXED_NOW)).toThrow(
			MockCinemaError
		);
	});

	it('rejects blocked, out-of-bounds and duplicate seats', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const { date } = schedule[0];
		const { time } = schedule[0].seances[0];
		const [seat] = availableSeats('1', date, time, 1);

		expect(() =>
			createPayment(makePayload([{ row: 1, column: 1 }], date, time), FIXED_NOW)
		).toThrow('недоступно');
		expect(() =>
			createPayment(makePayload([{ row: 100, column: 1 }], date, time), FIXED_NOW)
		).toThrow('не существует');
		expect(() => createPayment(makePayload([seat, seat], date, time), FIXED_NOW)).toThrow(
			'не должны повторяться'
		);
	});

	it('rejects an unknown seance', () => {
		expect(() =>
			createPayment(makePayload([{ row: 3, column: 1 }], '01.01.00', '10:00'), FIXED_NOW)
		).toThrow('Сеанс не найден');
	});

	it('filters orders by phone and cancels only the owner order', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const { date } = schedule[0];
		const { time } = schedule[0].seances[0];
		const [seat] = availableSeats('1', date, time, 1);
		const order = createPayment(makePayload([seat], date, time), FIXED_NOW);

		expect(listOrders('89990009999')).toHaveLength(1);
		expect(listOrders('+7 (999) 000-00-01')).toHaveLength(0);

		expect(() => cancelOrder(order._id, '89990009999')).not.toThrow();
		expect(getPaidSeats('1')).toHaveLength(0);

		const cancelled = listOrders('89990009999')[0];
		expect(cancelled.status).toBe('canceled');
		expect(cancelled.tickets[0].status).toBe('cancelled');

		expect(() => cancelOrder(order._id, '89990009999')).toThrow('нельзя отменить');
	});

	it('rejects cancelling an order belonging to another phone', () => {
		const schedule = buildSchedule('1', [], FIXED_NOW);
		const { date } = schedule[0];
		const { time } = schedule[0].seances[0];
		const [seat] = availableSeats('1', date, time, 1);
		const order = createPayment(makePayload([seat], date, time), FIXED_NOW);

		expect(() => cancelOrder(order._id, '89990000000')).toThrow('Заказ не найден');
	});
});
