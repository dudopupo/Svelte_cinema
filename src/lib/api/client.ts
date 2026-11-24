import type { BaseResponse } from './types';

export class ApiError extends Error {
	readonly status: number;
	readonly payload: Record<string, unknown>;

	constructor(reason: string, status: number, payload: Record<string, unknown>) {
		super(reason);
		this.name = 'ApiError';
		this.status = status;
		this.payload = payload;
	}
}

export type Fetcher = typeof globalThis.fetch;

export async function request<T extends BaseResponse>(
	path: string,
	init: RequestInit = {},
	fetcher: Fetcher = fetch
): Promise<T> {
	const headers = new Headers(init.headers);
	if (init.body !== undefined && !headers.has('content-type')) {
		headers.set('content-type', 'application/json');
	}
	headers.set('accept', 'application/json');

	const response = await fetcher(path, { ...init, headers });
	const data = (await response.json().catch(() => null)) as (T & BaseResponse) | null;

	if (!response.ok || !data || data.success === false) {
		const reason = data?.reason ?? `Ошибка запроса (${response.status})`;
		throw new ApiError(
			reason,
			response.status,
			(data ?? { success: false }) as unknown as Record<string, unknown>
		);
	}

	return data;
}
