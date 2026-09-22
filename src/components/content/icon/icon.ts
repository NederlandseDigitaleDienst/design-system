import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { iconStyles } from './icon.styles.js';
import { template } from './icon.template.js';
import { aliases } from './icon-aliases.js';
import { iconRegistry } from './icon-registry.js';

export { aliases };

export const ICONS: string[] = [
	...iconRegistry.keys(),
	...Object.keys(aliases),
].sort();

export type IconSize = 'full' | 'inherit' | '16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96';

export type IconColor =
	| ''
	/* Functional */
	| 'primary-content' | 'secondary-content' | 'accent' | 'critical' | 'warning' | 'success'
	/* Descriptief — rijkskleuren */
	| 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw'
	| 'paars' | 'violet' | 'robijnrood' | 'roze'
	| 'rood' | 'oranje' | 'donkergeel' | 'geel'
	| 'donkerbruin' | 'bruin' | 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen';

/**
 * A customizable icon component that renders SVG icons from a predefined library.
 *
 * Icons are decorative by default: the host gets `aria-hidden="true"` automatically.
 * If you want the icon to be announced by assistive tech, set `aria-hidden="false"`
 * on the consumer side together with an `aria-label`.
 *
 * Sizing: the icon fills whatever sizes it — an `nldd-icon-cell`, a button, a
 * menu item. `size="full"` names that default explicitly. `size="inherit"` makes
 * it follow the surrounding text (1em), for an icon set inline in a sentence.
 * Any spacer-aligned number (16–96) pins a fixed dimension.
 *
 * Reach for `inherit` rather than a global `nldd-icon { width: 1em }` rule in
 * the consumer: such a rule wins over the component's own :host styling and so
 * also shrinks the icons that a cell or button was already sizing correctly.
 *
 * Color: by default the icon inherits its parent's `color`. Set `color` to one
 * of the functional semantics (`primary-content`, `secondary-content`,
 * `accent`, `critical`, `warning`, `success`) or a rijkskleur (`lintblauw`,
 * `paars`, `groen`, …). For a color the system cannot know — the jacket
 * of a cable, a color someone picked — set `custom-color` to any CSS color.
 *
 * @element nldd-icon
 *
 * @attr {string} name - The name of the icon to display
 * @attr {string} size - `full` (the default) fills the container. `inherit` sizes the icon to the surrounding text (1em) and drops it onto that text's own line, for an icon set in a line of running text. Or a fixed spacer-aligned size in px (16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96).
 * @attr {string} color - Functional (`primary-content`, `secondary-content`, `accent`, `critical`, `warning`, `success`) or rijkskleur (`lintblauw`, `donkerblauw`, `hemelblauw`, `lichtblauw`, `paars`, `violet`, `robijnrood`, `roze`, `rood`, `oranje`, `donkergeel`, `geel`, `donkerbruin`, `bruin`, `donkergroen`, `groen`, `mosgroen`, `mintgroen`). Empty = inherit `color` from parent.
 * @attr {string} custom-color - A color of its own, as any CSS color value ('#a90061', 'oklch(0.6 0.2 20)', 'var(--brand-cable-blue)'). For a color the system cannot know. It wins over `color`.
 * @attr {boolean} box - Draw the icon on a filled square. `color` and `custom-color` then paint the box and the glyph takes the contrasting color, and `size` measures the box: the glyph is four fifths of it, the corner radius a fifth.
 *
 * @example
 * ```html
 * <nldd-icon name="heart"></nldd-icon>
 * <nldd-icon name="trash" size="24" color="critical"></nldd-icon>
 * <nldd-icon name="leaf" size="32" color="mosgroen"></nldd-icon>
 * <nldd-icon name="circle-filled" size="16" custom-color="#3b82f6"></nldd-icon>
 * ```
 */
@customElement('nldd-icon')
export class NLDDIcon extends LitElement {
	static override styles = iconStyles;

	@property({ type: String })
	name = 'circle-dashed';

	@property({ reflect: true, converter: reflectNonDefault<IconSize>('full') })
	size: IconSize = 'full';

	@property({ reflect: true, converter: reflectNonDefault<IconColor>('') })
	color: IconColor = '';

	/** Handed to the styles as a custom property rather than read from the
	 *  attribute in CSS: `attr()` with a type is not available everywhere yet,
	 *  and this keeps one code path. */
	@property({ reflect: true, attribute: 'custom-color', converter: reflectNonDefault<string>('') })
	customColor = '';

	/**
	 * Draw the icon on a filled square instead of on its own.
	 *
	 * It turns the colour question around: `color` and `custom-color` paint the
	 * box, and the glyph takes whatever contrasts with it. That pair is the
	 * reason this is an option here rather than a box a consumer builds around
	 * an icon, because a hand-picked pair is the part nobody can check by eye.
	 *
	 * `size` then measures the box, so the same size renders a smaller glyph
	 * with `box` than without: four fifths of it, with a radius of a fifth.
	 */
	@property({ type: Boolean, reflect: true })
	box = false;

	@state()
	private _iconSvg: string | null = null;

	override connectedCallback(): void {
		super.connectedCallback();
		if (!this.hasAttribute('aria-hidden')) {
			this.setAttribute('aria-hidden', 'true');
		}
		this._iconSvg = this._loadIcon(this.name);
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('name') && this.name) {
			this._iconSvg = this._loadIcon(this.name);
		}
		if (changedProperties.has('customColor')) {
			if (this.customColor) this.style.setProperty('--_custom-color', this.customColor);
			else this.style.removeProperty('--_custom-color');
		}
	}

	private _loadIcon(name: string): string | null {
		const resolvedName = aliases[name] ?? name;
		const svg = iconRegistry.get(resolvedName);

		if (svg) {
			return svg;
		}

		if (import.meta.env?.DEV) console.warn(`NLDDIcon: icon "${resolvedName}" not found`);
		return null;
	}

	override render() {
		return template(this._iconSvg);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-icon': NLDDIcon;
	}
}
