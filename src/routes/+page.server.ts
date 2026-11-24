import { getFilms } from '$lib/api/cinema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	try {
		const response = await getFilms(fetch);
		setHeaders({ 'cache-control': 'public, max-age=60' });
		return { films: response.films, loadFailed: false };
	} catch (error) {
		console.error('[catalog] failed to load films', error);
		return { films: [], loadFailed: true };
	}
};
