<script lang="ts">
	import type { FilmHall } from '$lib/api/types';
	import { m } from '$lib/paraglide/messages';
	import type { BookingSeat } from '$lib/stores/booking.svelte';
	import { MAX_BOOKING_SEATS, isBookableCell, seatKey } from '$lib/utils/booking';
	import { cn } from '$lib/utils.js';
	import { formatMoney } from '$lib/utils/format';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		hall,
		selected,
		maxSeats = MAX_BOOKING_SEATS,
		onToggle,
		onClear
	}: {
		hall: FilmHall;
		selected: BookingSeat[];
		maxSeats?: number;
		onToggle: (row: number, column: number) => void;
		onClear?: () => void;
	} = $props();

	const selectedKeys = $derived(new Set(selected.map((seat) => seatKey(seat.row, seat.column))));
	const columnCount = $derived(Math.max(1, ...hall.places.map((row) => row.length)));
	const gap = $derived(columnCount <= 8 ? 24 : columnCount <= 12 ? 12 : 6);
	const atLimit = $derived(selected.length >= maxSeats);
	const total = $derived(selected.reduce((sum, seat) => sum + seat.price, 0));

	function seatLabel(row: number, column: number): string {
		return m['common.row-seat-format']({ row, seat: column });
	}

	function seatAriaLabel(row: number, column: number, paid: boolean, isSelected: boolean): string {
		const status = paid
			? m['buy.pick-seats.status-paid']()
			: isSelected
				? m['buy.pick-seats.status-selected']()
				: m['buy.pick-seats.status-available']();

		return m['buy.pick-seats.seat-status']({ seat: seatLabel(row, column), status });
	}
</script>

<div class="flex flex-col gap-6" role="group" aria-label={m['buy.pick-seats.title']()}>
	<div class="scrollbar-none overflow-x-auto md:overflow-visible">
		<div class="mx-auto flex w-max flex-col gap-6 md:mx-0">
			<div class="flex flex-col items-center gap-2 self-center px-6">
				<div class="h-1.5 w-[220px] rounded-full bg-muted-foreground/40"></div>
				<p class="text-caption font-medium text-muted-foreground">{m['buy.pick-seats.screen']()}</p>
			</div>

			<p class="text-body-sm font-medium">{m['buy.pick-seats.row']()}</p>

			{#each hall.places as row, rowIndex (rowIndex)}
				{@const rowNumber = rowIndex + 1}
				<div class="flex items-center" style:gap={`${gap}px`}>
					<span class="w-4 shrink-0 text-center text-caption text-foreground">{rowNumber}</span>

					<div class="flex items-center" style:gap={`${gap}px`}>
						{#each row as cell, columnIndex (columnIndex)}
							{@const columnNumber = columnIndex + 1}
							{@const key = seatKey(rowNumber, columnNumber)}
							{@const isSelected = selectedKeys.has(key)}
							{@const available = isBookableCell(cell)}
							{@const paid = cell.type === 'paid'}
							{@const disabled = paid || (!isSelected && atLimit)}

							{#if available || paid}
								<div class="group relative size-5 shrink-0">
									<button
										type="button"
										class={cn(
											'size-5 rounded transition-colors',
											paid && 'cursor-default bg-seat-occupied',
											!paid && isSelected && 'bg-seat-selected',
											!paid && !isSelected && 'bg-seat-available hover:bg-seat-selected/70',
											!paid && atLimit && !isSelected && 'opacity-40',
											'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink'
										)}
										aria-label={seatAriaLabel(rowNumber, columnNumber, paid, isSelected)}
										aria-pressed={paid ? undefined : isSelected}
										{disabled}
										onclick={() => onToggle(rowNumber, columnNumber)}
									></button>

									{#if isSelected && available}
										{@const seat = selected.find((item) => seatKey(item.row, item.column) === key)}
										<div
											class={cn(
												'pointer-events-none absolute left-1/2 z-20 hidden -translate-x-1/2 group-focus-within:block group-hover:block',
												rowIndex === 0 ? 'top-full mt-2' : 'bottom-full mb-2'
											)}
										>
											<div
												class="relative rounded-lg bg-neutral-900 px-3 py-1.5 text-left text-neutral-50 shadow-lg dark:bg-neutral-800"
											>
												<p class="text-caption font-bold whitespace-nowrap">
													{formatMoney(seat?.price ?? 0)}
												</p>
												<p class="text-[12px] leading-4 whitespace-nowrap">
													{seatLabel(rowNumber, columnNumber)}
												</p>
												<button
													type="button"
													class="pointer-events-auto absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-brand-pink text-white transition-colors hover:bg-brand-pink/80"
													aria-label={m['buy.pick-seats.remove-seat']({
														seat: seatLabel(rowNumber, columnNumber)
													})}
													onclick={() => onToggle(rowNumber, columnNumber)}
												>
													<XIcon class="size-3" />
												</button>
											</div>
											<span
												class={cn(
													'absolute left-1/2 size-2 -translate-x-1/2 rotate-45 bg-neutral-900 dark:bg-neutral-800',
													rowIndex === 0 ? 'top-0 -mt-1' : 'bottom-0 -mb-1'
												)}
												aria-hidden="true"
											></span>
										</div>
									{/if}
								</div>
							{:else}
								<span class="size-5 shrink-0" aria-hidden="true"></span>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
		<div class="flex items-center gap-2">
			<span class="size-5 rounded bg-seat-occupied" aria-hidden="true"></span>
			<span class="text-caption font-medium">{m['buy.pick-seats.occupied']()}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="size-5 rounded bg-seat-selected" aria-hidden="true"></span>
			<span class="text-caption font-medium">{m['buy.pick-seats.selected']()}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="size-5 rounded bg-seat-available" aria-hidden="true"></span>
			<span class="text-caption font-medium">{m['buy.pick-seats.available']()}</span>
		</div>
	</div>

	{#if selected.length > 0}
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
			<p class="text-body-sm font-medium">
				{m['buy.pick-seats.total']({ price: formatMoney(total) })}
			</p>
			{#if onClear}
				<button
					type="button"
					class="text-caption font-medium text-brand-pink underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink"
					onclick={onClear}
				>
					{m['buy.pick-seats.clear']()}
				</button>
			{/if}
		</div>
	{/if}
</div>
