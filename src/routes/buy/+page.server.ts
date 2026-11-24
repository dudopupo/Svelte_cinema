import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { getFilm, getFilmSchedule } from '$lib/api/cinema';
import type { Film, FilmSchedule } from '$lib/api/types';
import { requireUser } from '$lib/server/guards';
import { parseBookingStep } from '$lib/utils/booking';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, locals }) => {
	const filmId = url.searchParams.get('filmId') ?? '';
	const date = url.searchParams.get('date') ?? '';
	const hallName = url.searchParams.get('hall') ?? '';
	const time = url.searchParams.get('time') ?? '';
	const step = parseBookingStep(url.searchParams.get('step'));

	if (!filmId || !date || !hallName || !time) {
		throw redirect(307, resolve('/'));
	}

	const user = requireUser(locals.user, url);

	let film: Film;
	let schedules: FilmSchedule[];

	try {
		[film, schedules] = await Promise.all([
			getFilm(filmId, fetch).then((response) => response.film),
			getFilmSchedule(filmId, fetch).then((response) => response.schedules)
		]);
	} catch (err) {
		console.warn('[buy] failed to load film or schedule', filmId, err);
		throw error(404, 'Фильм не найден');
	}

	const day = schedules.find((item) => item.date === date);
	const seance = day?.seances.find((item) => item.time === time && item.hall.name === hallName);

	if (!seance) {
		throw redirect(307, resolve('/film/[id]', { id: film.id }));
	}

	return {
		film,
		date,
		time,
		hall: seance.hall,
		step,
		contacts: {
			firstname: user.firstname ?? '',
			lastname: user.lastname ?? '',
			middlename: user.middlename ?? '',
			phone: user.phone,
			city: user.city ?? '',
			email: user.email ?? ''
		}
	};
};
