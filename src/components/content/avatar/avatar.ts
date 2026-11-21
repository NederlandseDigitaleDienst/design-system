/**
 * Nederlandse Digitale Dienst Avatar Component (Lit + TypeScript)
 *
 * Shows one person or organization as a compact, round (person) or rounded
 * (organization) representation. The content follows a fixed fallback chain: an
 * image when `src` loads, otherwise the initials (from `initials` or derived
 * from `name`), and otherwise a fallback icon.
 *
 * `type` sets both the shape and the fallback icon: `person` gives a circle
 * with a person icon, `organization` a rounded square with a building icon. The
 * shape belongs to the meaning and cannot be set on its own. Override the
 * fallback icon with `icon` where that helps.
 *
 * Without `size` the avatar scales with its container, like `nldd-icon`; a
 * fixed size (the same spacer-aligned scale, 16 through 96) is the exception.
 * The initials and the icon scale along. Wide initials (WW, MMM) are scaled
 * down automatically so they stay inside the shape. Four characters fit an
 * organization acronym such as LVVN or JenV; they read well from 40px, so below
 * that pick a shorter form.
 *
 * Accessibility: the host element carries the meaning. With a `name` (and
 * without `decorative`) it gets `role="img"` with the name as its label. When
 * the name already stands beside it as text, in an identity for instance, set
 * `decorative` so the avatar stays hidden from assistive software. A dead `src`
 * falls back to the initials or the icon, never to a broken-image icon.
 *
 * @element nldd-avatar
 * @keywords profile picture, profielfoto
 * @related nldd-identity, nldd-avatar-group, nldd-image
 *
 * @attr {string} color - `neutral` (the default, a neutral fill) or `content` (fill in the content color: the `--context-content-color` a surface, a button or a selected row sets; text in the contrast color, so the avatar can replace an icon in a button for instance)
 * @attr {string} size - `full` (the default) scales with the container, like nldd-icon; or a fixed size in px (spacer-aligned: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96). The initials and the icon scale along
 * @attr {boolean} icon-aligned - Shrinks the visible shape to 5/6 of the host, centered, so the avatar aligns optically with an icon on the same grid (an icon glyph has built-in margin)
 * @attr {string} icon - Overrides the type-dependent fallback icon
 * @attr {string} initials - Explicit initials, at most 4 characters, such as `KvK` or `LVVN` (overrides what is derived from `name`; also for organization acronyms). Four characters read well from 40px; below that use a shorter form
 * @attr {string} src - Image source; falls back to initials or icon when it fails to load
 * @attr {string} srcset - Responsive source set for the image (the component sets `sizes` itself)
 * @attr {boolean} button - Makes the avatar a button; ignored when `href` is set
 * @attr {string} accessible-label - Name of the link or button; without it `name` is used
 * @attr {boolean} decorative - Hides the avatar from assistive software (use when the name already stands beside it as text)
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for an avatar that is a link or a button inside a roving container (a row of an nldd-list). Does nothing on a decorative avatar.
 * @attr {string} tooltip-timing - When the name appears as a tooltip on hover or focus: `delay` (the default, after 700ms), `instant`, or `never`. An avatar shows no text, so without a tooltip the name is readable by assistive software only. A `decorative` avatar shows none regardless: there the name already stands beside it as text
 * @attr {string} name - Name of the person or organization; supplies the derived initials and the accessible label
 * @attr {string} type - `person` (circle, person icon) or `organization` (rounded, building icon); default `person`
 * @attr {string} href - Makes the avatar a link to this URL; the shape itself becomes the link, so the hit area and the focus ring follow it. As a link or a button the avatar needs size 24 or larger (WCAG 2.5.8)
 * @attr {string} target - Link target for href (e.g. '_blank'); completes rel and announces "Opens in a new tab". An `href` to another origin than the page (another website, a subdomain too) adds a visually hidden "andere website", in one sentence with the new-tab announcement when both apply; there is no way to switch it off.
 * @attr {string} rel - Link rel for href; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @example
 * ```html
 * <nldd-avatar name="Bart van de Biezen"></nldd-avatar>
 * <nldd-avatar
 * 	name="Jan Jansen"
 * 	src="/avatars/jan.jpg"
 * 	size="48"
 * ></nldd-avatar>
 * <nldd-avatar
 * 	type="organization"
 * 	name="Kamer van Koophandel"
 * 	initials="KvK"
 * ></nldd-avatar>
 * <nldd-avatar
 * 	name="Bart van de Biezen"
 * 	color="content"
 * ></nldd-avatar>
 * <nldd-avatar
 * 	name="Bart van de Biezen"
 * 	href="/profiel/"
 * ></nldd-avatar>
 * <nldd-avatar
 * 	name="Bart van de Biezen"
 * 	button
 * 	accessible-label="Profielmenu openen"
 * ></nldd-avatar>
 * ```
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { LayoutPass, sharedResizeObserver } from '../../../utilities/layout-pass.js';
import { nlddAvatarTranslations } from './avatar.i18n.js';
import { avatarStyles } from './avatar.styles.js';
import { avatarTemplate } from './avatar.template.js';
import '../icon/icon.js';

export type AvatarType = 'person' | 'organization';

export type AvatarColor = 'neutral' | 'content';

/** Fraction of the shape width the initials may occupy before they are scaled to
 *  fit. Leaves margin inside the circle so wide glyphs stay clear of the edge
 *  (the circle narrows above/below the center, so caps need room). */
