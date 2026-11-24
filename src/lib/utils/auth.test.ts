import { describe, expect, it } from 'vitest';
import {
	authPhoneDigits,
	formatAuthPhone,
	isAuthPhoneValid,
	isOtpCodeValid,
	retrySeconds,
	safeRedirectPath
} from './auth';

describe('auth helpers', () => {
	it('normalises Russian phone numbers', () => {
		expect(authPhoneDigits('+7 (999) 123-45-67')).toBe('79991234567');
		expect(authPhoneDigits('8 999 123 45 67')).toBe('79991234567');
		expect(authPhoneDigits('999 123 45 67')).toBe('79991234567');
	});

	it('formats a phone while typing', () => {
		expect(formatAuthPhone('')).toBe('');
		expect(formatAuthPhone('+7')).toBe('+7');
		expect(formatAuthPhone('7913')).toBe('+7 913');
		expect(formatAuthPhone('89131234567')).toBe('+7 913 123 45 67');
		expect(formatAuthPhone('9131234567')).toBe('+7 913 123 45 67');
	});

	it('validates a complete phone', () => {
		expect(isAuthPhoneValid('+7 913 123 45 67')).toBe(true);
		expect(isAuthPhoneValid('8 913 123 45 67')).toBe(true);
		expect(isAuthPhoneValid('+7 913 123 45')).toBe(false);
	});

	it('validates a six-digit OTP code', () => {
		expect(isOtpCodeValid('484041')).toBe(true);
		expect(isOtpCodeValid('48404')).toBe(false);
		expect(isOtpCodeValid('48404a')).toBe(false);
	});

	it('allows only local redirect targets', () => {
		expect(safeRedirectPath('/tickets')).toBe('/tickets');
		expect(safeRedirectPath('%2Ftickets%3Ftab%3Dhistory')).toBe('/tickets?tab=history');
		expect(safeRedirectPath('//evil.example')).toBe('/');
		expect(safeRedirectPath('https://evil.example')).toBe('/');
		expect(safeRedirectPath('/\\evil.example')).toBe('/');
		expect(safeRedirectPath('/auth')).toBe('/');
		expect(safeRedirectPath(null, '/profile')).toBe('/profile');
	});

	it('converts the backend retry delay to seconds', () => {
		expect(retrySeconds(120_000)).toBe(120);
		expect(retrySeconds(60_500)).toBe(61);
		expect(retrySeconds(undefined)).toBe(60);
		expect(retrySeconds(0)).toBe(60);
	});
});
