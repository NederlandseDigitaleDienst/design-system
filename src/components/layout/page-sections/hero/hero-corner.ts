import type { HeroLayout, HeroMainPosition } from './hero.js';
import { setState } from '../../../../utilities/element-state.js';

export type HeroCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type CornerPosition = Exclude<HeroMainPosition, 'top-center' | 'bottom-center'>;

const CORNERS: readonly HeroCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/** What the corner logic reads off the hero. */
interface CornerHost extends HTMLElement {
	corner: string | null;
	layout: HeroLayout;
	mainPosition: HeroMainPosition;
	mainWidth: string;
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

/* Without media the panel is the whole hero: the free corner is at the top,
 * on the side the text does not start from. */
function autoCornerWithoutMedia(position: HeroMainPosition): HeroCorner {
	return position.endsWith('right') ? 'top-left' : 'top-right';
}

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

function clear(host: HTMLElement): void {
	host.removeAttribute('data-media-corner');
	host.removeAttribute('data-main-corner');
	setState(host, 'corner-covered', false);
	setState(host, 'corner-unknown', false);
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
		setState(host, 'corner-unsupported', false);
		return;
	}

	const center = host.mainPosition === 'top-center' || host.mainPosition === 'bottom-center';
	// An unknown main-position is the default, as on the hero itself.
	const position: CornerPosition = Object.prototype.hasOwnProperty.call(MAIN_CORNER, host.mainPosition)
		? host.mainPosition as CornerPosition
		: 'bottom-left';
	// Without media the panel is the whole hero, so layout and position do not
	// come into it.
	const unsupported = host._hasMedia && (host.layout !== 'contained' || center);
	setState(host, 'corner-unsupported', unsupported);
	if (unsupported) {
		clear(host);
		return;
	}

	const value = host.corner.trim();
	const chosen = CORNERS.includes(value as HeroCorner) ? value as HeroCorner : null;
	const covered = host._hasMedia ? coveredCorners(host, position) : [];

	let mediaCorner = chosen ?? (host._hasMedia ? AUTO_MEDIA_CORNER[position] : autoCornerWithoutMedia(host.mainPosition));
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

	setState(host, 'corner-covered', chosen !== null && covered.includes(chosen));
	setState(host, 'corner-unknown', chosen === null && value !== '' && value !== 'auto');
}

const LIMITS = ['--_hero-media-corner-limit', '--_hero-main-corner-limit'] as const;

/**
 * Caps the radius at a third of the shortest side of the area it rounds, so a
 * low hero (a single title without media, a small `media-height`) keeps a
 * corner rather than turning into a drop. Fed by a ResizeObserver on the media
 * and the panel; the panel's own limit only counts without media, where it is
 * the whole hero. An area that is not shown measures zero and keeps its limit.
 */
export function limitCorner(host: HTMLElement, entries: readonly ResizeObserverEntry[]): void {
	for (const entry of entries) {
		const box = entry.borderBoxSize?.[0];
		const width = box?.inlineSize ?? entry.contentRect.width;
		const height = box?.blockSize ?? entry.contentRect.height;
		if (!width || !height) continue;
		const limit = entry.target.classList.contains('hero__media') ? LIMITS[0] : LIMITS[1];
		host.style.setProperty(limit, `${Math.min(width, height) / 3}px`);
	}
}

export function clearCornerLimits(host: HTMLElement): void {
	for (const limit of LIMITS) host.style.removeProperty(limit);
}
