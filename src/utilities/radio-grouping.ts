import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { afterParse } from './after-parse.js';
import { radioPositions, type RadioPosition } from './radio-position.js';

/**
 * Groups a radio with the ones that share its name, the way the browser does.
 *
 * The platform groups native radios by name, within one tree and one form, and
 * every radio of ours renders in a shadow root of its own. Left to the browser
 * each of them is a group of one: checking one leaves the others checked, Tab
 * stops at every option, and none of them knows its place in the set.
 *
 * A group component around the radios (nldd-radio-button-group) hands its
 * members their position and wins where it is there. This is for the radios
 * that stand on their own, in a `<fieldset role="radiogroup">` or a layout of
 * the consumer's own.
 */

/** What a radio has to offer to be grouped with the others of its name. */
export interface GroupedRadio extends HTMLElement {
	name: string;
	checked: boolean;
	disabled: boolean;
	readonly internals: ElementInternals;
	commitFormValue(): void;
	/** Checks this radio, the way a click does. */
	select(): void;
}

type RadioHost = GroupedRadio & ReactiveControllerHost;

/** What the browser groups radios by: a name, within one tree and one form. */
interface RadioGroupKey {
	root: Node;
	name: string;
	form: HTMLFormElement | null;
}

/**
 * Both tags in one list, because the platform groups on the name and not on the
 * element. A button and a field that share a name are one group to the browser,
 * and two lists would have them counting different sets.
 */
const RADIO_TAGS = 'nldd-radio-button, nldd-radio-button-field';

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/** The controller of each radio, so a recount can reach its siblings. */
const groupings = new WeakMap<Element, RadioGrouping>();

/** A radio that draws the shape for something else owns no state of its own. */
function isMember(radio: Element): boolean {
	return !(radio as Element & { decorative?: boolean }).decorative;
}

export class RadioGrouping implements ReactiveController {

	/** Its place among the radios that share its name, or null when it has none. */
	position: RadioPosition | null = null;

	/**
	 * Whether anything in the group is checked, which is what `required` asks of
	 * a radio: one of these, not this one. A radio without a group answers for
	 * itself, because it is the whole group.
	 */
	answered = false;

	/** Where it was grouped last, so the radios it leaves behind hear of it. */
	private _groupedIn: RadioGroupKey | null = null;

	constructor(private host: RadioHost) {
		groupings.set(host, this);
		host.addController(this);
	}

	hostConnected(): void {
		// A tick later, once the radios parsed after this one are there too.
		queueMicrotask(() => this.regroup(true));
	}

	hostDisconnected(): void {
		this.regroup(true);
	}

	/**
	 * Reads which group this radio is in now, and recounts the one it left.
	 *
	 * @param batched recount once for every radio that asks in the same tick,
	 *   or after the parse while the page is still loading. A recount reads the
	 *   whole tree, so a page of radios that each recount on connect is
	 *   quadratic.
	 */
	regroup(batched = false): void {
		const was = this._groupedIn;
		const now = this._key();
		this._groupedIn = now;
		const moved = !now || !was || was.root !== now.root || was.name !== now.name || was.form !== now.form;
		const recount = batched ? RadioGrouping._schedule : RadioGrouping._recount;
		if (was && moved) recount(was);
		if (now) recount(now);
		else this._apply(null, this.host.checked);
	}

	/** Counts the group again, after this radio was checked or disabled. */
	refresh(): void {
		if (this._groupedIn) RadioGrouping._recount(this._groupedIn);
		else this._apply(null, this.host.checked);
	}

	/**
	 * Unchecks the others, as checking a native radio does.
	 *
	 * @param batched at the next recount, with the other radios that render for
	 *   the first time: of the radios that come checked in the markup, the last
	 *   one wins. Each of them walking its group on its own is quadratic.
	 */
	uncheckOthers(batched = false): void {
		const key = this._key();
		if (!key) return;
		if (batched) {
			RadioGrouping._claims.add(this.host);
			RadioGrouping._schedule(key);
			return;
		}
		for (const radio of RadioGrouping._radiosIn(key)) {
			if (radio === this.host || !radio.checked) continue;
			radio.checked = false;
			// Synchronously: a change listener that reads the form should not find
			// two values under one name.
			radio.commitFormValue();
		}
	}

	/**
	 * Moves to the next radio of the group and checks it, as the arrow keys do
	 * for native radios. Disabled options are stepped over, and the ends wrap.
	 *
	 * @returns whether the key was handled.
	 */
	moveWithArrow(e: KeyboardEvent): boolean {
		const step = ARROW_STEPS[e.key];
		const key = step ? this._key() : null;
		if (!key || !this.position) return false;
		const radios = RadioGrouping._radiosIn(key).filter((radio) => !radio.disabled);
		const at = radios.indexOf(this.host);
		if (at === -1) return false;
		e.preventDefault();
		const next = radios[(at + step + radios.length) % radios.length];
		next.focus();
		next.select();
		return true;
	}

