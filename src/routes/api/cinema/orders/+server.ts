import { json } from '@sveltejs/kit';
import { listOrders } from '$lib/server/mock-cinema/store';

export function GET({ locals }) {
	if (!locals.user?.phone) {
		return json({ success: false, reason: 'Необходима авторизация' }, { status: 401 });
	}

	return json({ success: true, orders: listOrders(locals.user.phone) });
}
