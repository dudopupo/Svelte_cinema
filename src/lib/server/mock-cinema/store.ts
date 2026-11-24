import type {
	CinemaOrder,
	CinemaTicket,
	CreateCinemaPaymentPayload,
	FilmPerson
} from '$lib/api/types';
import { FILMS, findSeance } from './seed';

export class MockCinemaError extends Error {
	readonly status: number;
	readonly payload: Record<string, unknown>;

	constructor(reason: string, status = 400, payload: Record<string, unknown> = {}) {
		super(reason);
		this.name = 'MockCinemaError';
		this.status = status;
		this.payload = payload;
	}
}

interface CinemaStore {
	orders: CinemaOrder[];
}

const globalStore = globalThis as typeof globalThis & {
	__svelteCinemaStore?: CinemaStore;
};

const store: CinemaStore = (globalStore.__svelteCinemaStore ??= { orders: [] });

function createId(): string {
	return crypto.randomUUID().replaceAll('-', '').slice(0, 24);
}

function normalizePhone(phone: string): string {
	return phone.replace(/\D/g, '');
}

export function isSamePhone(left: string, right: string): boolean {
	const a = normalizePhone(left);
	const b = normalizePhone(right);
	if (!a || !b) return false;
	if (a === b) return true;
	return a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10);
}

export function getPaidSeats(filmId: string) {
	return store.orders
		.filter((order) => order.film.id === filmId && order.status === 'paid')
		.flatMap((order) =>
			order.tickets
				.filter((ticket) => ticket.status === 'paid')
				.map((ticket) => ({
					date: ticket.seance.date,
					time: ticket.seance.time,
					row: ticket.row,
					column: ticket.column
				}))
		);
}

export function listOrders(phone: string): CinemaOrder[] {
	return store.orders
		.filter((order) => isSamePhone(order.person.phone, phone))
		.sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))
		.map((order) => structuredClone(order));
}

export function findOrder(orderId: string): CinemaOrder | undefined {
	return store.orders.find((order) => order._id === orderId);
}

function validatePerson(person: FilmPerson): FilmPerson {
	const cleaned: FilmPerson = {
		firstname: person?.firstname?.trim() ?? '',
		lastname: person?.lastname?.trim() ?? '',
		middlename: person?.middlename?.trim() || undefined,
		phone: person?.phone?.trim() ?? ''
	};

	if (!cleaned.firstname || !cleaned.lastname || !cleaned.phone) {
		throw new MockCinemaError('Заполните имя, фамилию и телефон');
	}
	if (normalizePhone(cleaned.phone).length < 10) {
		throw new MockCinemaError('Некорректный номер телефона');
	}

	return cleaned;
}

export function createPayment(payload: CreateCinemaPaymentPayload, now = new Date()): CinemaOrder {
	const film = FILMS.find((item) => item.id === String(payload.filmId));
	if (!film) throw new MockCinemaError('Фильм не найден');

	const seance = findSeance(String(payload.filmId), payload.seance?.date, payload.seance?.time, {
		hall: payload.seance?.hall,
		now
	});
	if (!seance) throw new MockCinemaError('Сеанс не найден');

	const person = validatePerson(payload.person);

	if (!Array.isArray(payload.tickets) || payload.tickets.length === 0) {
		throw new MockCinemaError('Выберите хотя бы одно место');
	}
	if (payload.tickets.length > 10) {
		throw new MockCinemaError('За один раз можно купить не больше 10 билетов');
	}

	const paidSeats = getPaidSeats(film.id).filter(
		(seat) => seat.date === payload.seance.date && seat.time === payload.seance.time
	);

	const occupied = new Set(paidSeats.map((seat) => `${seat.row}:${seat.column}`));
	const uniqueRequested = new Set<string>();

	for (const requested of payload.tickets) {
		const row = Number(requested?.row);
		const column = Number(requested?.column);

		if (!Number.isInteger(row) || !Number.isInteger(column) || row < 1 || column < 1) {
			throw new MockCinemaError('Некорректное место');
		}

		const key = `${row}:${column}`;
		if (uniqueRequested.has(key)) {
			throw new MockCinemaError('Места не должны повторяться');
		}
		uniqueRequested.add(key);

		const cell = seance.hall.places[row - 1]?.[column - 1];
		if (!cell) throw new MockCinemaError(`Места ${row}:${column} не существует`);
		if (cell.type === 'blocked') {
			throw new MockCinemaError(`Место ${row}:${column} недоступно`);
		}
		if (cell.type === 'paid' || occupied.has(key)) {
			throw new MockCinemaError(`Место ${row}:${column} уже куплено`);
		}
	}

	const timestamp = now.toISOString();
	const orderId = createId();
	const order: CinemaOrder = {
		_id: orderId,
		film: structuredClone(film),
		orderNumber: Math.floor(Math.random() * 1_000_000),
		tickets: [],
		person,
		status: 'paid',
		created: timestamp,
		updated: timestamp
	};

	const tickets: CinemaTicket[] = payload.tickets.map(({ row, column }) => ({
		_id: createId(),
		filmId: film.id,
		orderId,
		row: Number(row),
		column: Number(column),
		seance: { date: payload.seance.date, time: payload.seance.time, hall: seance.hall.name },
		phone: person.phone,
		status: 'paid',
		created: timestamp,
		updated: timestamp
	}));

	order.tickets = tickets;
	store.orders.push(order);

	return structuredClone(order);
}

export function cancelOrder(orderId: string, phone: string): CinemaOrder {
	const order = findOrder(orderId);
	if (!order) throw new MockCinemaError('Заказ не найден');
	if (!isSamePhone(order.person.phone, phone)) throw new MockCinemaError('Заказ не найден');
	if (order.status !== 'paid') throw new MockCinemaError('Заказ нельзя отменить');

	const timestamp = new Date().toISOString();
	order.status = 'canceled';
	order.updated = timestamp;
	for (const ticket of order.tickets) {
		if (ticket.status !== 'paid') continue;
		ticket.status = 'cancelled';
		ticket.updated = timestamp;
	}

	return structuredClone(order);
}

export function resetCinemaStore(): void {
	store.orders = [];
}
