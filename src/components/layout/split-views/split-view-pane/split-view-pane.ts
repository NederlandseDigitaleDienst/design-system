/**
 * Nederlandse Digitale Dienst Split View Pane Component (Lit + TypeScript)
 *
 * A simple pane container for use inside split views.
 * The split view automatically sets context: whether a back button should be shown.
 *
 * The consumer sets `has-content` to indicate the pane has content.
 * The consumer sets `back-text` on the `nldd-top-title-bar` inside the pane.
 * The split view sets `hide-back` when the back button is not applicable.
 * The pane automatically hides the back button via CSS when `hide-back` is active.
 *
 * ## Background color
 * The pane sets `--context-parent-background-color` which cascades down to all descendants.
 * Set `background="tinted"` on a pane to give it a tinted background independently of sibling panes.
 * Descendants such as `nldd-page` read `--context-parent-background-color` automatically.
 *
 * ## Slotted content
 * A pane stretches its slotted content to fill it (`::slotted(*) { flex-grow: 1 }`),
 * so slot only layout content here. Overlays (`nldd-sheet`, popovers, dialogs,
 * menus) belong at the document root — teleport/portal them to `document.body`.
 * Do not leave an overlay as a light-DOM sibling of a split view: it gets slotted
 * into the main pane and becomes an extra flex-grow child that steals pane height,
 * so in document-scroll (root) mode a short page's sticky footer floats mid-screen
 * instead of docking.
 *
 * @element nldd-split-view-pane
 *
 * @attr {'inherit'|'base'|'tinted'} background - Use a tinted background color (cascades to descendants)
 * @attr {boolean} hide-back - Hide the back button (set automatically by the split view)
 * @attr {boolean} has-content - The pane has content (default: false)
 *
 * @slot - Pane content
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ScrollModeController } from '../../../../utilities/scroll-mode-controller.js';
import { splitViewPaneStyles } from './split-view-pane.styles.js';
import { splitViewPaneTemplate } from './split-view-pane.template.js';

@customElement('nldd-split-view-pane')
export class NLDDSplitViewPane extends LitElement {
	static override styles = splitViewPaneStyles;

	// Reflects --context-scroll-mode to [data-scroll] so the pane flows (does not
	// clip) in root-scroll mode, letting a slotted nldd-page stick to the document.
	private _scrollMode = new ScrollModeController(this);

	@property({ type: String, reflect: true })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	@property({ type: Boolean, reflect: true, attribute: 'hide-back' })
	hideBack = false;

	@property({ type: Boolean, reflect: true, attribute: 'has-content' })
	hasContent = false;

	override connectedCallback() {
		super.connectedCallback();
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
	}

	override render() {
		return splitViewPaneTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-split-view-pane': NLDDSplitViewPane;
	}
}
