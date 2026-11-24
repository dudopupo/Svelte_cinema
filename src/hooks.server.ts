import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { SESSION_COOKIE } from '$lib/server/backend';
import { getSessionProfile } from '$lib/server/session';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleSession: Handle = async ({ event, resolve }) => {
	event.locals.user = null;

	const token = event.cookies.get(SESSION_COOKIE);
	const isOwnAuthRoute =
		event.url.pathname.startsWith('/api/auth') || event.url.pathname.startsWith('/api/backend');

	if (token && !isOwnAuthRoute) {
		const profile = await getSessionProfile(token);
		if (profile.unauthorized) {
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		} else if (profile.user) {
			event.locals.user = profile.user;
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleSession);
