<script lang="ts">
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import type { LayoutProps } from './$types';
	import { theme } from '$lib/stores/theme.svelte';
	import { m } from '$lib/paraglide/messages';
	import { cn } from '$lib/utils.js';
	import SiteHeader from '$lib/components/cinema/layout/site-header.svelte';
	import MobileHeader from '$lib/components/cinema/layout/mobile-header.svelte';
	import TabBar from '$lib/components/cinema/layout/tab-bar.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import './layout.css';

	let { data, children }: LayoutProps = $props();

	const isBooking = $derived(page.url.pathname.startsWith('/buy'));
	const isAuth = $derived(page.url.pathname.startsWith('/auth'));

	onMount(() => {
		theme.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content={m['app.description']()} />
	<meta name="theme-color" content={theme.current === 'dark' ? '#0b0b0b' : '#fbfbfb'} />
	<meta property="og:site_name" content={m['app.name']()} />
	<meta property="og:type" content="website" />
</svelte:head>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-primary-foreground"
>
	{m['nav.skip-to-content']()}
</a>

{#if navigating.to}
	<div class="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-muted">
		<span class="sr-only" role="status" aria-live="polite">{m['common.loading']()}</span>
		<div class="h-full w-1/3 animate-loading-bar rounded-full bg-brand-pink"></div>
	</div>
{/if}

<div class="min-h-dvh bg-background text-foreground">
	{#if !isAuth}
		<SiteHeader user={data.user} />
		<MobileHeader />
	{/if}

	<main
		id="main"
		class={cn(
			'mx-auto w-full max-w-[1200px] px-4 pt-24 pb-10 md:pt-10 md:pb-10 xl:px-0',
			!isBooking && !isAuth && 'max-md:pb-28',
			isAuth && 'max-w-none px-0 pt-0 pb-0'
		)}
	>
		{@render children()}
	</main>

	{#if !isBooking && !isAuth}
		<TabBar />
	{/if}
</div>
