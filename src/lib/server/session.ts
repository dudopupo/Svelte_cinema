import type { User } from '$lib/api/types';
import { backendFetch } from './backend';

interface ProfileCacheEntry {
	user: User;
	expires: number;
}

const profileCache = new Map<string, ProfileCacheEntry>();
const CACHE_TTL = 30_000;

export interface SessionProfileResult {
	user?: User;
	unauthorized: boolean;
}

export async function getSessionProfile(token: string): Promise<SessionProfileResult> {
	const cached = profileCache.get(token);
	if (cached && cached.expires > Date.now()) return { user: cached.user, unauthorized: false };

	try {
		const result = await backendFetch<{ success?: boolean; user?: User }>('/users/profile', {
			token
		});

		if (result.status === 401 || result.status === 400) {
			profileCache.delete(token);
			return { unauthorized: true };
		}

		if (result.ok && result.data?.success && result.data.user) {
			profileCache.set(token, { user: result.data.user, expires: Date.now() + CACHE_TTL });
			return { user: result.data.user, unauthorized: false };
		}
	} catch (error) {
		console.warn('[auth] failed to load profile', error);
	}

	return { unauthorized: false };
}

export function forgetSessionProfile(token: string): void {
	profileCache.delete(token);
}
