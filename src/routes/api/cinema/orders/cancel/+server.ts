import { json } from '@sveltejs/kit';
import { cancelOrder, MockCinemaError } from '$lib/server/mock-cinema/store';

export async function PUT({ request, locals }) {
	if (!locals.user?.phone) {
		return json({ success: false, reason: 'Необходима авторизация' }, { status: 401 });
	}

	let payload: { orderId?: string };

	try {
		payload = await request.json();
	} catch {
		return json({ success: false, reason: 'Некорректный запрос' }, { status: 400 });
	}

	if (!payload?.orderId) {
		return json({ success: false, reason: 'Не указан заказ' }, { status: 400 });
	}

	try {
		cancelOrder(payload.orderId, locals.user.phone);
		return json({ success: true });
	} catch (error) {
		if (error instanceof MockCinemaError) {
			return json({ success: false, reason: error.message }, { status: error.status });
		}

		console.error('[cinema mock] cancel failed', error);
		return json({ success: false, reason: 'Не удалось отменить заказ' }, { status: 500 });
	}
}
