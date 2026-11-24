import { request, type Fetcher } from './client';
import type {
	AuthOtpResponse,
	ProfileResponse,
	SignInPayload,
	SignInResponse,
	UpdateProfilePayload
} from './types';

export function requestOtp(phone: string, fetcher?: Fetcher) {
	return request<AuthOtpResponse>(
		'/api/auth/otp',
		{ method: 'POST', body: JSON.stringify({ phone }) },
		fetcher
	);
}

export function signIn(payload: SignInPayload, fetcher?: Fetcher) {
	return request<SignInResponse>(
		'/api/auth/sign-in',
		{ method: 'POST', body: JSON.stringify(payload) },
		fetcher
	);
}

export function signOut(fetcher?: Fetcher) {
	return request<{ success: boolean }>('/api/auth/sign-out', { method: 'POST' }, fetcher);
}

export function getMe(fetcher?: Fetcher) {
	return request<ProfileResponse>('/api/auth/me', { method: 'GET' }, fetcher);
}

export function updateProfile(payload: UpdateProfilePayload, fetcher?: Fetcher) {
	return request<ProfileResponse>(
		'/api/auth/me',
		{ method: 'PATCH', body: JSON.stringify(payload) },
		fetcher
	);
}
