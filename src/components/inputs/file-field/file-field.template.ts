import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDFileField } from './file-field.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../content/icon/icon.js';
import '../../content/tooltip/tooltip.js';
import '../../actions/menu/menu.js';
import '../../status-and-feedback/activity-indicator/activity-indicator.js';
import type { DropRejection } from './file-field.drop.js';
import { splitName, splitForTruncation } from './file-field.truncate.js';

/** Format icons by extension; a format without one gets the plain file. */
const FORMAT_ICONS: Record<string, string> = {
	pdf: 'file-pdf',
	png: 'file-png',
	jpg: 'file-jpg',
	jpeg: 'file-jpg',
	gif: 'file-gif',
	webp: 'file-webp',
	svg: 'file-svg',
	heic: 'file-heic',
	tif: 'file-tiff',
	tiff: 'file-tiff',
	md: 'file-markdown',
	markdown: 'file-markdown',
	txt: 'file-text',
	odt: 'file-odt',
	ods: 'file-ods',
	odp: 'file-odp',
	odg: 'file-odg',
	odf: 'file-odf',
};

function fileIcon(component: NLDDFileField): string {
	const files = component.files;
	if (files.length > 1 || component._folderName()) return 'file-on-file';
	const extension = splitName(files[0].name)[1].slice(1).toLowerCase();
	return FORMAT_ICONS[extension] ?? 'file';
}

function renderValidationIcon(component: NLDDFileField): TemplateResult | typeof nothing {
	if (!component.invalid && !component.valid) return nothing;

	return html`
		<div class="file-field__validation-icon-area">
			<nldd-icon class="file-field__validation-icon"
				icon=${component.invalid ? 'invalid' : 'valid'}
				aria-hidden="true"
			></nldd-icon>
		</div>
	`;
}

type Kind = 'idle' | 'drag' | 'drop' | 'rejected' | 'reading';

interface Variant {
	content: TemplateResult | string;
	active: boolean;
	kind: Kind;
}

/**
 * Every text a place in the field can show, laid over each other in one grid
 * cell with only the active one visible. The place is as tall as the longest of
 * them all the time, so the field keeps its height when the text changes: a
 * sentence that wraps in a narrow or zoomed field does not move the target
 * under a pointer that is dragging a file. The texts that only a drag brings
 * are left out on a device without hover, where nothing is dragged.
 *
 * A control holds the texts of both states, and of a field for one file and
 * for more, so every field of a size is as tall at one width, whatever it
 * shows and however it is set up.
 */
function renderStack(element: 'text' | 'value', variants: Variant[]): TemplateResult {
	return html`
		<span class="file-field__${element}">${variants.map((variant) => html`
			<span class=${classMap({
				[`file-field__${variant.kind}-text`]: true,
				'is-active': variant.active,
			})}>${variant.content}</span>
		`)}</span>
	`;
}

/** The texts of a drag and of a refused drop, one active at most. */
function dragVariants(component: NLDDFileField, dragText: string, dropText: string): Variant[] {
	const rejection = component._dragRejection ?? component._rejection;
	const dragging = !rejection && component._drag !== 'none';
	const variants: Variant[] = [
		{ content: dragText, kind: 'drag', active: dragging && component._drag === 'page' },
		{ content: dropText, kind: 'drop', active: dragging && component._drag === 'over' },
		...rejectionVariants(component, rejection),
	];
	return variants;
}

/** Every text a control can show, none of them active: they only reserve
 *  their height. An area shows only the active text, and has a fixed height. */
