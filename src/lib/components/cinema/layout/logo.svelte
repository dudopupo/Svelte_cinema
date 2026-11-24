<script lang="ts">
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
</script>

<a
	href={resolve('/')}
	class="flex items-center gap-1"
	aria-label={`${m['app.brand']()} — ${m['app.name']()}`}
>
	<img src="/images/logo.png" alt="" class="size-6 object-contain" width="24" height="24" />
	<span class="text-[16px] leading-6 font-extrabold tracking-[0.32px] uppercase">
		{m['app.brand']()}
	</span>
</a>
