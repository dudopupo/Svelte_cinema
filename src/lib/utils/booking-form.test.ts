import { describe, expect, it } from 'vitest';
import type { BookingContacts } from '$lib/stores/booking.svelte';
import {
	cardIssues,
	contactIssues,
	formatCardExpiry,
	formatCardPan,
	formatCvv,
	isEmailValid,
	isPhoneValid
} from './booking-form';

const validContacts: BookingContacts = {
	firstname: 'Иван',
	lastname: 'Иванов',
	middlename: 'Иванович',
	phone: '+7 999 999 99 99',
	city: 'Москва',
	email: 'ivan@mail.ru'
};

describe('booking form helpers', () => {
	it('validates phone and email', () => {
		expect(isPhoneValid('+7 999 999 99 99')).toBe(true);
		expect(isPhoneValid('123')).toBe(false);
		expect(isEmailValid('ivan@mail.ru')).toBe(true);
		expect(isEmailValid('ivan@mail')).toBe(false);
	});

	it('requires last name, first name, middle name and phone', () => {
		const issues = contactIssues({
			firstname: ' ',
			lastname: '',
			middlename: '',
			phone: '',
			city: '',
			email: ''
		});

		expect(issues).toEqual({
			lastname: 'required',
			firstname: 'required',
			middlename: 'required',
			phone: 'required'
		});
	});

	it('reports invalid phone and email but accepts optional blank city and email', () => {
		expect(contactIssues(validContacts)).toEqual({});
		expect(contactIssues({ ...validContacts, city: '', email: '' })).toEqual({});

		expect(contactIssues({ ...validContacts, phone: '123', email: 'ivan@mail' })).toEqual({
			phone: 'phone',
			email: 'email'
		});
	});

	it('formats card fields as they are typed', () => {
		expect(formatCardPan('1111111111111111')).toBe('1111 1111 1111 1111');
		expect(formatCardPan('1111 1111 1111 1111 9999')).toBe('1111 1111 1111 1111');
		expect(formatCardPan('1111abc2222')).toBe('1111 2222');

		expect(formatCardExpiry('1225')).toBe('12/25');
		expect(formatCardExpiry('12/25')).toBe('12/25');
		expect(formatCardExpiry('1')).toBe('1');
		expect(formatCardExpiry('123456')).toBe('12/34');

		expect(formatCvv('1a234')).toBe('123');
	});

	it('validates card fields', () => {
		expect(cardIssues({ pan: '', expireDate: '', cvv: '' })).toEqual({
			pan: 'required',
			expireDate: 'required',
			cvv: 'required'
		});

		expect(cardIssues({ pan: '1111 1111 1111 1111', expireDate: '12/25', cvv: '123' })).toEqual({});

		expect(cardIssues({ pan: '1111 1111', expireDate: '13/25', cvv: '12' })).toEqual({
			pan: 'pan',
			expireDate: 'expiry',
			cvv: 'cvv'
		});
	});
});
