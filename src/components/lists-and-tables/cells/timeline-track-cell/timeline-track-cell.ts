/**
 * Nederlandse Digitale Dienst Timeline Track Cell Component (Lit + TypeScript)
 *
 * A cell component for displaying timeline track indicators in lists.
 * Shows a vertical line with a dot indicating timeline position and state.
 * The row's block padding belongs to the cell itself (via
 * `--context-cell-padding-block`), so the line spans the cell's own box edge to
 * edge and consecutive steps connect without gaps.
 *
 * By default the cell is a bare track: a line with a dot per row, for a timeline
 * of events. With `variant="step"` the dot grows big enough for a number or an
 * icon and you have a list of steps under each other, the vertical counterpart
 * of `nldd-step-indicator`. The size belongs to the variant rather than to the
 * content: every dot in a list is the same size, or the track would jump.
 *
 * @element nldd-timeline-track-cell
 * @attr {'major' | 'minor' | 'none'} variant - What stands in the lane: a whole dot (`major`, the default), a smaller one for a row that belongs under the one above it (`minor`), or nothing at all (`none`) for a row that carries what a step holds rather than being a step. A `none` row keeps its `size` and its `status`, so it stays in the same lane and the track runs on in the right color
 * @attr {'past' | 'current' | 'future'} status - How far along this row is (default 'past'); the same values as `nldd-step-indicator-item`. It colors the dot and the track around it: covered above where you are, still ahead below
 * @attr {'sm' | 'md'} size - How wide the lane is and so how big the dot: `sm` (default, 16px) for a timeline of events, `md` (24px) where a number or an icon has to fit. Every row in one list takes the same size, or the track jumps
 * @attr {'down' | 'up'} direction - The direction the timeline moves forward in: `down` (default) puts the past above, `up` below. Only the current step has half a track, so this only has an effect there
 * @attr {'first' | 'between' | 'last' | 'only'} position - Place in the series (default 'between'): decides whether the line continues above the dot, below it, or on both sides. `only` is the single row in the series and gets a line on neither side: a track of one dot leads nowhere. On a `variant="none"` row, which is nothing but line, `only` leaves it out altogether: the track ends above it
 * @attr {'auto' | 'top' | 'bottom' | 'both' | 'none'} line - Which halves of the track you have covered, when `status` and `direction` get it wrong (default 'auto', which is what those two say). The halves you name are drawn as covered and the other one as still ahead, so `none` covers neither. Which halves are drawn at all stays with `position`, except that naming a half draws it: `line="both"` on a `first` row draws one above too. A row that opens a group of its own is the case for `both`, since the going carries on below it. A `variant="none"` row has one line rather than two halves, and no point where a fill could change over, so there the status colors the whole of it and `line` overrules the whole of it. On a `current` row that leans the way the timeline runs: what belongs to a point usually comes after it, so going `down` the stretch reads as still ahead and going `up` as behind you
 * @attr {string} text - Number or short text in the dot
 * @attr {string} icon - Icon name in the dot; wins over `text`
 *
 * @slot - Custom content in the dot (an alternative to `text` and `icon`)
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import { timelineTrackCellStyles } from './timeline-track-cell.styles.js';
import { timelineTrackCellTemplate } from './timeline-track-cell.template.js';
import '../../../content/icon/icon.js';

type Status = 'past' | 'current' | 'future';
type Size = 'sm' | 'md';
type Variant = 'major' | 'minor' | 'none';
type Direction = 'down' | 'up';
type Position = 'first' | 'between' | 'last' | 'only';
type Line = 'auto' | 'top' | 'bottom' | 'both' | 'none';

@customElement('nldd-timeline-track-cell')
export class NLDDTimelineTrackCell extends VisibilityMixin(LitElement, 'cells-container') {
	static override styles = timelineTrackCellStyles;

	/**
	 * What stands in the lane: a whole dot, a smaller one, or nothing.
	 *
	 * A rank rather than a measurement — the cell picks the sizes, so the scale
	 * can change later without every consumer following. `minor` is a row that
	 * belongs under the one above it, and its dot stays empty: a number would not
	 * fit and would make the row a step of its own, so carry that hierarchy in
	 * the row instead, with an `nldd-text-cell` rather than an `nldd-title-cell`.
	 * `none` is a row that carries what a step holds rather than being one.
	 */
	@property({ reflect: true, converter: reflectNonDefault<Variant>('major') })
	variant: Variant = 'major';

	@property({ reflect: true, converter: reflectNonDefault<Status>('past') })
	status: Status = 'past';

	/** How wide the lane is, and with it how big the dot. One size per list: a
	 *  lane that changes width halfway bends the track. */
	@property({ reflect: true, converter: reflectNonDefault<Size>('sm') })
	size: Size = 'sm';

	/** Which way the timeline moves forward. The cell only knows its own step, so
	 *  it cannot tell which neighbor came first: with `up` (newest at the top)
	 *  the traveled half of the track is the one below the marker. Only the
	 *  current step has a half-and-half track, so this is the only row where it
	 *  changes anything. */
	@property({ reflect: true, converter: reflectNonDefault<Direction>('down') })
	direction: Direction = 'down';

	@property({ reflect: true, converter: reflectNonDefault<Position>('between') })
	position: Position = 'between';

	/**
	 * Which halves of the track you have covered, for when the status gets it
	 * wrong.
	 *
	 * It reads one row at a time, and a row that opens a group of its own is
	 * not the end of the going: the step you are on sits inside it, further
	 * down. Nothing in the cell can see that, and a cell that read its
	 * neighbours would break the moment rows come and go. So the consumer says
	 * it, and says it for both halves at once: the ones named are covered and
	 * the other one is still ahead.
	 *
	 * This is about fill, not about place. Where you stand in the series is what
	 * `position` says, and that keeps deciding which halves are drawn — naming a
	 * fill does not take a half away. It can add one, though: calling a half
	 * covered draws it, even where the position left it out.
	 */
	@property({ reflect: true, converter: reflectNonDefault<Line>('auto') })
	line: Line = 'auto';

	@property({ type: String })
	text = '';

	@property({ type: String })
	icon = '';

	/** Only a whole dot in a wide lane has room to read a number in: a minor one is
	 *  smaller still, and would claim to be a step of its own. */
	get showsContent(): boolean {
		return this.variant === 'major' && this.size === 'md';
	}

	private _warnedContent = false;

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!import.meta.env?.DEV) return;
		const ignored = !this.showsContent && Boolean(this.text || this.icon);
		if (ignored && !this._warnedContent) {
			this._warnedContent = true;
			console.warn('<nldd-timeline-track-cell>: `text` en `icon` passen alleen in een hele stip in een brede baan (`size="md"` met `variant="major"`); hier worden ze niet getoond.');
		}
		else if (!ignored) {
			this._warnedContent = false;
		}
	}

	override render() {
		return timelineTrackCellTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-timeline-track-cell': NLDDTimelineTrackCell;
	}
}
