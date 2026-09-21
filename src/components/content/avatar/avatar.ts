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
 * down automatically so they stay inside the shape.
 *
 * Accessibility: the host element carries the meaning. With a `name` (and
 * without `decorative`) it gets `role="img"` with the name as its label. When
 * the name already stands beside it as text, in an identity for instance, set
 * `decorative` so the avatar stays hidden from assistive software. A dead `src`
 * falls back to the initials or the icon, never to a broken-image icon.
 *
 * @element nldd-avatar
 *
 * @attr {string} type - `person` (circle, person icon) or `organization` (rounded, building icon); default `person`
 * @attr {string} size - `full` (the default) scales with the container, like nldd-icon; or a fixed size in px (spacer-aligned: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96). The initials and the icon scale along
 * @attr {string} color - `neutral` (the default, a neutral fill) or `inherit` (fill in the content color: the `--context-content-color` channel, or `currentColor` when that is unset; text in the contrast color, so the avatar can replace an icon in a button for instance)
 * @attr {boolean} icon-aligned - Shrinks the visible shape to 5/6 of the host, centered, so the avatar aligns optically with an icon on the same grid (an icon glyph has built-in margin)
 * @attr {string} name - Name of the person or organization; supplies the derived initials and the accessible label
 * @attr {string} initials - Explicit initials, at most 3 characters (overrides what is derived from `name`; also for organization acronyms)
 * @attr {string} src - Image source; falls back to initials or icon when it fails to load
 * @attr {string} srcset - Responsive source set for the image (the component sets `sizes` itself)
 * @attr {string} icon - Overrides the type-dependent fallback icon
 * @attr {string} accessible-label - Name of the link or button; without it `name` is used
 * @attr {boolean} decorative - Hides the avatar from assistive software (use when the name already stands beside it as text)
 * @attr {string} tooltip-timing - When the name appears as a tooltip on hover or focus: `delay` (the default, after 700ms), `instant`, or `never`. An avatar shows no text, so without a tooltip the name is readable by assistive software only. A `decorative` avatar shows none regardless: there the name already stands beside it as text
 * @attr {string} href - Makes the avatar a link to this URL; the shape itself becomes the link, so the hit area and the focus ring follow it
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for an avatar that is a link or a button inside a roving container (a row of an nldd-list). Does nothing on a decorative avatar.
 * @attr {boolean} button - Makes the avatar a button; ignored when `href` is set
 * @attr {string} target - Link target for href (e.g. '_blank'); completes rel and announces "Opens in a new tab"
 * @attr {string} rel - Link rel for href; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @example
 * ```html
 * <nldd-avatar name="Bart van de Biezen"></nldd-avatar>
 * <nldd-avatar name="Jan Jansen" src="/avatars/jan.jpg" size="48"></nldd-avatar>
 * <nldd-avatar type="organization" name="Kamer van Koophandel" initials="KvK"></nldd-avatar>
 * <nldd-avatar name="Bart van de Biezen" color="inherit"></nldd-avatar>
 * <nldd-avatar name="Bart van de Biezen" href="/profiel/"></nldd-avatar>
 * <nldd-avatar name="Bart van de Biezen" button accessible-label="Profielmenu openen"></nldd-avatar>
 * ```
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddAvatarTranslations } from './avatar.i18n.js';
import { avatarStyles } from './avatar.styles.js';
import { avatarTemplate } from './avatar.template.js';
import '../icon/icon.js';

export type AvatarType = 'person' | 'organization';

export type AvatarColor = 'neutral' | 'inherit';

/** Fraction of the shape width the initials may occupy before they are scaled to
 *  fit. Leaves margin inside the circle so wide glyphs stay clear of the edge
 *  (the circle narrows above/below the center, so caps need room). */
const INITIALS_FIT_RATIO = 0.75;

/** Empty = scale to the container (like nldd-icon); the rest pin a fixed px size. */
export type AvatarSize =
	'full' | '16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96';

@customElement('nldd-avatar')
export class NLDDAvatar extends withTranslations(LitElement, nlddAvatarTranslations) {
	static override styles = avatarStyles;

	@property({ reflect: true, converter: reflectNonDefault<AvatarType>('person') })
	type: AvatarType = 'person';

	@property({ reflect: true, converter: reflectNonDefault<AvatarSize>('full') })
	size: AvatarSize = 'full';

	@property({ reflect: true, converter: reflectNonDefault<AvatarColor>('neutral') })
	color: AvatarColor = 'neutral';

	@property({ type: Boolean, reflect: true, attribute: 'icon-aligned' })
	iconAligned = false;

	@property({ type: String })
	name = '';

	@property({ type: String })
	initials = '';

	@property({ type: String })
	src = '';

	@property({ type: String })
	srcset = '';

	@property({ type: String })
	icon = '';

