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
	const position: HeroMainPosition = center || host.mainPosition in MAIN_CORNER ? host.mainPosition : 'bottom-left';
	// Without media the panel is the whole hero, so layout and position do not
	// come into it.
	if (host._hasMedia && (host.layout !== 'contained' || center)) {
		clear(host);
		if (import.meta.env?.DEV) {
			warnOnce(host, 'unsupported', `<nldd-hero>: corner only applies with layout="contained" and the panel in a corner or along a side, so this hero stays rectangular. Set layout="contained" and a main-position other than "${position}", or drop the corner.`);
		}
		return;
	}

	const cornerPosition = (center ? 'bottom-left' : position) as CornerPosition;
	const chosen = CORNERS.includes(host.corner as HeroCorner) ? host.corner as HeroCorner : null;
	const covered = host._hasMedia ? coveredCorners(host, cornerPosition) : [];

	let mediaCorner = chosen ?? AUTO_MEDIA_CORNER[cornerPosition];
	if (!chosen && covered.includes(mediaCorner)) {
		// A full-width strip covers both corners on its edge: move to the
		// other edge, on the same side.
		const horizontal = mediaCorner.endsWith('left') ? 'left' : 'right';
		mediaCorner = `${mediaCorner.startsWith('top') ? 'bottom' : 'top'}-${horizontal}`;
	}

	const mainCorner = host._hasMedia && host.mainWidth !== 'full' ? MAIN_CORNER[cornerPosition] : null;

	host.setAttribute('data-media-corner', mediaCorner);
	host.setAttribute('data-main-corner', mainCorner ?? 'none');

	if (!import.meta.env?.DEV) return;
	if (chosen && covered.includes(chosen)) {
		warnOnce(host, `covered-${chosen}`, `<nldd-hero>: corner="${chosen}" sits under the panel, so the rounded corner does not show. Choose a corner the panel leaves free, or leave the value empty to let the hero choose.`);
	}
	if (host.width === 'full') {
		warnOnce(host, 'width-full', '<nldd-hero>: corner with width="full" runs the hero to the edge of the screen. A shape with a rounded corner always keeps a margin around it; leave width="full" off or drop the corner.');
	}
}
