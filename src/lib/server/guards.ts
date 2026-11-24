import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { User } from '$lib/api/types';

export function authUrl(url: URL): string {
	const redirectTo = `${url.pathname}${url.search}`;
	return `${resolve('/auth')}?redirectTo=${encodeURIComponent(redirectTo)}`;
}

/** Server-side guard for pages that require an authenticated profile. */
export function requireUser(user: User | null | undefined, url: URL): User {
	if (!user) throw redirect(307, authUrl(url));
	return user;
}
