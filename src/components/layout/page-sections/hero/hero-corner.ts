import type { HeroLayout, HeroMainPosition } from './hero.js';

export type HeroCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type CornerPosition = Exclude<HeroMainPosition, 'top-center' | 'bottom-center'>;

const CORNERS: readonly HeroCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/** What the corner logic reads off the hero. */
interface CornerHost extends HTMLElement {
	corner: string | null;
	layout: HeroLayout;
	mainPosition: HeroMainPosition;
	mainWidth: string;
	width: string;
	readonly _hasMedia: boolean;
}

/* The media corner per panel position, curated from the Rijkshuisstijl
 * examples rather than derived: always a corner the panel leaves free. */
const AUTO_MEDIA_CORNER: Record<CornerPosition, HeroCorner> = {
	'bottom-left': 'top-right',
	'bottom-right': 'bottom-left',
	'top-left': 'top-right',
	'top-right': 'top-left',
	'left': 'top-right',
	'right': 'top-left',
};

/* The panel's own corner: the one pointing diagonally into the media. A panel
 * that spans a full side has none. */
const MAIN_CORNER: Record<CornerPosition, HeroCorner | null> = {
	'bottom-left': 'top-right',
	'bottom-right': 'top-left',
	'top-left': 'bottom-right',
	'top-right': 'bottom-left',
	'left': null,
	'right': null,
};

/** The media corners the panel stands on, where a rounded corner would vanish. */
function coveredCorners(host: CornerHost, position: CornerPosition): HeroCorner[] {
	if (position === 'left') return ['top-left', 'bottom-left'];
	if (position === 'right') return ['top-right', 'bottom-right'];
	if (host.mainWidth !== 'full') return [position];
	const vertical = position.startsWith('top') ? 'top' : 'bottom';
	return [`${vertical}-left`, `${vertical}-right`];
}

const warned = new WeakMap<HTMLElement, Set<string>>();

function warnOnce(host: HTMLElement, key: string, message: string): void {
	const keys = warned.get(host) ?? new Set<string>();
	if (keys.has(key)) return;
	keys.add(key);
	warned.set(host, keys);
	console.warn(message, host);
}

function clear(host: HTMLElement): void {
	host.removeAttribute('data-media-corner');
	host.removeAttribute('data-main-corner');
}

/**
 * Works out which corners are rounded and writes them onto the host as
 * `data-media-corner` and `data-main-corner`, which the corner stylesheet
 * keys off. Without `corner`, or where a corner does not fit the shape
 * language, both are removed and the hero is rectangular.
 */
export function applyCorner(host: CornerHost): void {
	if (host.corner === null || host.corner === undefined) {
		clear(host);
		return;
	}

	const center = host.mainPosition === 'top-center' || host.mainPosition === 'bottom-center';
	// An unknown main-position is the default, as on the hero itself.
	const position: CornerPosition = Object.prototype.hasOwnProperty.call(MAIN_CORNER, host.mainPosition)
		? host.mainPosition as CornerPosition
		: 'bottom-left';
	// Without media the panel is the whole hero, so layout and position do not
	// come into it.
	if (host._hasMedia && (host.layout !== 'contained' || center)) {
		clear(host);
		if (import.meta.env?.DEV) {
			const fixes = [
				host.layout !== 'contained' ? 'set layout="contained"' : '',
				center ? `put the panel in a corner or along a side instead of main-position="${host.mainPosition}"` : '',
			].filter(Boolean);
			warnOnce(host, `unsupported-${fixes.length}-${center}`, `<nldd-hero>: corner only applies with layout="contained" and the panel in a corner or along a side, so this hero stays rectangular. To round it, ${fixes.join(' and ')}; or drop the corner.`);
		}
		return;
	}

	const value = host.corner.trim();
	const chosen = CORNERS.includes(value as HeroCorner) ? value as HeroCorner : null;
	const covered = host._hasMedia ? coveredCorners(host, position) : [];

	let mediaCorner = chosen ?? AUTO_MEDIA_CORNER[position];
	if (!chosen && covered.includes(mediaCorner)) {
		// A full-width strip covers both corners on its edge: move to the
		// other edge, on the same side.
		const horizontal = mediaCorner.endsWith('left') ? 'left' : 'right';
		mediaCorner = `${mediaCorner.startsWith('top') ? 'bottom' : 'top'}-${horizontal}`;
	}

	const mainCorner = host._hasMedia && host.mainWidth !== 'full' ? MAIN_CORNER[position] : null;

	host.setAttribute('data-media-corner', mediaCorner);
	if (mainCorner) host.setAttribute('data-main-corner', mainCorner);
	else host.removeAttribute('data-main-corner');

	if (!import.meta.env?.DEV) return;
	if (!chosen && value !== '' && value !== 'auto') {
		warnOnce(host, `unknown-${value}`, `<nldd-hero>: corner="${value}" is not a corner, so the hero chooses one. Use "top-left", "top-right", "bottom-left" or "bottom-right", or leave the value empty.`);
	}
	if (chosen && covered.includes(chosen)) {
		warnOnce(host, `covered-${chosen}`, `<nldd-hero>: corner="${chosen}" sits under the panel, so the rounded corner does not show. Choose a corner the panel leaves free, or leave the value empty to let the hero choose.`);
	}
	if (host.width === 'full') {
		warnOnce(host, 'width-full', '<nldd-hero>: corner with width="full" runs the hero to the edge of the screen. A shape with a rounded corner always keeps a margin around it; leave width="full" off or drop the corner.');
	}
}
