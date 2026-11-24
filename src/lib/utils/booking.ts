import type { FilmHallCell } from '$lib/api/types';

export const BOOKING_STEPS = ['seats', 'review', 'contacts', 'payment', 'success'] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

export const BOOKING_FLOW_STEPS = ['seats', 'review', 'contacts', 'payment'] as const;
export type BookingFlowStep = (typeof BOOKING_FLOW_STEPS)[number];

export const MAX_BOOKING_SEATS = 10;

export function isBookingStep(value: string | null): value is BookingStep {
	return BOOKING_STEPS.includes(value as BookingStep);
}

export function parseBookingStep(value: string | null): BookingStep {
	return isBookingStep(value) ? value : 'seats';
}

export interface BookingPageState {
	bookingStep?: BookingStep;
}

/**
 * `replaceState` updates the browser URL but not `page.url`, so the current
 * step is mirrored into `page.state` for components that live outside the page.
 */
export function bookingStepFromPage(url: URL, state: unknown): BookingStep {
	const stored = (state as BookingPageState | null)?.bookingStep;

	return typeof stored === 'string' && isBookingStep(stored)
		? stored
		: parseBookingStep(url.searchParams.get('step'));
}

export function isFlowStep(step: BookingStep): step is BookingFlowStep {
	return step !== 'success';
}

/** 0-based position inside the four-step flow; `success` is treated as the last step. */
export function bookingStepIndex(step: BookingStep): number {
	const index = BOOKING_FLOW_STEPS.indexOf(step as BookingFlowStep);
	return index === -1 ? BOOKING_FLOW_STEPS.length - 1 : index;
}

export function bookingStepSearch(url: URL, step: BookingStep): string {
	const params = new URLSearchParams(url.search);
	params.set('step', step);
	return params.toString();
}

export function bookingStepUrl(url: URL, step: BookingStep): string {
	return `${url.pathname}?${bookingStepSearch(url, step)}`;
}

export function seatKey(row: number, column: number): string {
	return `${row}:${column}`;
}

export function isBookableCell(cell: FilmHallCell | undefined): cell is FilmHallCell {
	return cell?.type === 'econom' || cell?.type === 'comfort';
}