const INITIALS_FIT_RATIO = 0.75;

/** Empty = scale to the container (like nldd-icon); the rest pin a fixed px size. */
export type AvatarSize =
	'full' | '16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96';

/**
 * How wide initials are against the shape they sit in, per text, font and
 * document (a themed part of the page can set another font). The initials take their font size from the width of the shape
 * (cqi), so that proportion is the same at every size: one avatar with "JJ"
 * that is laid out says it for every "JJ" on the page, also for one that is
 * hidden or not laid out yet. An avatar then measures nothing at all.
 */
const ratios = new WeakMap<Document, Map<string, number>>();

function ratiosOf(doc: Document): Map<string, number> {
	let map = ratios.get(doc);
	if (!map) {
		map = new Map();
		ratios.set(doc, map);
		// A web font that comes in changes the width of every text.
		doc.fonts?.addEventListener('loadingdone', () => {
			map!.clear();
			fitAvatars([...connected].filter((avatar) => avatar.ownerDocument === doc));
		});
	}
	return map;
}

/** Every avatar on a page, for a font that loads. */
const connected = new Set<NLDDAvatar>();

/**
 * Fits the initials of many avatars in one pass: first the texts that have no
 * ratio yet are measured, on the first avatar with that text that is laid
 * out, then every avatar writes its fit. An avatar that measured itself as it
 * rendered would read a layout the previous one had just made dirty, once per
 * avatar.
 */
function fitAvatars(avatars: NLDDAvatar[]): void {
	const live = avatars.filter((avatar) => avatar.isConnected);
	const keys = live.map((avatar) => avatar._ratioKey());
	live.forEach((avatar, i) => {
		const key = keys[i];
		if (!key) return;
		const known = ratiosOf(avatar.ownerDocument);
		if (known.has(key)) return;
		const ratio = avatar._measureRatio();
		if (ratio !== undefined) known.set(key, ratio);
	});
	live.forEach((avatar, i) => avatar._fitInitials(keys[i]));
}

/** The avatars that rendered new initials in the same tick. */
const fitPass = new LayoutPass<NLDDAvatar>(fitAvatars);

/** One observer for the avatars whose initials could not be measured yet,
 *  until their shape is laid out. */
const shapeObserver = sharedResizeObserver<NLDDAvatar>(fitAvatars);

@customElement('nldd-avatar')
export class NLDDAvatar extends withTranslations(LitElement, nlddAvatarTranslations) {
	static override styles = avatarStyles;

	@property({ reflect: true, converter: reflectNonDefault<AvatarColor>('neutral') })
	color: AvatarColor = 'neutral';