	private _key(): RadioGroupKey | null {
		if (!this.host.isConnected || !isMember(this.host) || !this.host.name) return null;
		return { root: this.host.getRootNode(), name: this.host.name, form: this.host.internals.form };
	}

	/** Compared by value: a recount hands out new objects for the same place, and
	 *  asking for a render on every one of those is a render per radio per
	 *  keystroke, each of them scheduled from inside an update that had just
	 *  finished. */
	private _apply(position: RadioPosition | null, answered: boolean): void {
		const same = this.answered === answered
			&& this.position?.posInSet === position?.posInSet
			&& this.position?.setSize === position?.setSize
			&& this.position?.tabbable === position?.tabbable;
		if (same) return;
		this.position = position;
		this.answered = answered;
		this.host.requestUpdate();
	}

	private static _radiosIn({ root, name, form }: RadioGroupKey): GroupedRadio[] {
		return RadioGrouping._groupsIn(root).get(name)?.get(form) ?? [];
	}

	/** Every grouped radio in a tree, by name and form, in document order. */
	private static _groupsIn(root: Node): Map<string, Map<HTMLFormElement | null, GroupedRadio[]>> {
		const groups = new Map<string, Map<HTMLFormElement | null, GroupedRadio[]>>();
		for (const radio of (root as ParentNode).querySelectorAll?.(RADIO_TAGS) ?? []) {
			if (!groupings.has(radio) || !radio.isConnected || !isMember(radio)) continue;
			const { name, internals } = radio as GroupedRadio;
			const byForm = groups.get(name) ?? new Map<HTMLFormElement | null, GroupedRadio[]>();
			groups.set(name, byForm);
			const radios = byForm.get(internals.form) ?? [];
			byForm.set(internals.form, radios);
			radios.push(radio as GroupedRadio);
		}
		return groups;
	}

	/** The groups to recount at the next flush: per tree, the names and forms. */
	private static _pending = new Map<Node, Map<string, Set<HTMLFormElement | null>>>();

	private static _schedule = (key: RadioGroupKey): void => {
		const pending = RadioGrouping._pending;
		const scheduled = pending.size > 0;
		const names = pending.get(key.root) ?? new Map<string, Set<HTMLFormElement | null>>();
		pending.set(key.root, names);
		const forms = names.get(key.name) ?? new Set<HTMLFormElement | null>();
		names.set(key.name, forms);
		forms.add(key.form);
		if (scheduled) return;
		const doc = key.root.ownerDocument ?? (key.root as Document);
		if (!afterParse(RadioGrouping._flush, doc)) queueMicrotask(RadioGrouping._flush);
	};

	/** Checked radios that render for the first time, in the order they did. */
	private static _claims = new Set<GroupedRadio>();

	/** Recounts every pending group, reading each tree once. */
	private static _flush = (): void => {
		const pending = [...RadioGrouping._pending];
		const claims = [...RadioGrouping._claims].reverse();
		RadioGrouping._pending.clear();
		RadioGrouping._claims.clear();
		for (const [root, names] of pending) {
			const groups = RadioGrouping._groupsIn(root);
			for (const [name, forms] of names) {
				for (const form of forms) {
					const radios = groups.get(name)?.get(form) ?? [];
					RadioGrouping._settleClaims(radios, claims);
					RadioGrouping._place(radios);
				}
			}
		}
	};

	/** The last radio that came checked keeps it; the others in its group do not. */
	private static _settleClaims(radios: GroupedRadio[], claims: GroupedRadio[]): void {
		const members = new Set(radios);
		const winner = claims.find((radio) => members.has(radio) && radio.checked);
		if (!winner) return;
		for (const radio of radios) {
			if (radio === winner || !radio.checked) continue;
			radio.checked = false;
			radio.commitFormValue();
		}
	}

	/** A radio on its own keeps the place the browser gives it: none. */
	private static _recount = (key: RadioGroupKey): void => {
		RadioGrouping._place(RadioGrouping._radiosIn(key));
	};

	/** Hands every radio of one group its place, and whether the group is answered. */
	private static _place(radios: GroupedRadio[]): void {
		const positions = radios.length > 1
			? radioPositions(radios, (radio) => radio.checked, (radio) => radio.disabled)
			: [];
		const answered = radios.some((radio) => radio.checked);
		radios.forEach((radio, index) => {
			groupings.get(radio)?._apply(positions[index] ?? null, answered);
		});
	}
}
