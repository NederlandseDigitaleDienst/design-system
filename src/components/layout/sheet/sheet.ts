/**
 * Nederlandse Digitale Dienst Sheet Component (Lit + TypeScript)
 *
 * An overlay component that slides in from the side or bottom of the screen.
 * Based on the native <dialog> element for built-in accessibility,
 * focus management, and Escape key support.
 *
 * On small (sm) viewports the sheet always renders as a bottom sheet,
 * regardless of the configured placement.
 *
 * Render the sheet at the document root (teleport/portal it to `document.body`),
 * never inside a split view's content flow: as a slotted flex child it would steal
 * pane height (see `nldd-split-view-pane`).
 *
 * A sheet holds a whole nldd-page: an nldd-top-title-bar in its header slot,
 * the content, and a footer when there are actions. The page behaves as it does
 * anywhere else, with only the middle scrolling, and the text of the bar is
 * also the sheet's accessible name. Do not build a header of your own.
 *
 * Open and close it with `open`, bound to your state together with the close
 * event: the sheet clears `open` itself when the user closes it. show() and
 * hide() do the same for code without a binding. Keep the sheet in the DOM
 * rather than mounting it when it opens, or the animations are skipped.
 *
 * @element nldd-sheet
 *
 * @attr {string} width - Custom width for side sheets (left/right) as a CSS length (e.g. '480px', '32rem'). Applied from the md breakpoint up; ignored on sm (bottom sheet) and for `placement="bottom"`. Clamped to `100vw - 2 * inset` so the sheet always fits.
 * @attr {string} height - Custom height for bottom sheets (and for any sheet on sm viewports, where all placements collapse to bottom). Accepts: `'full'` (default — viewport minus top-inset, identical to omitting the attribute), `'fit-content'` (collapse to content size), or any CSS length/percentage (e.g. `'50dvh'`, `'480px'`, `'50%'`). Always clamped to `100dvh - top-inset` so the sheet can't extend past the dismiss-tap area. No effect on side sheets at md+.
 * @attr {string} placement - Sheet position: 'left' | 'right' | 'bottom' (default: 'right')
 * @attr {string} accessible-label - Accessible name for the dialog, forwarded as aria-label. Unset, the sheet takes the text of the nldd-top-title-bar inside it, and without one it is called 'Venster'.
 * @attr {boolean} open - Whether the sheet is open. Set it to open or close the sheet, as an alternative to show() and hide(). The sheet clears it itself when it closes another way (Escape, the backdrop, the close button of its title bar), so bind it together with the close event.
 *
 * @slot - Sheet content
 * @slot notifications - Where the notifications area lands while this overlay is open, so a notification is not left inert behind it. Filled by the package; leave it alone.
 *
 * @fires open - Fired when the sheet is opened
 * @fires close - Fired when the sheet is fully closed. Does not bubble: overlays nest, and a listener on one sheet asking about that sheet should not also hear the form it opened. The dismiss button of an nldd-top-title-bar inside it fires `dismiss`, which bubbles; this component catches that itself, closes and fires `close`. Listen to `close` alone, or one click runs your handler twice.
 *
 * @method show() - Opens the sheet
 * @method hide() - Closes the sheet with a closing animation
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { sheetStyles } from './sheet.styles.js';
import { sheetTemplate } from './sheet.template.js';
import { TitleBarLabelController } from '../../../utilities/title-bar-label-controller.js';
import { setState } from '../../../utilities/element-state.js';
import { ModalOverlay } from '../../../utilities/modal-overlay.js';

type Placement = 'left' | 'right' | 'bottom';

@customElement('nldd-sheet')
export class NLDDSheet extends LitElement {
	static override styles = sheetStyles;

	/**
	 * Custom width for side sheets (left/right) from the md breakpoint up.
	 * CSS length (e.g. '480px', '32rem'). Ignored on sm viewports (bottom-sheet
	 * fallback) and for `placement="bottom"`. Clamped to `100vw - 2 * inset`.
	 */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	/**
	 * Custom height for bottom sheets (and for any sheet on sm viewports
	 * where all placements collapse to bottom). Defaults to full-height
	 * — `'fit-content'` opts back into the content-sized layout, any CSS
	 * length/percentage sets a specific size. Clamped to `100dvh - top-
	 * inset` via `max-height` so the dismiss-tap area always remains.
	 */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	height = '';

	@property({ reflect: true, converter: reflectNonDefault<Placement>('right') })
	placement: Placement = 'right';

	/** Accessible name for the dialog — forwarded as aria-label to the dialog element. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	private _titleBar = new TitleBarLabelController(this);

	get _resolvedAccessibleLabel(): string {
		return this.accessibleLabel || this._titleBar.text || 'Venster';
	}

	@property({ type: Boolean, reflect: true })
	open = false;

	_modalOverlay = new ModalOverlay(this, {
		animatedClose: true,
		titleBarDismiss: true,
		beforeOpen: () => setState(this, 'unnamed', !this.accessibleLabel && !this._titleBar.text),
	});

	override updated(changed: Map<string, unknown>) {
		if (changed.has('width')) {
			if (this.width) {
				this.style.setProperty('--_sheet-width', this.width);
			} else {
				this.style.removeProperty('--_sheet-width');
			}
		}
		if (changed.has('height')) {
			const h = this.height;
			// `'full'` is an explicit alias for the default (no var → CSS
			// fallback to `calc(100dvh - top-inset)`). Anything else flows
			// through CSS.supports so typos and bogus values silently fall
			// back to the default rather than producing a broken layout.
			const custom = Boolean(h) && h !== 'full';
			const valid = custom && CSS.supports('height', h);
			if (valid) this.style.setProperty('--_sheet-height', h);
			else this.style.removeProperty('--_sheet-height');
			setState(this, 'invalid-height', custom && !valid);
		}
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
	}

	show(): void {
		this._modalOverlay.show();
	}

	hide(): void {
		this._modalOverlay.hide();
	}

	override render() {
		return sheetTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-sheet': NLDDSheet;
	}
}
