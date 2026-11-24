<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import { ApiError } from '$lib/api/client';
	import { requestOtp, signIn } from '$lib/api/account';
	import AuthOtpForm from '$lib/components/cinema/auth/auth-otp-form.svelte';
	import AuthPhoneForm from '$lib/components/cinema/auth/auth-phone-form.svelte';
	import Logo from '$lib/components/cinema/layout/logo.svelte';
	import { m } from '$lib/paraglide/messages';
	import { retrySeconds } from '$lib/utils/auth';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let step = $state<'phone' | 'otp'>('phone');
	let phone = $state('');
	let pending = $state(false);
	let error = $state<string | null>(null);
	let seconds = $state(0);

	const title = $derived(step === 'phone' ? m['auth.title']() : m['auth.otp.title']());

	$effect(() => {
		if (seconds <= 0) return;

		const timeout = setTimeout(() => {
			seconds -= 1;
		}, 1000);

		return () => clearTimeout(timeout);
	});

	function errorMessage(cause: unknown, fallback: string): string {
		return cause instanceof ApiError ? cause.message : fallback;
	}

	async function handlePhone(value: string): Promise<void> {
		error = null;
		pending = true;

		try {
			const response = await requestOtp(value);
			phone = value;
			step = 'otp';
			seconds = retrySeconds(response.retryDelay);
		} catch (cause) {
			error = errorMessage(cause, m['auth.otp-error']());
		} finally {
			pending = false;
		}
	}

	async function handleOtp(code: string): Promise<void> {
		error = null;
		pending = true;

		try {
			await signIn({ phone, code });
			const redirectTo = data.redirectTo as ResolvedPathname;
			await goto(redirectTo, { invalidateAll: true });
		} catch (cause) {
			error = errorMessage(cause, m['auth.sign-in-error']());
		} finally {
			pending = false;
		}
	}

	async function handleResend(): Promise<void> {
		if (seconds > 0 || pending) return;

		error = null;
		pending = true;

		try {
			const response = await requestOtp(phone);
			seconds = retrySeconds(response.retryDelay);
		} catch (cause) {
			error = errorMessage(cause, m['auth.otp-error']());
		} finally {
			pending = false;
		}
	}

	function handleBack(): void {
		step = 'phone';
		error = null;
		seconds = 0;
	}
</script>

<svelte:head>
	<title>{title} — {m['app.name']()}</title>
</svelte:head>

<div class="flex min-h-dvh flex-col md:items-center md:justify-center md:gap-12 md:px-6">
	<header class="flex h-16 shrink-0 items-center gap-4 px-4 md:hidden">
		{#if step === 'otp'}
			<button
				type="button"
				class="-ml-1 flex size-6 shrink-0 items-center justify-center"
				aria-label={m['button.back']()}
				onclick={handleBack}
			>
				<ChevronLeftIcon class="size-6" />
			</button>
		{/if}
		<h1 class="min-w-0 truncate text-title-md">{title}</h1>
	</header>

	<div class="hidden md:block">
		<Logo />
	</div>

	<div class="flex w-full flex-col gap-6 px-4 pt-6 pb-10 md:w-[280px] md:gap-4 md:p-0">
		{#if step === 'phone'}
			<h1 class="text-title-md max-md:sr-only md:text-center">{m['auth.title']()}</h1>
			<p class="text-body-sm">{m['auth.description']()}</p>
			<AuthPhoneForm {pending} {error} onSubmit={handlePhone} />
		{:else}
			<div class="hidden items-center justify-center gap-6 md:flex">
				<button
					type="button"
					class="flex size-6 shrink-0 items-center justify-center"
					aria-label={m['button.back']()}
					onclick={handleBack}
				>
					<ChevronLeftIcon class="size-6" />
				</button>
				<h1 class="text-title-md">{m['auth.otp.title']()}</h1>
			</div>

			<p class="text-body-sm">{m['auth.otp.description']()}</p>
			<AuthOtpForm {pending} {error} {seconds} onSubmit={handleOtp} onResend={handleResend} />

			{#if dev}
				<p class="text-caption text-muted-foreground">
					{m['auth.otp.dev-hint']()}
					<a
						href={resolve('/api/otps')}
						target="_blank"
						rel="noreferrer"
						class="font-medium text-foreground underline underline-offset-4"
					>
						/api/otps
					</a>
				</p>
			{/if}
		{/if}
	</div>
</div>
