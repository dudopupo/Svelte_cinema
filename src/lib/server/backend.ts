import { env } from '$env/dynamic/private';

export const SESSION_COOKIE = 'session_token';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const BACKEND_URL = (env.BACKEND_URL || 'https://juniorsbootcamp.ru').replace(/\/+$/, '');

export function backendUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${BACKEND_URL}/api${normalized}`;
}

export interface BackendFetchOptions {
	method?: string;
	token?: string;
	body?: unknown;
	rawBody?: string;
	headers?: HeadersInit;
	signal?: AbortSignal;
}

export interface BackendResult<T = unknown> {
	ok: boolean;
	status: number;
	data: T;
	headers: Headers;
}

/** Reads the session token from the backend's `Set-Cookie` response header. */
export function extractSessionToken(headers: Headers): string | undefined {
	const cookies =
		typeof headers.getSetCookie === 'function'
			? headers.getSetCookie()
			: [headers.get('set-cookie') ?? ''];

	for (const cookie of cookies) {
		const match = cookie.match(new RegExp(`(?:^|[,\\s])${SESSION_COOKIE}=([^;]+)`));
		if (match?.[1]) return decodeURIComponent(match[1]);
	}

	return undefined;
}

export async function backendFetch<T = unknown>(
	path: string,
	{ method = 'GET', token, body, rawBody, headers, signal }: BackendFetchOptions = {}
): Promise<BackendResult<T>> {
	const requestHeaders = new Headers(headers);
	requestHeaders.set('accept', 'application/json');
	requestHeaders.set('x-application', 'web');

	if (body !== undefined || rawBody !== undefined)
		requestHeaders.set('content-type', 'application/json');
	if (token) {
		requestHeaders.set('authorization', `Bearer ${token}`);
		requestHeaders.set('cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}`);
	}

	const response = await fetch(backendUrl(path), {
		method,
		headers: requestHeaders,
		body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
		signal: signal ?? AbortSignal.timeout(15_000)
	});

	const text = await response.text();
	let data: unknown = null;

	if (text) {
		try {
			data = JSON.parse(text);
		} catch {
			data = text;
		}
	}

	return { ok: response.ok, status: response.status, data: data as T, headers: response.headers };
}
