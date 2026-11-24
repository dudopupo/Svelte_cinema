import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { backendFetch } from '$lib/server/backend';

export const POST: RequestHandler = async ({ request }) => {
	let payload: { phone?: string };

	try {
		payload = await request.json();
	} catch {
		return json({ success: false, reason: 'Некорректный запрос' }, { status: 400 });
	}

	const phone = payload?.phone?.trim();
	if (!phone) return json({ success: false, reason: 'Укажите номер телефона' }, { status: 400 });

	try {
		const result = await backendFetch<{ success?: boolean; reason?: string; retryDelay?: number }>(
			'/otps/otp',
			{ method: 'POST', body: { phone } }
		);

		return json(result.data ?? { success: false, reason: 'Не удалось отправить код' }, {
			status: result.status
		});
	} catch (error) {
		console.error('[auth] create otp failed', error);
		return json({ success: false, reason: 'Сервис авторизации недоступен' }, { status: 502 });
	}
};
