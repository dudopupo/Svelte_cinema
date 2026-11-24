<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogTitle
	} from '$lib/components/ui/dialog/index.js';
	import { m } from '$lib/paraglide/messages';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		open = false,
		title,
		secondaryLabel,
		primaryLabel,
		onSecondary,
		onPrimary,
		onClose = () => {}
	}: {
		open?: boolean;
		title: string;
		secondaryLabel: string;
		primaryLabel: string;
		onSecondary: () => void;
		onPrimary: () => void;
		onClose?: () => void;
	} = $props();

	function handleOpenChange(next: boolean): void {
		if (!next) onClose();
	}
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
	<DialogContent
		showCloseButton={false}
		aria-describedby={undefined}
		class="max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:gap-0 max-md:rounded-t-2xl max-md:rounded-b-none max-md:p-4 md:max-w-[544px] md:gap-4 md:rounded-3xl md:px-4 md:py-6"
	>
		<div class="hidden justify-end md:flex">
			<DialogClose
				type="button"
				class="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
				aria-label={m['button.close']()}
			>
				<XIcon class="size-6" />
			</DialogClose>
		</div>

		<div class="flex flex-col items-center gap-0 md:gap-4 md:px-8">
			<span
				class="flex size-20 shrink-0 items-center justify-center rounded-full bg-foreground text-[40px] leading-none font-bold text-background"
				aria-hidden="true"
			>
				?
			</span>

			<DialogTitle class="max-w-[448px] px-2 py-3 text-center text-title-md">
				{title}
			</DialogTitle>

			<div class="flex w-full flex-col gap-2 md:gap-4">
				<Button
					variant="secondary"
					class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium"
					onclick={onSecondary}
				>
					{secondaryLabel}
				</Button>
				<Button
					class="h-[52px] w-full rounded-full text-[14px] leading-[21px] font-medium"
					onclick={onPrimary}
				>
					{primaryLabel}
				</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>
