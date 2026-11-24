<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { cn } from '$lib/utils.js';
	import FilmIcon from '@lucide/svelte/icons/film';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import UserIcon from '@lucide/svelte/icons/user';

	const items = $derived([
		{ href: resolve('/'), label: m['menu.films'](), icon: FilmIcon },
		{ href: resolve('/tickets'), label: m['menu.tickets'](), icon: TicketIcon },
		{ href: resolve('/profile'), label: m['menu.profile'](), icon: UserIcon }
	]);

	function isActive(href: string): boolean {
		const pathname = page.url.pathname;
		if (href === resolve('/')) {
			return pathname === '/' || pathname.startsWith('/film') || pathname.startsWith('/buy');
		}
		return pathname.startsWith(href);
	}
</script>

<nav
	class="fixed inset-x-4 bottom-3 z-40 mx-auto flex max-w-[328px] items-center gap-1 rounded-full border border-border-hard bg-background p-1 shadow-tabs md:hidden"
	aria-label={m['nav.main']()}
>
	{#each items as item (item.href)}
		{@const active = isActive(item.href)}
		<a
			href={item.href}
			class={cn(
				'flex h-[58px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[12px] leading-4 tracking-[0.06px] transition-colors',
				active
					? 'bg-brand-pink font-bold text-white'
					: 'font-semibold text-foreground hover:bg-secondary'
			)}
			aria-current={active ? 'page' : undefined}
		>
			<item.icon class="size-6" aria-hidden="true" />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>
