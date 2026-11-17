import type { TextEditorState } from './text-editor.commands.js';

/* Controls that drive an editor from their markup: `text-editor-command` on a
 * button, a toggle, a menu item or a segmented control, inside the editor (its
 * `toolbar` slot) or inside an element with `text-editor-for` set
 * to the editor's id, anywhere on the page.
 *
 * One listener on the document runs the commands, so a toolbar rendered later
 * needs no wiring. After every change of state the editor looks its controls up
 * again and sets `selected` and `disabled` on them: on the originals in the light
 * DOM, which nldd-toolbar copies into its overflow menu. */

const COMMAND_ATTR = 'text-editor-command';
const FOR_ATTR = 'text-editor-for';

/** What the binding needs of the editor. */
export interface CommandTarget extends HTMLElement {
	disabled: boolean;
	readonly: boolean;
	getState(): TextEditorState;
	runCommand(name: string, payload?: unknown): void;
}

type ListValue = 'none' | 'bullet' | 'ordered' | 'task';

/** `setHeading:2` → `['setHeading', 2]`; a number stays a number. */
export function parseCommand(value: string): [string, unknown] {
	const at = value.indexOf(':');
	if (at < 0) return [value.trim(), undefined];
	const arg = value.slice(at + 1).trim();
	return [value.slice(0, at).trim(), /^\d+$/.test(arg) ? Number(arg) : arg];
}

function currentList(state: TextEditorState): ListValue {
	const { active } = state;
	return active.taskList ? 'task' : active.orderedList ? 'ordered' : active.bulletList ? 'bullet' : 'none';
}

const TOGGLES = new Set(['bold', 'italic', 'inlineCode', 'strikethrough', 'link', 'quote', 'codeBlock', 'taskList']);

/** Whether the command is on at the caret, for a toggle or a menu item. */
function isActive(name: string, arg: unknown, state: TextEditorState): boolean {
	const { active } = state;
	if (TOGGLES.has(name)) return Boolean(active[name as keyof typeof active]);
	if (name === 'bulletList') return active.bulletList && !active.taskList;
	if (name === 'heading') return active.heading === (typeof arg === 'number' ? arg : 1);
	if (name === 'setHeading') return !active.codeBlock && active.heading === (typeof arg === 'number' ? arg : 0);
	if (name === 'setList') return !active.codeBlock && currentList(state) === (arg ?? 'none');
	return false;
}

// Formatting inside code is literal text: the inline formats are off in any
// code, the block formats in a code block. A text style stays, as the way out.
const INLINE = new Set(['bold', 'italic', 'strikethrough', 'link']);
const BLOCK = new Set(['inlineCode', 'quote', 'bulletList', 'taskList', 'setList', 'heading']);

/** Whether the command can run now. */
function canRun(name: string, target: CommandTarget, state: TextEditorState): boolean {
	if (target.disabled) return false;
	if (target.readonly) return name === 'copy';
	const { active } = state;
	if (INLINE.has(name)) return !active.inlineCode && !active.codeBlock;
	if (BLOCK.has(name)) return !active.codeBlock;
	switch (name) {
		case 'undo': return state.canUndo;
		case 'redo': return state.canRedo;
		case 'indent': return state.canIndent;
		case 'outdent': return state.canOutdent;
		case 'copy':
		case 'cut': return !state.empty;
		default: return true;
	}
}

const tag = (el: Element): string => el.tagName.toLowerCase();

/** The element itself, then its ancestors, across shadow boundaries. */
function* ancestry(el: Element): Generator<Element> {
	let node: Node | null = el;
	while (node) {
		if (node instanceof Element) yield node;
		node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);
	}
}

/** A copy nldd-toolbar made for its overflow menu: the toolbar sends its
 *  `select` on to the original, so the copy itself is not a control. */
function isOverflowCopy(el: Element): boolean {
	const root = el.getRootNode();
	return root instanceof ShadowRoot && tag(root.host) === 'nldd-toolbar';
}

/* One set of listeners on the document for every editor: an event finds its
 * control once, and only the editor that owns it answers. */
const bindings = new Set<ToolbarBinding>();

