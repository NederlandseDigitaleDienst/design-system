export const breakpoints = {
	smMin: '320px',
	smMax: '640px',
	mdMin: '641px',
	mdMax: '1007px',
	lgMin: '1008px',
} as const;

/**
 * The same breakpoints in rem, for `@container` and `@media` conditions. With
 * page zoom, Safari compares the width of a container that takes its size from
 * the layout in zoomed pixels, so a px condition sees a narrow container as
 * wide; a rem condition scales with the zoom. At the default font size of
 * 16px they equal the px values.
 */
export const queryBreakpoints = {
	smMin: '20rem',
	smMax: '40rem',
	mdMin: '40.0625rem',
	mdMax: '62.9375rem',
	lgMin: '63rem',
} as const;

/**
 * The root font size in CSS pixels, what 1rem is in the query conditions. It
 * reads the computed style of the page, so call it in the browser (in
 * connectedCallback, a resize observer or an event handler), not during SSR.
 */
export function rootFontSize(): number {
	return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/**
 * A breakpoint in CSS pixels at the root font size, for a width that script
 * compares itself. It matches what the rem conditions in the styles see, also
 * when someone has set a larger default font size. Comparing against more than
 * one breakpoint, read `rootFontSize()` once and pass it in. Browser only, like
 * `rootFontSize()`.
 */
export function breakpointPx(name: keyof typeof queryBreakpoints, fontSize = rootFontSize()): number {
	return parseFloat(queryBreakpoints[name]) * fontSize;
}
