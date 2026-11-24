import type { Film, Rating } from '$lib/api/types';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0
});

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const AGE_RATING_LABELS: Record<Rating, string> = {
	g: '0+',
	pg: '6+',
	pg13: '12+',
	r: '16+',
	nc17: '18+'
};

const HALL_LABELS: Record<string, string> = {
	red: 'Красный зал',
	green: 'Зелёный зал',
	blue: 'Синий зал'
};

export function capitalize(value: string): string {
	if (!value) return value;
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatMoney(value: number): string {
	return moneyFormatter.format(value);
}

export function formatGenres(genres: string[]): string {
	return capitalize(genres.join(', '));
}

export function formatScheduleDate(value: string): string {
	const match = /^(\d{2})\.(\d{2})\.(\d{2})$/.exec(value);
	if (!match) return value;

	const [, day, month, year] = match;
	const date = new Date(2000 + Number(year), Number(month) - 1, Number(day));

	return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function hallLabel(name: string): string {
	const key = name.trim().toLowerCase();
	if (HALL_LABELS[key]) return HALL_LABELS[key];
	return /зал$/i.test(name) ? name : `${name} зал`;
}

/** "Красный", "Зелёный", "Синий" — short hall name used on ticket cards. */
export function hallShortLabel(name: string): string {
	return hallLabel(name).replace(/\s+зал$/i, '');
}

export function ageRatingLabel(rating: Rating): string {
	return AGE_RATING_LABELS[rating] ?? '';
}

export function filmRating(film: Pick<Film, 'userRatings'>): string {
	return film.userRatings.kinopoisk || film.userRatings.imdb || '—';
}

export function formatSeanceDateTime(date: string, time: string): string {
	return `${formatScheduleDate(date)}, ${time}`;
}
