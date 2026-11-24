import { json } from '@sveltejs/kit';
import { buildSchedule, FILMS } from '$lib/server/mock-cinema/seed';
import { getPaidSeats } from '$lib/server/mock-cinema/store';

export function GET({ params }) {
	const film = FILMS.find((item) => item.id === params.filmId);
	if (!film) return json({ success: false, reason: 'Фильм не найден' }, { status: 400 });

	const schedules = buildSchedule(film.id, getPaidSeats(film.id));
	return json({ success: true, schedules });
}
