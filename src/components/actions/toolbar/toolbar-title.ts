import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { toolbarTitleStyles } from './toolbar.styles.js';
import { toolbarTitleTemplate } from './toolbar-title.template.js';
import { nlddToolbarTranslations, type NLDDToolbarTranslations } from './toolbar.i18n.js';
import { translate } from '../../../utilities/translations.js';
import type { Size } from './toolbar-item.js';

type TitleAlign = 'left' | 'center';

/**
 * The title of an nldd-toolbar, with optional media before it and an action after it.
 *
 * @element nldd-toolbar-title
 * @attr {string} width - Preferred (fluid) width as a CSS length or percentage; the title grows toward it and shrinks to min-width.
 * @attr {string} min-width - Minimum width as a CSS length (default: the width of its own text, up to `max-width`). Items move into the overflow menu before the title gets narrower than this; only when no item is left to move does the title truncate below it. Set `0` to let the title shrink first.
 * @attr {string} max-width - Maximum width as a CSS length (default: '240px'); the title text truncates with an ellipsis beyond it. The cap is lifted while the title is the sole toolbar element (it then stretches to fill the row).
 * @attr {string} align - Text alignment: 'left' | 'center' (default: 'left').
 * @attr {string} text - Title text.
 * @attr {string} supporting-text - Secondary supporting text shown below the title.
 * @attr {'sm'|'md'|'lg'} size - Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's size (default: 'md'), which sets the title group height and, at 'sm', the title and supporting-text fonts.
 *
 * @attr {string} href - Makes the mark and the name one link, for the place this window belongs to (usually the app's own start). The `action` slot stays outside it: a control inside a link is a control you cannot reach without following the link.
 * @attr {string} target - Where the link opens; only meaningful with `href`. `_blank` adds rel="noopener noreferrer" and a visually hidden "opens in a new tab" announcement. An `href` to another origin than the page (another website, a subdomain too) adds a visually hidden "andere website", in one sentence with the new-tab announcement when both apply; there is no way to switch it off.
 * @attr {object} translations - Override translation keys (the new-tab announcement); unset keys fall back to Dutch.
 *
 * @slot media - Optional leading image before the title: a logo, a product mark, a file-type icon. Its height is capped to the title group so it cannot stretch the row; pick the size within that yourself. With no `text` the media stands alone and carries the name, so give it one (an `alt`, or an accessible label).
 * @slot action - Optional trailing control (e.g. an xs nldd-icon-button), shown inline after the title and tuned to sit against it. Empty by default.
 */
@customElement('nldd-toolbar-title')
export class NLDDToolbarTitle extends LitElement {
	static override styles = toolbarTitleStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ reflect: true, attribute: 'min-width', converter: reflectNonDefault<string>('') })
	minWidth = '';

	@property({ reflect: true, attribute: 'max-width', converter: reflectNonDefault<string>('') })
	maxWidth = '';

	@property({ reflect: true, converter: reflectNonDefault<TitleAlign>('left') })
	align: TitleAlign = 'left';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ type: String, reflect: true })
	href = '';

	@property({ type: String, reflect: true })
	target = '';

	@property({ type: Object })
	translations: Partial<NLDDToolbarTranslations> = {};

	/** Set by nldd-toolbar; not part of the public API. @internal */
	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	public _t(key: keyof NLDDToolbarTranslations): string {
		return translate(this.translations, nlddToolbarTranslations, key);
	}

	// Layout state — `solo-fluid` and `hidden` — is owned by nldd-toolbar and
	// toggled directly as attributes during measurement (synchronous). Not a
	// reactive property for the same reflection-timing reason as the item.

	// willUpdate (not updated) so the size CSS variables are written before the
	// toolbar measures the title with getBoundingClientRect() on the same frame.
	override willUpdate(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('minWidth')) this._reflectSizeVar('--_toolbar-title-group-min-width', this.minWidth);
		if (changedProperties.has('width')) this._reflectSizeVar('--_toolbar-title-width', this.width);
		if (changedProperties.has('maxWidth')) this._reflectSizeVar('--_toolbar-title-max-width', this.maxWidth);
	}

	private _reflectSizeVar(prop: string, value: string): void {
		if (value) {
			this.style.setProperty(prop, value);
		} else {
			this.style.removeProperty(prop);
		}
	}

	override render() {
		return toolbarTitleTemplate(this);
	}
}
