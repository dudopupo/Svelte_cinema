<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { theme } from '$lib/stores/theme.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
</script>

<Button
	variant="ghost"
	size="icon"
	class="rounded-full"
	aria-label={theme.current === 'dark' ? m['header.theme-light']() : m['header.theme-dark']()}
	onclick={() => theme.toggle()}
>
	{#if theme.current === 'dark'}
		<SunIcon class="size-5" />
	{:else}
		<MoonIcon class="size-5" />
	{/if}
</Button>
