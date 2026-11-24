import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
	it('keeps custom typography and text color utilities together', () => {
		expect(cn('text-body-md', 'text-neutral-700')).toBe('text-body-md text-neutral-700');
		expect(cn('text-primary-foreground', 'text-body-sm')).toBe(
			'text-primary-foreground text-body-sm'
		);
	});

	it('still lets the last conflicting utility win', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
		expect(cn('text-sm', 'text-title-md')).toBe('text-title-md');
	});
});
