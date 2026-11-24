import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Our typography scale lives in `@theme` (layout.css). Without registering it,
// tailwind-merge treats classes such as `text-body-sm` as text colors and
// strips real color utilities like `text-primary-foreground` from the same list.
const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			text: [
				'heading-2xl',
				'heading-xl',
				'heading-lg',
				'heading-md',
				'title-lg',
				'title-md',
				'body-lg',
				'body-md',
				'body-sm',
				'link',
				'caption'
			]
		}
	}
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
