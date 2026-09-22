/**
 * Nederlandse Digitale Dienst Badge Component (Lit + TypeScript)
 *
 * Shows the state of something, or how much of it there is: a status, a number
 * of unread messages, a dot saying something is new. What it says is decided by
 * the system, and it changes without anyone touching it. A badge is never
 * interactive.
 *
 * It shows text, a number and/or an icon; with no content it becomes a dot. Put
 * it in a corner of another element (an icon, for instance) or on its own.
 *
 * For a property someone assigns to something, such as a category, a role or a
 * certification, use `nldd-tag`. For standalone data the user works with, such
 * as a chosen person or an active filter, use `nldd-token`.
 *
 * @element nldd-badge
 * @attr {string} size - Size: 'sm' | 'md' (default: 'md')
 * @attr {string} color - Semantic ('critical' | 'accent' | 'neutral' | 'warning' | 'success'), a Rijkshuisstijl color ('lintblauw' | 'hemelblauw' | 'oranje' | …), or 'inherit' to fill in the content color around it: the `--context-content-color` channel a list item, table row or menu sets, falling back to `currentColor`. Default: 'critical'
 * @attr {string} custom-color - A color of its own, as any CSS color value ('#a90061', 'oklch(0.6 0.2 20)', 'var(--brand-cable-blue)'). For a color the system cannot know: the jacket of a cable, a color someone picked. It wins over `color`. Whatever it paints, the text and icon on top become white or black, whichever contrasts. The text on it is black or white, picked on the relative luminance of the fill, so it clears 4.5:1 whatever color you hand it.
 * @attr {boolean} pulse - Grows a ring out of the badge and fades it, for something happening right now (a live connection, an outage). Respects `prefers-reduced-motion`.
 * @attr {string} text - Text (takes precedence over number)
 * @attr {number} number - Numeric value. Shortened when it is over max
 * @attr {number} max - Value above which number is shown as "{max}+" (default: 99)
 * @attr {string} icon - Icon name. Icon-only renders as a square; with text or number the icon goes on the left.
 * @attr {string} accessible-label - Accessible label for screen readers. Falls back to text/number; otherwise to the i18n default ("Notificatie").
 * @attr {boolean} decorative - Hides the badge from assistive software (use when the text beside it says the same, such as a dot next to a status word)
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { badgeStyles } from './badge.styles.js';
import { template } from './badge.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddBadgeTranslations } from './badge.i18n.js';
import './../../content/icon/icon.js';

type Color =
	| 'critical' | 'accent' | 'neutral' | 'warning' | 'success'
	| 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw'
	| 'paars' | 'violet'
	| 'robijnrood' | 'roze' | 'rood' | 'oranje'
	| 'donkergeel' | 'geel'
	| 'donkerbruin' | 'bruin'
	| 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen'
	| 'inherit';
type Size = 'sm' | 'md';

@customElement('nldd-badge')
export class NLDDBadge extends withTranslations(LitElement, nlddBadgeTranslations) {
	static override styles = badgeStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, converter: reflectNonDefault<Color>('critical') })
	color: Color = 'critical';

	/** Handed to the styles as a custom property rather than read from the
	 *  attribute in CSS: `attr()` with a type is not available everywhere yet,
	 *  and this keeps one code path. */
	@property({ reflect: true, attribute: 'custom-color', converter: reflectNonDefault<string>('') })
	customColor = '';

	@property({ type: Boolean, reflect: true })
	pulse = false;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: Number, reflect: true })
	number: number | undefined = undefined;

	@property({ reflect: true, converter: reflectNonDefault<number>(99) })
	max = 99;

	@property({ type: String })
	icon = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	decorative = false;

	override updated(changed: Map<string, unknown>): void {
		if (!changed.has('customColor')) return;
		if (this.customColor) this.style.setProperty('--_custom-color', this.customColor);
		else this.style.removeProperty('--_custom-color');
	}

	get _hasText(): boolean {
		return !!this.text || typeof this.number === 'number';
	}

	get _isDot(): boolean {
		return !this._hasText && !this.icon;
	}

	get _isIconOnly(): boolean {
		return !!this.icon && !this._hasText;
	}

	get _displayValue(): string {
		if (this.text) return this.text;
		if (typeof this.number === 'number') {
			return this.number > this.max ? `${this.max}+` : String(this.number);
		}
		return '';
	}

	get _ariaLabel(): string {
		if (this.accessibleLabel) return this.accessibleLabel;
		if (this._hasText) return this._displayValue;
		return this._t('components.badge.notification-label');
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-badge': NLDDBadge;
	}
}
