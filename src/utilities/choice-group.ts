import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { radioPositions, type RadioPosition } from './radio-position.js';

/**
 * A group of options that answer one question: nldd-radio-button-group,
 * nldd-checkbox-group and nldd-toggle-button-group.
 *
 * Each option renders its input in a shadow root of its own, so the browser
 * sees every option as a group of one. The group knows better and hands each
 * option what it cannot work out alone: the name, `required`, `disabled`,
 * whether anything in the group is chosen (what `required` asks of a group),
 * and for single choice its place in the set and the one stop for Tab.
 *
 * An option tells its group when it changed, whoever changed it (the user,
 * the app, a form reset), through `ChoiceGroup.of(option)`: the group has no
 * way to see a property change on an option, and the option does not reach
 * into its parent.
 *
 * The keyboard stays with each group: the arrows in a radio group and in a
 * toggle group differ on where they go when nothing is chosen yet.
 */

/** What a group asks of its options. */
export interface ChoiceOption extends HTMLElement {
	disabled: boolean;
	name: string;
	required: boolean;
	_groupHasSelection: boolean;
	_groupPosition?: RadioPosition | null;
	commitFormValue?(): void;
}

export interface ChoiceGroupOptions<T extends ChoiceOption> {
	/** The options in DOM order, nested ones included where they belong to the group. */
	options: () => T[];
	isSelected: (option: T) => boolean;
	/** Deselects an option because another one was chosen. */
	deselect: (option: T) => void;
	/** One choice: choosing one deselects the others, and the group is one stop for Tab. */
	single: () => boolean;
	/** The name handed to each option; null leaves the name it has. */
	name: () => string | null;
	/** What `required` each option gets. */
	required: () => boolean;
	/** Whatever else this group hands its options (type, appearance, size). */
	forward?: (option: T) => void;
}

/** The group each host speaks for, so an option can find it without its tag. */
const groups = new WeakMap<Element, ChoiceGroup<ChoiceOption>>();

/**
 * Disables an option for its group, and enables only what the group disabled:
 * an option that is disabled of its own stays so when the group is enabled again.
 */
export function setGroupDisabled(option: HTMLElement & { disabled: boolean }, disabled: boolean): void {
	if (disabled) {
		if (option.hasAttribute('disabled')) return;
		option.setAttribute('group-disabled', '');
		option.disabled = true;
	} else if (option.hasAttribute('group-disabled')) {
		option.removeAttribute('group-disabled');
		option.disabled = false;
	}
}

/**
 * What a group announces on itself. Announced, not drawn: what is wrong goes in
 * an nldd-validation-list, in words. Leave `required` out where the role has
 * no `aria-required`, as `group` has not.
 */
export function announceGroupState(host: HTMLElement, state: { required?: boolean; invalid: boolean }): void {
	if (state.required !== undefined) host.toggleAttribute('aria-required', state.required);
	if (state.invalid) host.setAttribute('aria-invalid', 'true');
	else host.removeAttribute('aria-invalid');
}

export class ChoiceGroup<T extends ChoiceOption> implements ReactiveController {
	private _settleQueued = false;

	constructor(
		private readonly host: ReactiveControllerHost & HTMLElement & { disabled: boolean },
		private readonly options: ChoiceGroupOptions<T>,
	) {
		host.addController(this);
	}

	/** The group an option belongs to, or null for one that stands alone. */
	static of(option: Element): ChoiceGroup<ChoiceOption> | null {
		for (let el = option.parentElement; el; el = el.parentElement) {
			const group = groups.get(el);
			if (group) return group;
		}
		return null;
	}

	hostConnected(): void {
		groups.set(this.host, this as unknown as ChoiceGroup<ChoiceOption>);
	}

	hostDisconnected(): void {
		groups.delete(this.host);
	}

	/** Whether anything in the group is chosen. */
	get answered(): boolean {
		return this.options.options().some(this.options.isSelected);
	}

	/** Hands every option what the group decides, then settles what follows from the choice. */
	sync(): void {
		const name = this.options.name();
		const required = this.options.required();
		for (const option of this.options.options()) {
			if (name !== null) option.name = name;
			option.required = required;
			setGroupDisabled(option, this.host.disabled);
			this.options.forward?.(option);
		}
		this.settle();
	}

	/**
	 * Whether anything is chosen, on every option, and for single choice each
	 * option's place and the stop for Tab. Committed at once: a listener on
	 * `change` reads the validity this just changed.
	 */
	settle(): void {
		const options = this.options.options();
		const answered = options.some(this.options.isSelected);
		const positions = this.options.single()
			? radioPositions(options, this.options.isSelected, (option) => option.disabled)
			: null;
		options.forEach((option, index) => {
			option._groupHasSelection = answered;
			if ('_groupPosition' in option) option._groupPosition = positions?.[index] ?? null;
			option.commitFormValue?.();
		});
	}

	/** An option's choice or `disabled` changed, whoever changed it. */
	optionChanged(option: Element): void {
		if (this.options.single()) {
			if (this.options.isSelected(option as T)) this.selectOnly(option as T);
			this.settle();
			return;
		}
		// Once for all of them: checking an option with others under it changes
		// every one of those, each of which reports here.
		if (this._settleQueued) return;
		this._settleQueued = true;
		queueMicrotask(() => {
			this._settleQueued = false;
			this.settle();
		});
	}

	/** Bind to the group's `change`: what the user chose. */
	handleChange = (event: Event): void => {
		const option = event.target as T;
		if (this.options.single()) {
			if (!this.options.isSelected(option)) return;
			this.selectOnly(option);
		}
		this.settle();
	};

	/** Deselects every other option, as a radio group does. */
	selectOnly(chosen: T): void {
		for (const option of this.options.options()) {
			if (option === chosen) continue;
			this.options.deselect(option);
			// At once, not in the option's own update: the change event is still on
			// its way, and a listener serializing the form would see the old value.
			option.commitFormValue?.();
		}
	}

	/** Focus on the first chosen option, or else the first enabled one, as Tab lands. */
	focus(focusOptions?: FocusOptions): void {
		const enabled = this.options.options().filter((option) => !option.disabled);
		(enabled.find(this.options.isSelected) ?? enabled[0])?.focus(focusOptions);
	}
}
