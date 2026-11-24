import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SignInResponse, User } from '$lib/api/types';
import {
	backendFetch,
	extractSessionToken,
	SESSION_COOKIE,
	SESSION_MAX_AGE
} from '$lib/server/backend';

export const POST: RequestHandler = async ({ request, cookies }) => {
	let payload: { phone?: string; code?: string | number };

	try {
		payload = await request.json();
	} catch {
		return json({ success: false, reason: 'Некорректный запрос' }, { status: 400 });
	}

	const phone = payload?.phone?.trim();
	const code = Number(payload?.code);

	if (!phone || !Number.isFinite(code)) {
		return json({ success: false, reason: 'Укажите телефон и код' }, { status: 400 });
	}

	try {
		const result = await backendFetch<SignInResponse>('/auth/sign-in', {
			method: 'POST',
			body: { phone, code }
		});

		const token = result.data?.token ?? extractSessionToken(result.headers);
		const user: User | undefined = result.data?.user;

		if (!result.ok || !result.data?.success || !token) {
			return json(
				{ success: false, reason: result.data?.reason ?? 'Неверный код' },
				{ status: result.status === 200 ? 400 : result.status }
			);
		}

		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});

		return json({ success: true, user });
	} catch (error) {
		console.error('[auth] sign-in failed', error);
		return json({ success: false, reason: 'Сервис авторизации недоступен' }, { status: 502 });
	}
};
