/**
 * Story-only UI element wrapping `encodeLqip()` in a file-picker. Kept in a
 * separate module from the pure encoder so consumers importing just the
 * functions (e.g. a Node build pipeline) don't accidentally register the
 * `nldd-lqip-encoder` custom element into their registry.
 *
 * Intentionally NOT exported from `src/components/index.ts` — this is a
 * developer tool, not a design-system component.
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { encodeLqip } from './lqip-encoder.js';
import './image.js';

/* --------------------------------------------------------------------- *
 *  i18n
 * --------------------------------------------------------------------- */

export const nlddLqipEncoderTranslations = {
	'components.lqip-encoder.upload-label': 'Kies een afbeelding',
	'components.lqip-encoder.file-prefix-text': 'Bestand:',
	'components.lqip-encoder.copy-instruction-text': 'Kopieer deze waarde naar je lqip attribuut:',
	'components.lqip-encoder.preview-heading-text': 'Visuele controle:',
	'components.lqip-encoder.preview-lqip-label': 'LQIP placeholder',
	'components.lqip-encoder.preview-image-label': 'Originele afbeelding',
};

export type NLDDLqipEncoderTranslations = typeof nlddLqipEncoderTranslations;

/* --------------------------------------------------------------------- *
 *  Element
 * --------------------------------------------------------------------- */

@customElement('nldd-lqip-encoder')
export class NLDDLqipEncoder extends LitElement {
	@property({ type: Object })
	translations: Partial<NLDDLqipEncoderTranslations> = {};

	@state() private _lqip: string | null = null;
	@state() private _imageUrl = '';
	@state() private _filename = '';
	@state() private _aspectRatio = '16/9';
	@state() private _error = '';

	public _t(key: keyof NLDDLqipEncoderTranslations): string {
		return this.translations[key] ?? nlddLqipEncoderTranslations[key];
	}

	static override styles = css`
		:host {
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			gap: var(--primitives-space-16);
			padding: var(--primitives-space-16);
			border: var(--primitives-border-width-thin) solid var(--semantics-content-secondary-color);
			border-radius: var(--primitives-corner-radius-md);
			background-color: var(--semantics-surfaces-base-background-color);
			color: var(--semantics-content-color);
			font: var(--primitives-font-body-md-regular-snug);
		}

		.encoder__upload-label {
			display: inline-block;
			padding: var(--primitives-space-8) var(--primitives-space-16);
			border-radius: var(--primitives-corner-radius-md);
			background-color: var(--semantics-buttons-accent-filled-background-color);
			color: var(--semantics-buttons-accent-filled-content-color);
			cursor: pointer;
			font: var(--primitives-font-body-md-regular-snug);
		}

		/* The native <input type="file"> is visually hidden but still focusable;
		   reflect its focus state on the surrounding label so keyboard users
		   see where focus is. Same focus-ring tokens the rest of the design
		   system uses on buttons. */
		.encoder__upload-label:focus-within {
			outline: var(--semantics-focus-ring-outline);
			outline-offset: var(--semantics-focus-ring-outline-offset);
			box-shadow: var(--semantics-focus-ring-box-shadow);
		}

		.encoder__upload-input {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.encoder__result {
			display: flex;
			flex-direction: column;
			gap: var(--primitives-space-8);
		}

		.encoder__code {
			padding: var(--primitives-space-8) var(--primitives-space-12);
			border-radius: var(--primitives-corner-radius-sm);
			background-color: var(--semantics-surfaces-tinted-background-color);
			font: var(--primitives-font-monospace-sm-regular-snug);
			-webkit-user-select: all;
			user-select: all;
			word-break: break-all;
		}

		.encoder__preview {
			display: flex;
			flex-direction: column;
			gap: var(--primitives-space-8);
		}

		.encoder__preview-pair {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: var(--primitives-space-16);
			max-width: calc(var(--primitives-area-480) * 2 + var(--primitives-space-16));
		}

		.encoder__preview-item {
			display: flex;
			flex-direction: column;
			gap: var(--primitives-space-4);
			min-width: 0;
		}

		.encoder__preview-item-label {
			font: var(--primitives-font-body-sm-regular-tight);
			color: var(--semantics-content-secondary-color);
		}

		.encoder__error {
			color: var(--semantics-content-color);
			background-color: var(--semantics-categories-critical-tinted-background-color);
			padding: var(--primitives-space-8) var(--primitives-space-12);
			border-radius: var(--primitives-corner-radius-sm);
		}
	`;

	private _handleFileChange = async (e: Event): Promise<void> => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		this._error = '';
		try {
			// Free the previous object URL before allocating a new one.
			if (this._imageUrl) URL.revokeObjectURL(this._imageUrl);
			this._imageUrl = URL.createObjectURL(file);
			this._filename = file.name;
			// Decode once to read dimensions for the comparison preview, then
			// reuse the bitmap for the actual encode so the file isn't decoded
			// twice. We pass an ImageBitmap (not the File) so encodeLqip treats
			// it as caller-owned and won't close it — hence the try/finally
			// here closes it ourselves, including when encodeLqip throws.
			const bitmap = await createImageBitmap(file);
			try {
				this._aspectRatio = `${bitmap.width}/${bitmap.height}`;
				this._lqip = await encodeLqip(bitmap);
			} finally {
				bitmap.close();
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : String(err);
			this._lqip = null;
		}
	};

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		if (this._imageUrl) URL.revokeObjectURL(this._imageUrl);
	}

	override render() {
		return html`
			<div>
				<label class="encoder__upload-label">
					${this._t('components.lqip-encoder.upload-label')}
					<input class="encoder__upload-input"
						type="file"
						accept="image/*"
						@change=${this._handleFileChange}
					>
				</label>
			</div>
			${this._error ? html`<div class="encoder__error" role="alert">${this._error}</div>` : ''}
			${this._lqip !== null ? html`
				<div class="encoder__result">
					<div>${this._t('components.lqip-encoder.file-prefix-text')} <strong>${this._filename}</strong></div>
					<div>${this._t('components.lqip-encoder.copy-instruction-text')}</div>
					<div class="encoder__code">lqip="${this._lqip}"</div>
				</div>
				<div class="encoder__preview">
					<div>${this._t('components.lqip-encoder.preview-heading-text')}</div>
					<div class="encoder__preview-pair">
						<div class="encoder__preview-item">
							<nldd-image
								alt=${this._t('components.lqip-encoder.preview-lqip-label')}
								aspect-ratio=${this._aspectRatio}
								lqip=${this._lqip}
							></nldd-image>
							<span class="encoder__preview-item-label">${this._t('components.lqip-encoder.preview-lqip-label')}</span>
						</div>
						<div class="encoder__preview-item">
							<nldd-image
								src=${this._imageUrl}
								alt=${this._filename}
								aspect-ratio=${this._aspectRatio}
								lqip=${this._lqip}
							></nldd-image>
							<span class="encoder__preview-item-label">${this._t('components.lqip-encoder.preview-image-label')}</span>
						</div>
					</div>
				</div>
			` : ''}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-lqip-encoder': NLDDLqipEncoder;
	}
}
