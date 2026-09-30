/**
 * Nederlandse Digitale Dienst Form Section Component
 *
 * Plain custom element (extends HTMLElement, no Lit). The light-DOM render
 * works around an NVDA + Firefox a11y bug where a shadow-DOM <fieldset> +
 * <legend> is not reliably announced as the group label for slotted controls.
 * A native fieldset/legend in the light DOM works correctly across all
 * AT/browser combinations.
 *
 * **Differs from shadow components:**
 * - No shadowRoot: all children live in the light DOM (inside the rendered
 *   <fieldset>).
 * - No Lit: a plain HTMLElement with manual DOM mutation.
 * - **Requires a global stylesheet import**: `dist/css/form-section.css` (or
 *   `global.css`). Form-section has no shadow stylesheet.
 *
 * Renders to:
 *
 *     <nldd-form-section>
 *         <fieldset class="form-section">
 *             <legend class="form-section__header">
 *                 <span class="form-section__title">Title</span>
 *                 <span class="form-section__supporting-text">Supporting text</span>
 *             </legend>
 *             <div class="form-section__main">
 *                 [user's children]
 *             </div>
 *         </fieldset>
 *     </nldd-form-section>
 *
 * **Accessibility note**: the title renders as a `<legend>`. Semantically that
 * is a **group label**, not a heading. Screen readers announce it when the user
 * enters the fieldset, but users jumping through headings with the H key skip
 * it. Visually it looks like a heading, so use this component for *form
 * grouping*, not as page structure. For real page headings, use a separate
 * heading element above the form.
 *
 * **Supporting-text length**: the supporting text sits as a `<span>` inside the
 * `<legend>` so a screen reader reads it along as the group label. Side effect:
 * on every field entry within the section, the whole legend (title + supporting text)
 * is spoken again. Keep `supporting-text` short (roughly 80 characters or less)
 * and use it to introduce the group ("Vul je adresgegevens in"), not for
 * detailed instructions. For a longer explanation on one specific field, use
 * `nldd-form-field-help-text` on that field.
 *
 *     <nldd-form>
 *         <nldd-form-section text="Persoonsgegevens" supporting-text="Vul je gegevens in.">
 *             <nldd-form-field label="Voornaam">...</nldd-form-field>
 *             <nldd-form-field label="Achternaam">...</nldd-form-field>
 *         </nldd-form-section>
 *
 *         <nldd-form-section text="Adres">
 *             <nldd-form-field label="Straat">...</nldd-form-field>
 *         </nldd-form-section>
 *
 *         <nldd-form-actions>...</nldd-form-actions>
 *     </nldd-form>
 *
 * @element nldd-form-section
 *
 * @attr {string} text - Heading text (rendered in the `<legend>`).
 * @attr {string} supporting-text - Short description under the heading. Keep it to roughly 80 characters or less (see the a11y note).
 *
 * Children of the form-section are placed in `.form-section__main`.
 */

const FIELDSET_CLASS = 'form-section';
const HEADER_CLASS = 'form-section__header';
const TITLE_CLASS = 'form-section__title';
const SUPPORTING_TEXT_CLASS = 'form-section__supporting-text';
const MAIN_CLASS = 'form-section__main';

export class NLDDFormSection extends HTMLElement {
	static get observedAttributes(): string[] {
		return ['text', 'supporting-text'];
	}

	private _fieldset: HTMLFieldSetElement | null = null;
	private _legend: HTMLLegendElement | null = null;
	private _main: HTMLDivElement | null = null;
	private _observer: MutationObserver | null = null;
	private _hasWarnedNoLabel = false;

	get text(): string {
		return this.getAttribute('text') ?? '';
	}
	set text(value: string) {
		if (value) this.setAttribute('text', value);
		else this.removeAttribute('text');
	}

	get supportingText(): string {
		return this.getAttribute('supporting-text') ?? '';
	}
	set supportingText(value: string) {
		if (value) this.setAttribute('supporting-text', value);
		else this.removeAttribute('supporting-text');
	}

