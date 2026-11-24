<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import FilmIcon from '@lucide/svelte/icons/film';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

	let {
		title,
		description = null,
		icon = 'film',
		class: className,
		children
	}: {
		title: string;
		description?: string | null;
		icon?: 'film' | 'search' | 'ticket' | 'alert';
		class?: string;
		children?: Snippet;
	} = $props();

	const icons = {
		film: FilmIcon,
		search: SearchXIcon,
		ticket: TicketIcon,
		alert: TriangleAlertIcon
	};
	const Icon = $derived(icons[icon]);
</script>

<div
	class={cn(
		'flex flex-col items-center gap-4 rounded-3xl border border-border-soft bg-secondary/60 px-6 py-12 text-center md:py-16',
		className
	)}
>
	<span
		class="flex size-16 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground md:size-20"
		aria-hidden="true"
	>
		<Icon class="size-8 md:size-10" />
	</span>

	<div class="flex max-w-[420px] flex-col gap-1">
		<h2 class="text-title-md text-foreground">{title}</h2>
		{#if description}
			<p class="text-body-sm text-muted-foreground">{description}</p>
		{/if}
	</div>

	{#if children}
		<div class="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
			{@render children()}
		</div>
	{/if}
</div>
