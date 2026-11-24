import { json } from '@sveltejs/kit';
import { FILMS } from '$lib/server/mock-cinema/seed';

export function GET() {
	return json({ success: true, films: FILMS });
}
