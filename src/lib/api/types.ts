export type Rating = 'g' | 'pg' | 'pg13' | 'r' | 'nc17';
export type Profession = 'actor' | 'director';

export interface Country {
	id: number;
	code: string;
	code2: string;
	name: string;
}

export interface FilmStaff {
	id: string;
	professions: Profession[];
	fullName: string;
	photo: string;
}

export interface FilmUserRating {
	kinopoisk: string;
	imdb: string;
}

export interface Film {
	id: string;
	name: string;
	originalName: string;
	description: string;
	releaseDate: string;
	actors: FilmStaff[];
	directors: FilmStaff[];
	runtime: number;
	ageRating: Rating;
	genres: string[];
	userRatings: FilmUserRating;
	img: string;
	country?: Country;
}

export type FilmHallCellType = 'econom' | 'comfort' | 'blocked' | 'paid';

export interface FilmHallCell {
	price: number;
	type: FilmHallCellType;
}

export interface FilmHall {
	name: string;
	places: FilmHallCell[][];
}

export interface FilmSeance {
	time: string;
	hall: FilmHall;
}

export interface FilmSchedule {
	date: string;
	seances: FilmSeance[];
}

export type CinemaTicketStatus = 'paid' | 'cancelled';
export type CinemaOrderStatus = 'paid' | 'canceled';

export interface FilmPerson {
	firstname: string;
	lastname: string;
	middlename?: string;
	phone: string;
}

export interface CinemaTicket {
	_id: string;
	filmId: string;
	orderId: string;
	row: number;
	column: number;
	seance: { date: string; time: string; hall?: string };
	phone: string;
	status: CinemaTicketStatus;
	created?: string;
	updated?: string;
}

export interface CinemaOrder {
	_id: string;
	film: Film;
	orderNumber: number;
	tickets: CinemaTicket[];
	person: FilmPerson;
	status: CinemaOrderStatus;
	created?: string;
	updated?: string;
}

export interface User {
	_id: string;
	phone: string;
	firstname?: string;
	middlename?: string;
	lastname?: string;
	email?: string;
	city?: string;
}

export interface Card {
	_id: string;
	phone: string;
	panMasked: string;
	expiry: string;
	cryptoPacket?: string | null;
}

export interface BaseResponse {
	success: boolean;
	reason?: string;
}

export interface FilmsResponse extends BaseResponse {
	films: Film[];
}

export interface FilmResponse extends BaseResponse {
	film: Film;
}

export interface ScheduleResponse extends BaseResponse {
	schedules: FilmSchedule[];
}

export interface PaymentResponse extends BaseResponse {
	order: CinemaOrder;
}

export interface CinemaOrdersResponse extends BaseResponse {
	orders: CinemaOrder[];
}

export interface CreateCinemaPaymentPayload {
	filmId: string;
	person: FilmPerson;
	debitCard: {
		pan: string;
		expireDate: string;
		cvv: string;
	};
	seance: { date: string; time: string; hall?: string };
	tickets: Array<{ row: number; column: number }>;
}

export interface CancelCinemaOrderPayload {
	orderId: string;
}

export interface AuthOtpResponse extends BaseResponse {
	retryDelay?: number;
}

export interface SignInPayload {
	phone: string;
	code: number | string;
}

export interface SignInResponse extends BaseResponse {
	token?: string;
	user: User;
}

export interface ProfileResponse extends BaseResponse {
	user: User;
}

export interface UpdateProfilePayload {
	firstname?: string;
	middlename?: string;
	lastname?: string;
	email?: string;
	city?: string;
}
