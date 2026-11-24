<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import FilmCard from '$lib/components/cinema/film/film-card.svelte';
	import EmptyState from '$lib/components/cinema/shared/empty-state.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function retry(): Promise<void> {
		await invalidateAll();
	}

	type Film = PageData['films'][number];
	type Section = {
		heroes: Film[];
		compact: Film[];
		showActors: boolean;
	};

	function buildSections(films: Film[], size: number, heroes: number): Section[] {
		const result: Section[] = [];

		for (let index = 0; index < films.length; index += size) {
			const chunk = films.slice(index, index + size);
			result.push({
				heroes: chunk.slice(0, heroes),
				compact: chunk.slice(heroes),
				showActors: Math.floor(index / size) % 2 === 1
			});
		}

		return result;
	}

	const desktopSections = $derived(buildSections(data.films, 6, 2));
	const mobileSections = $derived(buildSections(data.films, 6, 1));
</script>

<svelte:head>
	<title>{m['catalog.title']()} — {m['app.name']()}</title>
</svelte:head>

<h1 class="sr-only">{m['catalog.title']()}</h1>

{#if data.loadFailed}
	<EmptyState
		icon="alert"
		title={m['catalog.load-error']()}
		description={m['catalog.load-error-hint']()}
	>
		<Button
			type="button"
			variant="secondary"
			class="h-12 rounded-full px-6 text-[14px] leading-[21px] font-medium"
			onclick={retry}
		>
			{m['common.retry']()}
		</Button>
	</EmptyState>
{:else if data.films.length === 0}
	<EmptyState icon="search" title={m['catalog.empty']()} description={m['catalog.empty-hint']()} />
{:else}
	<section class="hidden flex-col gap-10 md:flex" aria-label={m['catalog.all']()}>
		{#each desktopSections as section, sectionIndex (sectionIndex)}
			<div class="flex flex-col gap-10">
				<div class="grid grid-cols-2 gap-10">
					{#each section.heroes as film (film.id)}
						<FilmCard {film} variant="featured" showActors={section.showActors} />
					{/each}
				</div>

				{#if section.compact.length > 0}
					<div class="grid grid-cols-4 gap-6">
						{#each section.compact as film (film.id)}
							<FilmCard {film} />
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</section>

	<section class="flex flex-col gap-10 md:hidden" aria-label={m['catalog.all']()}>
		{#each mobileSections as section, sectionIndex (sectionIndex)}
			<div class="flex flex-col gap-10">
				{#each section.heroes as film (film.id)}
					<FilmCard {film} variant="featured" showActors={section.showActors} />
				{/each}

				{#if section.compact.length > 0}
					<div class="scrollbar-none flex gap-3 overflow-x-auto">
						{#each section.compact as film (film.id)}
							<FilmCard {film} class="w-[235px] shrink-0" />
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</section>
{/if}