function reservedVariants(component: NLDDFileField): Variant[] {
	if (component.variant === 'area') return [];
	type Key = Parameters<NLDDFileField['_t']>[0] extends `components.file-field.${infer K}` ? K : never;
	const t = (key: Key) => component._t(`components.file-field.${key}`);
	const sentence = (choose: Key, hint: Key) => html`<span class="file-field__choose-text">${t(choose)}</span> <span class="file-field__drop-hint-text">${t(hint)}</span>`;
	const texts: [TemplateResult | string, Kind][] = [
		[sentence('to-choose-file-action', 'drop-hint-lowercase-text'), 'idle'],
		[sentence('to-choose-files-action', 'drop-hint-multiple-lowercase-text'), 'idle'],
		[sentence('to-choose-files-or-folder-action', 'drop-hint-multiple-lowercase-text'), 'idle'],
		...(['drag-here-text', 'drag-here-multiple-text', 'replace-drag-text'] as const).map((key): [string, Kind] => [t(key), 'drag']),
		...(['drop-here-text', 'drop-here-multiple-text', 'replace-drop-text'] as const).map((key): [string, Kind] => [t(key), 'drop']),
		...(['type', 'count', 'folder', 'empty-folder', 'unreadable-folder'] as const)
			.map((reason): [string, Kind] => [component._rejectionText(reason), 'rejected']),
		[t('wrong-file-type-error-text'), 'rejected'],
	];
	return texts.map(([content, kind]) => ({ content, kind, active: false }));
}

/** The reasons a drop can be refused for, as this field takes files: a field
 *  for one refuses a folder or several files, a field for more reads a folder,
 *  which can then be empty or unreadable. */
function rejectionVariants(component: NLDDFileField, rejection: DropRejection | null): Variant[] {
	const reasons: DropRejection[] = component._multiple
		? ['type', 'empty-folder', 'unreadable-folder']
		: ['type', 'folder', 'count'];
	return reasons.map((reason) => ({ content: component._rejectionText(reason), kind: 'rejected', active: rejection === reason }));
}

/**
 * While a dropped folder is read, the activity indicator with its own label, as
 * every other loading state, at the size of the icon of a chosen file, a step
 * smaller in an area, where the label goes under it. The field
 * shows it empty: what was chosen before gives way to the folder. Only an area
 * has room to show the label; a screen reader hears it either way. The circle
 * is only there while it shows: it is a live region, and sets its own visibility.
 */
function renderReadingIndicator(component: NLDDFileField): TemplateResult {
	const area = component.variant === 'area';
	const sm = component.size === 'sm';
	const size = area ? (sm ? '24' : '32') : (sm ? '20' : '24');
	return html`<nldd-activity-indicator class="file-field__reading-indicator"
		timing="instant"
		size=${size}
		?show-text=${area}
	></nldd-activity-indicator>`;
}

/** A button for files and one for a folder, for an area with `directory`:
 *  room enough to offer both without a menu. */
function renderChooseButtonGroup(component: NLDDFileField): TemplateResult {
	const label = (text: string) => [text, component.accessibleLabel].filter(Boolean).join(', ');
	const files = component._t('components.file-field.to-choose-files-action');
	const folder = component._t('components.file-field.to-choose-folder-action');
	return html`
		<div class="file-field__choose-button-group">
			<nldd-button
				appearance="neutral-tinted"
				size=${component.size}
				start-icon="files"
				text=${files}
				accessible-label=${label(files)}
				?disabled=${component.disabled}
				@click=${component._chooseFiles}
			></nldd-button>
			<nldd-button
				appearance="neutral-tinted"
				size=${component.size}
				start-icon="folder"
				text=${folder}
				accessible-label=${label(folder)}
				?disabled=${component.disabled}
				@click=${component._chooseFolder}
			></nldd-button>
		</div>
	`;
}

/** The empty field is one button over the whole surface, read as one sentence:
 *  "Bestand kiezen of sleep het hierheen". The validation icon sits inside it,
 *  so a press on the icon opens the dialog too. An area with `directory` has a
 *  button for each choice instead, with the drop hint under them, and the
 *  surface around them is only a place to drop. */
