import { describe, expect, it } from 'vitest';
import { profileFromUser, profileIssues, profilePayload } from './profile-form';

describe('profile form helpers', () => {
	it('maps a user to editable fields', () => {
		expect(
			profileFromUser({
				_id: '1',
				phone: '+7 999 123 45 67',
				firstname: 'Иван',
				lastname: 'Иванов',
				city: 'Москва'
			})
		).toEqual({
			lastname: 'Иванов',
			firstname: 'Иван',
			middlename: '',
			city: 'Москва',
			phone: '+7 999 123 45 67',
			email: ''
		});
	});

	it('validates the optional email only when it is filled', () => {
		const base = {
			lastname: '',
			firstname: '',
			middlename: '',
			city: '',
			phone: '+7 999 123 45 67',
			email: ''
		};

		expect(profileIssues(base)).toEqual({});
		expect(profileIssues({ ...base, email: 'ivan@mail' })).toEqual({ email: 'email' });
		expect(profileIssues({ ...base, email: 'ivan@mail.ru' })).toEqual({});
	});

	it('trims the payload and never sends the phone', () => {
		expect(
			profilePayload({
				lastname: ' Иванов ',
				firstname: ' Иван ',
				middlename: ' Иванович ',
				city: ' Москва ',
				phone: '+7 999 123 45 67',
				email: ' ivan@mail.ru '
			})
		).toEqual({
			lastname: 'Иванов',
			firstname: 'Иван',
			middlename: 'Иванович',
			city: 'Москва',
			email: 'ivan@mail.ru'
		});
	});
});
