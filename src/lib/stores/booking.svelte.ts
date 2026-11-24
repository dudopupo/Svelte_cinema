import type { CinemaOrder, Film, FilmHall } from '$lib/api/types';
import { MAX_BOOKING_SEATS, isBookableCell, type BookingStep, seatKey } from '$lib/utils/booking';

export interface BookingSeat {
	row: number;
	column: number;
	price: number;
}

export interface BookingContacts {
	firstname: string;
	lastname: string;
	middlename: string;
	phone: string;
	city: string;
	email: string;
}

export interface BookingInit {
	film: Film;
	date: string;
	time: string;
	hall: FilmHall;
	step: BookingStep;
	contacts: BookingContacts;
}

interface BookingDraft {
	filmId: string;
	date: string;
	time: string;
	hall: string;
	seats: BookingSeat[];
	contacts: BookingContacts;
	order: CinemaOrder | null;
}

export type SeatToggleResult = 'added' | 'removed' | 'unavailable' | 'limit';

const DRAFT_KEY = 'cinema-booking-draft';

export function emptyContacts(): BookingContacts {
	return {
		firstname: '',
		lastname: '',
		middlename: '',
		phone: '',
		city: '',
		email: ''
	};
}

function getSessionStorage(): Storage | null {
	if (typeof sessionStorage === 'undefined') return null;

	try {
		return sessionStorage;
	} catch {
		return null;
	}
}

export class BookingStore {
	film = $state<Film | null>(null);
	date = $state('');
	time = $state('');
	hall = $state<FilmHall | null>(null);
	step = $state<BookingStep>('seats');
	seats = $state<BookingSeat[]>([]);
	contacts = $state<BookingContacts>(emptyContacts());
	order = $state<CinemaOrder | null>(null);

	get total(): number {
		return this.seats.reduce((sum, seat) => sum + seat.price, 0);
	}

	get canContinue(): boolean {
		return this.seats.length > 0;
	}

	init({ film, date, time, hall, step, contacts }: BookingInit): void {
		this.film = film;
		this.date = date;
		this.time = time;
		this.hall = hall;
		this.step = step;
		this.seats = [];
		this.contacts = { ...emptyContacts(), ...contacts };
		this.order = null;
	}

	/**
	 * Restores the draft saved in sessionStorage. Returns the step the flow
	 * should display after restoring (may fall back to `seats`).
	 */
	restoreDraft(): BookingStep {
		const draft = this.readDraft();

		if (draft && this.matchesDraft(draft)) {
			this.seats = draft.seats.flatMap(({ row, column }) => {
				const cell = this.hall?.places[row - 1]?.[column - 1];
				if (!isBookableCell(cell)) return [];
				return [{ row, column, price: cell.price }];
			});

			this.contacts = { ...emptyContacts(), ...draft.contacts };
			this.order = draft.order;
		} else if (draft) {
			this.clearDraft();
		}

		this.step = this.resolveStep(this.step);
		this.persist();

		return this.step;
	}

	setStep(step: BookingStep): boolean {
		const resolved = this.resolveStep(step);
		if (resolved !== step) return false;

		this.step = resolved;
		this.persist();

		return true;
	}

	toggleSeat(row: number, column: number): SeatToggleResult {
		const cell = this.hall?.places[row - 1]?.[column - 1];
		if (!isBookableCell(cell)) return 'unavailable';

		const key = seatKey(row, column);
		const index = this.seats.findIndex((seat) => seatKey(seat.row, seat.column) === key);

		if (index !== -1) {
			this.seats.splice(index, 1);
			this.persist();
			return 'removed';
		}

		if (this.seats.length >= MAX_BOOKING_SEATS) return 'limit';

		this.seats.push({ row, column, price: cell.price });
		this.persist();

		return 'added';
	}

	removeSeat(row: number, column: number): void {
		const key = seatKey(row, column);
		const index = this.seats.findIndex((seat) => seatKey(seat.row, seat.column) === key);
		if (index === -1) return;

		this.seats.splice(index, 1);
		this.persist();
	}

	clearSeats(): void {
		if (this.seats.length === 0) return;

		this.seats = [];
		this.persist();
	}

	isSelected(row: number, column: number): boolean {
		const key = seatKey(row, column);
		return this.seats.some((seat) => seatKey(seat.row, seat.column) === key);
	}

	updateContacts(patch: Partial<BookingContacts>): void {
		this.contacts = { ...this.contacts, ...patch };
		this.persist();
	}

	complete(order: CinemaOrder): void {
		this.order = order;
		this.step = 'success';
		this.persist();
	}

	reset(): void {
		const storage = getSessionStorage();
		try {
			storage?.removeItem(DRAFT_KEY);
		} catch {
			// ignore persistence errors
		}

		this.seats = [];
		this.contacts = emptyContacts();
		this.order = null;
		this.step = 'seats';
	}

	private resolveStep(step: BookingStep): BookingStep {
		if (step === 'success') return this.order ? 'success' : 'seats';
		if (step !== 'seats' && this.seats.length === 0) return 'seats';
		return step;
	}

	private matchesDraft(draft: BookingDraft): boolean {
		return (
			draft.filmId === this.film?.id &&
			draft.date === this.date &&
			draft.time === this.time &&
			draft.hall === this.hall?.name
		);
	}

	private readDraft(): BookingDraft | null {
		const storage = getSessionStorage();
		if (!storage) return null;

		try {
			const raw = storage.getItem(DRAFT_KEY);
			if (!raw) return null;

			const parsed = JSON.parse(raw) as Partial<BookingDraft>;
			if (
				typeof parsed.filmId !== 'string' ||
				typeof parsed.date !== 'string' ||
				typeof parsed.time !== 'string' ||
				typeof parsed.hall !== 'string' ||
				!Array.isArray(parsed.seats)
			) {
				return null;
			}

			return {
				filmId: parsed.filmId,
				date: parsed.date,
				time: parsed.time,
				hall: parsed.hall,
				seats: parsed.seats.filter(
					(seat): seat is BookingSeat =>
						typeof seat?.row === 'number' &&
						typeof seat?.column === 'number' &&
						typeof seat?.price === 'number'
				),
				contacts: { ...emptyContacts(), ...parsed.contacts },
				order: parsed.order ?? null
			};
		} catch {
			return null;
		}
	}

	private persist(): void {
		const storage = getSessionStorage();
		if (!storage || !this.film || !this.hall) return;

		const draft: BookingDraft = {
			filmId: this.film.id,
			date: this.date,
			time: this.time,
			hall: this.hall.name,
			seats: this.seats,
			contacts: this.contacts,
			order: this.order
		};

		try {
			storage.setItem(DRAFT_KEY, JSON.stringify(draft));
		} catch {
			// ignore persistence errors
		}
	}

	private clearDraft(): void {
		const storage = getSessionStorage();
		try {
			storage?.removeItem(DRAFT_KEY);
		} catch {
			// ignore persistence errors
		}
	}
}
