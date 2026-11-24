import { error } from '@sveltejs/kit';
import { getFilm, getFilmSchedule } from '$lib/api/cinema';
import type { Film, FilmSchedule } from '$lib/api/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	let film: Film;

	try {
		const response = await getFilm(params.id, fetch);
		film = response.film;
	} catch (err) {
		console.warn('[film] failed to load film', params.id, err);
		throw error(404, 'Фильм не найден');
	}

	let schedules: FilmSchedule[] = [];
	let scheduleFailed = false;

	try {
		const response = await getFilmSchedule(params.id, fetch);
		schedules = response.schedules;
	} catch (err) {
		console.warn('[film] failed to load schedule', params.id, err);
		scheduleFailed = true;
	}

	return { film, schedules, scheduleFailed };
};