function renderEmpty(component: NLDDFileField): TemplateResult {
	const drags = dragVariants(
		component,
		component._multiple
			? component._t('components.file-field.drag-here-multiple-text')
			: component._t('components.file-field.drag-here-text'),
		component._multiple
			? component._t('components.file-field.drop-here-multiple-text')
			: component._t('components.file-field.drop-here-text'),
	);
	const area = component.variant === 'area';
	const buttonGroup = area && component.directory;
	const hint = html`<span class="file-field__drop-hint-text">${component._multiple
		? component._t('components.file-field.drop-hint-multiple-lowercase-text')
		: component._t('components.file-field.drop-hint-lowercase-text')}</span>`;
	const sentence = buttonGroup
		? hint
		: html`<span class="file-field__choose-text">${component._chooseLabel()}</span> ${hint}`;
	const types = area ? component._acceptTypes() : null;
	const dragged = drags.some((variant) => variant.active);
	const reading = component._reading && !dragged;
	const stack = renderStack('text', [
		{ content: sentence, kind: 'idle', active: !reading && !dragged },
		...drags,
		...(area ? [] : [{ content: reading ? renderReadingIndicator(component) : '', kind: 'reading' as const, active: reading }]),
		...reservedVariants(component),
	]);
	const content = html`${area && reading ? renderReadingIndicator(component) : html`${area
		? html`<nldd-icon class="file-field__upload-icon" icon="upload-to-cloud" aria-hidden="true"></nldd-icon>`
		: nothing}${buttonGroup ? renderChooseButtonGroup(component) : nothing}${stack}${types ? html`<span class="file-field__accepted-types">${component._t('components.file-field.accepted-types-text', { types })}</span>` : nothing}`}${renderValidationIcon(component)}`;
	if (buttonGroup) {
		return html`<div class="file-field__drop-area">${content}</div>`;
	}
	return html`
		<button class="file-field__choose-button"
			type="button"
			aria-label=${component._chooseAccessibleLabel()}
			aria-haspopup=${component.directory ? 'menu' : nothing}
			aria-expanded=${component.directory ? String(component._menuOpen) : nothing}
			?disabled=${component.disabled}
			@click=${(e: Event) => component._handleChoose(e)}
		>${content}</button>
	`;
}

/** A name as it fits: cut in the middle once measured, on one line or on the
 *  lines the field has, before that cut by CSS with its end in view. A screen
 *  reader reads the whole name either way, and a name that is cut short shows
 *  whole in a tooltip. */
function renderName(component: NLDDFileField, name: string): TemplateResult {
	const [start, end] = splitForTruncation(name);
	const shown = component._fittedName === null
		? html`<span class="file-field__name-start">${start}</span>${end
			? html`<span class="file-field__name-end">${end}</span>`
			: nothing}`
		: html`<span class="file-field__name-start">${component._fittedName}</span>`;
	return html`
		<nldd-tooltip text=${name} timing=${component._nameTruncated ? 'delay' : 'never'}>
			<span class=${classMap({ 'file-field__name': true, 'is-wrapped': component._nameLines > 1 })} aria-hidden="true">${shown}</span>
		</nldd-tooltip>
		<span class="file-field__full-name">${name}</span>
	`;
}

/** A folder with the number of files in it. The name of the folder gives way
 *  first, so the number stays in view: on one line by CSS, on more cut in the
 *  middle once measured. A narrow field drops the word: "site (3)". A screen
 *  reader reads the whole label either way. */