	@property({ reflect: true, converter: reflectNonDefault<AvatarSize>('full') })
	size: AvatarSize = 'full';

	@property({ type: Boolean, reflect: true, attribute: 'icon-aligned' })
	iconAligned = false;

	@property({ type: String })
	icon = '';

	@property({ type: String })
	initials = '';

	@property({ type: String })
	src = '';

	@property({ type: String })
	srcset = '';

	/** Makes the avatar a button. Ignored once `href` is set: one avatar is one
	 *  action, and a link outranks a button (the same rule as nldd-card). */
	@property({ type: Boolean, reflect: true })
	button = false;

	/** Accessible name of the link or button. Without it, it falls back to
	 *  `name`. Only matters when the avatar is interactive. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	decorative = false;

	/** Take the control out of the tab order (`tabindex="-1"`), for an avatar
	 *  that is a link or a button inside a roving container (an `nldd-list` sets
	 *  it on the rows that are not the current one). Still mouse- and
	 *  script-focusable, and it does nothing on a decorative avatar. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;

	/** Forwarded to the inner nldd-tooltip's `timing`, like nldd-icon-button.
	 *  On by default: initials without a name are a riddle. An
	 *  avatar that sits beside that name is `decorative` and shows none. */
	@property({ reflect: true, attribute: 'tooltip-timing', converter: reflectNonDefault<'delay' | 'instant' | 'never'>('delay') })
	tooltipTiming: 'delay' | 'instant' | 'never' = 'delay';

	@property({ type: String })
	name = '';

	@property({ reflect: true, converter: reflectNonDefault<AvatarType>('person') })
	type: AvatarType = 'person';

	/** Makes the avatar one link: the shape itself becomes the <a>, so the click
	 *  area and the focus ring follow its shape (an overlay would be square). */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	href = '';

	@property({ type: String })
	target = '';

	@property({ type: String })
	rel = '';

	/** True once the avatar is a control itself. */
	get isInteractive(): boolean {
		return Boolean(this.href) || this.button;
	}

	/** Set when the image errors, so the template falls through to the next
	 *  content step. Not private: the template module reads it. */
	@state()
	_imageFailed = false;

	/** Initials shown when there is no image: an explicit `initials` wins,
	 *  otherwise the first letter of the first and last word of `name`. */
	get resolvedInitials(): string {
		if (this.initials) return this.initials.slice(0, 4);
		const words = this.name.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return '';
		const first = words[0].charAt(0);
		const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
		return (first + last).toUpperCase();
	}

	/** Fallback icon when there is neither image nor initials. */
	get resolvedIcon(): string {
		if (this.icon) return this.icon;
		return this.type === 'organization' ? 'building' : 'person';
	}

	_onImageError = (): void => {
		this._imageFailed = true;
	};

	override willUpdate(changed: PropertyValues<this>): void {
		// withTranslations merges a consumer's `translations` override in its own
		// willUpdate; without this call the override is silently ignored.
		super.willUpdate(changed);
		// Either source changing offers a fresh candidate, so give the image
		// another chance rather than staying on the fallback forever.
		if (changed.has('src') || changed.has('srcset')) this._imageFailed = false;
	}

	/** The shape that is observed while the initials wait for a ratio. */
	private _observedShape: Element | null = null;

	private _waitForShape(wait: boolean): void {
		const shape = wait ? this.shadowRoot?.querySelector('.avatar') ?? null : null;
		if (shape === this._observedShape) return;
		shapeObserver.unobserveAll(this);
		this._observedShape = shape;
		if (shape) shapeObserver.observe(shape, this);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		connected.add(this);
		if (this.hasUpdated) fitPass.schedule(this, this.ownerDocument);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		connected.delete(this);
		fitPass.cancel(this);
		shapeObserver.unobserveAll(this);
		this._observedShape = null;
	}

