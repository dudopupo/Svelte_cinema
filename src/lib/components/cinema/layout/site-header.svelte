<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { User } from '$lib/api/types';
	import { signOut } from '$lib/api/account';
	import { m } from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button/index.js';
	import Logo from './logo.svelte';
	import ThemeToggle from './theme-toggle.svelte';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import UserIcon from '@lucide/svelte/icons/user';

	let { user }: { user: User | null } = $props();

	let signingOut = $state(false);

	const iconLinkClass =
		'flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary-hover';

	async function handleSignOut(): Promise<void> {
		if (signingOut) return;
		signingOut = true;

		try {
			await signOut();
			await goto(resolve('/'), { invalidateAll: true });
		} catch (error) {
			console.error('[header] failed to sign out', error);
		} finally {
			signingOut = false;
		}
	}
</script>

<header class="sticky top-4 z-40 hidden md:block">
	<div class="mx-auto w-full max-w-[1200px] px-4 xl:px-0">
		<div
			class="flex h-16 items-center justify-between rounded-full border border-border-hard bg-background px-3 shadow-header"
		>
			<Logo />

			<div class="flex items-center gap-6">
				<div class="flex items-center gap-4">
					<ThemeToggle />

					<nav class="flex items-center gap-4" aria-label={m['nav.main']()}>
						<a
							href={resolve('/tickets')}
							class={iconLinkClass}
							aria-label={m['menu.tickets']()}
							aria-current={page.url.pathname.startsWith('/tickets') ? 'page' : undefined}
						>
							<TicketIcon class="size-6" aria-hidden="true" />
						</a>

						<a
							href={resolve(user ? '/profile' : '/auth')}
							class={iconLinkClass}
							aria-label={user ? m['menu.profile']() : m['button.sign-in']()}
							aria-current={page.url.pathname.startsWith(user ? '/profile' : '/auth')
								? 'page'
								: undefined}
						>
							<UserIcon class="size-6" aria-hidden="true" />
						</a>
					</nav>
				</div>

				{#if user}
					<Button
						class="h-10 rounded-full px-6 text-sm font-medium"
						disabled={signingOut}
						aria-busy={signingOut}
						onclick={handleSignOut}
					>
						{signingOut ? m['common.busy']() : m['button.logout']()}
						<LogOutIcon class="size-4" aria-hidden="true" />
					</Button>
				{:else}
					<Button href={resolve('/auth')} class="h-10 rounded-full px-6 text-sm font-medium">
						{m['button.sign-in']()}
						<LogInIcon class="size-4" aria-hidden="true" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
</header>
