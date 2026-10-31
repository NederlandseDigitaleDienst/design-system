/**
 * Nederlandse Digitale Dienst Button Group Component (Lit + TypeScript)
 *
 * A container for grouping related buttons together, in a row or stacked.
 *
 * `auto`, the default, is a row, and a stack over the full width in a container
 * of 30rem (480px) or less, the width of a phone, where two labels beside each
 * other leave no room for either. A card or a dialog between 480px and the
 * sm breakpoint keeps its row. The group is its own container, so it follows
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
 * With `width="full"` the buttons fill the row and share it equally. A button
 * whose label does not fit its share takes the width it needs, and the others
 * share what is left. A button that does not fit beside the others moves to the
 * next line and fills it: two buttons stack, three end up as two over one. That
 * replaces the 480px rule of `auto`, and the group is no container then. With
 * `orientation="horizontal"` it stays a row, and a label that does not fit wraps
 * instead. An `nldd-icon-button` takes no share of the row.
 *
 * The group sets its `size` on every button in it: buttons in one group are the
 * same size. It holds three buttons at most and hides the rest.
 *
 * @element nldd-button-group
 * @attr {string} size - Button group size, set on every button in it: 'sm' | 'md' (default: 'md')
 * @attr {string} orientation - Layout direction: 'auto' | 'horizontal' | 'vertical' (default: 'auto')
 * @attr {string} width - 'full': the buttons fill the row in equal shares, and a button that does not fit moves to a line of its own (default: unset, each button as wide as its label)
 *
 * @slot - Default slot for buttons (max 3)
 */
import { LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { buttonGroupStyles } from './button-group.styles.js';
import { template } from './button-group.template.js';
import { setState } from '../../../utilities/element-state.js';

type Size = 'sm' | 'md';
type Orientation = 'auto' | 'horizontal' | 'vertical';
type Width = '' | 'full';

@customElement('nldd-button-group')
export class NLDDButtonGroup extends LitElement {
	static override styles = buttonGroupStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, converter: reflectNonDefault<Orientation>('auto') })
	orientation: Orientation = 'auto';

	@property({ reflect: true, converter: reflectNonDefault<Width>('') })
	width: Width = '';

	@query('slot')
	private _slot!: HTMLSlotElement;

	/** DEV only: watches for the collapse below, then lets itself go. */
	private _collapseObserver: ResizeObserver | null = null;
	/** Timer holding a zero-width reading before it counts as a verdict. */
	private _collapseVerdict = 0;

	/** Buttons whose size the group has set, so a size of their own can be told apart. */
	private _sized = new WeakSet<Element>();

	/** @internal */
	_handleSlotChange(): void {
		const assigned = this._slot.assignedElements({ flatten: true });
		for (const el of assigned) {
			const own = el.getAttribute('size');
			if (own !== null && own !== this.size && !this._sized.has(el)) setState(this, 'own-size-overwritten', true);
			el.setAttribute('size', this.size);
			this._sized.add(el);
		}
	}

	override updated(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('size')) this._handleSlotChange();
		// Switching to auto makes the group a container after the fact, so the
		// question it can then fail is only worth asking from here on.
		if (changedProperties.has('orientation') || changedProperties.has('width')) this._watchForCollapse();
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
	 * The group is an inline-size container while `orientation` is `auto` and
	 * `width` is not `full`, so its width has to come from its parent: a
	 * container may not size itself from its own contents. In a parent that shrink-wraps (inline-flex, a float, a table
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
	 *
	 * A zero reading waits before it counts: a parent can hand over its width a
	 * frame or two after the first paint, and that looks exactly like a collapse
	 * until it does. Only a zero that is still zero when the timer runs out gets
	 * said out loud.
	 */
	private _watchForCollapse(): void {
		if (!import.meta.env?.DEV) return;
		if (this.orientation !== 'auto' || this.width === 'full') {
			this._stopWatchingForCollapse();
			setState(this, 'no-width', false);
			return;
		}
		if (this._collapseObserver) return;
		this._collapseObserver = new ResizeObserver(() => {
			// No box at all (display:none, a closed sheet): nothing to judge yet.
			// Client rects rather than offsetParent: that is null for a fixed
			// element too, and a fixed group can collapse like any other.
			if (!this.isConnected || this.getClientRects().length === 0) return;
			if (!this._slot?.assignedElements({ flatten: true }).length) return;
			if (this.getBoundingClientRect().width > 0) {
				// It got a width, from the start or a tick late.
				setState(this, 'no-width', false);
				this._stopWatchingForCollapse();
				return;
			}
			// Zero, but not yet a verdict: a parent can hand over its width a
			// frame or two later, and that is the same zero. Give it a moment and
			// keep watching, so a width that arrives cancels this.
			if (this._collapseVerdict !== 0) return;
			this._collapseVerdict = window.setTimeout(() => {
				if (!this.isConnected || this.getClientRects().length === 0) return;
				if (this.getBoundingClientRect().width > 0) return;
				setState(this, 'no-width', true);
				this._stopWatchingForCollapse();
			}, 250);
		});
		this._collapseObserver.observe(this);
	}

	private _stopWatchingForCollapse(): void {
		this._collapseObserver?.disconnect();
		this._collapseObserver = null;
		if (this._collapseVerdict) clearTimeout(this._collapseVerdict);
		this._collapseVerdict = 0;
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
