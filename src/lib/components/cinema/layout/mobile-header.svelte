<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { m } from '$lib/paraglide/messages';
	import { bookingStepFromPage, bookingStepSearch, type BookingStep } from '$lib/utils/booking';
	import { bookingStepLabel } from '$lib/utils/booking-labels';
	import ThemeToggle from './theme-toggle.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import XIcon from '@lucide/svelte/icons/x';

	type HeaderMeta = { title: string; back: ResolvedPathname | null; close?: boolean };

	/** resolve() does not model query strings, so the step is appended to the resolved path. */
	function buyBackLink(step: BookingStep): ResolvedPathname {
		const previous: Record<BookingStep, BookingStep | null> = {
			seats: null,
			review: 'seats',
			contacts: 'review',
			payment: 'contacts',
			success: null
		};
		const previousStep = previous[step];

		if (previousStep) {
			return `${resolve('/buy')}?${bookingStepSearch(page.url, previousStep)}` as ResolvedPathname;
		}

		const filmId = page.url.searchParams.get('filmId');
		return filmId ? resolve('/film/[id]', { id: filmId }) : resolve('/');
	}

	const meta = $derived.by((): HeaderMeta => {
		const pathname = page.url.pathname;

		if (pathname.startsWith('/film/')) {
			return { title: m['film.about'](), back: resolve('/') };
		}
		if (pathname.startsWith('/tickets')) return { title: m['tickets.title'](), back: null };
		if (pathname.startsWith('/profile')) return { title: m['profile.title'](), back: null };
		if (pathname.startsWith('/auth')) return { title: m['auth.title'](), back: null };
		if (pathname.startsWith('/buy')) {
			const step = bookingStepFromPage(page.url, page.state);

			if (step === 'success') {
				return { title: '', back: resolve('/'), close: true };
			}

			return { title: bookingStepLabel(step), back: buyBackLink(step) };
		}

		return { title: m['catalog.title'](), back: null };
	});

	const showTheme = $derived(!page.url.pathname.startsWith('/buy'));
</script>

<header
	class="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-4 bg-background/95 px-4 backdrop-blur-md md:hidden"
>
	{#if meta.close}
		<p class="min-w-0 flex-1 truncate text-title-md">{meta.title}</p>
		<a
			href={meta.back}
			class="-mr-1 flex size-6 items-center justify-center text-foreground"
			aria-label={m['button.go-home']()}
		>
			<XIcon class="size-6" />
		</a>
	{:else}
		{#if meta.back}
			<a
				href={meta.back}
				class="-ml-1 flex size-6 items-center justify-center text-foreground"
				aria-label={m['button.back']()}
			>
				<ChevronLeftIcon class="size-6" />
			</a>
		{/if}

		{#if meta.title}
			<p class="min-w-0 truncate text-title-md">{meta.title}</p>
		{/if}

		{#if showTheme}
			<div class="ml-auto">
				<ThemeToggle />
			</div>
		{/if}
	{/if}
</header>