	override updated(changed: PropertyValues<this>): void {
		// Trim to match resolvedInitials: a whitespace-only name yields no
		// initials (so the icon shows), and must not claim role="img" with a
		// blank label either — that reads as an unnamed image.
		const labeled = !this.decorative && this.name.trim() !== '';
		if (this.isInteractive) {
			// The link or button in the shadow root carries the name, so the host must
			// not put a second one (role="img") beside it, and hiding the host would
			// hide the control along with it.
			this.removeAttribute('role');
			this.removeAttribute('aria-label');
			this.removeAttribute('aria-hidden');
		}
		else if (labeled) {
			this.setAttribute('role', 'img');
			this.setAttribute('aria-label', this.name);
			this.removeAttribute('aria-hidden');
		}
		else {
			this.setAttribute('aria-hidden', 'true');
			this.removeAttribute('role');
			this.removeAttribute('aria-label');
		}
		// Fit again on every change that can swap the initials in or alter
		// their text. src/_imageFailed matter too: a dead image falls back to
		// initials that were never fitted. href and button swap the shape.
		if (
			changed.has('name') || changed.has('initials')
			|| changed.has('src') || changed.has('srcset') || changed.has('_imageFailed')
			|| changed.has('href') || changed.has('button')
		) {
			fitPass.schedule(this, this.ownerDocument);
		}
	}

	/** @internal The initials the template shows, '' when it shows an image or the icon. */
	get _shownInitials(): string {
		return this.src && !this._imageFailed ? '' : this.resolvedInitials;
	}

	/** @internal How wide the initials are against the shape's content box,
	 *  without the fit that is applied; undefined while the shape is not laid
	 *  out. A read, that writes nothing. Bounding boxes, not scrollWidth: they
	 *  are not rounded to whole pixels, so the ratio holds at every size. A
	 *  transform on an ancestor scales both alike. */
	/** @internal What a ratio is known by: the initials and their font. A
	 *  style read, no layout; undefined without initials. */
	_ratioKey(): string | undefined {
		const text = this._shownInitials;
		const initials = this.shadowRoot?.querySelector<HTMLElement>('.avatar__initials');
		if (!text || !initials) return undefined;
		const { fontStyle, fontWeight, fontFamily } = getComputedStyle(initials);
		return `${fontStyle} ${fontWeight} ${fontFamily}|${text}`;
	}

	_measureRatio(): number | undefined {
		const initials = this.shadowRoot?.querySelector<HTMLElement>('.avatar__initials');
		const shape = this.shadowRoot?.querySelector<HTMLElement>('.avatar');
		if (!initials || !shape || shape.offsetWidth <= 0) return undefined;
		const content = shape.getBoundingClientRect().width * (shape.clientWidth / shape.offsetWidth);
		const applied = Number(this.style.getPropertyValue('--_avatar-initials-fit')) || 1;
		const natural = initials.getBoundingClientRect().width / applied;
		if (content <= 0 || natural <= 0) return undefined;
		return natural / content;
	}

	/** Shrink wide initials so they always fit. The fit factor is the shape's
	 *  usable width over the initials' natural width, capped at 1 so narrow
	 *  initials are never enlarged. Applied via --_avatar-initials-fit (a
	 *  transform scale), so no reflow and it stays measurable.
	 *
	 *  Uses the ratio of its text in its font (see ratiosOf), by the key read
	 *  with the others. Without one yet, the avatar waits for its shape to be
	 *  laid out. */
	_fitInitials(key: string | undefined): void {
		const ratio = key ? ratiosOf(this.ownerDocument).get(key) : undefined;
		this._waitForShape(Boolean(key) && ratio === undefined);
		if (!key) {
			this.style.removeProperty('--_avatar-initials-fit');
			return;
		}
		if (ratio === undefined) return;
		const fit = String(Math.min(1, INITIALS_FIT_RATIO / ratio));
		// An unchanged fit writes nothing, so no style is recalculated.
		if (this.style.getPropertyValue('--_avatar-initials-fit') !== fit) {
			this.style.setProperty('--_avatar-initials-fit', fit);
		}
	}

	override render() {
		return avatarTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-avatar': NLDDAvatar;
	}
}
