<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CinemaOrder } from '$lib/api/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { formatSeanceDateTime, hallLabel } from '$lib/utils/format';
	import { formatSeatGroups, ticketNumber } from '$lib/utils/tickets';
	import CheckIcon from '@lucide/svelte/icons/check';

	let { order, hall }: { order: CinemaOrder; hall: string } = $props();

	const tickets = $derived(order.tickets);
	const dateTime = $derived(
		formatSeanceDateTime(tickets[0]?.seance.date ?? '', tickets[0]?.seance.time ?? '')
	);
	const seats = $derived(formatSeatGroups(tickets));
	const ticketNumbers = $derived(tickets.map((ticket) => ticketNumber(ticket._id)).join(', '));
</script>

<div class="flex flex-col gap-10 lg:gap-6">
	<div class="flex flex-col items-center gap-4 lg:items-start">
		<span
			class="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white lg:size-14"
			aria-hidden="true"
		>
			<CheckIcon class="size-9 lg:size-6" strokeWidth={3} />
		</span>

		<div class="flex w-full flex-col gap-4 px-4 lg:gap-6 lg:px-0">
			<h1 class="text-center text-title-md lg:text-left">{m['buy.payed.success']()}</h1>

			<dl class="flex w-full max-w-[398px] flex-col gap-4">
				<div class="flex flex-col gap-1">
					<dt class="text-[14px] leading-[22px] font-medium text-muted-foreground">
						{m['buy.payed.tickets-count']()}
					</dt>
					<dd class="text-[16px] leading-6 font-medium">{tickets.length}</dd>
				</div>

				<div class="flex flex-col gap-1">
					<dt class="text-[14px] leading-[22px] font-medium text-muted-foreground">
						{m['buy.payed.film']()}
					</dt>
					<dd class="text-[16px] leading-6 font-medium">{order.film.name}</dd>
				</div>

				<div class="flex flex-col gap-1">
					<dt class="text-[14px] leading-[22px] font-medium text-muted-foreground">
						{m['ticket.date-time']()}
					</dt>
					<dd class="text-[16px] leading-6 font-medium">{dateTime}</dd>
				</div>

				<div class="flex flex-col gap-1">
					<dt class="text-[14px] leading-[22px] font-medium text-muted-foreground">
						{m['ticket.hall']()}
					</dt>
					<dd class="text-[16px] leading-6 font-medium">{hallLabel(hall)}</dd>
				</div>

				<div class="flex flex-col gap-1">
					<dt class="text-[14px] leading-[22px] font-medium text-muted-foreground">
						{m['buy.payed.seats']()}
					</dt>
					<dd class="text-[16px] leading-6 font-medium">{seats}</dd>
				</div>

				<div class="flex flex-col gap-1">
					<dt class="text-[14px] leading-[22px] font-medium text-muted-foreground">
						{m['buy.payed.ticket-numbers']()}
					</dt>
					<dd class="text-[16px] leading-6 font-medium">{ticketNumbers}</dd>
				</div>

				<hr class="border-border-soft" />

				<p class="text-[16px] leading-6 font-medium text-muted-foreground">
					{m['buy.payed.sms-sent']()}
				</p>
			</dl>
		</div>
	</div>

	<div class="flex w-full max-w-[398px] flex-col gap-2.5 lg:gap-4">
		<Button
			href={resolve('/tickets')}
			variant="secondary"
			class="h-[52px] rounded-full text-[14px] leading-[21px] font-medium"
		>
			{m['button.order-details']()}
		</Button>
		<Button
			href={resolve('/')}
			class="h-[52px] rounded-full text-[14px] leading-[21px] font-medium"
		>
			{m['button.go-home']()}
		</Button>
	</div>
</div>
