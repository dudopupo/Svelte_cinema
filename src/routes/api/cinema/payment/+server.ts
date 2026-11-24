import { json } from '@sveltejs/kit';
import type { CreateCinemaPaymentPayload } from '$lib/api/types';
import { createPayment, MockCinemaError } from '$lib/server/mock-cinema/store';

export async function POST({ request }) {
	let payload: CreateCinemaPaymentPayload;

	try {
		payload = await request.json();
	} catch {
		return json({ success: false, reason: 'Некорректный запрос' }, { status: 400 });
	}

	try {
		const order = createPayment(payload);
		return json({ success: true, order });
	} catch (error) {
		if (error instanceof MockCinemaError) {
			return json(
				{ success: false, reason: error.message, ...error.payload },
				{ status: error.status }
			);
		}

		console.error('[cinema mock] payment failed', error);
		return json({ success: false, reason: 'Не удалось создать заказ' }, { status: 500 });
	}
}
