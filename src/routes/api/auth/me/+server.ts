import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ProfileResponse, UpdateProfilePayload } from '$lib/api/types';
import { backendFetch, SESSION_COOKIE } from '$lib/server/backend';
import { forgetSessionProfile, getSessionProfile } from '$lib/server/session';

const PROFILE_FIELDS = ['firstname', 'middlename', 'lastname', 'email', 'city'] as const;

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (!token) return json({ success: false, reason: 'Не авторизован' }, { status: 401 });

	const profile = await getSessionProfile(token);
	if (profile.unauthorized) {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return json({ success: false, reason: 'Не авторизован' }, { status: 401 });
	}
	if (!profile.user) {
		return json({ success: false, reason: 'Не удалось загрузить профиль' }, { status: 502 });
	}

	return json({ success: true, user: profile.user });
};

export const PATCH: RequestHandler = async ({ request, cookies, locals }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (!token) return json({ success: false, reason: 'Не авторизован' }, { status: 401 });

	let body: UpdateProfilePayload;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, reason: 'Некорректный запрос' }, { status: 400 });
	}

	const payload: UpdateProfilePayload = {};
	for (const field of PROFILE_FIELDS) {
		if (typeof body?.[field] === 'string') payload[field] = body[field]!.trim();
	}

	try {
		const result = await backendFetch<ProfileResponse>('/users/profile', {
			method: 'PATCH',
			token,
			body: payload
		});

		if (!result.ok || !result.data?.success) {
			return json(
				{ success: false, reason: result.data?.reason ?? 'Не удалось обновить профиль' },
				{ status: result.status }
			);
		}

		forgetSessionProfile(token);
		locals.user = result.data.user ?? locals.user;
		return json({ success: true, user: result.data.user ?? locals.user });
	} catch (error) {
		console.error('[auth] update profile failed', error);
		return json({ success: false, reason: 'Сервис недоступен' }, { status: 502 });
	}
};
