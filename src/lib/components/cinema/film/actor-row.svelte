<script lang="ts">
	import type { FilmStaff } from '$lib/api/types';
	import { cn } from '$lib/utils.js';
	import { m } from '$lib/paraglide/messages';
	import ActorAvatar from './actor-avatar.svelte';

	let {
		actors,
		compact = false,
		class: className
	}: { actors: FilmStaff[]; compact?: boolean; class?: string } = $props();

	const visible = $derived(actors.slice(0, 4));
</script>

<div class={cn('flex flex-col gap-2 md:gap-4', className)}>
	<h2 class={compact ? 'text-body-sm font-medium md:text-title-md' : 'text-title-md'}>
		{m['film.actors']()}
	</h2>
	<ul class="flex gap-2 overflow-hidden">
		{#each visible as actor (actor.id)}
			<li
				class={cn(
					'flex flex-col items-center gap-2 text-center md:gap-1',
					compact ? 'w-[76px] shrink-0 md:w-[136px]' : 'min-w-0 flex-1 basis-0 md:max-w-[136px]'
				)}
			>
				<ActorAvatar photo={actor.photo} name={actor.fullName} />
				<span
					class={cn(
						'line-clamp-2 text-muted-foreground',
						compact
							? 'text-[14px] leading-[22px] font-medium md:text-body-md md:font-normal'
							: 'text-body-md'
					)}
				>
					{actor.fullName}
				</span>
			</li>
		{/each}
	</ul>
</div>