	/** Accessible name of the link or button. Without it, it falls back to
	 *  `name`. Only matters when the avatar is interactive. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	decorative = false;

	/** Forwarded to the inner nldd-tooltip's `timing`, like nldd-icon-button.
	 *  On by default: initials without a name are a riddle. An
	 *  avatar that sits beside that name is `decorative` and shows none. */
	@property({ reflect: true, attribute: 'tooltip-timing', converter: reflectNonDefault<'delay' | 'instant' | 'never'>('delay') })
	tooltipTiming: 'delay' | 'instant' | 'never' = 'delay';

	/** Makes the avatar one link: the shape itself becomes the <a>, so the click
	 *  area and the focus ring follow its shape (an overlay would be square). */
	@property({ type: String, reflect: true })
	href = '';

	/** Take the control out of the tab order (`tabindex="-1"`) — for an avatar
	 *  that is a link or a button inside a roving container (an `nldd-list` sets
	 *  it on the rows that are not the current one). Still mouse- and
	 *  script-focusable, and it does nothing on a decorative avatar. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;

	/** Makes the avatar a button. Ignored once `href` is set: one avatar is one
	 *  action, and a link outranks a button (the same rule as nldd-card). */
	@property({ type: Boolean, reflect: true })
	button = false;

	@property({ type: String })
	target = '';

	@property({ type: String })
	rel = '';

	/** True once the avatar is a control itself. */
	get isInteractive(): boolean {
		return Boolean(this.href) || this.button;
	}

	private _warnedLabel = false;

	/** Set when the image errors, so the template falls through to the next
	 *  content step. Not private: the template module reads it. */
	@state()
	_imageFailed = false;

	/** Initials shown when there is no image: an explicit `initials` wins,
	 *  otherwise the first letter of the first and last word of `name`. */
	get resolvedInitials(): string {
		if (this.initials) return this.initials.slice(0, 3);
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

	/** Re-measures the initials fit when the shape lays out or resizes; covers the
	 *  case where the avatar is only sized after first render (e.g. filling a
	 *  container that appears later). Content changes are handled in updated(). */
	private _resizeObserver = new ResizeObserver(() => this._fitInitials());

	override willUpdate(changed: PropertyValues<this>): void {
		// withTranslations merges a consumer's `translations` override in its own
		// willUpdate; without this call the override is silently ignored.
		super.willUpdate(changed);
		// Either source changing offers a fresh candidate, so give the image
		// another chance rather than staying on the fallback forever.
		if (changed.has('src') || changed.has('srcset')) this._imageFailed = false;
	}

	override firstUpdated(): void {
		const shape = this.shadowRoot?.querySelector('.avatar');
		if (shape) this._resizeObserver.observe(shape);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		const shape = this.shadowRoot?.querySelector('.avatar');
		if (this.hasUpdated && shape) this._resizeObserver.observe(shape);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._resizeObserver.disconnect();
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
		// An interactive avatar without a name is a silent accessibility failure:
		// the control holds nothing but an image or initials. Warn in dev, the same
		// as nldd-card.
		if (import.meta.env?.DEV) {
			const missing = this.isInteractive
				&& !(this.accessibleLabel || this.name).trim();
			if (missing && !this._warnedLabel) {
				this._warnedLabel = true;
				console.warn('<nldd-avatar>: een avatar met `href` of `button` heeft `accessible-label` (of `name`) nodig, anders heeft de control geen toegankelijke naam.');
			}
			else if (!missing) {
				this._warnedLabel = false;
			}
		}
		// The shape does not resize when only its content does, so the
		// ResizeObserver won't fire — re-measure here on every change that can
		// swap the initials in or alter their text. src/_imageFailed matter too:
		// a dead image falls back to initials that were never measured.
		if (
			changed.has('name') || changed.has('initials')
			|| changed.has('src') || changed.has('srcset') || changed.has('_imageFailed')
		) {
			this._fitInitials();
		}
	}

	/** Shrink wide initials so they always fit. The fit factor is the shape's
	 *  usable width over the initials' natural width (scrollWidth ignores
	 *  the applied transform, so the measurement stays stable); capped at 1 so
	 *  narrow initials are never enlarged. Applied via --_initials-fit (a
	 *  transform scale), so no reflow and it stays measurable. */
	private _fitInitials(): void {
		const initials = this.shadowRoot?.querySelector<HTMLElement>('.avatar__initials');
		const shape = this.shadowRoot?.querySelector<HTMLElement>('.avatar');
		if (!initials || !shape) {
			this.style.removeProperty('--_initials-fit');
			return;
		}
		const available = shape.clientWidth * INITIALS_FIT_RATIO;
		const actual = initials.scrollWidth;
		if (available <= 0 || actual <= 0) return; // not laid out yet — leave as is
		this.style.setProperty('--_initials-fit', String(Math.min(1, available / actual)));
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
