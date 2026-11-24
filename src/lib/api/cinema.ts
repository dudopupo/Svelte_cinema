import { request, type Fetcher } from './client';
import type {
	CancelCinemaOrderPayload,
	CinemaOrdersResponse,
	CreateCinemaPaymentPayload,
	FilmResponse,
	FilmsResponse,
	PaymentResponse,
	ScheduleResponse
} from './types';

export function getFilms(fetcher?: Fetcher) {
	return request<FilmsResponse>('/api/cinema/films', { method: 'GET' }, fetcher);
}

export function getFilm(filmId: string, fetcher?: Fetcher) {
	return request<FilmResponse>(
		`/api/cinema/film/${encodeURIComponent(filmId)}`,
		{ method: 'GET' },
		fetcher
	);
}

export function getFilmSchedule(filmId: string, fetcher?: Fetcher) {
	return request<ScheduleResponse>(
		`/api/cinema/film/${encodeURIComponent(filmId)}/schedule`,
		{ method: 'GET' },
		fetcher
	);
}

export function createCinemaPayment(payload: CreateCinemaPaymentPayload, fetcher?: Fetcher) {
	return request<PaymentResponse>(
		'/api/cinema/payment',
		{ method: 'POST', body: JSON.stringify(payload) },
		fetcher
	);
}

export function getCinemaOrders(fetcher?: Fetcher) {
	return request<CinemaOrdersResponse>('/api/cinema/orders', { method: 'GET' }, fetcher);
}

export function cancelCinemaOrder(payload: CancelCinemaOrderPayload, fetcher?: Fetcher) {
	return request<{ success: boolean }>(
		'/api/cinema/orders/cancel',
		{ method: 'PUT', body: JSON.stringify(payload) },
		fetcher
	);
}
