<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { m } from '$lib/paraglide/messages';
	import type { BookingContacts } from '$lib/stores/booking.svelte';
	import { contactIssues, type ContactField, type ContactIssue } from '$lib/utils/booking-form';

	let {
		contacts,
		onUpdate,
		onBack,
		onContinue
	}: {
		contacts: BookingContacts;
		onUpdate: (patch: Partial<BookingContacts>) => void;
		onBack: () => void;
		onContinue: () => void;
	} = $props();

	const fields: Array<{
		key: ContactField;
		label: () => string;
		placeholder: () => string;
		required: boolean;
		autocomplete: HTMLInputAttributes['autocomplete'];
		inputmode?: 'tel' | 'email';
	}> = [
		{
			key: 'lastname',
			label: m['input.lastname.label'],
			placeholder: m['input.lastname.placeholder'],
			required: true,
			autocomplete: 'family-name'
		},
		{
			key: 'firstname',
			label: m['input.firstname.label'],
			placeholder: m['input.firstname.placeholder'],
			required: true,
			autocomplete: 'given-name'
		},
		{
			key: 'middlename',
			label: m['input.middlename.label'],
			placeholder: m['input.middlename.placeholder'],
			required: true,
			autocomplete: 'additional-name'
		},
		{
			key: 'phone',
			label: m['input.phone.label'],
			placeholder: m['input.phone.placeholder'],
			required: true,
			autocomplete: 'tel',
			inputmode: 'tel'
		},
		{
			key: 'city',
			label: m['input.city.label'],
			placeholder: m['input.city.placeholder'],
			required: false,
			autocomplete: 'address-level2'
		},
		{
			key: 'email',
			label: m['input.email.label'],
			placeholder: m['input.email.placeholder'],
			required: false,
			autocomplete: 'email',
			inputmode: 'email'
		}
	];

	const inputClass =
		'h-10 rounded-full bg-background px-4 text-[20px] leading-6 font-normal shadow-input aria-invalid:border-destructive-border dark:bg-background';

	let form = $state<BookingContacts>(untrack(() => ({ ...contacts })));
	let touched = $state(false);

	const issues = $derived(touched ? contactIssues(form) : {});

	function issueMessage(issue: ContactIssue): string {
		switch (issue) {
			case 'required':
				return m['validation.required']();
			case 'phone':
				return m['validation.invalid-phone']();
			case 'email':
				return m['validation.invalid-email']();
		}
	}

	function updateField(key: ContactField, value: string): void {
		form[key] = value;
		onUpdate({ [key]: value });
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		touched = true;

		if (Object.keys(contactIssues(form)).length === 0) {
			onContinue();
		}
	}
</script>

<form class="flex flex-col gap-6" novalidate onsubmit={handleSubmit}>
	<div class="grid gap-6 lg:grid-cols-2 lg:gap-x-12">
		<div class="flex flex-col gap-6">
			{#each fields.slice(0, 3) as field (field.key)}
				{@render contactField(field)}
			{/each}
		</div>
		<div class="flex flex-col gap-6">
			{#each fields.slice(3) as field (field.key)}
				{@render contactField(field)}
			{/each}
		</div>
	</div>

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
		>
			{m['button.continue']()}
		</Button>
	</div>
</form>

{#snippet contactField(field: (typeof fields)[number])}
	{@const issue = issues[field.key]}
	<div class="flex flex-col gap-1">
		<label for={`contact-${field.key}`} class="text-[14px] leading-[22px] font-medium">
			{field.label()}{field.required ? '*' : ''}
		</label>
		<Input
			id={`contact-${field.key}`}
			name={field.key}
			class={inputClass}
			placeholder={field.placeholder()}
			autocomplete={field.autocomplete}
			inputmode={field.inputmode}
			required={field.required}
			aria-invalid={issue ? true : undefined}
			aria-describedby={issue ? `contact-${field.key}-error` : undefined}
			value={form[field.key]}
			oninput={(event) => updateField(field.key, event.currentTarget.value)}
		/>
		{#if issue}
			<p id={`contact-${field.key}-error`} class="text-caption text-destructive-foreground">
				{issueMessage(issue)}
			</p>
		{/if}
	</div>
{/snippet}
