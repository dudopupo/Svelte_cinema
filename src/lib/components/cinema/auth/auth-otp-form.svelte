<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { m } from '$lib/paraglide/messages';
	import { isOtpCodeValid } from '$lib/utils/auth';

	let {
		pending = false,
		error = null,
		seconds = 0,
		onSubmit,
		onResend
	}: {
		pending?: boolean;
		error?: string | null;
		seconds?: number;
		onSubmit: (code: string) => void;
		onResend: () => void;
	} = $props();

	const inputClass =
		'h-10 rounded-full bg-background px-4 text-[20px] leading-6 font-normal shadow-input aria-invalid:border-destructive-border dark:bg-background';

	let code = $state('');
	let touched = $state(false);

	const issue = $derived.by(() => {
		if (!touched) return null;
		if (!code.trim()) return 'required';
		if (!isOtpCodeValid(code)) return 'otp-length';
		return null;
	});

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		const value = event.currentTarget.value.replace(/\D/g, '').slice(0, 6);
		code = value;
		event.currentTarget.value = value;
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		touched = true;

		if (isOtpCodeValid(code)) {
			onSubmit(code);
		}
	}
</script>

<form class="flex flex-col gap-6" novalidate aria-busy={pending} onsubmit={handleSubmit}>
	<div class="flex flex-col gap-1">
		<label for="auth-otp" class="text-caption">
			<span class="md:hidden">{m['auth.otp.code-label']()}</span>
			<span class="hidden md:inline">{m['input.otp.label']()}</span>
		</label>
		<Input
			id="auth-otp"
			name="code"
			class={inputClass}
			placeholder={m['input.otp.placeholder']()}
			autocomplete="one-time-code"
			inputmode="numeric"
			required
			aria-invalid={issue ? true : undefined}
			aria-describedby={issue ? 'auth-otp-error' : undefined}
			value={code}
			oninput={handleInput}
		/>
		{#if issue}
			<p id="auth-otp-error" class="text-caption text-destructive-foreground">
				{issue === 'required' ? m['validation.required']() : m['validation.otp-length']()}
			</p>
		{/if}
		{#if error}
			<p class="text-caption text-destructive-foreground" role="alert">{error}</p>
		{/if}
	</div>

	<div class="flex flex-col gap-2.5 pt-4 md:gap-4 md:pt-0">
		<Button type="submit" class="h-[52px] w-full rounded-full" disabled={pending}>
			{pending ? m['common.busy']() : m['button.sign-in']()}
		</Button>

		{#if seconds > 0}
			<p class="flex h-[52px] items-center justify-center text-caption font-medium">
				{m['button.resend-otp-timer']({ time: seconds })}
			</p>
		{:else}
			<Button
				type="button"
				variant="secondary"
				class="h-[52px] w-full rounded-full"
				disabled={pending}
				onclick={onResend}
			>
				{m['button.resend-otp']()}
			</Button>
		{/if}
	</div>
</form>
