/**
 * A font size of your own per breakpoint, for a component that otherwise takes
 * its size from the scale (`sm-custom-size`, `md-custom-size`, `lg-custom-size`).
 * The component writes each valid value into `--_{prefix}-{breakpoint}-custom-size`
 * and marks the host with `data-{breakpoint}-custom-size`; its styles put the
 * value inside a max() with its own size, so it never shows smaller.
 */
import { setState } from './element-state.js';

export type Breakpoint = 'sm' | 'md' | 'lg';

export const BREAKPOINTS: readonly Breakpoint[] = ['sm', 'md', 'lg'];

/** The font size of display size 1 per breakpoint: the floor of a custom size on nldd-title and nldd-text. */
export const DISPLAY_1_FONT_SIZE: Record<Breakpoint, string> = {
	sm: 'var(--primitives-font-size-700)',
	md: 'var(--primitives-font-size-800)',
	lg: 'var(--primitives-font-size-1000)',
};

/** Font-size values that are not a length: the CSS-wide keywords and the
 *  absolute and relative size keywords. */
const NOT_A_LENGTH = new Set([
	'inherit', 'initial', 'unset', 'revert', 'revert-layer',
	'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large',
	'larger', 'smaller', 'math',
]);

/** A length font-size takes. A keyword cannot go inside the max() that keeps the floor, so it would void the whole font. */
export function isFontSize(value: string): boolean {
	return !NOT_A_LENGTH.has(value.toLowerCase()) && CSS.supports('font-size', value);
}

/**
 * Writes the valid custom sizes onto the host and returns them. A breakpoint
 * without a valid value keeps the size from the scale. Sets the
 * `invalid-custom-size` state when a value is given that is not a length.
 * Call it from willUpdate(), so the first paint already has the size.
 */
export function applyCustomFontSizes(
	host: HTMLElement,
	prefix: string,
	own: Record<Breakpoint, string>,
): Partial<Record<Breakpoint, string>> {
	const sizes: Partial<Record<Breakpoint, string>> = {};
	// Nothing to measure or write when rendered without a DOM, as on a server.
	if (typeof CSS === 'undefined') return sizes;
	let invalid = false;
	for (const breakpoint of BREAKPOINTS) {
		const value = (own[breakpoint] || '').trim();
		const valid = value !== '' && isFontSize(value);
		if (valid) {
			sizes[breakpoint] = value;
			host.style.setProperty(`--_${prefix}-${breakpoint}-custom-size`, value);
		} else {
			host.style.removeProperty(`--_${prefix}-${breakpoint}-custom-size`);
		}
		host.toggleAttribute(`data-${breakpoint}-custom-size`, valid);
		if (value !== '' && !valid) invalid = true;
	}
	setState(host, 'invalid-custom-size', invalid);
	return sizes;
}

/**
 * DEV-only: sets the `custom-size-below-floor` state when a fixed custom size
 * is smaller than the floor at its breakpoint, which then shows instead.
 */
export function checkCustomFontSizeFloor(
	host: HTMLElement,
	sizes: Partial<Record<Breakpoint, string>>,
	floors: Record<Breakpoint, string>,
): void {
	if (!host.shadowRoot || Object.keys(sizes).length === 0) {
		setState(host, 'custom-size-below-floor', false);
		return;
	}
	const probe = document.createElement('span');
	probe.style.position = 'absolute';
	probe.style.visibility = 'hidden';
	host.shadowRoot.append(probe);
	const px = (value: string): number => {
		probe.style.fontSize = value;
		return parseFloat(getComputedStyle(probe).fontSize);
	};
	let below = false;
	try {
		for (const [breakpoint, value] of Object.entries(sizes) as [Breakpoint, string][]) {
			// A value relative to the viewport, a container or the surrounding
			// text resolves to something else elsewhere, so it is left to the
			// CSS floor rather than measured here.
			if (/%|\d(?:v[whib]|vmin|vmax|cq[whib]|cqmin|cqmax|em|ex|ch|cap|ic|lh)\b/.test(value)) continue;
			if (px(value) < px(floors[breakpoint]) - 0.5) below = true;
		}
	} finally {
		probe.remove();
	}
	setState(host, 'custom-size-below-floor', below);
}
