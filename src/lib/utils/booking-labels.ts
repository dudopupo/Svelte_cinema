import { m } from '$lib/paraglide/messages';
import type { BookingStep } from './booking';

export function bookingStepLabel(step: BookingStep): string {
	switch (step) {
		case 'seats':
			return m['buy.pick-seats.title']();
		case 'review':
			return m['buy.review-tickets.title']();
		case 'contacts':
			return m['buy.contacts.title']();
		case 'payment':
			return m['buy.pay.card-title']();
		case 'success':
			return m['buy.payed.success']();
	}
}
