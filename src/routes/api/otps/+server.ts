import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';

/** Dev-only convenience page: shows the OTP codes the backend generated. */
export async function GET({ fetch }) {
	if (!dev) throw error(404, 'Not found');

	try {
		const response = await fetch(backendUrl('/otps'), {
			headers: { accept: 'text/html' },
			signal: AbortSignal.timeout(10_000)
		});

		if (!response.ok) {
			return new Response('Не удалось загрузить коды', { status: response.status });
		}

		return new Response(await response.text(), {
			headers: { 'content-type': 'text/html; charset=utf-8' }
		});
	} catch (cause) {
		console.error('[dev] failed to load otps', cause);
		return new Response('Сервис недоступен', { status: 502 });
	}
}
