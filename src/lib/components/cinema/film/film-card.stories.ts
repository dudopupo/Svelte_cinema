import type { Meta, StoryObj } from '@storybook/svelte';
import { sampleFilm } from '$lib/test/fixtures';
import FilmCard from './film-card.svelte';

const meta = {
	title: 'Cinema/Film/FilmCard',
	component: FilmCard,
	parameters: {
		layout: 'centered'
	},
	args: {
		film: sampleFilm
	},
	tags: ['autodocs']
} satisfies Meta<typeof FilmCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
	args: {
		variant: 'compact'
	}
};

export const Featured: Story = {
	args: {
		variant: 'featured'
	},
	parameters: {
		layout: 'padded'
	}
};

export const FeaturedWithActors: Story = {
	args: {
		variant: 'featured',
		showActors: true
	},
	parameters: {
		layout: 'padded'
	}
};
