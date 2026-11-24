import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { backendFetch, SESSION_COOKIE } from '$lib/server/backend';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

const proxy: RequestHandler = async ({ request, params, url, cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	const segments = (params.path ?? '').split('/').filter(Boolean);

	if (segments.some((segment) => segment === '..' || segment === '.')) {
		return json({ success: false, reason: 'Некорректный путь' }, { status: 400 });
	}

	const method = request.method.toUpperCase();
	if (!ALLOWED_METHODS.has(method)) {
		return json({ success: false, reason: 'Метод не поддерживается' }, { status: 405 });
	}

	const path = `/${segments.join('/')}${url.search}`;
	const rawBody =
		method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
			? undefined
			: await request.text();

	try {
		const result = await backendFetch<unknown>(path, {
			method,
			token,
			rawBody: rawBody || undefined
		});

		return json(result.data ?? { success: false, reason: 'Пустой ответ сервера' }, {
			status: result.status
		});
	} catch (error) {
		console.error('[backend proxy] request failed', error);
		return json({ success: false, reason: 'Сервис недоступен' }, { status: 502 });
	}
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
