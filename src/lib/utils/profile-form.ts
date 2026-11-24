import type { UpdateProfilePayload, User } from '$lib/api/types';
import { isEmailValid } from './booking-form';

export interface ProfileFields {
	lastname: string;
	firstname: string;
	middlename: string;
	city: string;
	phone: string;
	email: string;
}

export type ProfileField = keyof ProfileFields;
export type ProfileIssues = Partial<Record<ProfileField, 'email'>>;

export function profileFromUser(user: User): ProfileFields {
	return {
		lastname: user.lastname ?? '',
		firstname: user.firstname ?? '',
		middlename: user.middlename ?? '',
		city: user.city ?? '',
		phone: user.phone ?? '',
		email: user.email ?? ''
	};
}

export function profileIssues(fields: ProfileFields): ProfileIssues {
	const issues: ProfileIssues = {};

	if (fields.email.trim() && !isEmailValid(fields.email)) {
		issues.email = 'email';
	}

	return issues;
}

export function profilePayload(fields: ProfileFields): UpdateProfilePayload {
	return {
		lastname: fields.lastname.trim(),
		firstname: fields.firstname.trim(),
		middlename: fields.middlename.trim(),
		city: fields.city.trim(),
		email: fields.email.trim()
	};
}
