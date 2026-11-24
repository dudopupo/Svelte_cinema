<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { signOut, updateProfile } from '$lib/api/account';
	import type { UpdateProfilePayload } from '$lib/api/types';
	import ProfileForm from '$lib/components/cinema/profile/profile-form.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function handleSave(payload: UpdateProfilePayload): Promise<void> {
		await updateProfile(payload);
		await invalidateAll();
	}

	async function handleLogout(): Promise<void> {
		await signOut();
		await goto(resolve('/'), { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>{m['profile.title']()} — {m['app.name']()}</title>
</svelte:head>

<ProfileForm user={data.user} onSave={handleSave} onLogout={handleLogout} />
