<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { UpdateProfilePayload, User } from '$lib/api/types';
	import { ApiError } from '$lib/api/client';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ConfirmDialog from '$lib/components/cinema/shared/confirm-dialog.svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		profileFromUser,
		profileIssues,
		profilePayload,
		type ProfileField
	} from '$lib/utils/profile-form';
	import { cn } from '$lib/utils.js';

	let {
		user,
		onSave,
		onLogout
	}: {
		user: User;
		onSave: (payload: UpdateProfilePayload) => Promise<void>;
		onLogout: () => Promise<void>;
	} = $props();

	const inputClass =
		'h-10 rounded-full bg-background px-4 text-[20px] leading-6 font-normal shadow-input aria-invalid:border-destructive-border dark:bg-background';

	const fields: Array<{
		key: ProfileField;
		label: () => string;
		placeholder: () => string;
		autocomplete: HTMLInputAttributes['autocomplete'];
		inputmode?: 'tel' | 'email';
		readonly?: boolean;
		grid: string;
	}> = [
		{
			key: 'lastname',
			label: m['input.lastname.label'],
			placeholder: m['input.lastname.placeholder'],
			autocomplete: 'family-name',
			grid: 'order-1 md:col-start-1 md:row-start-1'
		},
		{
			key: 'firstname',
			label: m['input.firstname.label'],
			placeholder: m['input.firstname.placeholder'],
			autocomplete: 'given-name',
			grid: 'order-2 md:col-start-1 md:row-start-2'
		},
		{
			key: 'middlename',
			label: m['input.middlename.label'],
			placeholder: m['input.middlename.placeholder'],
			autocomplete: 'additional-name',
			grid: 'order-3 md:col-start-1 md:row-start-3'
		},
		{
			key: 'city',
			label: m['input.city.label'],
			placeholder: m['input.city.placeholder'],
			autocomplete: 'address-level2',
			grid: 'order-4 md:col-start-2 md:row-start-3'
		},
		{
			key: 'phone',
			label: m['input.phone.label'],
			placeholder: m['input.phone.placeholder'],
			autocomplete: 'tel',
			inputmode: 'tel',
			readonly: true,
			grid: 'order-5 md:col-start-2 md:row-start-1'
		},
		{
			key: 'email',
			label: m['input.email.label'],
			placeholder: m['profile.email-placeholder'],
			autocomplete: 'email',
			inputmode: 'email',
			grid: 'order-6 md:col-start-2 md:row-start-2'
		}
	];

	let form = $state(untrack(() => profileFromUser(user)));
	let touched = $state(false);
	let saving = $state(false);
	let loggingOut = $state(false);
	let success = $state<string | null>(null);
	let error = $state<string | null>(null);
	let logoutOpen = $state(false);

	const issues = $derived(touched ? profileIssues(form) : {});

	function updateField(key: ProfileField, value: string): void {
		form[key] = value;
		success = null;
		error = null;
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		touched = true;
		success = null;
		error = null;

		if (Object.keys(profileIssues(form)).length > 0) return;

		saving = true;

		try {
			await onSave(profilePayload(form));
			success = m['profile.update-success']();
		} catch (cause) {
			error = cause instanceof ApiError ? cause.message : m['profile.update-error']();
		} finally {
			saving = false;
		}
	}

	async function handleLogout(): Promise<void> {
		logoutOpen = false;
		error = null;
		loggingOut = true;

		try {
			await onLogout();
		} catch (cause) {
			error = cause instanceof ApiError ? cause.message : m['profile.logout-error']();
		} finally {
			loggingOut = false;
		}
	}
</script>

<h1 class="text-title-md max-md:sr-only">{m['profile.title']()}</h1>

<form class="mt-6 flex flex-col gap-6" novalidate onsubmit={handleSubmit}>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-[342px_342px] md:gap-x-10 md:gap-y-4">
		{#each fields as field (field.key)}
			{@const issue = issues[field.key]}
			<div class={cn('flex flex-col gap-1', field.grid)}>
				<label for={`profile-${field.key}`} class="text-caption">{field.label()}</label>
				<Input
					id={`profile-${field.key}`}
					name={field.key}
					class={inputClass}
					placeholder={field.placeholder()}
					autocomplete={field.autocomplete}
					inputmode={field.inputmode}
					readonly={field.readonly}
					aria-invalid={issue ? true : undefined}
					aria-describedby={issue ? `profile-${field.key}-error` : undefined}
					value={form[field.key]}
					oninput={(event) => updateField(field.key, event.currentTarget.value)}
				/>
				{#if issue}
					<p id={`profile-${field.key}-error`} class="text-caption text-destructive-foreground">
						{m['validation.invalid-email']()}
					</p>
				{/if}
			</div>
		{/each}
	</div>

	{#if success || error}
		<div class="flex flex-col gap-1" aria-live="polite">
			{#if success}
				<p class="text-caption text-success-foreground">{success}</p>
			{/if}
			{#if error}
				<p class="text-caption text-destructive-foreground" role="alert">{error}</p>
			{/if}
		</div>
	{/if}

	<div class="flex flex-col gap-2.5 md:w-[343px] md:gap-4">
		<Button
			type="submit"
			variant="secondary"
			class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium"
			disabled={saving}
			aria-busy={saving}
		>
			{saving ? m['common.busy']() : m['button.update-profile']()}
		</Button>
		<Button
			type="button"
			class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium"
			disabled={loggingOut}
			aria-busy={loggingOut}
			onclick={() => (logoutOpen = true)}
		>
			{loggingOut ? m['common.busy']() : m['button.logout']()}
		</Button>
	</div>
</form>

<ConfirmDialog
	open={logoutOpen}
	title={m['profile.logout-confirm']()}
	secondaryLabel={m['button.cancel']()}
	primaryLabel={m['button.logout']()}
	onSecondary={() => (logoutOpen = false)}
	onPrimary={handleLogout}
	onClose={() => (logoutOpen = false)}
/>
