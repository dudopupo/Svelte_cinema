<script lang="ts">
	import { afterNavigate, invalidateAll, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { ApiError } from '$lib/api/client';
	import { cancelCinemaOrder } from '$lib/api/cinema';
	import type { CinemaOrder } from '$lib/api/types';
	import ConfirmDialog from '$lib/components/cinema/shared/confirm-dialog.svelte';
	import EmptyState from '$lib/components/cinema/shared/empty-state.svelte';
	import TicketsBoard from '$lib/components/cinema/tickets/tickets-board.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { parseTicketsTab, type TicketsTab } from '$lib/utils/tickets';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let tab = $state<TicketsTab>(parseTicketsTab(page.url.searchParams.get('tab')));
	let selected = $state<CinemaOrder | null>(null);
	let dialogOpen = $state(false);
	let canceling = $state(false);
	let notice = $state<string | null>(null);
	let cancelError = $state<string | null>(null);

	afterNavigate(() => {
		const next = parseTicketsTab(page.url.searchParams.get('tab'));
		if (next !== tab) tab = next;
	});

	function handleTabChange(next: TicketsTab): void {
		tab = next;
		notice = null;
		cancelError = null;
		const url = `${resolve('/tickets')}?tab=${next}` as ResolvedPathname;
		replaceState(url, page.state);
	}

	function handleReturn(order: CinemaOrder): void {
		selected = order;
		dialogOpen = true;
	}

	function closeDialog(): void {
		dialogOpen = false;
		selected = null;
	}

	async function handleConfirmReturn(): Promise<void> {
		if (!selected || canceling) return;

		const orderId = selected._id;
		dialogOpen = false;
		canceling = true;
		notice = null;
		cancelError = null;

		try {
			await cancelCinemaOrder({ orderId });
			selected = null;
			notice = m['ticket.cancel-success']();
			await invalidateAll();
		} catch (cause) {
			cancelError = cause instanceof ApiError ? cause.message : m['ticket.cancel-error']();
		} finally {
			canceling = false;
		}
	}

	async function retryLoad(): Promise<void> {
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>{m['tickets.title']()} — {m['app.name']()}</title>
</svelte:head>

<h1 class="text-title-md max-md:sr-only">{m['tickets.heading']()}</h1>

<div class="mt-6 flex flex-col gap-4 md:gap-6" aria-busy={canceling}>
	{#if notice || cancelError || canceling}
		<div class="flex flex-col gap-1" aria-live="polite">
			{#if canceling}
				<p class="text-caption text-muted-foreground">{m['common.busy']()}</p>
			{/if}
			{#if notice}
				<p class="text-caption text-success-foreground">{notice}</p>
			{/if}
			{#if cancelError}
				<p class="text-caption text-destructive-foreground" role="alert">{cancelError}</p>
			{/if}
		</div>
	{/if}

	{#if data.loadFailed}
		<EmptyState
			icon="alert"
			title={m['tickets.load-error']()}
			description={m['tickets.load-error-hint']()}
		>
			<Button variant="secondary" class="h-12 rounded-full px-6" onclick={retryLoad}>
				{m['common.retry']()}
			</Button>
		</EmptyState>
	{:else}
		<TicketsBoard
			orders={data.orders}
			{tab}
			onTabChange={handleTabChange}
			onReturn={handleReturn}
		/>
	{/if}
</div>

<ConfirmDialog
	open={dialogOpen}
	title={m['ticket.return-confirm']()}
	secondaryLabel={m['button.return']()}
	primaryLabel={m['button.cancel']()}
	onSecondary={handleConfirmReturn}
	onPrimary={closeDialog}
	onClose={closeDialog}
/>