/** The nearest element with a command along the event's path. An editor on the
 *  way ends the search: what is inside it is not a control of an editor above. */
function controlOf(event: Event): Element | null {
	for (const node of event.composedPath()) {
		if (!(node instanceof Element)) continue;
		if (tag(node) === 'nldd-text-editor') return null;
		if (node.hasAttribute(COMMAND_ATTR)) return isOverflowCopy(node) ? null : node;
	}
	return null;
}

/** The binding of the editor `el` belongs to: the one a container names, or,
 *  in none, the editor it sits in. */
function ownerOf(el: Element): ToolbarBinding | undefined {
	for (const node of ancestry(el)) {
		const id = node.getAttribute(FOR_ATTR);
		if (id !== null) {
			if (id === '') return undefined;
			for (const binding of bindings) if (binding.target.id === id) return binding;
			return undefined;
		}
		for (const binding of bindings) if (binding.target === node) return binding;
	}
	return undefined;
}

function listen(type: 'click' | 'change' | 'select' | 'pointerdown' | 'keydown'): EventListener {
	return (event) => {
		const control = controlOf(event);
		const owner = control && ownerOf(control);
		owner?.handle(type, event, control!);
	};
}

const LISTENERS = (['click', 'change', 'select', 'pointerdown', 'keydown'] as const).map((type) => [type, listen(type)] as const);
// Capture for the moment before a control answers: a click switches the list first.
const CAPTURE = new Set(['pointerdown', 'keydown']);

export class ToolbarBinding {
	/** The list before the press: a second click on the list that is on turns
	 *  it off. A radio does not change on that click, and a click on another item
	 *  has already switched the list by the time the click arrives. */
	private _listBeforePress: ListValue | null = null;

	constructor(readonly target: CommandTarget, private readonly focusText: () => void) {}

	connect(): void {
		if (bindings.size === 0) {
			for (const [type, listener] of LISTENERS) document.addEventListener(type, listener, CAPTURE.has(type));
		}
		bindings.add(this);
	}

	disconnect(): void {
		bindings.delete(this);
		if (bindings.size === 0) {
			for (const [type, listener] of LISTENERS) document.removeEventListener(type, listener, CAPTURE.has(type));
		}
	}

	/** Every control of this editor, in its slot and in the containers naming it. */
	controls(): Element[] {
		const own = [...this.target.querySelectorAll(`[${COMMAND_ATTR}]`)];
		const id = this.target.id;
		const elsewhere = id
			? [...document.querySelectorAll(`[${FOR_ATTR}="${CSS.escape(id)}"]`)].flatMap((box) => [
				...(box.hasAttribute(COMMAND_ATTR) ? [box] : []),
				...box.querySelectorAll(`[${COMMAND_ATTR}]`),
			])
			: [];
		return [...own, ...elsewhere].filter((el) => ownerOf(el) === this);
	}

	private _run(value: string): void {
		const [name, arg] = parseCommand(value);
		// A code block is its own block type: a text style steps out of it first,
		// which makes "Paragraaf" the way out of a code block.
		if (name === 'setHeading' && this.target.getState().active.codeBlock) this.target.runCommand('codeBlock');
		// The state-change that follows sets the controls.
		this.target.runCommand(name, arg);
		// After a menu has given focus back to its button.
		queueMicrotask(this.focusText);
	}

