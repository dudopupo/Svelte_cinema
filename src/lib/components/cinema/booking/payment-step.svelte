<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { m } from '$lib/paraglide/messages';
	import {
		cardIssues,
		formatCardExpiry,
		formatCardPan,
		formatCvv,
		type CardFields,
		type CardIssue
	} from '$lib/utils/booking-form';

	let {
		onBack,
		onPay
	}: {
		onBack: () => void;
		onPay: (card: CardFields) => Promise<string | null>;
	} = $props();

	const inputClass =
		'h-10 w-full rounded-full bg-background px-4 text-[20px] leading-6 font-normal shadow-input aria-invalid:border-destructive-border dark:bg-background';

	let card = $state<CardFields>({ pan: '', expireDate: '', cvv: '' });
	let touched = $state(false);
	let submitting = $state(false);
	let submitError = $state<string | null>(null);

	const issues = $derived(touched ? cardIssues(card) : {});

	function issueMessage(issue: CardIssue): string {
		switch (issue) {
			case 'required':
				return m['validation.required']();
			case 'pan':
				return m['validation.invalid-card-format']();
			case 'expiry':
				return m['validation.invalid-expiry-format']();
			case 'cvv':
				return m['validation.invalid-cvv-format']();
		}
	}

	function updatePan(event: Event & { currentTarget: HTMLInputElement }): void {
		const value = formatCardPan(event.currentTarget.value);
		card.pan = value;
		event.currentTarget.value = value;
	}

	function updateExpiry(event: Event & { currentTarget: HTMLInputElement }): void {
		const value = formatCardExpiry(event.currentTarget.value);
		card.expireDate = value;
		event.currentTarget.value = value;
	}

	function updateCvv(event: Event & { currentTarget: HTMLInputElement }): void {
		const value = formatCvv(event.currentTarget.value);
		card.cvv = value;
		event.currentTarget.value = value;
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		touched = true;
		submitError = null;

		if (Object.keys(cardIssues(card)).length > 0) return;

		submitting = true;

		try {
			const error = await onPay({ ...card });
			if (error) submitError = error;
		} catch {
			submitError = m['buy.pay.error']();
		} finally {
			submitting = false;
		}
	}
</script>

<form
	class="flex min-h-[calc(100dvh-12rem)] flex-col gap-6 md:min-h-0"
	novalidate
	aria-busy={submitting}
	onsubmit={handleSubmit}
>
	<div
		class="flex w-full flex-col gap-4 self-start rounded-3xl bg-secondary p-6 lg:w-[280px] lg:gap-4 lg:rounded-none lg:bg-transparent lg:p-0"
	>
		<div class="flex flex-col gap-1">
			<label for="card-pan" class="text-[14px] leading-[22px] font-medium">
				{m['input.pan.label']()}
			</label>
			<Input
				id="card-pan"
				name="pan"
				class={inputClass}
				placeholder={m['input.pan.placeholder']()}
				autocomplete="cc-number"
				inputmode="numeric"
				aria-invalid={issues.pan ? true : undefined}
				aria-describedby={issues.pan ? 'card-pan-error' : undefined}
				value={card.pan}
				oninput={updatePan}
			/>
			{#if issues.pan}
				<p id="card-pan-error" class="text-caption text-destructive-foreground">
					{issueMessage(issues.pan)}
				</p>
			{/if}
		</div>

		<div class="grid grid-cols-2 gap-6 lg:gap-4">
			<div class="flex flex-col gap-1">
				<label for="card-expiry" class="text-[14px] leading-[22px] font-medium">
					{m['input.expire-date.label']()}
				</label>
				<Input
					id="card-expiry"
					name="expireDate"
					class={inputClass}
					placeholder={m['input.expire-date.placeholder']()}
					autocomplete="cc-exp"
					inputmode="numeric"
					aria-invalid={issues.expireDate ? true : undefined}
					aria-describedby={issues.expireDate ? 'card-expiry-error' : undefined}
					value={card.expireDate}
					oninput={updateExpiry}
				/>
				{#if issues.expireDate}
					<p id="card-expiry-error" class="text-caption text-destructive-foreground">
						{issueMessage(issues.expireDate)}
					</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label for="card-cvv" class="text-[14px] leading-[22px] font-medium">
					{m['input.cvv.label']()}
				</label>
				<Input
					id="card-cvv"
					name="cvv"
					type="password"
					class={inputClass}
					placeholder={m['input.cvv.placeholder']()}
					autocomplete="cc-csc"
					inputmode="numeric"
					aria-invalid={issues.cvv ? true : undefined}
					aria-describedby={issues.cvv ? 'card-cvv-error' : undefined}
					value={card.cvv}
					oninput={updateCvv}
				/>
				{#if issues.cvv}
					<p id="card-cvv-error" class="text-caption text-destructive-foreground">
						{issueMessage(issues.cvv)}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="mt-auto flex flex-col gap-4">
		{#if submitError}
			<p class="text-caption text-destructive-foreground" role="alert">{submitError}</p>
		{/if}

		<div class="flex flex-col gap-4 md:flex-row">
			<Button
				type="button"
				variant="secondary"
				class="hidden h-[52px] rounded-full text-[14px] leading-[21px] font-medium md:inline-flex md:flex-1"
				onclick={onBack}
			>
				{m['button.back']()}
			</Button>
			<Button
				type="submit"
				class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium md:flex-1"
				disabled={submitting}
			>
				{submitting ? m['buy.pay.processing']() : m['button.pay']()}
			</Button>
		</div>
	</div>
</form>
