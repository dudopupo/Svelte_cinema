const DEFAULT_RETRY_SECONDS = 60;

/** Keeps only the digits of a Russian phone number and normalises it to 7XXXXXXXXXX. */
export function authPhoneDigits(value: string): string {
	const digits = value.replace(/\D/g, '');
	if (!digits) return '';

	const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
	const withCountry = normalized.startsWith('7') ? normalized : `7${normalized}`;

	return withCountry.slice(0, 11);
}

export function formatAuthPhone(value: string): string {
	const digits = authPhoneDigits(value);
	if (!digits) return '';

	const rest = digits.slice(1);
	const groups = [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6, 8), rest.slice(8, 10)].filter(
		Boolean
	);

	return groups.length > 0 ? `+7 ${groups.join(' ')}` : '+7';
}

export function isAuthPhoneValid(value: string): boolean {
	return authPhoneDigits(value).length === 11;
}

export function isOtpCodeValid(value: string): boolean {
	return /^\d{6}$/.test(value.trim());
}

/**
 * Only same-origin absolute paths are allowed after sign-in. Protocol-relative
 * and backslash paths are rejected to avoid open redirects.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
	if (!value) return fallback;

	let decoded: string;
	try {
		decoded = decodeURIComponent(value);
	} catch {
		return fallback;
	}

	if (
		!decoded.startsWith('/') ||
		decoded.startsWith('//') ||
		decoded.startsWith('/auth') ||
		decoded.includes('\\')
	) {
		return fallback;
	}

	return decoded;
}

/** Converts the backend `retryDelay` (milliseconds) into whole seconds. */
export function retrySeconds(
	delayMs: number | null | undefined,
	fallback = DEFAULT_RETRY_SECONDS
): number {
	if (!delayMs || !Number.isFinite(delayMs) || delayMs <= 0) return fallback;
	return Math.max(1, Math.ceil(delayMs / 1000));
}
