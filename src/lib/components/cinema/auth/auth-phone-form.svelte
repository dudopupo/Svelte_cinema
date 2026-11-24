<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { m } from '$lib/paraglide/messages';
	import { formatAuthPhone, isAuthPhoneValid } from '$lib/utils/auth';

	let {
		pending = false,
		error = null,
		onSubmit
	}: {
		pending?: boolean;
		error?: string | null;
		onSubmit: (phone: string) => void;
	} = $props();

	const inputClass =
		'h-10 rounded-full bg-background px-4 text-[20px] leading-6 font-normal shadow-input aria-invalid:border-destructive-border dark:bg-background';

	let phone = $state('');
	let touched = $state(false);

	const invalid = $derived(touched && !isAuthPhoneValid(phone));

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		const formatted = formatAuthPhone(event.currentTarget.value);
		phone = formatted;
		event.currentTarget.value = formatted;
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		touched = true;

		if (isAuthPhoneValid(phone)) {
			onSubmit(phone);
		}
	}
</script>

<form class="flex flex-col gap-6" novalidate aria-busy={pending} onsubmit={handleSubmit}>
	<div class="flex flex-col gap-1">
		<label for="auth-phone" class="text-caption">{m['input.phone.label']()}</label>
		<Input
			id="auth-phone"
			name="phone"
			class={inputClass}
			placeholder="+7"
			autocomplete="tel"
			inputmode="tel"
			required
			aria-invalid={invalid ? true : undefined}
			aria-describedby={invalid ? 'auth-phone-error' : undefined}
			value={phone}
			oninput={handleInput}
		/>
		{#if invalid}
			<p id="auth-phone-error" class="text-caption text-destructive-foreground">
				{m['validation.invalid-phone']()}
			</p>
		{/if}
		{#if error}
			<p class="text-caption text-destructive-foreground" role="alert">{error}</p>
		{/if}
	</div>

	<div class="pt-4 md:pt-0">
		<Button type="submit" class="h-[52px] w-full rounded-full" disabled={pending}>
			{#if pending}
				{m['common.busy']()}
			{:else}
				<span class="md:hidden">{m['button.continue']()}</span>
				<span class="hidden md:inline">{m['button.sign-in']()}</span>
			{/if}
		</Button>
	</div>
</form>