	connectedCallback(): void {
		// One-time setup: build fieldset/legend/main and migrate children.
		// Subsequent connect cycles (e.g. when nldd-form moves us into its
		// inner <form>) skip this block but still re-attach the observer.
		if (!this._fieldset) this._buildStructure();
		this._renderLegend();
		this._warnIfNoLabel();

		// (Re-)attach observer on every connect to catch dynamically added
		// children (which would otherwise land outside the inner fieldset).
		if (!this._observer) {
			const main = this._main;
			this._observer = new MutationObserver(mutations => {
				for (const m of mutations) {
					if (m.target !== this) continue;
					m.addedNodes.forEach(node => {
						if (node === this._fieldset) return;
						main?.appendChild(node);
					});
				}
			});
			this._observer.observe(this, { childList: true });
		}
	}

	disconnectedCallback(): void {
		this._observer?.disconnect();
		this._observer = null;
	}

	attributeChangedCallback(name: string): void {
		if (name === 'text' || name === 'supporting-text') {
			// Pas re-renderen na _buildStructure (eerste connect).
			if (this._legend) {
				this._renderLegend();
				this._warnIfNoLabel();
			}
		}
	}

	private _warnIfNoLabel(): void {
		// Dev only, so an end user's production console stays clean.
		if (!import.meta.env?.DEV) return;
		if (this._hasWarnedNoLabel) return;
		if (this.text || this.supportingText) return;
		this._hasWarnedNoLabel = true;
		console.warn('<nldd-form-section>: No `text` or `supporting-text` provided. The <fieldset> has no accessible name and screen readers may announce it as just "group" (Chrome) or nothing (Firefox). Set `text` for a group label, or document this section as purely visual grouping.');
	}

	private _buildStructure(): void {
		// Save user's existing children (light-DOM at construction time).
		const initialChildren = Array.from(this.childNodes);

		// Create structure: <fieldset><legend/><div.main/></fieldset>
		const fieldset = document.createElement('fieldset');
		fieldset.className = FIELDSET_CLASS;

		const legend = document.createElement('legend');
		legend.className = HEADER_CLASS;

		const main = document.createElement('div');
		main.className = MAIN_CLASS;

		fieldset.append(legend, main);

		// Move children into main
		for (const child of initialChildren) {
			main.appendChild(child);
		}

		this.appendChild(fieldset);

		this._fieldset = fieldset;
		this._legend = legend;
		this._main = main;
	}

	private _renderLegend(): void {
		const legend = this._legend;
		if (!legend) return;

		const text = this.text;
		const supportingText = this.supportingText;
		const hasContent = !!text || !!supportingText;

		// Clear existing legend content.
		legend.textContent = '';

		if (text) {
			const titleSpan = document.createElement('span');
			titleSpan.className = TITLE_CLASS;
			titleSpan.textContent = text;
			legend.appendChild(titleSpan);
		}

		if (supportingText) {
			const supportingTextSpan = document.createElement('span');
			supportingTextSpan.className = SUPPORTING_TEXT_CLASS;
			supportingTextSpan.textContent = supportingText;
			legend.appendChild(supportingTextSpan);
		}

		// Hide the legend completely (including its space) when empty, so
		// .form-section__main becomes :first-child and its margin-top collapses
		// through CSS.
		//
		// Accessibility implication: without a legend the <fieldset> has no
		// accessible name. Screen reader behavior varies (Chrome: "group", Firefox:
		// nothing). That is a deliberate choice: a form section can also be used
		// purely as visual grouping (the padding around it) without a heading. Want a
		// screen reader name without a visible title? Wrap the form in an
		// nldd-form-section WITH text, or use aria-labelledby on the individual
		// fields.
		legend.hidden = !hasContent;
	}
}

if (!customElements.get('nldd-form-section')) {
	customElements.define('nldd-form-section', NLDDFormSection);
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-form-section': NLDDFormSection;
	}
}
