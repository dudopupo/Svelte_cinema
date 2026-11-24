<script lang="ts">
	import type { Film } from '$lib/api/types';
	import type { BookingSeat } from '$lib/stores/booking.svelte';
	import { m } from '$lib/paraglide/messages';
	import { formatMoney, formatSeanceDateTime, hallLabel } from '$lib/utils/format';
	import TicketIcon from '@lucide/svelte/icons/ticket';

	let {
		film,
		date,
		time,
		hall,
		seats,
		total
	}: {
		film: Film;
		date: string;
		time: string;
		hall: string;
		seats: BookingSeat[];
		total: number;
	} = $props();

	const seatsLabel = $derived(
		seats.length === 0
			? '—'
			: seats
					.map((seat) => m['common.row-seat-format']({ row: seat.row, seat: seat.column }))
					.join(', ')
	);
</script>

<aside class="rounded-3xl bg-secondary px-6 py-6 xl:px-10" aria-label={m['buy.your-tickets']()}>
	<div class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-title-md">{m['buy.your-tickets']()}</h2>
			<span
				class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white"
				aria-hidden="true"
			>
				<TicketIcon class="size-6" />
			</span>
		</div>

		<dl class="flex flex-col">
			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.payed.tickets-count']()}</dt>
				<dd class="text-body-md text-foreground">{seats.length}</dd>
			</div>

			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.payed.film']()}</dt>
				<dd class="text-body-md text-foreground">{film.name}</dd>
			</div>

			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['ticket.date-time']()}</dt>
				<dd class="text-body-md text-foreground">{formatSeanceDateTime(date, time)}</dd>
			</div>

			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['ticket.hall']()}</dt>
				<dd class="text-body-md text-foreground">{hallLabel(hall)}</dd>
			</div>

			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['common.seats']()}</dt>
				<dd class="text-body-md text-foreground">{seatsLabel}</dd>
			</div>

			<div class="mt-2 flex items-center justify-between gap-4 border-t border-border-soft pt-2">
				<dt class="text-caption text-muted-foreground">{m['common.total']()}</dt>
				<dd class="text-body-md font-bold text-foreground">{formatMoney(total)}</dd>
			</div>
		</dl>
	</div>
</aside>
