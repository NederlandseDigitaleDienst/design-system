/**
 * Nederlandse Digitale Dienst File Field Component (Lit + TypeScript)
 *
 * A file picker that reads as one control. Empty, the whole tinted surface is
 * one button with one sentence centered in it, "Bestand kiezen of sleep het
 * hierheen", its first part accented, so a press anywhere on it opens the file
 * dialog. Once a file is chosen, the surface shows it with the icon of its
 * format, its name, a button to choose another and a dismiss button to clear it
 * again. A long name is cut in the middle, so its start and its end stay in
 * view ("Screenshot 20…at 13.12.21.png"); it then shows whole in a tooltip, and
 * a screen reader reads it whole either way. It wraps a hidden native
 * `<input type="file">`, which is what makes the picker open at all — a file
 * dialog only opens from a user gesture on a real input.
 *
 * Files can be dropped on the whole field. A drop goes through the same input,
 * so it fires the same `change` with the same detail and submits the same way as
 * a pick. `accept` and `multiple` hold for a drop too, which the native input
 * does not do: a drop that does not fit is refused as a whole, the previous
 * choice stays, and the field says why for a few seconds: "Sleep één
 * bestand", or what `accept` takes, named from it ("Het bestand moet een PDF
 * zijn"; "Dit bestandstype past niet" where a type in it has no name). The
 * message stays for a few seconds and then gives way to the field again.
 *
 * With `multiple`, a dropped folder is read down to the files in it, its
 * subfolders included, and mixed with loose files in one drop if need be. The
 * field then names the folder ("site (124 bestanden)"), `paths` says where each
 * file sat ("site/css/main.css"), and a form submits each file with its path as
 * its name, as a native folder input does, so two files with one name in
 * different folders stay apart. `accept` holds for every file in it. Without
 * `multiple` a folder is refused ("Sleep een bestand, geen map"): one file
 * cannot be a folder. Only a drop tells a folder apart, not the drag.
 *
 * `directory` offers a folder in the file dialog too. A dialog picks files or a
 * folder, never both, so with it choosing and changing open a menu with
 * "Bestanden kiezen" and "Map kiezen", and the field says "Bestanden of een map
 * kiezen". A folder is many files, so `directory` takes several without
 * `multiple`. Safari on iOS picks a folder as well; a browser that cannot opens
 * a dialog for files instead.
 *
 * While files are dragged over the page, every field marks itself as a place
 * to put them, and the field under the pointer says it will take them (a field
 * with a file: that they replace it), or turns critical and refuses already
 * when the number or the type rules them out. A file dropped next to a field no
 * longer makes the browser open it and leave the page; a drop that another drop zone or an
 * editable field takes is left alone. On a device without hover there is no
 * dragging, so the field there drops the hint.
 *
 * The surface deliberately does not look like an input field. A border with
 * field semantics promises you can type into it; here you can only press it or
 * drop a file on it, so it has the border of a tinted surface instead of
 * `--semantics-input-fields-*`.
 *
 * Several files are summarized, not listed: "3 bestanden" with a single cross
 * that clears all of them. Every pick replaces the whole FileList, and rebuilding
 * it to add or drop one file means going through DataTransfer, which does not
 * deduplicate (even the same File object twice yields two entries) — and a File
 * has no id, so deduplicating would come down to guessing from name, size and
 * last-modified. A list with a cross per file would promise an edit the platform
 * does not support. A page that does want to show the files renders its own list
 * from the `File[]` in the change event.
 *
 * `variant="area"` lays the same field out as a tall surface, for a page where
 * handing in files is the main task. Empty, it shows an upload icon, the
 * sentence and the types it takes ("Toegestaan: PDF of JPG"), named from
 * `accept`; with a file, the icon of its format, its name and the buttons
 * "Wijzigen" and "Wis selectie" stacked in the middle. Both states have the same
 * height, so the page does not move when a file is chosen.
 *
 * @element nldd-file-field
 * @attr {string} variant - 'control' (default): a row the height of a field. 'area': a tall surface with the upload icon and the accepted types when empty, and the file icon, name and buttons stacked once chosen; both states keep the same height
 * @attr {string} size - Field size: 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {string} accept - Comma-separated list of accepted file types, forwarded to the input (e.g. ".pdf,image/*")
 * @attr {boolean} multiple - Allows choosing more than one file, and dropping a folder
 * @attr {boolean} directory - Offers a folder beside files: choosing and changing open a menu with both, since one dialog picks either. Takes several files, as `multiple` does
 * @attr {string} accessible-label - Accessible label forwarded to the inner input. Set automatically by nldd-form-field.
 * @attr {string} input-id - Sets the id on the native input. Set automatically by nldd-form-field.
 * @attr {boolean} valid - Marks the field as valid; shows a check icon on the right, like nldd-dropdown
 * @attr {boolean} invalid - Marks the field as invalid; shows an alert icon on the right, like nldd-dropdown
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Name for form submission
 * @attr {boolean} required - Marks the field required (invalid while no file is chosen)
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @prop {File[]} files - The chosen files. Read-only: browsers forbid setting a file input's value, so there is no `value` attribute and no way to preselect a file.
 * @prop {string[]} paths - Where each of `files` sat, in the same order: its name, or for a file from a dropped folder the path from that folder down. Read-only.
 *
 * @fires change - When the chosen files change, including a clear; detail: { files: File[], paths: string[] }
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { fileFieldStyles } from './file-field.styles.js';
import { fileFieldTemplate } from './file-field.template.js';
import { nlddFileFieldTranslations, type NLDDFileFieldTranslations } from './file-field.i18n.js';
import {
	acceptNames,
	carriesFiles,
	holdsFolder,
	readDrop,
	fileMatches,
	typeRuledOut,
	unwatchDrags,
	watchDrags,
	type DragState,
	type DropRejection,
} from './file-field.drop.js';
import { textMeasurer, truncateMiddle } from './file-field.truncate.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';
import { deferFocus } from '../../../utilities/defer-focus.js';
import { fileDragAndDropAvailable, FileDragAndDropAvailabilityController } from '../../../utilities/file-drag-and-drop.js';

/** How long the message of a refused drop stays in the field. */
const REJECTION_MS = 4000;

