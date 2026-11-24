export const BACKEND_ORIGIN = 'https://juniorsbootcamp.ru';
export const CINEMA_ASSET_ORIGIN = `${BACKEND_ORIGIN}/api`;

/**
 * Film posters and staff photos are served by the bootcamp backend. The cinema
 * contract returns paths like `/static/images/cinema/films/warcraft.webp`.
 */
export function cinemaAsset(path: string | undefined | null): string {
	if (!path) return '';
	if (/^https?:\/\//i.test(path)) return path;
	return `${CINEMA_ASSET_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