	/** Called by the document listeners for a control this editor owns. */
	handle(type: string, event: Event, control: Element): void {
		const kind = tag(control);
		const [name] = parseCommand(control.getAttribute(COMMAND_ATTR)!);
		switch (type) {
			case 'pointerdown':
			case 'keydown': {
				// A press by pointer, or by Enter or Space on the keyboard.
				if (type === 'keydown' && !['Enter', ' '].includes((event as KeyboardEvent).key)) return;
				this._listBeforePress = kind === 'nldd-segmented-control' ? currentList(this.target.getState()) : null;
				return;
			}
			case 'click': {
				// A menu item answers with `select`.
				if (kind === 'nldd-menu-item') return;
				if (kind === 'nldd-segmented-control') {
					// A segmented control answers with `change`, except a second press on
					// the list that is on, which turns it off.
					const item = (event.target as Element).closest?.('nldd-segmented-control-item') as { value?: string } | null;
					if (name === 'setList' && item?.value && item.value !== 'none' && item.value === this._listBeforePress) this._run('setList:none');
					this._listBeforePress = null;
					return;
				}
				this._run(control.getAttribute(COMMAND_ATTR)!);
				return;
			}
			case 'change': {
				if (kind !== 'nldd-segmented-control') return;
				const value = (control as unknown as { value?: string }).value;
				if (value) this._run(`${name}:${value}`);
				return;
			}
			case 'select': {
				if (kind !== 'nldd-menu-item') return;
				const value = control.getAttribute(COMMAND_ATTR)!;
				// Choosing the radio that is on changes nothing, as in any radio group:
				// "Codeblok" in a code block keeps it.
				const [, arg] = parseCommand(value);
				if (control.getAttribute('type') === 'radio' && isActive(name, arg, this.target.getState())) return;
				this._run(value);
			}
		}
	}

	/** Sets `selected`, the value of a segmented control and `disabled` on every
	 *  control from the editor's state. */
	reflect(state: TextEditorState = this.target.getState()): void {
		for (const el of this.controls()) {
			const [name, arg] = parseCommand(el.getAttribute(COMMAND_ATTR)!);
			const kind = tag(el);
			el.toggleAttribute('disabled', !canRun(name, this.target, state));
			if (kind === 'nldd-segmented-control') {
				if (name === 'setList') (el as unknown as { value: string }).value = currentList(state);
				continue;
			}
			if (kind === 'nldd-toggle-button' || kind === 'nldd-menu-item' || kind === 'nldd-segmented-control-item') {
				el.toggleAttribute('selected', isActive(name, arg, state));
			}
		}
	}
}

/** Marks the toolbar slot `is-stuck` while it sticks to the top of its scroll
 *  container, so it can take room from that edge without moving the text.
 *
 *  Measured, not observed: a slot that sticks has left its place at the edge of
 *  the frame, whichever element scrolls. The check runs on any scroll (a capture
 *  listener sees every scroll container) and when the editor changes size, once
 *  per frame, and only in an embedded editor with a filled slot. */
export class StuckToolbar {
	private _frame = 0;
	private _resize?: ResizeObserver;
	private _listening = false;
	private _gap = 0;

	constructor(private readonly host: HTMLElement, private readonly container: () => HTMLElement | null) {}

	private _slot(): HTMLSlotElement | null {
		return this.container()?.querySelector<HTMLSlotElement>('slot[name="toolbar"]') ?? null;
	}

	/** Starts or stops watching, after the slot or `embedded` changed. Only an
	 *  embedded editor keeps a gap while stuck; elsewhere there is nothing to do. */
	update(): void {
		const slot = this._slot();
		const watch = Boolean(slot?.classList.contains('is-filled')) && this.host.hasAttribute('embedded');
		if (!watch) slot?.classList.remove('is-stuck');
		if (watch && !this._listening) {
			this._gap = parseFloat(getComputedStyle(slot!).getPropertyValue('--_text-editor-stuck-gap')) || 0;
			document.addEventListener('scroll', this._schedule, { capture: true, passive: true });
			this._resize = new ResizeObserver(this._schedule);
			this._resize.observe(this.host);
			this._listening = true;
		} else if (!watch && this._listening) {
			this.stop();
		}
		this._schedule();
	}

	stop(): void {
		document.removeEventListener('scroll', this._schedule, { capture: true });
		this._resize?.disconnect();
		cancelAnimationFrame(this._frame);
		this._frame = 0;
		this._listening = false;
	}

	private _schedule = (): void => {
		if (this._frame) return;
		this._frame = requestAnimationFrame(() => {
			this._frame = 0;
			this.check();
		});
	};

	check(): void {
		const slot = this._slot();
		if (!slot || !this._listening) return;
		const moved = slot.getBoundingClientRect().top - this.container()!.getBoundingClientRect().top;
		// Stuck, the bar sits a gap further from the edge: that alone is no reason to stay stuck.
		const gap = slot.classList.contains('is-stuck') ? this._gap : 0;
		slot.classList.toggle('is-stuck', moved > gap + 0.5);
	}
}
