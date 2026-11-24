import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { backendFetch, SESSION_COOKIE } from '$lib/server/backend';
import { forgetSessionProfile } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);

	if (token) {
		try {
			await backendFetch('/auth/sign-out', { method: 'POST', token });
		} catch (error) {
			console.warn('[auth] backend sign-out failed', error);
		} finally {
			forgetSessionProfile(token);
		}
	}

	cookies.delete(SESSION_COOKIE, { path: '/' });

	return json({ success: true });
};
