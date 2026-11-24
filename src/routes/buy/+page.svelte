<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { createCinemaPayment } from '$lib/api/cinema';
	import { ApiError } from '$lib/api/client';
	import BookingSteps from '$lib/components/cinema/booking/booking-steps.svelte';
	import BookingSummary from '$lib/components/cinema/booking/booking-summary.svelte';
	import ContactsStep from '$lib/components/cinema/booking/contacts-step.svelte';
	import PaymentStep from '$lib/components/cinema/booking/payment-step.svelte';
	import ReviewStep from '$lib/components/cinema/booking/review-step.svelte';
	import SeatsStep from '$lib/components/cinema/booking/seats-step.svelte';
	import SuccessStep from '$lib/components/cinema/booking/success-step.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { m } from '$lib/paraglide/messages';
	import { BookingStore, type BookingContacts } from '$lib/stores/booking.svelte';
	import { bookingStepSearch, type BookingStep } from '$lib/utils/booking';
	import type { CardFields } from '$lib/utils/booking-form';
	import { bookingStepLabel } from '$lib/utils/booking-labels';
	import { cn } from '$lib/utils.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const booking = new BookingStore();
	untrack(() => {
		booking.init({
			film: data.film,
			date: data.date,
			time: data.time,
			hall: data.hall,
			step: data.step,
			contacts: data.contacts
		});
	});

	let restored = $state(false);

	const stepTitle = $derived(bookingStepLabel(booking.step));
	const showBody = $derived(restored || booking.step === 'seats');
	const layoutClass = $derived(
		cn(
			'grid grid-cols-1 gap-10 lg:items-start',
			booking.step === 'seats' && 'lg:grid-cols-[minmax(0,702fr)_482px] lg:gap-4'
		)
	);
	const contentClass = $derived(
		cn('min-w-0', booking.step !== 'seats' && booking.step !== 'success' && 'lg:max-w-[702px]')
	);

	/** resolve() does not model query strings, so the step is appended to the resolved path. */
	function stepUrl(step: BookingStep): ResolvedPathname {
		return `${resolve('/buy')}?${bookingStepSearch(page.url, step)}` as ResolvedPathname;
	}

	onMount(() => {
		const step = booking.restoreDraft();
		restored = true;

		if (step !== data.step) {
			// replaceState is unavailable until SvelteKit finishes hydrating, defer it one task.
			setTimeout(() => replaceState(stepUrl(step), { bookingStep: step }), 0);
		}
	});

	function navigate(step: BookingStep): void {
		if (!booking.setStep(step)) return;
		replaceState(stepUrl(step), { bookingStep: step });
	}

	function handleToggle(row: number, column: number): void {
		booking.toggleSeat(row, column);
	}

	function handleClear(): void {
		booking.clearSeats();
	}

	function handleContactsUpdate(patch: Partial<BookingContacts>): void {
		booking.updateContacts(patch);
	}

	async function handlePay(card: CardFields): Promise<string | null> {
		if (!booking.film || !booking.hall) return m['buy.pay.error']();

		try {
			const response = await createCinemaPayment({
				filmId: booking.film.id,
				person: {
					firstname: booking.contacts.firstname.trim(),
					lastname: booking.contacts.lastname.trim(),
					middlename: booking.contacts.middlename.trim() || undefined,
					phone: booking.contacts.phone.trim()
				},
				debitCard: card,
				seance: { date: booking.date, time: booking.time, hall: booking.hall.name },
				tickets: booking.seats.map(({ row, column }) => ({ row, column }))
			});

			booking.complete(response.order);
			navigate('success');

			return null;
		} catch (error) {
			return error instanceof ApiError ? error.message : m['buy.pay.error']();
		}
	}
</script>

<svelte:head>
	<title>{stepTitle} — {m['app.name']()}</title>
</svelte:head>

<div class={layoutClass}>
	<div class={contentClass}>
		{#if booking.step !== 'success'}
			<BookingSteps step={booking.step} onNavigate={navigate} />
		{/if}

		<div class={booking.step === 'success' ? '' : 'mt-6'}>
			{#if !showBody}
				<div
					class="flex min-h-[240px] flex-col gap-6"
					role="status"
					aria-live="polite"
					aria-busy="true"
				>
					<span class="sr-only">{m['common.loading']()}</span>
					<Skeleton class="h-8 w-48 rounded-full" />
					<Skeleton class="h-64 w-full rounded-3xl" />
					<div class="flex flex-col gap-4 sm:flex-row">
						<Skeleton class="h-[52px] w-full rounded-full" />
						<Skeleton class="h-[52px] w-full rounded-full" />
					</div>
				</div>
			{:else if booking.step === 'seats' && booking.hall && booking.film}
				<SeatsStep
					hall={booking.hall}
					seats={booking.seats}
					filmHref={resolve('/film/[id]', { id: booking.film.id })}
					onToggle={handleToggle}
					onClear={handleClear}
					onContinue={() => navigate('review')}
				/>
			{:else if booking.step === 'review' && booking.film}
				<ReviewStep
					filmName={booking.film.name}
					date={booking.date}
					time={booking.time}
					hall={booking.hall?.name ?? ''}
					seats={booking.seats}
					total={booking.total}
					onBack={() => navigate('seats')}
					onContinue={() => navigate('contacts')}
				/>
			{:else if booking.step === 'contacts'}
				<ContactsStep
					contacts={booking.contacts}
					onUpdate={handleContactsUpdate}
					onBack={() => navigate('review')}
					onContinue={() => navigate('payment')}
				/>
			{:else if booking.step === 'payment'}
				<PaymentStep onBack={() => navigate('contacts')} onPay={handlePay} />
			{:else if booking.step === 'success' && booking.order}
				<SuccessStep order={booking.order} hall={booking.hall?.name ?? ''} />
			{/if}
		</div>
	</div>

	{#if booking.step === 'seats' && booking.film && booking.hall}
		<div class="hidden lg:block">
			<BookingSummary
				film={booking.film}
				date={booking.date}
				time={booking.time}
				hall={booking.hall.name}
				seats={booking.seats}
				total={booking.total}
			/>
		</div>
	{/if}
</div>
