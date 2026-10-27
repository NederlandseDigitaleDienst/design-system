import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDFileField } from './file-field.js';
import '../../actions/button/button.js';
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

/** The empty field is one button over the whole surface, read as one sentence:
 *  "Bestand kiezen of sleep het hierheen". The validation icon sits inside it,
 *  so a press on the icon opens the dialog too. */
function renderBrowse(component: NLDDFileField): TemplateResult {
	const rejection = component._dragRejection ?? component._rejection;
	let content: TemplateResult;
	if (component._drag === 'over') {
		content = renderMessage(component.multiple
			? component._t('components.file-field.drop-here-multiple-text')
			: component._t('components.file-field.drop-here-text'), 'drop');
	} else if (rejection) {
		content = renderMessage(component._rejectionText(rejection), 'rejected');
	} else if (component._drag === 'page') {
		content = renderMessage(component.multiple
			? component._t('components.file-field.drag-here-multiple-text')
			: component._t('components.file-field.drag-here-text'), 'drag');
	} else {
		content = html`<span class="file-field__value"><span class="file-field__browse-action">${component._chooseLabel()}</span> <span class="file-field__hint">${component.multiple
			? component._t('components.file-field.drop-hint-multiple-text')
			: component._t('components.file-field.drop-hint-text')}</span></span>`;
	}
	return html`
		<button class="file-field__browse"
			type="button"
			aria-label=${component._chooseAccessibleLabel() || component._chooseLabel()}
			?disabled=${component.disabled}
			@click=${component._handleChoose}
		>${content}${renderValidationIcon(component)}</button>
	`;
}

function renderMessage(text: string, kind?: 'drag' | 'drop' | 'rejected'): TemplateResult {
	return html`<span class=${classMap({ 'file-field__value': true, [`is-${kind}`]: !!kind })}>${text}</span>`;
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

/** A field with a file while files are dragged: one sentence in the middle, as
 *  in an empty field, saying a drop replaces what is there. The buttons go,
 *  since nothing can be pressed while dragging. */
function renderReplace(component: NLDDFileField): TemplateResult {
	let content: TemplateResult;
	if (component._dragRejection) {
		content = renderMessage(component._rejectionText(component._dragRejection), 'rejected');
	} else if (component._drag === 'over') {
		content = renderMessage(component._t('components.file-field.replace-drop-text'), 'drop');
	} else {
		content = renderMessage(component._t('components.file-field.replace-drag-text'), 'drag');
	}
	return html`<div class="file-field__replace">${content}${renderValidationIcon(component)}</div>`;
}

function renderValue(component: NLDDFileField): TemplateResult {
	const files = component.files;
	const rejection = component._dragRejection ?? component._rejection;
	if (rejection) return renderMessage(component._rejectionText(rejection), 'rejected');
	return html`
		<nldd-icon class="file-field__file-icon" icon=${fileIcon(files)} aria-hidden="true"></nldd-icon>
		<span class="file-field__value has-file">
			${files.length === 1 ? renderName(component, files[0].name) : component._valueLabel()}
		</span>
	`;
}

export function fileFieldTemplate(component: NLDDFileField): TemplateResult {
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	const hasFiles = component.files.length > 0;
	const dragging = component._drag !== 'none';

	return html`
		<div class=${classMap({
			'file-field': true,
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
			${!hasFiles ? renderBrowse(component) : dragging ? renderReplace(component) : renderValue(component)}
			${hasFiles && !dragging ? html`
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
						?disabled=${component.disabled}
						@click=${component._handleClear}
					></nldd-icon-button>
				</div>
			` : nothing}
			${hasFiles && !dragging ? renderValidationIcon(component) : nothing}
			<span class="file-field__status" role="status">${component._rejection
				? component._rejectionText(component._rejection)
				: ''}</span>
		</div>
	`;
}
