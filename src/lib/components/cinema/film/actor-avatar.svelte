<script lang="ts">
	import { onMount } from 'svelte';
	import { cinemaAsset } from '$lib/api/assets';

	let { photo, name }: { photo: string; name: string } = $props();

	let failed = $state(false);
	let image = $state<HTMLImageElement>();

	onMount(() => {
		// A 404 can fire before hydration, so the error handler may never run.
		if (image && image.complete && image.naturalWidth === 0) failed = true;
	});

	const initials = $derived(
		name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<span
	class="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted"
>
	{#if failed}
		<span class="text-body-md font-bold text-muted-foreground" aria-hidden="true">{initials}</span>
	{:else}
		<img
			bind:this={image}
			src={cinemaAsset(photo)}
			alt=""
			class="absolute inset-0 size-full object-cover"
			loading="lazy"
			onerror={() => (failed = true)}
		/>
	{/if}
</span>
