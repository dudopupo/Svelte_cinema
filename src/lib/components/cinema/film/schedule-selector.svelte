<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { FilmSchedule, FilmSeance } from '$lib/api/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { cn } from '$lib/utils.js';
	import { formatScheduleDate, hallLabel } from '$lib/utils/format';
	import XIcon from '@lucide/svelte/icons/x';

	let { schedules, filmId }: { schedules: FilmSchedule[]; filmId: string } = $props();

	let activeDate = $state<string | null>(null);
	let selectedSeanceKey = $state<string | null>(null);
	let strip = $state<HTMLDivElement>();

	const currentDate = $derived(
		schedules.some((day) => day.date === activeDate) ? activeDate! : (schedules[0]?.date ?? '')
	);

	const activeDay = $derived(schedules.find((day) => day.date === currentDate) ?? schedules[0]);

	const halls = $derived.by(() => {
		const grouped: Array<{ name: string; seances: FilmSeance[] }> = [];

		for (const seance of activeDay?.seances ?? []) {
			const group = grouped.find((item) => item.name === seance.hall.name);
			if (group) group.seances.push(seance);
			else grouped.push({ name: seance.hall.name, seances: [seance] });
		}

		return grouped;
	});

	function seanceKey(seance: FilmSeance): string {
		return `${seance.hall.name}:${seance.time}`;
	}

	const selectedSeance = $derived(
		activeDay?.seances.find((seance) => seanceKey(seance) === selectedSeanceKey)
	);

	async function selectDate(date: string): Promise<void> {
		if (date !== currentDate) {
			activeDate = date;
			selectedSeanceKey = null;
		}

		await tick();

		const button = strip?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`);
		if (!strip || !button) return;

		// Align the chosen day with the start of the strip, inside its 4px padding.
		const offset = button.getBoundingClientRect().left - strip.getBoundingClientRect().left;
		const left = strip.scrollLeft + offset - 4;

		if (typeof strip.scrollTo === 'function') strip.scrollTo({ left, behavior: 'smooth' });
		else strip.scrollLeft = left;
	}

	function toggleSeance(seance: FilmSeance): void {
		const key = seanceKey(seance);
		selectedSeanceKey = selectedSeanceKey === key ? null : key;
	}

	function horizontalScroll(node: HTMLElement) {
		let dragging = false;
		let moved = false;
		let startX = 0;
		let startScroll = 0;

		function onWheel(event: WheelEvent) {
			if (node.scrollWidth <= node.clientWidth) return;
			if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

			event.preventDefault();
			node.scrollLeft += event.deltaY;
		}

		function onPointerDown(event: PointerEvent) {
			if (event.pointerType !== 'mouse' || event.button !== 0) return;

			dragging = true;
			moved = false;
			startX = event.clientX;
			startScroll = node.scrollLeft;
		}

		function onPointerMove(event: PointerEvent) {
			if (!dragging) return;

			const delta = event.clientX - startX;
			if (!moved && Math.abs(delta) > 4) {
				moved = true;

				// Capture only once a real drag starts, otherwise the button click is lost.
				try {
					node.setPointerCapture(event.pointerId);
				} catch {
					// Synthetic or already released pointer.
				}
			}

			if (moved) node.scrollLeft = startScroll - delta;
		}

		function onPointerUp(event: PointerEvent) {
			dragging = false;
			if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
		}

		function onClickCapture(event: MouseEvent) {
			if (!moved) return;

			event.preventDefault();
			event.stopPropagation();
			moved = false;
		}

		node.addEventListener('wheel', onWheel, { passive: false });
		node.addEventListener('pointerdown', onPointerDown);
		node.addEventListener('pointermove', onPointerMove);
		node.addEventListener('pointerup', onPointerUp);
		node.addEventListener('pointercancel', onPointerUp);
		node.addEventListener('click', onClickCapture, true);

		return {
			destroy() {
				node.removeEventListener('wheel', onWheel);
				node.removeEventListener('pointerdown', onPointerDown);
				node.removeEventListener('pointermove', onPointerMove);
				node.removeEventListener('pointerup', onPointerUp);
				node.removeEventListener('pointercancel', onPointerUp);
				node.removeEventListener('click', onClickCapture, true);
			}
		};
	}

	function continueBooking(): void {
		if (!selectedSeance) return;

		const search = new URLSearchParams({
			filmId,
			date: currentDate,
			hall: selectedSeance.hall.name,
			time: selectedSeance.time
		});

		// resolve() returns the route without a query string, so the rule cannot see it inside the template.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(`${resolve('/buy')}?${search.toString()}`);
	}
</script>

<div class="flex flex-col gap-6">
	<div
		bind:this={strip}
		class="scrollbar-none flex w-fit max-w-full overflow-x-auto rounded-full bg-muted p-1"
		role="group"
		aria-label={m['film.choose-date']()}
		use:horizontalScroll
	>
		{#each schedules as day (day.date)}
			{@const active = day.date === currentDate}
			<button
				type="button"
				data-date={day.date}
				class={cn(
					'shrink-0 rounded-full px-3 py-2 text-[18px] leading-[26px] font-bold tracking-[0.09px] transition-colors',
					active
						? 'bg-background text-foreground shadow-input'
						: 'text-foreground hover:bg-background/60'
				)}
				aria-pressed={active}
				onclick={() => void selectDate(day.date)}
			>
				{formatScheduleDate(day.date)}
			</button>
		{/each}
	</div>

	<div class="flex flex-col gap-6">
		{#each halls as hall (hall.name)}
			<div class="flex flex-col gap-2">
				<p class="text-[14px] leading-[22px] font-medium text-foreground">{hallLabel(hall.name)}</p>
				<div class="flex flex-wrap gap-2">
					{#each hall.seances as seance (seanceKey(seance))}
						{@const selected = selectedSeanceKey === seanceKey(seance)}
						<button
							type="button"
							class={cn(
								'inline-flex h-[52px] items-center gap-2 rounded-full text-[20px] leading-[28px] font-bold tracking-[0.3px] transition-colors',
								selected
									? 'bg-brand-pink px-[18px] text-white'
									: 'bg-secondary px-8 text-foreground hover:bg-secondary-hover'
							)}
							aria-pressed={selected}
							onclick={() => toggleSeance(seance)}
						>
							{seance.time}
							{#if selected}
								<XIcon class="size-5" />
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/each}

		{#if halls.length === 0}
			<p class="text-body-md text-muted-foreground">{m['film.no-seances']()}</p>
		{/if}
	</div>

	<Button
		class="h-[52px] w-full max-w-[328px] rounded-full text-[14px] leading-[21px] font-medium"
		disabled={!selectedSeance}
		onclick={continueBooking}
	>
		{m['button.continue']()}
	</Button>
</div>
