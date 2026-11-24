import { beforeEach, describe, expect, it } from 'vitest';
import { sampleFilm, sampleHall, sampleOrder } from '$lib/test/fixtures';
import type { BookingStep } from '$lib/utils/booking';
import { BookingStore } from './booking.svelte';

function createStore(step: BookingStep = 'seats'): BookingStore {
	const store = new BookingStore();
	store.init({
		film: sampleFilm,
		date: '23.11.26',
		time: '12:15',
		hall: sampleHall,
		step,
		contacts: {
			firstname: 'Иван',
			lastname: 'Иванов',
			middlename: 'Иванович',
			phone: '+7 999 999 99 99',
			city: 'Москва',
			email: 'ivan@mail.ru'
		}
	});
	return store;
}

beforeEach(() => {
	sessionStorage.clear();
});

describe('BookingStore', () => {
	it('selects and removes seats with the hall price', () => {
		const store = createStore();

		expect(store.toggleSeat(1, 2)).toBe('added');
		expect(store.seats).toEqual([{ row: 1, column: 2, price: 300 }]);
		expect(store.total).toBe(300);
		expect(store.isSelected(1, 2)).toBe(true);

		expect(store.toggleSeat(1, 2)).toBe('removed');
		expect(store.seats).toHaveLength(0);
		expect(store.total).toBe(0);
	});

	it('ignores blocked and paid seats', () => {
		const store = createStore();

		expect(store.toggleSeat(1, 1)).toBe('unavailable');
		expect(store.toggleSeat(3, 2)).toBe('unavailable');
		expect(store.seats).toHaveLength(0);
	});

	it('limits the selection to ten seats', () => {
		const store = createStore();

		for (const [row, column] of [
			[1, 2],
			[1, 3],
			[1, 4],
			[2, 1],
			[2, 2],
			[2, 3],
			[2, 4],
			[2, 5],
			[3, 1],
			[3, 3]
		]) {
			expect(store.toggleSeat(row, column)).toBe('added');
		}

		expect(store.seats).toHaveLength(10);
		expect(store.toggleSeat(3, 4)).toBe('limit');
		expect(store.seats).toHaveLength(10);
	});

	it('clears every selected seat', () => {
		const store = createStore();
		store.toggleSeat(1, 2);
		store.toggleSeat(2, 3);

		store.clearSeats();

		expect(store.seats).toHaveLength(0);
		expect(store.total).toBe(0);
		expect(store.canContinue).toBe(false);
	});

	it('persists seats and contacts for the same seance', () => {
		const store = createStore();
		store.toggleSeat(1, 2);
		store.toggleSeat(2, 3);
		store.updateContacts({ phone: '+7 900 000 00 00' });
		store.setStep('review');

		const restored = createStore('review');
		expect(restored.restoreDraft()).toBe('review');
		expect(restored.seats).toEqual([
			{ row: 1, column: 2, price: 300 },
			{ row: 2, column: 3, price: 400 }
		]);
		expect(restored.contacts.phone).toBe('+7 900 000 00 00');
	});

	it('falls back to the seat step when no seats can be restored', () => {
		const store = createStore('review');

		expect(store.restoreDraft()).toBe('seats');
		expect(store.step).toBe('seats');
		expect(store.seats).toHaveLength(0);
	});

	it('ignores a draft from another seance', () => {
		const store = createStore();
		store.toggleSeat(1, 2);

		const other = new BookingStore();
		other.init({
			film: sampleFilm,
			date: '24.11.26',
			time: '18:00',
			hall: sampleHall,
			step: 'review',
			contacts: {
				firstname: '',
				lastname: '',
				middlename: '',
				phone: '',
				city: '',
				email: ''
			}
		});

		expect(other.restoreDraft()).toBe('seats');
		expect(other.seats).toHaveLength(0);
	});

	it('keeps contacts for the next steps', () => {
		const store = createStore();
		store.updateContacts({ firstname: 'Пётр', city: 'Казань' });

		expect(store.contacts.firstname).toBe('Пётр');
		expect(store.contacts.lastname).toBe('Иванов');
		expect(store.contacts.city).toBe('Казань');
	});

	it('restores the success step together with the paid order', () => {
		const store = createStore();
		store.toggleSeat(1, 2);
		store.complete(sampleOrder);

		const restored = createStore('success');
		expect(restored.restoreDraft()).toBe('success');
		expect(restored.order?._id).toBe(sampleOrder._id);
	});

	it('falls back to the seats when the success step has no order', () => {
		const store = createStore('success');

		expect(store.restoreDraft()).toBe('seats');
		expect(store.step).toBe('seats');
	});
});
