<script lang="ts">
	import type { FilmHall } from '$lib/api/types';
	import type { BookingSeat } from '$lib/stores/booking.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import SeatMap from './seat-map.svelte';

	let {
		hall,
		seats,
		filmHref,
		onToggle,
		onClear,
		onContinue
	}: {
		hall: FilmHall;
		seats: BookingSeat[];
		filmHref: string;
		onToggle: (row: number, column: number) => void;
		onClear: () => void;
		onContinue: () => void;
	} = $props();
</script>

<div class="flex flex-col gap-6">
	<SeatMap {hall} selected={seats} {onToggle} {onClear} />

	<div class="flex flex-col gap-4 md:flex-row">
		<Button
			href={filmHref}
			variant="secondary"
			class="hidden h-[52px] rounded-full text-[14px] leading-[21px] font-medium md:inline-flex md:flex-1"
		>
			{m['button.back']()}
		</Button>
		<Button
			class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium md:flex-1"
			disabled={seats.length === 0}
			onclick={onContinue}
		>
			{m['button.continue']()}
		</Button>
	</div>
</div>
