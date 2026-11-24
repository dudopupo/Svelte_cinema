<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CinemaOrder } from '$lib/api/types';
	import TicketCard from './ticket-card.svelte';
	import EmptyState from '$lib/components/cinema/shared/empty-state.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';
	import { m } from '$lib/paraglide/messages';
	import { filterOrdersByTab, parseTicketsTab, type TicketsTab } from '$lib/utils/tickets';

	let {
		orders,
		tab,
		onTabChange,
		onReturn
	}: {
		orders: CinemaOrder[];
		tab: TicketsTab;
		onTabChange: (tab: TicketsTab) => void;
		onReturn?: (order: CinemaOrder) => void;
	} = $props();

	const visibleOrders = $derived(filterOrdersByTab(orders, tab));
	const emptyMessage = $derived(
		tab === 'active' ? m['tickets.empty-active']() : m['tickets.empty-history']()
	);

	// shadcn's TabsList hard-codes h-8 through a group-data variant, so the design's
	// 50 px track needs an important height to win the cascade.
	const triggerClass =
		'h-[42px] rounded-full text-[18px] leading-[26px] font-bold data-active:shadow-sm dark:data-active:border-transparent dark:data-active:bg-background';
</script>

<div class="flex flex-col gap-6">
	<Tabs value={tab} onValueChange={(value) => onTabChange(parseTicketsTab(value))}>
		<TabsList class="!h-[50px] w-full rounded-full p-1 md:w-[328px]">
			<TabsTrigger value="active" class={triggerClass}>
				{m['tickets.active-tab']()}
			</TabsTrigger>
			<TabsTrigger value="history" class={triggerClass}>
				{m['tickets.history-tab']()}
			</TabsTrigger>
		</TabsList>
	</Tabs>

	{#if visibleOrders.length === 0}
		<EmptyState icon="ticket" title={emptyMessage}>
			<Button href={resolve('/')} variant="secondary" class="h-12 rounded-full px-6">
				{m['tickets.return-to-catalog']()}
			</Button>
		</EmptyState>
	{:else}
		<div class="flex flex-col gap-4 md:grid md:max-w-[672px] md:grid-cols-2">
			{#each visibleOrders as order, index (order._id)}
				<TicketCard {order} number={index + 1} onReturn={tab === 'active' ? onReturn : undefined} />
			{/each}
		</div>
	{/if}
</div>
