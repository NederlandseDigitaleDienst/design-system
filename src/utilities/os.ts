/**
 * Detects the user's operating system from the browser's navigator API.
 * Used to pick OS-specific keyboard shortcut labels and similar
 * platform-aware UI variants.
 *
 * ChromeOS is reported as `'linux'` (its platform string matches
 * `cros`/`linux`). Falls back to `'other'` when the platform can't be
 * classified (Android, unknown UA strings, non-browser environments).
 */

export type OS = 'mac' | 'windows' | 'linux' | 'other';

let cached: OS | null = null;
let override: OS | null = null;

interface NavigatorWithUAData extends Navigator {
	userAgentData?: { platform?: string };
}

function classify(platform: string): OS {
	const p = platform.toLowerCase();
	// UACH (navigator.userAgentData.platform) reports 'iOS'; navigator.platform
	// reports 'iPhone'/'iPad'/'iPod'. Match both so iOS resolves to 'mac'.
	if (/mac|iphone|ipad|ipod|ios/.test(p)) return 'mac';
	if (/win/.test(p)) return 'windows';
	// Android's platform string contains "Linux" — bail before the linux check.
	if (/android/.test(p)) return 'other';
	if (/linux|cros/.test(p)) return 'linux';
	return 'other';
}

export function detectOS(): OS {
	if (override !== null) return override;
	if (cached !== null) return cached;
	if (typeof navigator === 'undefined') {
		cached = 'other';
		return cached;
	}
	const nav = navigator as NavigatorWithUAData;
	const platform = nav.userAgentData?.platform || nav.platform || '';
	cached = classify(platform);
	return cached;
}

/**
 * @internal — test/dev only.
 *
 * Force a specific OS for the duration of testing or stories.
 * Pass `null` to clear the override and fall back to real detection.
 * Mutates module-level singleton state and affects every component on
 * the page that calls `detectOS()` — not a supported public API
 * (hence the `_` prefix, matching `_resetOSDetectionCache`).
 */
export function _setOSOverride(os: OS | null): void {
	override = os;
}

/** Reset the detection cache. For tests that mock `navigator` between cases. */
export function _resetOSDetectionCache(): void {
	cached = null;
}

export function isMac(): boolean { return detectOS() === 'mac'; }
export function isWindows(): boolean { return detectOS() === 'windows'; }
export function isLinux(): boolean { return detectOS() === 'linux'; }
