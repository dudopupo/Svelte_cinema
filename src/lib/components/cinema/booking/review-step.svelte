<script lang="ts">
	import type { BookingSeat } from '$lib/stores/booking.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { formatMoney, formatSeanceDateTime, hallLabel } from '$lib/utils/format';
	import TicketIcon from '@lucide/svelte/icons/ticket';

	let {
		filmName,
		date,
		time,
		hall,
		seats,
		total,
		onBack,
		onContinue
	}: {
		filmName: string;
		date: string;
		time: string;
		hall: string;
		seats: BookingSeat[];
		total: number;
		onBack: () => void;
		onContinue: () => void;
	} = $props();

	const dateTime = $derived(formatSeanceDateTime(date, time));
	const hallName = $derived(hallLabel(hall));
	const seatsLabel = $derived(
		seats
			.map((seat) => m['common.row-seat-format']({ row: seat.row, seat: seat.column }))
			.join(', ')
	);
</script>

<div class="flex flex-col gap-6">
	<div class="hidden flex-col gap-6 md:flex">
		<dl class="flex max-w-[402px] flex-col">
			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.payed.film']()}</dt>
				<dd class="text-body-md text-foreground">{filmName}</dd>
			</div>
			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.review-tickets.count']()}</dt>
				<dd class="text-body-md text-foreground">{seats.length}</dd>
			</div>
			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.review-tickets.date']()}</dt>
				<dd class="text-body-md text-foreground">{dateTime}</dd>
			</div>
			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.review-tickets.hall']()}</dt>
				<dd class="text-body-md text-foreground">{hallName}</dd>
			</div>
			<div class="flex flex-col">
				<dt class="text-caption text-muted-foreground">{m['buy.review-tickets.seats']()}</dt>
				<dd class="text-body-md text-foreground">{seatsLabel}</dd>
			</div>
		</dl>

		<p class="text-title-md text-foreground">
			{m['buy.review-tickets.total-price']({ price: formatMoney(total) })}
		</p>
	</div>

	<div class="flex flex-col gap-4 md:hidden">
		<div class="flex flex-col gap-1">
			<p class="text-caption text-muted-foreground">{m['buy.review-tickets.film-name']()}</p>
			<p class="text-[20px] leading-7 font-medium text-foreground">{filmName}</p>
		</div>

		{#each seats as seat, index (seat.row + ':' + seat.column)}
			<div class="rounded-3xl border border-border-hard p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="flex flex-col gap-0.5">
						<p class="text-caption text-muted-foreground">{m['ticket.ticket']()}</p>
						<p class="text-body-md text-foreground">{index + 1}</p>
					</div>
					<span
						class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white"
						aria-hidden="true"
					>
						<TicketIcon class="size-6" />
					</span>
				</div>

				<div class="mt-3 flex flex-col">
					<p class="text-caption text-muted-foreground">{m['ticket.date-time']()}</p>
					<p class="text-body-md text-foreground">{dateTime}</p>
					<p class="mt-2 text-caption text-muted-foreground">{m['ticket.hall']()}</p>
					<p class="text-body-md text-foreground">{hallName}</p>
					<p class="mt-2 text-caption text-muted-foreground">{m['ticket.seat']()}</p>
					<p class="text-body-md text-foreground">
						{m['common.row-seat-format']({ row: seat.row, seat: seat.column })}
					</p>
				</div>
			</div>
		{/each}

		<p class="text-title-md text-foreground">
			{m['buy.review-tickets.total-price']({ price: formatMoney(total) })}
		</p>
	</div>

	<div class="flex flex-col gap-4 md:flex-row">
		<Button
			variant="secondary"
			class="hidden h-[52px] rounded-full text-[14px] leading-[21px] font-medium md:inline-flex md:flex-1"
			onclick={onBack}
		>
			{m['button.back']()}
		</Button>
		<Button
			class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium md:flex-1"
			onclick={onContinue}
		>
			{m['button.buy-tickets']()}
		</Button>
	</div>
</div>
