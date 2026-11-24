<script lang="ts">
	import type { CinemaOrder } from '$lib/api/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { formatSeanceDateTime, hallShortLabel } from '$lib/utils/format';
	import { formatSeatGroups } from '$lib/utils/tickets';
	import { cn } from '$lib/utils.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import CircleSlashIcon from '@lucide/svelte/icons/circle-slash';
	import TicketIcon from '@lucide/svelte/icons/ticket';

	let {
		order,
		number,
		onReturn
	}: {
		order: CinemaOrder;
		number: number;
		onReturn?: (order: CinemaOrder) => void;
	} = $props();

	const canceled = $derived(
		order.status === 'canceled' || order.tickets.every((ticket) => ticket.status === 'cancelled')
	);
	const canReturn = $derived(
		!canceled && order.tickets.some((ticket) => ticket.status === 'paid') && Boolean(onReturn)
	);
	const firstTicket = $derived(order.tickets[0]);
	const dateTime = $derived(
		formatSeanceDateTime(firstTicket?.seance.date ?? '', firstTicket?.seance.time ?? '')
	);
	const hall = $derived(hallShortLabel(firstTicket?.seance.hall ?? ''));
	const seats = $derived(formatSeatGroups(order.tickets));
</script>

<article class="flex flex-col gap-1 rounded-3xl border border-border-hard p-4">
	<div class="flex items-start gap-2">
		<div class="flex min-w-0 flex-1 flex-col">
			<p class="text-caption text-muted-foreground">{m['tickets.ticket-number']()}</p>
			<p class="text-[24px] leading-8 font-medium">{number}</p>
		</div>
		<span
			class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white"
			aria-hidden="true"
		>
			<TicketIcon class="size-6" />
		</span>
	</div>

	<span
		class={cn(
			'inline-flex h-8 items-center gap-2 self-start rounded-full px-4 text-xs leading-4 font-bold',
			canceled
				? 'bg-destructive-background text-destructive-foreground'
				: 'bg-success-background text-success-foreground'
		)}
	>
		{#if canceled}
			{m['ticket.status.canceled']()}
			<CircleSlashIcon class="size-4" />
		{:else}
			{m['ticket.status.paid']()}
			<CircleCheckIcon class="size-4" />
		{/if}
	</span>

	<div class="flex flex-col">
		<p class="text-caption text-muted-foreground">{m['ticket.date-time']()}</p>
		<p class="text-body-sm">{dateTime}</p>
	</div>

	<div class="flex flex-col">
		<p class="text-caption text-muted-foreground">{m['ticket.hall']()}</p>
		<p class="text-body-sm">{hall}</p>
	</div>

	<div class="flex flex-col">
		<p class="text-caption text-muted-foreground">{m['ticket.seat']()}</p>
		<p class="text-body-sm">{seats}</p>
	</div>

	{#if canReturn}
		<Button
			variant="secondary"
			class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium"
			onclick={() => onReturn?.(order)}
		>
			{m['button.return-ticket']()}
		</Button>
	{/if}
</article>
