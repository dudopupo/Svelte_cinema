<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ActorRow from '$lib/components/cinema/film/actor-row.svelte';
	import ScheduleSelector from '$lib/components/cinema/film/schedule-selector.svelte';
	import EmptyState from '$lib/components/cinema/shared/empty-state.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cinemaAsset } from '$lib/api/assets';
	import { m } from '$lib/paraglide/messages';
	import { filmRating, formatGenres } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const film = $derived(data.film);

	async function retry(): Promise<void> {
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>{film.name} — {m['app.name']()}</title>
	<meta name="description" content={film.description} />
	<meta property="og:title" content={film.name} />
	<meta property="og:description" content={film.description} />
	<meta property="og:image" content={cinemaAsset(film.img)} />
</svelte:head>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-[541fr_619fr] lg:items-start lg:gap-10">
	<div class="order-2 min-w-0 lg:order-1">
		{#if data.scheduleFailed}
			<EmptyState
				icon="alert"
				title={m['film.schedule-error']()}
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
		{:else if data.schedules.length === 0}
			<EmptyState
				icon="film"
				title={m['film.schedule-empty']()}
				description={m['film.schedule-empty-hint']()}
			>
				<Button
					href={resolve('/')}
					variant="secondary"
					class="h-12 rounded-full px-6 text-[14px] leading-[21px] font-medium"
				>
					{m['film.back-to-catalog']()}
				</Button>
			</EmptyState>
		{:else}
			<ScheduleSelector schedules={data.schedules} filmId={film.id} />
		{/if}
	</div>

	<article class="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
		<div class="flex flex-col gap-2 lg:gap-6">
			<div class="relative h-[235px] overflow-hidden rounded-3xl bg-muted lg:h-[369px]">
				<img
					src={cinemaAsset(film.img)}
					alt={film.name}
					class="size-full object-cover"
					loading="eager"
				/>
				<span
					class="absolute top-4 left-4 inline-flex h-8 min-w-[50px] items-center justify-center rounded-full bg-accent-primary px-4 text-[12px] leading-4 font-bold tracking-[0.18px] text-[#0b0b0b]"
				>
					{filmRating(film)}
				</span>
			</div>

			<div class="flex flex-col gap-0 lg:gap-1">
				<h1 class="text-title-md font-medium lg:text-title-lg lg:font-bold">{film.name}</h1>
				<p
					class="text-[14px] leading-[22px] font-medium text-muted-foreground lg:text-body-md lg:font-normal"
				>
					{formatGenres(film.genres)}
				</p>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<p class="text-body-sm text-foreground">{film.description}</p>

			<ActorRow actors={film.actors} class="hidden lg:flex" />
		</div>
	</article>
</div>
