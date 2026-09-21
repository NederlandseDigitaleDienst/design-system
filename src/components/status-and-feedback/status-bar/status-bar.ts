/**
 * Nederlandse Digitale Dienst Status Bar Component (Lit + TypeScript)
 *
 * A narrow, page-wide status bar (24px) with a deep background color per
 * variant. Use it for persistent system state: an outage, planned maintenance,
 * a draft view or a recording in progress. The bar deliberately shows no icon
 * and supports text only. The text itself has to name the status ("Storing: …",
 * "Gepland onderhoud …"), so the meaning does not follow from color alone
 * (WCAG 1.4.1).
 *
 * Keep the text short: the bar shows one line and truncates with an ellipsis,
 * certainly on narrower screens. For a long message with a lot of information
 * only the essence belongs in the bar. Point to a separate page or sheet for
 * the rest (through `href` or `button`, for instance), where the user can read
 * on.
 *
 * The whole bar can be clickable: set `href` (renders an `<a>`) or `button`
 * (renders a `<button>`; listen for the native `click` event). Without either
 * the bar is static. On interaction a chevron appears as an affordance. One
 * action per bar at most; several actions, or links in running text, belong in
 * nldd-banner.
 *
 * ## ARIA
 * role and aria-live are set automatically from the variant:
 * - critical → role="alert" (implies aria-live="assertive"; interrupts the screen reader)
 * - others   → role="status" aria-live="polite"
 * Not overridable. If you need a quieter component, pick a different one. Use
 * `critical` only for a real emergency: role="alert" interrupts the screen
 * reader on every change of the content, so do not put text in it that changes
 * regularly (a counting-down timer, for example).
 *
 * @element nldd-status-bar
 *
 * @attr {'neutral'|'accent'|'success'|'warning'|'critical'} variant - Color of the bar (default: 'neutral')
 * @attr {string} text - The status text (one line; truncated with an ellipsis)
 * @attr {string} href - Makes the whole bar a link (renders an <a>)
 * @attr {string} target - Link target (e.g. '_blank'); only used with href
 * @attr {string} rel - Link rel, used with href; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {boolean} button - Makes the whole bar a button; ignored when href is set
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { statusBarStyles } from './status-bar.styles.js';
import { statusBarTemplate } from './status-bar.template.js';
import '../../content/icon/icon.js';

export type StatusBarVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'critical';

@customElement('nldd-status-bar')
export class NLDDStatusBar extends LitElement {
	static override styles = statusBarStyles;

	@property({ reflect: true, converter: reflectNonDefault<StatusBarVariant>('neutral') })
	variant: StatusBarVariant = 'neutral';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: String })
	href = '';

	/** Link target (e.g. '_blank'). Only used when href is set. */
	@property({ type: String })
	target = '';

	/** Link rel attribute. Only used when href is set. */
	@property({ type: String })
	rel = '';

	@property({ type: Boolean, reflect: true })
	button = false;

	override connectedCallback(): void {
		super.connectedCallback();
		// Set role + aria-live here, NOT in the constructor: the custom-element
		// spec forbids a constructor from adding attributes to its element, so
		// document.createElement (the path Vue, React and other createElement-based
		// frameworks use) would throw NotSupportedError and the element would never
		// upgrade. connectedCallback runs at insertion, before the first render, so
		// the live-region role is present from the start; updated() keeps it in sync
		// on later variant changes.
		this._applyAriaForVariant(this.variant);
	}

	override updated(changed: Map<string, unknown>): void {
		if (changed.has('variant')) this._applyAriaForVariant(this.variant);
	}

	private _applyAriaForVariant(variant: StatusBarVariant): void {
		// role + aria-live are component-owned and tied to the variant for correct
		// announcement (critical = assertive alert, else polite status). They are
		// (re)applied unconditionally on every connect/variant change, NOT guarded
		// behind "consumer hasn't set role" — deliberately, since the docs state they
		// are not consumer-overridable: a wrong role here (e.g. presentation on a
		// critical alert) would silently break the a11y contract.
		if (variant === 'critical') {
			this.setAttribute('role', 'alert');
			this.removeAttribute('aria-live');
		} else {
			this.setAttribute('role', 'status');
			this.setAttribute('aria-live', 'polite');
		}
		// The bar is announced as one unit; without aria-atomic some screen
		// readers announce only the changed subtree on text updates.
		this.setAttribute('aria-atomic', 'true');
	}

	override render() {
		return statusBarTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-status-bar': NLDDStatusBar;
	}
}
