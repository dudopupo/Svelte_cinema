import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ActorAvatar from './actor-avatar.svelte';

describe('ActorAvatar', () => {
	it('falls back to initials when the photo fails to load', async () => {
		render(ActorAvatar, { photo: '/missing.webp', name: 'Лори Бартрам' });

		const image = document.querySelector('img');
		if (image) await fireEvent.error(image);

		expect(screen.getByText('ЛБ')).toBeInTheDocument();
		expect(document.querySelector('img')).toBeNull();
	});
});