function renderFolderLabel(component: NLDDFileField, folder: string): TemplateResult {
	const label = component._valueLabel();
	const short = component._t('components.file-field.folder-count-short-text', { folder, count: component.files.length });
	const wrapped = component._nameLines > 1;
	const variant = (text: string, length: 'full' | 'short') => {
		const at = text.indexOf(folder);
		if (wrapped) {
			const fitted = at < 0 ? text : text.slice(0, at) + (component._fittedFolder ?? folder) + text.slice(at + folder.length);
			return html`<span class="file-field__folder file-field__folder--${length} is-wrapped" aria-hidden="true">${fitted}</span>`;
		}
		const [before, name, after] = at < 0 ? ['', text, ''] : [text.slice(0, at), folder, text.slice(at + folder.length)];
		return html`<span class="file-field__folder file-field__folder--${length}" aria-hidden="true">${before
			? html`<span class="file-field__folder-rest">${before}</span>`
			: nothing}<span class="file-field__folder-name">${name}</span>${after
			? html`<span class="file-field__folder-rest">${after}</span>`
			: nothing}</span>`;
	};
	return html`${variant(label, 'full')}${variant(short, 'short')}<span class="file-field__full-name">${label}</span>`;
}

/** The buttons of a narrow control in one menu, so the name keeps room. With
 *  `directory` it offers files and a folder itself, not a menu in a menu. */
function renderMoreButton(component: NLDDFileField, size: string): TemplateResult {
	return html`
		<nldd-icon-button class="file-field__more-button"
			appearance="neutral-transparent"
			size=${size}
			icon="more"
			text=${component._t('components.file-field.show-options-action')}
			accessible-label=${component._moreAccessibleLabel()}
			?disabled=${component.disabled}
		>
			<nldd-menu slot="popup">
				${component.directory ? html`
					<nldd-menu-item
						icon="files"
						text=${component._t('components.file-field.to-choose-files-menu-action')}
						@select=${component._chooseFiles}
					></nldd-menu-item>
					<nldd-menu-item
						icon="folder"
						text=${component._t('components.file-field.to-choose-folder-menu-action')}
						@select=${component._chooseFolder}
					></nldd-menu-item>
				` : html`
					<nldd-menu-item
						icon="edit"
						text=${component._t('components.file-field.to-change-action')}
						@select=${component._chooseFiles}
					></nldd-menu-item>
				`}
				<nldd-menu-item
					icon="dismiss"
					text=${component._t('components.file-field.clear-action')}
					@select=${component._handleClear}
				></nldd-menu-item>
			</nldd-menu>
		</nldd-icon-button>
	`;
}

/**
 * A field with a file: the row with its name and buttons, and over it, in the
 * same place, the sentences of a drag, saying a drop replaces what is there.
 * While files are dragged the row gives way to them; nothing can be pressed
 * then. A drop that was refused says why in the same place, across the whole
 * row, so the name has only itself to make room for; an area says it in place
 * of the name, with the buttons still there. A narrow control gives up the
 * icon of the file first, then puts both buttons in a menu.
 */