/** The word for a family of types in `accept`, such as `image/*`. */
const FAMILY_KEYS = {
	image: 'components.file-field.image-lowercase',
	video: 'components.file-field.video-lowercase',
	audio: 'components.file-field.audio-file-lowercase',
} as const;

@customElement('nldd-file-field')
export class NLDDFileField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = fileFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	// Property order matches the story controls.
	@property({ reflect: true, converter: reflectNonDefault<'control' | 'area'>('control') })
	variant: 'control' | 'area' = 'control';

	@property({ reflect: true, converter: reflectNonDefault<'md' | 'sm'>('md') })
	size: 'md' | 'sm' = 'md';

	@property({ type: String, reflect: true })
	accept = '';

	@property({ type: Boolean, reflect: true })
	multiple = false;

	/** Offers a folder beside files: choosing opens a menu with both. */
	@property({ type: Boolean, reflect: true })
	directory = false;

	/** @internal A folder is many files, so `directory` takes several too. */
	get _multiple(): boolean {
		return this.multiple || this.directory;
	}

	/** Accessible label forwarded to the inner <input>. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String, attribute: 'input-id' })
	inputId = '';


	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: Object })
	translations: Partial<NLDDFileFieldTranslations> = {};

	/** The chosen files. Mirrors the input's FileList; there is no setter, because
	 *  browsers refuse a programmatic file selection. */
	@state()
	private _files: File[] = [];

	/** Where each of `_files` sat, in the same order. */
	private _paths: string[] = [];

	get files(): File[] {
		return this._files;
	}

	/** Where each file sat: its name, or for a file from a dropped folder the
	 *  path from that folder down ("site/css/main.css"). Same order as `files`. */
	get paths(): string[] {
		return this._paths;
	}

	/** @internal Where a dragged file is, seen from this field. */
	@state()
	_drag: DragState = 'none';

	/** @internal Why the file under the pointer would be refused. */
	@state()
	_dragRejection: DropRejection | null = null;

	/** @internal The chosen name cut in the middle to fit, or null before it is
	 *  measured, while CSS cuts it with its end in view. */
	@state()
	_fittedName: string | null = null;

	/** @internal Whether the name is cut short, and so shows whole in a tooltip. */
	@state()
	_nameTruncated = false;

	private _resizeObserver?: ResizeObserver;
	private _rejectionTimer?: ReturnType<typeof setTimeout>;
	private _observedValue?: Element;

	/** @internal What a screen reader hears after a drop that was taken. */
	@state()
	_announcement = '';

	/** @internal Why the last drop was refused; shown for a few seconds. */
	@state()
	_rejection: DropRejection | null = null;

	/** Renders again when dragging files becomes possible or not, so the drop
	 *  hint in the name of the button follows the one on screen. */
	private _fileDrag = new FileDragAndDropAvailabilityController(this);

	@query('.file-field__input')
	private _input!: HTMLInputElement;

	@query('.file-field__folder-input')
	private _folderInput!: HTMLInputElement | null;

	@query('.file-field__choose-menu')
	private _chooseMenu!: (HTMLElement & { anchorElement: Element | null }) | null;

	/** @internal */
	public _t(key: keyof NLDDFileFieldTranslations, vars?: Record<string, string | number>): string {
		return translate(this.translations, nlddFileFieldTranslations, key, vars);
	}

	/** @internal */
	public _chooseLabel(): string {
		if (this.directory) return this._t('components.file-field.to-choose-files-or-folder-action');
		return this._multiple
			? this._t('components.file-field.to-choose-files-action')
			: this._t('components.file-field.to-choose-file-action');
	}

	/**
	 * The native input carries the field's label but is hidden, so it is not in
	 * the accessibility tree. The button is what you tab to, and on its own it
	 * does not say for which field, so the label comes in its name.
	 *
	 * After everything the button shows, and not in place of part of it: a voice
	 * command or an audit compares the name with the visible text, and "Bestand
	 * kiezen, Bijlage" under "Bestand kiezen of sleep het hierheen" is a mismatch
	 * (WCAG 2.5.3). The change button does the same.
	 *
	 * The drop hint only where it shows: a device without hover cannot drag, so
	 * there the hint is gone from the field and from the name alike, and a screen
	 * reader is not told to do what cannot be done.
	 *
	 * @internal
	 */
	public _chooseAccessibleLabel(): string {
		const hint = !fileDragAndDropAvailable() ? '' : this._multiple
			? this._t('components.file-field.drop-hint-multiple-lowercase-text')
			: this._t('components.file-field.drop-hint-lowercase-text');
		const types = this.variant === 'area' ? this._acceptTypes() : null;
		return [
			hint ? `${this._chooseLabel()} ${hint}` : this._chooseLabel(),
			types ? this._t('components.file-field.accepted-types-text', { types }) : '',
			this.accessibleLabel,
		].filter(Boolean).join(', ');
	}

	/**
	 * The change button is where focus lands after a pick, so its name says for
	 * which field and which file is chosen, as a native file input does. The
	 * visible text comes first, so a voice command with it still finds the
	 * button (WCAG 2.5.3).
	 *
	 * @internal
	 */
	public _changeAccessibleLabel(): string {
		return [this._t('components.file-field.to-change-action'), this.accessibleLabel, this._valueLabel()]
			.filter(Boolean)
			.join(', ');
	}

	/** @internal The cross says which file it clears. */
	public _clearAccessibleLabel(): string {
		return `${this._t('components.file-field.clear-action')}, ${this._valueLabel()}`;
	}

	/** @internal The types `accept` takes, named for a person ("PDF of JPG"), or
	 *  null when a type in it has no name. */
	public _acceptTypes(): string | null {
		const names = acceptNames(this.accept);
		if (!names) return null;
		const named = names.map((name) => (typeof name === 'string'
			? name
			: this._t(FAMILY_KEYS[name.family])));
		return named.length === 1
			? named[0]
			: this._t('components.file-field.list-lowercase-text', { items: named.slice(0, -1).join(', '), last: named[named.length - 1] });
	}

	/** @internal */
	public _rejectionText(reason: DropRejection): string {
		if (reason === 'count') return this._t('components.file-field.too-many-files-error-text');
		if (reason === 'folder') return this._t('components.file-field.folder-error-text');
		const types = this._acceptTypes();
		if (!types) return this._t('components.file-field.wrong-file-type-error-text');
		return this._multiple
			? this._t('components.file-field.files-type-error-text', { types })
			: this._t('components.file-field.file-type-error-text', { types });
	}

	/** @internal */
	public _valueLabel(): string {
		if (this._files.length === 1) return this._files[0].name;
		// Everything from one dropped folder: name the folder.
		const folders = new Set(this._paths.map((path) => (path.includes('/') ? path.split('/')[0] : '')));
		const [folder] = folders;
		if (folders.size === 1 && folder) {
			return this._t('components.file-field.folder-count-text', { folder, count: this._files.length });
		}
		return this._t('components.file-field.file-count-text', { count: this._files.length });
	}

	override connectedCallback(): void {
		super.connectedCallback();
		watchDrags(this);
		this._resizeObserver ??= new ResizeObserver(() => this._fitName());
		this._resizeObserver.observe(this);
		// The first measurement can run in the fallback font.
		void document.fonts?.ready.then(() => {
			if (this.isConnected) this._fitName();
		});
		this.addEventListener('dragover', this._handleDragOver);
		this.addEventListener('drop', this._handleDrop);
		this.addEventListener('pointerdown', this._clearRejection);
		this.addEventListener('keydown', this._handleKeydown);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		unwatchDrags(this);
		this._resizeObserver?.disconnect();
		clearTimeout(this._rejectionTimer);
		this._observedValue = undefined;
		this.removeEventListener('dragover', this._handleDragOver);
		this.removeEventListener('drop', this._handleDrop);
		this.removeEventListener('pointerdown', this._clearRejection);
		this.removeEventListener('keydown', this._handleKeydown);
	}

	override updated(changed: PropertyValues): void {
		// Dragging hides the name, so it is measured again once it is back.
		if (changed.has('_files') || changed.has('size') || changed.has('variant') || changed.has('_drag')) void this._fitNameAfterRender();
	}

	/** Measures once the buttons beside the name have rendered and taken their
	 *  width, and after this update rather than in it, where a state change
	 *  would start another. */
	private async _fitNameAfterRender(): Promise<void> {
		const buttons = this.shadowRoot?.querySelectorAll<HTMLElement & { updateComplete?: Promise<boolean> }>('nldd-button, nldd-icon-button') ?? [];
		await Promise.all(Array.from(buttons, (button) => button.updateComplete));
		this._fitName();
	}

	/** Cuts the chosen name in the middle to the width it has. Without a width
	 *  (a hidden field), it falls back to the CSS cut of the first render. */
	private _fitName(): void {
		const value = this.shadowRoot?.querySelector<HTMLElement>('.file-field__value');
		const name = this.shadowRoot?.querySelector<HTMLElement>('.file-field__name');
		if (this._files.length !== 1 || !value || !name) {
			this._fittedName = null;
			this._nameTruncated = false;
			return;
		}
		// The buttons beside the name take their width after their own render, so
		// the width of the name itself is watched, not only the host's.
		if (value !== this._observedValue) {
			if (this._observedValue) this._resizeObserver?.unobserve(this._observedValue);
			this._resizeObserver?.observe(value);
			this._observedValue = value;
		}
		const style = getComputedStyle(value);
		const width = value.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		if (width <= 0) {
			this._fittedName = null;
			this._nameTruncated = false;
			return;
		}
		const { measure, done } = textMeasurer(name);
		try {
			const { text, truncated } = truncateMiddle(this._files[0].name, width, measure);
			this._fittedName = text;
			this._nameTruncated = truncated;
		} finally {
			done();
		}
	}

	override willUpdate(changed: PropertyValues): void {
		if (changed.has('_files')) {
			this._fittedName = null;
			this._nameTruncated = false;
		}
		if (changed.has('required')) this._updateValidity();
		if (changed.has('accessibleLabel')) this.internals.ariaLabel = this.accessibleLabel || null;
	}

	/** @internal */
	public _handleChoose(e?: Event): void {
		this._clearRejection();
		// With a folder on offer, a press asks which of the two: one dialog picks
		// files or a folder, never both.
		const menu = this._chooseMenu;
		if (this.directory && menu && e?.currentTarget instanceof Element) {
			menu.anchorElement = e.currentTarget;
			menu.showPopover();
			return;
		}
		this._input?.click();
	}

	/** @internal Picked in the menu of a field with `directory`. */
	public _chooseFiles(): void {
		this._input?.click();
	}

	/** @internal Picked in the menu of a field with `directory`. */
	public _chooseFolder(): void {
		this._folderInput?.click();
	}

	/** @internal */
	public _handleInputChange(e: Event): void {
		e.stopPropagation();
		const input = e.target as HTMLInputElement;
		// The choose button gives way to the change button once there is a file,
		// and the other way round, so focus would land on the body.
		const hadFocus = this.matches(':focus-within');
		this._files = input.files ? Array.from(input.files) : [];
		this._paths = this._files.map((file) => file.webkitRelativePath || file.name);
		this._rejection = null;
		this._commit();
		if (hadFocus) void this.updateComplete.then(() => this.focus());
	}

	// — Drag and drop ————————————————————————————————————————————————————————

	/** Why a drag or drop would be refused: too many files for a field without
	 *  `multiple`, or a type `accept` rules out. With `files` the drop is judged
	 *  on names and types; without, a drag only on what it shows before the drop. */
	private _judge(transfer: DataTransfer, files?: File[]): DropRejection | null {
		if (files) {
			if (!this._multiple && files.length > 1) return 'count';
			if (holdsFolder(transfer)) {
				// Several files may come from a folder; one file cannot be a folder.
				// The types are judged once the folder is read.
				return this._multiple ? null : 'folder';
			}
			return files.every((file) => fileMatches(this.accept, file)) ? null : 'type';
		}
		const items = Array.from(transfer.items).filter((item) => item.kind === 'file');
		if (!this._multiple && items.length > 1) return 'count';
		return items.some((item) => typeRuledOut(this.accept, item.type)) ? 'type' : null;
	}

	/** @internal Called by the shared window listeners in file-field.drop.ts. */
	public _setDrag(state: DragState, transfer: DataTransfer | null): void {
		if (this.disabled) state = 'none';
		// Called on every dragover on the page; only over the field is there
		// anything to judge.
		if (state !== 'over' && state === this._drag) return;
		if (state !== 'none' && this._drag === 'none') this._clearRejection();
		this._dragRejection = state === 'over' && transfer ? this._judge(transfer) : null;
		this._drag = this._dragRejection ? 'rejected' : state;
	}

	private _handleDragOver = (e: DragEvent): void => {
		if (this.disabled || !e.dataTransfer || !carriesFiles(e.dataTransfer)) return;
		// Left unhandled, the window listener refuses the drop with a no-drop cursor.
		if (this._judge(e.dataTransfer)) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	};

	private _handleDrop = (e: DragEvent): void => {
		if (!e.dataTransfer || !carriesFiles(e.dataTransfer)) return;
		e.preventDefault();
		if (this.disabled) return;
		const files = Array.from(e.dataTransfer.files);
		const rejection = this._judge(e.dataTransfer, files);
		if (rejection) {
			this._refuse(rejection);
			return;
		}
		if (holdsFolder(e.dataTransfer)) {
			void readDrop(e.dataTransfer).then((dropped) => this._takeDrop(dropped));
			return;
		}
		this._takeDrop(files.map((file) => ({ file, path: file.name })));
	};

	/** A drop that passed the count, with its folders read: judged on the types
	 *  of the files in it, then taken in place of what the field had. */
	private _takeDrop(dropped: { file: File; path: string }[]): void {
		if (dropped.length === 0) return;
		if (!dropped.every(({ file }) => fileMatches(this.accept, file))) {
			this._refuse('type');
			return;
		}
		const transfer = new DataTransfer();
		for (const { file } of dropped) transfer.items.add(file);
		if (this._input) this._input.files = transfer.files;
		this._files = dropped.map(({ file }) => file);
		this._paths = dropped.map(({ path }) => path);
		this._rejection = null;
		// A pick moves focus to the change button, which names the file; a drop
		// moves nothing, so it is said.
		this._announcement = this._t('components.file-field.file-chosen-text', { name: this._valueLabel() });
		this._commit();
	}

	/** Shown for a while, then the field reads as itself again: the message
	 *  takes the place of "Bestand kiezen", and a field that kept it looked as if
	 *  it no longer did anything. The status line keeps it for a screen reader. */
	private _refuse(rejection: DropRejection): void {
		this._rejection = rejection;
		clearTimeout(this._rejectionTimer);
		this._rejectionTimer = setTimeout(() => {
			this._announcement = this._rejectionText(rejection);
			this._rejection = null;
		}, REJECTION_MS);
	}

	private _clearRejection = (): void => {
		clearTimeout(this._rejectionTimer);
		this._rejection = null;
		this._announcement = '';
	};

	private _handleKeydown = (e: KeyboardEvent): void => {
		if (e.key === 'Escape') this._clearRejection();
	};

	/** @internal */
	public _handleClear(): void {
		// Clearing the input as well as the array: the element keeps the previous
		// FileList otherwise, so choosing the same file again would fire no change.
		if (this._input) this._input.value = '';
		if (this._folderInput) this._folderInput.value = '';
		this._files = [];
		this._paths = [];
		this._commit();
		// Focus would land on the body when the cross unmounts with the last file.
		void this.updateComplete.then(() => this.focus());
	}

	private _commit(): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { files: this._files, paths: this._paths },
			bubbles: true,
			composed: true,
		}));
	}


	// — Form participation ————————————————————————————————————————————————————

	/** Submit one entry per file under `name`, the way a native multiple file
	 *  input does. A single file is submitted as itself, so a form with one file
	 *  reads back as a File rather than as FormData wrapping one. A file from a
	 *  dropped folder goes with its path as its file name, which is how a native
	 *  folder input submits it too. */
	override formValue(): FormValue {
		if (!this.name || this._files.length === 0) return null;
		const nested = this._paths.some((path) => path.includes('/'));
		if (this._files.length === 1 && !nested) return this._files[0];
		const data = new FormData();
		this._files.forEach((file, index) => data.append(this.name, file, this._paths[index] ?? file.name));
		return data;
	}

	override commitFormValue(): void {
		super.commitFormValue();
		this._updateValidity();
	}

	/** A required field without a file is invalid (valueMissing). */
	private _updateValidity(): void {
		if (this.required && this._files.length === 0) {
			this.internals.setValidity(
				{ valueMissing: true },
				this._t('components.file-field.required-error-text'),
				this._input ?? this,
			);
		} else {
			this.internals.setValidity({});
		}
	}

	formResetCallback(): void {
		if (this._input) this._input.value = '';
		this._files = [];
		this.commitFormValue();
	}

	/** The button that opens the dialog: the whole surface while the field is
	 *  empty, "Wijzigen" once it has a file. */
	private _chooseButton(): HTMLElement | null {
		return this.shadowRoot?.querySelector<HTMLElement>('.file-field__browse-button, nldd-button') ?? null;
	}

	/**
	 * Delegates focus to the choose button rather than the hidden input: an input
	 * that is `display: none` cannot take focus, and the button is what a user
	 * sees as the control.
	 */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		this._chooseButton()?.focus(options);
	}

	/** The file input is display:none and therefore not in the accessibility tree.
	 *  What a screen reader meets is the button, so the description goes there. */
	override describedTarget(): Element | null {
		return this._chooseButton();
	}

	override render() {
		return fileFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-file-field': NLDDFileField;
	}
}
