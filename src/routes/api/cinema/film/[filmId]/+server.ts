import { json } from '@sveltejs/kit';
import { FILMS } from '$lib/server/mock-cinema/seed';

export function GET({ params }) {
	const film = FILMS.find((item) => item.id === params.filmId);
	if (!film) return json({ success: false, reason: 'Фильм не найден' }, { status: 400 });

	return json({ success: true, film });
}
