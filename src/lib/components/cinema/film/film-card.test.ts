import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { sampleFilm } from '$lib/test/fixtures';
import FilmCard from './film-card.svelte';

describe('FilmCard', () => {
	it('renders the film name, genres and rating', () => {
		render(FilmCard, { film: sampleFilm });

		expect(screen.getByRole('heading', { level: 2, name: sampleFilm.name })).toBeInTheDocument();
		expect(screen.getByText('Фантастика, драма, приключения')).toBeInTheDocument();
		expect(screen.getByText('8.7')).toBeInTheDocument();
	});

	it('links to the film page', () => {
		render(FilmCard, { film: sampleFilm });

		const links = screen.getAllByRole('link');
		expect(links.some((link) => link.getAttribute('href') === '/film/7')).toBe(true);
	});

	it('shows actors only when requested', () => {
		const { unmount } = render(FilmCard, { film: sampleFilm });
		expect(screen.queryByRole('heading', { name: 'Актёры' })).not.toBeInTheDocument();
		unmount();

		render(FilmCard, { film: sampleFilm, showActors: true });
		expect(screen.getByRole('heading', { name: 'Актёры' })).toBeInTheDocument();
		expect(screen.getByText('Энн Хэтэуэй')).toBeInTheDocument();
	});
});
