<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

	const notFound = $derived(page.status === 404);
	const title = $derived(notFound ? m['error.not-found.title']() : m['error.generic.title']());
	const description = $derived(
		notFound ? m['error.not-found.description']() : m['error.generic.description']()
	);

	function reload(): void {
		if (typeof location !== 'undefined') location.reload();
	}
</script>

<svelte:head>
	<title>{title} — {m['app.name']()}</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
	<span
		class="flex size-20 shrink-0 items-center justify-center rounded-full bg-destructive-background text-destructive-foreground"
		aria-hidden="true"
	>
		<TriangleAlertIcon class="size-10" />
	</span>

	<div class="flex flex-col gap-2">
		<p class="text-caption font-semibold tracking-[0.18px] text-muted-foreground uppercase">
			{m['error.status']({ status: String(page.status) })}
		</p>
		<h1 class="text-title-md md:text-title-lg">{title}</h1>
		<p class="mx-auto max-w-[420px] text-body-sm text-muted-foreground">{description}</p>
	</div>

	<div class="flex w-full max-w-[328px] flex-col gap-2.5 sm:flex-row sm:justify-center">
		<Button
			href={resolve('/')}
			class="h-[52px] flex-1 rounded-full text-[14px] leading-[21px] font-medium"
		>
			{m['button.go-home']()}
		</Button>
		<Button
			type="button"
			variant="secondary"
			class="h-[52px] flex-1 rounded-full text-[14px] leading-[21px] font-medium"
			onclick={reload}
		>
			{m['common.refresh']()}
		</Button>
	</div>
</div>
