import type { BookingContacts } from '$lib/stores/booking.svelte';

export type ContactField = keyof BookingContacts;
export type ContactIssue = 'required' | 'phone' | 'email';
export type ContactIssues = Partial<Record<ContactField, ContactIssue>>;

export interface CardFields {
	pan: string;
	expireDate: string;
	cvv: string;
}

export type CardField = keyof CardFields;
export type CardIssue = 'required' | 'pan' | 'expiry' | 'cvv';
export type CardIssues = Partial<Record<CardField, CardIssue>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVV_PATTERN = /^\d{3}$/;

export function phoneDigits(value: string): string {
	return value.replace(/\D/g, '');
}

export function isPhoneValid(value: string): boolean {
	return phoneDigits(value).length >= 10;
}

export function isEmailValid(value: string): boolean {
	return EMAIL_PATTERN.test(value.trim());
}

export function contactIssues(contacts: BookingContacts): ContactIssues {
	const issues: ContactIssues = {};

	if (!contacts.lastname.trim()) issues.lastname = 'required';
	if (!contacts.firstname.trim()) issues.firstname = 'required';
	if (!contacts.middlename.trim()) issues.middlename = 'required';

	if (!contacts.phone.trim()) {
		issues.phone = 'required';
	} else if (!isPhoneValid(contacts.phone)) {
		issues.phone = 'phone';
	}

	if (contacts.email.trim() && !isEmailValid(contacts.email)) {
		issues.email = 'email';
	}

	return issues;
}

export function formatCardPan(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 16);
	return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function formatCardExpiry(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 4);
	if (digits.length <= 2) return digits;
	return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(value: string): string {
	return value.replace(/\D/g, '').slice(0, 3);
}

export function cardIssues(card: CardFields): CardIssues {
	const issues: CardIssues = {};

	if (!card.pan.trim()) {
		issues.pan = 'required';
	} else if (phoneDigits(card.pan).length !== 16) {
		issues.pan = 'pan';
	}

	if (!card.expireDate.trim()) {
		issues.expireDate = 'required';
	} else if (!EXPIRY_PATTERN.test(card.expireDate.trim())) {
		issues.expireDate = 'expiry';
	}

	if (!card.cvv.trim()) {
		issues.cvv = 'required';
	} else if (!CVV_PATTERN.test(card.cvv.trim())) {
		issues.cvv = 'cvv';
	}

	return issues;
}
