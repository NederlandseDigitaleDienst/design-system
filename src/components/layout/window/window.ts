/**
 * Nederlandse Digitale Dienst Window Component (Lit + TypeScript)
 *
 * A floating window based on the native <dialog> element, positionable through
 * CSS values. Always modal.
 *
 * No header of its own: consumers use nldd-page with a sticky header inside for
 * a title bar. The text of the nldd-top-title-bar in that header is also the
 * window's accessible name.
 *
 * Open and close it with `open`, bound to your state together with the close
 * event: the window clears `open` itself when the user closes it. show() and
 * hide() do the same for code without a binding. Keep the window in the DOM
 * rather than mounting it when it opens, or the animations are skipped.
 *
 * @element nldd-window
 *
 * @attr {'inherit'|'light'|'dark'} scheme - Color scheme (default 'inherit').
 * @attr {string} width - CSS width (default: 640px)
 * @attr {string} height - CSS height (default: content height)
 * @attr {string} top - CSS top position of the top edge (e.g. '0', '100px')
 * @attr {string} right - CSS right value
 * @attr {string} bottom - CSS bottom value
 * @attr {string} left - CSS left position of the left edge
 * @attr {boolean} centered - Centers both axes on the viewport. Overridable per axis: `centered top="0"` is horizontally centered, top aligned. Mirrors CSS `place-items: center` with `align-items`/`justify-items` overrides.
 * @attr {string} accessible-label - Accessible name (aria-label). Unset, the window takes the text of the nldd-top-title-bar inside it, and without one the i18n default ('Venster'). Each window needs a unique, descriptive name, from either.
 * @attr {object} translations - Override translation keys; unset keys fall back to the Dutch default.
 * @attr {boolean} no-light-dismiss - A click on the backdrop does not close the window. For windows where dismissing by accident costs work: a process of several steps, a form with filled-in fields. Escape and the dismiss button keep working.
 * @attr {boolean} open - Whether the window is open. Set it to open or close the window, as an alternative to show() and hide(). The window clears it itself when it closes another way (Escape, the backdrop, the close button of its title bar), so bind it together with the close event.
 *
 * @slot - Complete window content (e.g. nldd-page)
 * @slot notifications - Where the notifications area lands while this overlay is open, so a notification is not left inert behind it. Filled by the package; leave it alone.
 *
 * @fires open - When the window opens
 * @fires close - When the window has fully closed. Does not bubble: overlays can sit inside each other, and a listener on one window should not also hear the form that opened it. The dismiss button of an nldd-top-title-bar inside it fires `dismiss`, which bubbles; this component catches that itself, closes and fires `close`. Listen to `close` alone, or one click runs your handler twice.
 *
 * @method show() - Opens the window
 * @method hide() - Closes the window
 */

import { LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { windowStyles } from './window.styles.js';
import { windowTemplate } from './window.template.js';
import { nlddWindowTranslations, type NLDDWindowTranslations } from './window.i18n.js';
import { TitleBarLabelController } from '../../../utilities/title-bar-label-controller.js';
import { ModalOverlay } from '../../../utilities/modal-overlay.js';
import { translate } from '../../../utilities/translations.js';
import { setState } from '../../../utilities/element-state.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';

export type NLDDWindowScheme = 'inherit' | 'light' | 'dark';

@customElement('nldd-window')
export class NLDDWindow extends LitElement {
	static override styles = windowStyles;

	@property({ reflect: true, converter: reflectNonDefault<NLDDWindowScheme>('inherit') })
	scheme: NLDDWindowScheme = 'inherit';

	@property({ type: String, reflect: true })
	width: string | undefined;

	@property({ type: String, reflect: true })
	height: string | undefined;

	@property({ type: String, reflect: true })
	top: string | undefined;

	@property({ type: String, reflect: true })
	right: string | undefined;

	@property({ type: String, reflect: true })
	bottom: string | undefined;

	@property({ type: String, reflect: true })
	left: string | undefined;

	@property({ type: Boolean, reflect: true })
	centered = false;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/**
	 * Override one or more translation keys.
	 * Unset keys fall back to the Dutch default.
	 */
	@property({ type: Object })
	translations: Partial<NLDDWindowTranslations> = {};

	@property({ type: Boolean, reflect: true, attribute: 'no-light-dismiss' })
	noLightDismiss = false;

	@property({ type: Boolean, reflect: true })
	open = false;

	private _titleBar = new TitleBarLabelController(this);

	_modalOverlay = new ModalOverlay(this, {
		titleBarDismiss: true,
		lightDismiss: () => !this.noLightDismiss,
		beforeOpen: () => {
			setState(this, 'unnamed', !this.accessibleLabel && !this._titleBar.text);
			this._applyPositionStyles();
		},
	});

	private get _dialog(): HTMLDialogElement | null {
		return this._modalOverlay.dialog;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
	}

	override firstUpdated(): void {
		// Apply scheme once the shadow DOM (including the inner <dialog>) is
		// in place — the `changed.has('scheme')` path in updated() may run
		// before the @query lookup resolves the dialog on the very first
		// render.
		this._applyScheme();
	}

	override updated(changed: PropertyValues): void {
		this._applyPositionStyles();
		if (changed.has('scheme')) {
			this._applyScheme();
		}
	}

	private _applyScheme(): void {
		const dialog = this._dialog;
		if (this.scheme === 'light' || this.scheme === 'dark') {
			this.style.colorScheme = this.scheme;
			if (dialog) dialog.style.colorScheme = this.scheme;
		} else {
			this.style.removeProperty('color-scheme');
			if (dialog) dialog.style.removeProperty('color-scheme');
		}
	}

	// — i18n ——————————————————————————————————————————————————————————————————

	private _t(key: keyof NLDDWindowTranslations): string {
		return translate(this.translations, nlddWindowTranslations, key);
	}

	get _resolvedAccessibleLabel(): string {
		return this.accessibleLabel || this._titleBar.text || this._t('components.window.accessible-label');
	}

	show(): void {
		this._modalOverlay.show();
	}

	hide(): void {
		this._modalOverlay.hide();
	}

	private _applyPositionStyles(): void {
		const dialog = this._dialog;
		if (!dialog) return;

		const hasEdge = this.top !== undefined || this.left !== undefined || this.right !== undefined || this.bottom !== undefined;
		const hasOverride = hasEdge || this.centered;

		// `centered` centers both axes unless an edge attribute is set on that
		// axis, so edges take precedence. transform: translate(-50%) per centered
		// axis keeps the width clamping (max-width) from breaking the centering: a
		// percentage in a transform is relative to the element's own width, not to
		// the viewport.
		const yCenter = this.centered && this.top === undefined && this.bottom === undefined;
		const xCenter = this.centered && this.left === undefined && this.right === undefined;

		// Set explicit 'auto' on opposing axis when only one side is set,
		// to override the UA stylesheet defaults on <dialog>
		dialog.style.top = this.top ?? (yCenter ? '50%' : (this.bottom !== undefined ? 'auto' : ''));
		dialog.style.bottom = this.bottom ?? (this.top !== undefined ? 'auto' : '');
		dialog.style.left = this.left ?? (xCenter ? '50%' : (this.right !== undefined ? 'auto' : ''));
		dialog.style.right = this.right ?? (this.left !== undefined ? 'auto' : '');
		dialog.style.width = this.width ?? '';
		dialog.style.height = this.height ?? '';

		// A translate per centered axis, to correct center-from-edge.
		dialog.style.transform = (xCenter || yCenter)
			? `translate(${xCenter ? '-50%' : '0'}, ${yCenter ? '-50%' : '0'})`
			: '';

		// Reset margin when custom position is set; keep margin: auto for the
		// UA-default centering (which only kicks in without explicit position).
		dialog.style.margin = hasOverride ? '0' : '';
	}

	override render() {
		return windowTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-window': NLDDWindow;
	}
}
