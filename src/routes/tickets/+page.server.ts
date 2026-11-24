import { redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import { getCinemaOrders } from '$lib/api/cinema';
import { authUrl, requireUser } from '$lib/server/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	requireUser(locals.user, url);

	try {
		const { orders } = await getCinemaOrders(fetch);
		return { orders, loadFailed: false };
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			throw redirect(307, authUrl(url));
		}

		console.warn('[tickets] failed to load orders', error);
		return { orders: [], loadFailed: true };
	}
};