function renderChosen(component: NLDDFileField): TemplateResult {
	const files = component.files;
	const area = component.variant === 'area';
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	const dragging = component._drag !== 'none';
	// An area shows only the active text and has a fixed height, so a refused
	// drop can say why in place of the name there, with the buttons still there.
	const refused = component._rejection;
	const replaced = dragging || (!area && refused !== null);
	const drags = dragVariants(
		component,
		component._t('components.file-field.replace-drag-text'),
		component._t('components.file-field.replace-drop-text'),
	).map((variant) => ({ ...variant, active: variant.active && replaced }));
	const folder = component._folderName();
	const name = folder
		? renderFolderLabel(component, folder)
		: files.length === 1 ? renderName(component, files[0].name) : component._valueLabel();
	return html`
		<div class="file-field__chosen-area">
			<div class=${classMap({ 'file-field__chosen-file': true, 'is-active': !replaced })}>
				<nldd-icon class="file-field__file-icon" icon=${fileIcon(component)} aria-hidden="true"></nldd-icon>
				${renderStack('value', [
					{ content: name, kind: 'idle', active: !area || !refused },
					...(area ? rejectionVariants(component, refused) : []),
				])}
				${area ? html`
					<div class="file-field__edit-button-group">
						<nldd-button class="file-field__change-button"
							appearance="neutral-tinted"
							size=${component.size}
							text=${component._t('components.file-field.to-change-action')}
							popup-type=${component.directory ? 'menu' : nothing}
							?expandable=${component.directory}
							?expanded=${component._menuOpen}
							accessible-label=${component._changeAccessibleLabel() || nothing}
							?disabled=${component.disabled}
							@click=${(e: Event) => component._handleChoose(e)}
						></nldd-button>
						<nldd-button
							appearance="neutral-base"
							size=${component.size}
							text=${component._t('components.file-field.clear-action')}
							accessible-label=${component._clearAccessibleLabel()}
							?disabled=${component.disabled}
							@click=${component._handleClear}
						></nldd-button>
					</div>
				` : html`
					<div class="file-field__edit-button-group">
						<nldd-button class="file-field__change-button"
							appearance="neutral-tinted"
							size=${buttonSize}
							text=${component._t('components.file-field.to-change-action')}
							popup-type=${component.directory ? 'menu' : nothing}
							?expandable=${component.directory}
							?expanded=${component._menuOpen}
							accessible-label=${component._changeAccessibleLabel() || nothing}
							?disabled=${component.disabled}
							@click=${(e: Event) => component._handleChoose(e)}
						></nldd-button>
						<nldd-icon-button class="file-field__clear-button"
							appearance="neutral-transparent"
							size=${buttonSize}
							icon="dismiss"
							text=${component._t('components.file-field.clear-action')}
							accessible-label=${component._clearAccessibleLabel()}
							?disabled=${component.disabled}
							@click=${component._handleClear}
						></nldd-icon-button>
						${renderMoreButton(component, buttonSize)}
					</div>
				`}
				${renderValidationIcon(component)}
			</div>
			<div class=${classMap({ 'file-field__replace-area': true, 'is-active': replaced })}>
				${area ? html`<nldd-icon class="file-field__upload-icon" icon="upload-to-cloud" aria-hidden="true"></nldd-icon>` : nothing}
				${renderStack('text', [...drags, ...reservedVariants(component)])}
				${renderValidationIcon(component)}
			</div>
		</div>
	`;
}

export function fileFieldTemplate(component: NLDDFileField): TemplateResult {
	const hasFiles = component.files.length > 0 && !component._reading;

	return html`
		<div aria-busy=${component._reading ? 'true' : nothing} class=${classMap({
			'file-field': true,
			'file-field--area': component.variant === 'area',
			'has-files': hasFiles,
			[`is-drag-${component._drag}`]: component._drag !== 'none',
		})}>
			<input class="file-field__input"
				type="file"
				id=${component.inputId || nothing}
				accept=${component.accept || nothing}
				?multiple=${component._multiple}
				?disabled=${component.disabled}
				?required=${component.required}
				aria-label=${component.accessibleLabel || nothing}
				@change=${component._handleInputChange}
			>
			${component.directory ? html`
				<input class="file-field__folder-input"
					type="file"
					webkitdirectory
					multiple
					?disabled=${component.disabled}
					@change=${component._handleInputChange}
				>
				<span class="file-field__menu-anchor"></span>
				<nldd-menu class="file-field__choose-menu"
					@beforetoggle=${(e: Event) => component._handleMenuToggle(e)}
				>
					<nldd-menu-item
						icon="files"
						text=${component._t('components.file-field.to-choose-files-menu-action')}
						@select=${component._chooseFiles}
					></nldd-menu-item>
					<nldd-menu-item
						icon="folder"
						text=${component._t('components.file-field.to-choose-folder-menu-action')}
						@select=${component._chooseFolder}
					></nldd-menu-item>
				</nldd-menu>
			` : nothing}
			${hasFiles ? renderChosen(component) : renderEmpty(component)}
			<span class="file-field__status" role="status">${component._rejection
				? component._rejectionText(component._rejection)
				: component._announcement}</span>
		</div>
	`;
}
