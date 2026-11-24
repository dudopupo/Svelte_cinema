<script lang="ts">
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import {
		BOOKING_FLOW_STEPS,
		bookingStepIndex,
		isFlowStep,
		type BookingStep
	} from '$lib/utils/booking';
	import { bookingStepLabel } from '$lib/utils/booking-labels';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import HouseIcon from '@lucide/svelte/icons/house';

	let {
		step,
		onNavigate
	}: {
		step: BookingStep;
		onNavigate?: (step: BookingStep) => void;
	} = $props();

	const stepIndex = $derived(bookingStepIndex(step));
	const current = $derived(stepIndex + 1);
	const total = BOOKING_FLOW_STEPS.length;
	const visibleSteps = $derived(isFlowStep(step) ? BOOKING_FLOW_STEPS.slice(0, stepIndex + 1) : []);
	const progress = $derived((current / total) * 100);
</script>

<div class="flex flex-col gap-6">
	<nav class="hidden min-h-9 items-center gap-2 px-2 md:flex" aria-label={m['buy.title']()}>
		<a
			href={resolve('/')}
			class="text-muted-foreground transition-colors hover:text-foreground"
			aria-label={m['film.back-to-catalog']()}
		>
			<HouseIcon class="size-4" />
		</a>

		{#each visibleSteps as item (item)}
			<ChevronRightIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			{#if item === step}
				<span class="text-caption font-semibold" aria-current="page">
					{bookingStepLabel(item)}
				</span>
			{:else}
				<button
					type="button"
					class="text-caption text-muted-foreground transition-colors hover:text-foreground"
					onclick={() => onNavigate?.(item)}
				>
					{bookingStepLabel(item)}
				</button>
			{/if}
		{/each}
	</nav>

	<h1 class="text-title-md max-md:sr-only">{bookingStepLabel(step)}</h1>

	<div class="flex flex-col">
		<p class="pb-1 text-caption font-medium">{m['buy.step-format']({ current, total })}</p>
		<div
			class="h-1 w-full overflow-hidden rounded-full bg-muted"
			role="progressbar"
			aria-label={m['buy.step-format']({ current, total })}
			aria-valuemin={1}
			aria-valuemax={total}
			aria-valuenow={current}
		>
			<div
				class="h-full rounded-full bg-brand-pink transition-[width] duration-300"
				style:width={`${progress}%`}
			></div>
		</div>
	</div>
</div>
