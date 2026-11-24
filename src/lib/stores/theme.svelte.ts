export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'cinema-theme';

function readTheme(): ThemeMode {
	if (typeof document === 'undefined') return 'dark';

	const attribute = document.documentElement.dataset.theme;
	if (attribute === 'light' || attribute === 'dark') return attribute;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') return stored;
	} catch {
		// localStorage can be unavailable in private mode
	}

	return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

class ThemeStore {
	current = $state<ThemeMode>('dark');

	init(): void {
		this.apply(readTheme());
	}

	set(mode: ThemeMode): void {
		this.apply(mode);
		try {
			localStorage.setItem(STORAGE_KEY, mode);
		} catch {
			// ignore persistence errors
		}
	}

	toggle(): void {
		this.set(this.current === 'dark' ? 'light' : 'dark');
	}

	private apply(mode: ThemeMode): void {
		this.current = mode;
		if (typeof document === 'undefined') return;

		document.documentElement.dataset.theme = mode;
		document.documentElement.classList.toggle('dark', mode === 'dark');
	}
}

export const theme = new ThemeStore();
