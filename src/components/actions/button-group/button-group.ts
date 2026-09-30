/**
 * Nederlandse Digitale Dienst Button Group Component (Lit + TypeScript)
 *
 * A container for grouping related buttons together, in a row or stacked.
 *
 * `auto`, the default, is a row on a container wide enough for one and a stack
 * over the full width below the sm breakpoint, where two labels beside each
 * other leave no room for either. The group is its own container, so it follows
 * the width it was given rather than the width of the window: the same group is
 * a row in a page and a stack in a sheet beside it.
 *
 * Being a container has one consequence to know: the width has to come from the
 * parent, since a container may not size itself from what is inside it. In a
 * parent that shrink-wraps its content (an inline-flex box, a float, a table
 * cell, a flex item at `width: auto`) the group measures zero and its buttons
 * are invisible. It says so once in development. Give the group or that parent
 * a width.
 *
 * A stack fills the width with its buttons, except an `nldd-icon-button`, which
 * keeps its own size: a bar with a single glyph in the middle is not a bigger
 * target, only a wider one.
 *
 * @element nldd-button-group
 * @attr {string} size - Button group size: 'sm' | 'md' (default: 'md')
 * @attr {string} orientation - Layout direction: 'auto' | 'horizontal' | 'vertical' (default: 'auto')
 *
 * @slot - Default slot for buttons (max 3)
 *
 * @csspart group - The button group container
 */
import { LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { buttonGroupStyles } from './button-group.styles.js';
import { template } from './button-group.template.js';

type Size = 'sm' | 'md';
type Orientation = 'auto' | 'horizontal' | 'vertical';

@customElement('nldd-button-group')
export class NLDDButtonGroup extends LitElement {
	static override styles = buttonGroupStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, converter: reflectNonDefault<Orientation>('auto') })
	orientation: Orientation = 'auto';

	@query('slot')
	private _slot!: HTMLSlotElement;

	/** DEV only: watches for the collapse below, then lets itself go. */
	private _collapseObserver: ResizeObserver | null = null;

	handleSlotChange() {
		const assigned = this._slot
			.assignedElements({ flatten: true })
			.filter((el): el is HTMLElement => el instanceof HTMLElement);

		assigned.forEach((el, index) => {
			if (index >= 3) {
				el.setAttribute('hidden', '');
				if (import.meta.env?.DEV) console.warn('nldd-button-group: Only 3 buttons are allowed. Extra buttons will be hidden.');
			}

			el.setAttribute('size', this.size);
		});
	}

	override updated(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('size')) this.handleSlotChange();
		// Switching to auto makes the group a container after the fact, so the
		// question it can then fail is only worth asking from here on.
		if (changedProperties.has('orientation')) this._watchForCollapse();
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// Also on reconnect: a group that moves takes a new parent with it, and
		// that parent decides whether there is a width to take.
		this._watchForCollapse();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._stopWatchingForCollapse();
	}

	/**
	 * The group is an inline-size container while `orientation` is `auto`, so its
	 * width has to come from its parent: a container may not size itself from its
	 * own contents. In a parent that shrink-wraps (inline-flex, a float, a table
	 * cell, a flex item at `width: auto`) there is nothing to take, the group
	 * measures zero and the buttons disappear without an error.
	 *
	 * Watched rather than sampled: a group can be in a closed sheet or behind
	 * `display: none` on its first frame, and a parent can get its width a tick
	 * later, so one look would call both of those a collapse or miss the real
	 * one. The observer waits for the group to be displayed, says it once and
	 * stops watching either way. It starts again when the group is reconnected
	 * somewhere else or when `orientation` turns to `auto`, since both change
	 * the answer.
	 */
	private _watchForCollapse(): void {
		if (!import.meta.env?.DEV) return;
		if (this.orientation !== 'auto') {
			this._stopWatchingForCollapse();
			return;
		}
		if (this._collapseObserver) return;
		this._collapseObserver = new ResizeObserver(() => {
			// No box at all (display:none, a closed sheet): nothing to judge yet.
			// Client rects rather than offsetParent: that is null for a fixed
			// element too, and a fixed group can collapse like any other.
			if (!this.isConnected || this.getClientRects().length === 0) return;
			if (!this._slot?.assignedElements({ flatten: true }).length) return;
			const collapsed = this.getBoundingClientRect().width === 0;
			if (collapsed) {
				console.warn('nldd-button-group: the group is 0 wide, so its buttons are invisible. It takes its width from its parent (it is a container query while orientation is auto), and a parent that sizes itself from its content leaves nothing to take. Give the group or that parent a width.');
			}
			this._stopWatchingForCollapse();
		});
		this._collapseObserver.observe(this);
	}

	private _stopWatchingForCollapse(): void {
		this._collapseObserver?.disconnect();
		this._collapseObserver = null;
	}

	override render() {
		return template.call(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-button-group': NLDDButtonGroup;
	}
}
