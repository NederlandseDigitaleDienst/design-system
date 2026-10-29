import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDFileField } from './file-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../actions/icon-button/icon-button.js';
import '../../content/icon/icon.js';
import '../../content/tooltip/tooltip.js';
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

function fileIcon(files: File[]): string {
	if (files.length > 1) return 'file-on-file';
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

type Kind = 'drag' | 'drop' | 'rejected';

interface Variant {
	content: TemplateResult | string;
	active: boolean;
	kind?: Kind;
}

/**
 * Every text a place in the field can show, laid over each other in one grid
 * cell with only the active one visible. The place is as tall as the longest of
 * them all the time, so the field keeps its height when the text changes: a
 * sentence that wraps in a narrow or zoomed field does not move the target
 * under a pointer that is dragging a file. The texts that only a drag brings
 * (`kind`) are left out on a device without hover, where nothing is dragged.
 */
function renderStack(variants: Variant[]): TemplateResult {
	return html`
		<span class="file-field__texts">${variants.map((variant) => html`
			<span class=${classMap({
				'file-field__text': true,
				'is-active': variant.active,
				[`file-field__text--${variant.kind}`]: !!variant.kind,
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
		{ content: component._rejectionText('type'), kind: 'rejected', active: rejection === 'type' },
		{ content: component._rejectionText('folder'), kind: 'rejected', active: rejection === 'folder' },
	];
	if (!component.multiple) {
		variants.push({ content: component._rejectionText('count'), kind: 'rejected', active: rejection === 'count' });
	}
	return variants;
}

/** The empty field is one button over the whole surface, read as one sentence:
 *  "Bestand kiezen of sleep het hierheen". The validation icon sits inside it,
 *  so a press on the icon opens the dialog too. */
function renderBrowse(component: NLDDFileField): TemplateResult {
	const drags = dragVariants(
		component,
		component.multiple
			? component._t('components.file-field.drag-here-multiple-text')
			: component._t('components.file-field.drag-here-text'),
		component.multiple
			? component._t('components.file-field.drop-here-multiple-text')
			: component._t('components.file-field.drop-here-text'),
	);
	const sentence = html`<span class="file-field__browse-action">${component._chooseLabel()}</span> <span class="file-field__hint">${component.multiple
		? component._t('components.file-field.drop-hint-multiple-lowercase-text')
		: component._t('components.file-field.drop-hint-lowercase-text')}</span>`;
	const area = component.variant === 'area';
	const types = area ? component._acceptTypes() : null;
	return html`
		<button class="file-field__browse-button"
			type="button"
			aria-label=${component._chooseAccessibleLabel() || component._chooseLabel()}
			?disabled=${component.disabled}
			@click=${component._handleChoose}
		>${area ? html`<nldd-icon class="file-field__upload-icon" icon="upload-to-cloud" aria-hidden="true"></nldd-icon>` : nothing}<span class="file-field__sentence">${renderStack([
			{ content: sentence, active: !drags.some((variant) => variant.active) },
			...drags,
		])}</span>${types ? html`<span class="file-field__accepted-types">${component._t('components.file-field.accepted-types-text', { types })}</span>` : nothing}${renderValidationIcon(component)}</button>
	`;
}

/** A name as it fits: cut in the middle once measured, before that cut by CSS
 *  with its end in view. A screen reader reads the whole name either way, and a
 *  name that is cut short shows whole in a tooltip. */
function renderName(component: NLDDFileField, name: string): TemplateResult {
	const [start, end] = splitForTruncation(name);
	const shown = component._fittedName === null
		? html`<span class="file-field__name-start">${start}</span>${end
			? html`<span class="file-field__name-end">${end}</span>`
			: nothing}`
		: html`<span class="file-field__name-start">${component._fittedName}</span>`;
	return html`
		<nldd-tooltip text=${name} timing=${component._nameTruncated ? 'delay' : 'never'}>
			<span class="file-field__name" aria-hidden="true">${shown}</span>
		</nldd-tooltip>
		<span class="file-field__full-name">${name}</span>
	`;
}

/**
 * A field with a file: the row with its name and buttons, and over it, in the
 * same place, the sentences of a drag, saying a drop replaces what is there.
 * While files are dragged the row gives way to them; nothing can be pressed
 * then. A drop that was refused says why in place of the name, with the
 * buttons still there.
 */
function renderChosen(component: NLDDFileField): TemplateResult {
	const files = component.files;
	const area = component.variant === 'area';
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	const dragging = component._drag !== 'none';
	const refused = component._rejection;
	const drags = dragVariants(
		component,
		component._t('components.file-field.replace-drag-text'),
		component._t('components.file-field.replace-drop-text'),
	).map((variant) => ({ ...variant, active: variant.active && dragging }));
	const nameVariants: Variant[] = [
		{ content: files.length === 1 ? renderName(component, files[0].name) : component._valueLabel(), active: !refused },
		{ content: component._rejectionText('type'), kind: 'rejected', active: refused === 'type' },
		{ content: component._rejectionText('folder'), kind: 'rejected', active: refused === 'folder' },
	];
	if (!component.multiple) {
		nameVariants.push({ content: component._rejectionText('count'), kind: 'rejected', active: refused === 'count' });
	}
	return html`
		<div class="file-field__chosen-area">
			<div class=${classMap({ 'file-field__chosen-file': true, 'is-active': !dragging })}>
				<nldd-icon class="file-field__file-icon" icon=${fileIcon(files)} aria-hidden="true"></nldd-icon>
				<span class="file-field__value">${renderStack(nameVariants)}</span>
				${area ? html`
					<div class="file-field__actions">
						<nldd-button-group
							size=${component.size}
							width="full"
						>
							<nldd-button
								appearance="neutral-tinted"
								text=${component._t('components.file-field.to-change-action')}
								accessible-label=${component._changeAccessibleLabel() || nothing}
								?disabled=${component.disabled}
								@click=${component._handleChoose}
							></nldd-button>
							<nldd-button
								appearance="neutral-base"
								text=${component._t('components.file-field.clear-action')}
								accessible-label=${component._clearAccessibleLabel()}
								?disabled=${component.disabled}
								@click=${component._handleClear}
							></nldd-button>
						</nldd-button-group>
					</div>
				` : html`
					<div class="file-field__actions">
						<nldd-button
							appearance="neutral-tinted"
							size=${buttonSize}
							text=${component._t('components.file-field.to-change-action')}
							accessible-label=${component._changeAccessibleLabel() || nothing}
							?disabled=${component.disabled}
							@click=${component._handleChoose}
						></nldd-button>
						<nldd-icon-button
							appearance="neutral-transparent"
							size=${buttonSize}
							icon="dismiss"
							text=${component._t('components.file-field.clear-action')}
							accessible-label=${component._clearAccessibleLabel()}
							?disabled=${component.disabled}
							@click=${component._handleClear}
						></nldd-icon-button>
					</div>
				`}
				${renderValidationIcon(component)}
			</div>
			<div class=${classMap({ 'file-field__replace-area': true, 'is-active': dragging })}>
				${area ? html`<nldd-icon class="file-field__upload-icon" icon="upload-to-cloud" aria-hidden="true"></nldd-icon>` : nothing}
				<span class="file-field__sentence">${renderStack(drags)}</span>
				${renderValidationIcon(component)}
			</div>
		</div>
	`;
}

export function fileFieldTemplate(component: NLDDFileField): TemplateResult {
	const hasFiles = component.files.length > 0;

	return html`
		<div class=${classMap({
			'file-field': true,
			'file-field--area': component.variant === 'area',
			'has-files': hasFiles,
			[`is-drag-${component._drag}`]: component._drag !== 'none',
		})}>
			<input class="file-field__input"
				type="file"
				id=${component.inputId || nothing}
				accept=${component.accept || nothing}
				?multiple=${component.multiple}
				?disabled=${component.disabled}
				?required=${component.required}
				aria-label=${component.accessibleLabel || nothing}
				@change=${component._handleInputChange}
			>
			${hasFiles ? renderChosen(component) : renderBrowse(component)}
			<span class="file-field__status" role="status">${component._rejection
				? component._rejectionText(component._rejection)
				: component._announcement}</span>
		</div>
	`;
}
