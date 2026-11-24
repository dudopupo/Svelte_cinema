import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { safeRedirectPath } from '$lib/utils/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const redirectTo = safeRedirectPath(url.searchParams.get('redirectTo'), resolve('/'));

	if (locals.user) {
		throw redirect(307, redirectTo);
	}

	return { redirectTo };
};
