import { describe, expect, it } from 'vitest';
import {
	ageRatingLabel,
	filmRating,
	formatGenres,
	formatMoney,
	formatScheduleDate,
	formatSeanceDateTime,
	hallLabel
} from './format';

describe('format utilities', () => {
	it('formats money in rubles without decimals', () => {
		const formatted = formatMoney(1250);
		expect(formatted).toContain('1');
		expect(formatted).toContain('250');
		expect(formatted).toContain('₽');
	});

	it('capitalizes the first genre only', () => {
		expect(formatGenres(['фэнтези', 'приключения', 'боевик'])).toBe('Фэнтези, приключения, боевик');
	});

	it('formats schedule dates as a short russian weekday', () => {
		expect(formatScheduleDate('23.11.26')).toBe('Пн, 23 ноя');
		expect(formatScheduleDate('29.11.26')).toBe('Вс, 29 ноя');
	});

	it('keeps malformed dates untouched', () => {
		expect(formatScheduleDate('not-a-date')).toBe('not-a-date');
	});

	it('maps hall names to russian labels', () => {
		expect(hallLabel('Red')).toBe('Красный зал');
		expect(hallLabel('green')).toBe('Зелёный зал');
		expect(hallLabel('Blue')).toBe('Синий зал');
		expect(hallLabel('Красный зал')).toBe('Красный зал');
	});

	it('maps age ratings and picks the kinopoisk value', () => {
		expect(ageRatingLabel('pg13')).toBe('12+');
		expect(ageRatingLabel('nc17')).toBe('18+');
		expect(filmRating({ userRatings: { kinopoisk: '8.7', imdb: '8.8' } })).toBe('8.7');
	});

	it('combines date and time for a seance', () => {
		expect(formatSeanceDateTime('23.11.26', '12:15')).toBe('Пн, 23 ноя, 12:15');
	});
});
