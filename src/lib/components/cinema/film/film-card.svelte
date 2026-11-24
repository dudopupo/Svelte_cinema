<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Film } from '$lib/api/types';
	import { cinemaAsset } from '$lib/api/assets';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { cn } from '$lib/utils.js';
	import { filmRating, formatGenres } from '$lib/utils/format';
	import ActorRow from './actor-row.svelte';

	let {
		film,
		variant = 'compact',
		showActors = false,
		class: className
	}: {
		film: Film;
		variant?: 'featured' | 'compact';
		showActors?: boolean;
		class?: string;
	} = $props();

	const href = $derived(resolve('/film/[id]', { id: film.id }));
	const featured = $derived(variant === 'featured');
</script>

<article class={cn('flex flex-col gap-2 md:gap-4', className)} aria-label={film.name}>
	<div class="relative">
		<a
			{href}
			class={cn(
				'group block shrink-0 overflow-hidden rounded-3xl bg-muted',
				featured ? 'h-[235px] md:h-[455px]' : 'h-[235px]'
			)}
			aria-label={`${film.name} — ${m['button.details']()}`}
		>
			<img
				src={cinemaAsset(film.img)}
				alt={film.name}
				class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
				loading="lazy"
			/>
		</a>
		<span
			class="pointer-events-none absolute top-4 left-4 inline-flex h-8 min-w-[50px] items-center justify-center rounded-full bg-accent-primary px-4 text-[12px] leading-4 font-bold tracking-[0.18px] text-[#0b0b0b]"
		>
			{filmRating(film)}
		</span>
	</div>

	<div class="flex flex-col gap-0 md:gap-1">
		<h2
			class={cn(
				'line-clamp-1 text-[18px] leading-[26px]',
				featured ? 'md:text-title-lg' : 'md:text-title-md'
			)}
		>
			<a {href} class="transition-colors hover:text-accent-quinary">{film.name}</a>
		</h2>
		<p
			class="line-clamp-1 text-[14px] leading-[22px] font-medium text-muted-foreground md:text-body-md md:font-normal"
		>
			{formatGenres(film.genres)}
		</p>
	</div>

	{#if showActors && film.actors.length > 0}
		<ActorRow actors={film.actors} compact />
	{/if}

	<Button
		{href}
		class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium md:text-[14px]"
	>
		{m['button.details']()}
	</Button>
</article>
