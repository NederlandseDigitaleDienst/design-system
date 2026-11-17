/**
 * The theme and the color scheme a visitor chose on the landing page, kept for
 * the other pages. So a component can be looked at in the color of your own
 * organization, and in light or dark, on its own page.
 *
 * Both are attributes on <html>, as in an application: `data-nldd-theme` and
 * `data-scheme`. Without a choice neither is set, which is lintblauw in the
 * scheme of the system.
 */

const KEYS = { theme: 'nldd-site-theme', scheme: 'nldd-site-scheme' } as const;
const ATTRIBUTES = { theme: 'data-nldd-theme', scheme: 'data-scheme' } as const;

type Preference = keyof typeof KEYS;

function stored(preference: Preference): string | null {
	// Storage can be unavailable, in a private window or with cookies blocked.
	try {
		return localStorage.getItem(KEYS[preference]);
	} catch {
		return null;
	}
}

/** Sets a preference on the page and remembers it. An empty value clears it. */
export function setPreference(preference: Preference, value: string): void {
	const root = document.documentElement;
	if (value) root.setAttribute(ATTRIBUTES[preference], value);
	else root.removeAttribute(ATTRIBUTES[preference]);
	try {
		if (value) localStorage.setItem(KEYS[preference], value);
		else localStorage.removeItem(KEYS[preference]);
	} catch {
		// The page still changes; the choice just does not travel along.
	}
}

export function getPreference(preference: Preference): string {
	return stored(preference) ?? '';
}

/** Puts the remembered choices on the page. An attribute that is already set wins. */
export function applyPreferences(): void {
	const root = document.documentElement;
	for (const preference of ['theme', 'scheme'] as const) {
		const value = stored(preference);
		if (value && !root.hasAttribute(ATTRIBUTES[preference])) root.setAttribute(ATTRIBUTES[preference], value);
	}
}
