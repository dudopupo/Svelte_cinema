import { describe, expect, it } from 'vitest';
import {
	bookingStepIndex,
	bookingStepUrl,
	isBookableCell,
	parseBookingStep,
	seatKey
} from './booking';

describe('booking utils', () => {
	it('parses known steps and falls back to seats', () => {
		expect(parseBookingStep('seats')).toBe('seats');
		expect(parseBookingStep('review')).toBe('review');
		expect(parseBookingStep('payment')).toBe('payment');
		expect(parseBookingStep('unknown')).toBe('seats');
		expect(parseBookingStep(null)).toBe('seats');
	});

	it('builds a step url while preserving seance parameters', () => {
		const url = new URL('http://localhost/buy?filmId=7&date=23.11.26&hall=Blue&step=review');

		expect(bookingStepUrl(url, 'contacts')).toBe(
			'/buy?filmId=7&date=23.11.26&hall=Blue&step=contacts'
		);
	});

	it('computes zero-based flow indexes', () => {
		expect(bookingStepIndex('seats')).toBe(0);
		expect(bookingStepIndex('review')).toBe(1);
		expect(bookingStepIndex('contacts')).toBe(2);
		expect(bookingStepIndex('payment')).toBe(3);
		expect(bookingStepIndex('success')).toBe(3);
	});

	it('creates stable seat keys', () => {
		expect(seatKey(2, 11)).toBe('2:11');
	});

	it('treats only economy and comfort cells as bookable', () => {
		expect(isBookableCell({ price: 100, type: 'econom' })).toBe(true);
		expect(isBookableCell({ price: 200, type: 'comfort' })).toBe(true);
		expect(isBookableCell({ price: 0, type: 'blocked' })).toBe(false);
		expect(isBookableCell({ price: 100, type: 'paid' })).toBe(false);
		expect(isBookableCell(undefined)).toBe(false);
	});
});
