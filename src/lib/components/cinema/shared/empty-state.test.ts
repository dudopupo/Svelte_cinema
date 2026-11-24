import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import EmptyState from './empty-state.svelte';

describe('EmptyState', () => {
	it('renders the title and description', () => {
		render(EmptyState, { title: 'Фильмы не найдены', description: 'Загляните позже' });

		expect(
			screen.getByRole('heading', { level: 2, name: 'Фильмы не найдены' })
		).toBeInTheDocument();
		expect(screen.getByText('Загляните позже')).toBeInTheDocument();
	});

	it('hides the decorative icon from assistive technology', () => {
		const { container } = render(EmptyState, { title: 'Пусто' });

		expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
	});
});
