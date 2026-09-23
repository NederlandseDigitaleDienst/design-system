import { nothing } from 'lit';
import {
	Directive,
	directive,
	PartType,
	type ElementPart,
	type PartInfo,
} from 'lit/directive.js';

const PADDING_OPTIONS = [
	'(auto)', '0', '2', '4', '6', '8', '10', '12', '16', '20', '24',
	'28', '32', '40', '44', '48', '56', '64', '80', '96',
];

const paddingControl = (name: string, description: string) => ({
	name,
	control: { type: 'select' as const },
	options: PADDING_OPTIONS,
	mapping: { '(auto)': '' },
	description,
	table: { defaultValue: { summary: '(auto)' } },
});

/**
 * Shared Storybook controls for the PageSectionMixin surface API
 * (background, scheme, width, height and the 12 block-padding overrides).
 * Spread into a section story's `args` / `argTypes`, and bind onto the host
 * element in `render` with the `pageSectionAttrs` directive.
 */
export const pageSectionArgs = {
	background: 'inherit',
	scheme: 'inherit',
	width: '',
	height: '',
	paddingBlock: '',
	paddingTop: '',
	paddingBottom: '',
	smPaddingBlock: '',
	smPaddingTop: '',
	smPaddingBottom: '',
	mdPaddingBlock: '',
	mdPaddingTop: '',
	mdPaddingBottom: '',
	lgPaddingBlock: '',
	lgPaddingTop: '',
	lgPaddingBottom: '',
};

export const pageSectionArgTypes = {
	background: {
		control: { type: 'select' },
		options: ['inherit', 'base', 'tinted'],
		description: 'Oppervlak: "inherit" laat het oppervlak van de ouder doorschijnen, "base" en "tinted" tekenen een eigen oppervlak dat naar de inhoud cascadeert',
		table: { defaultValue: { summary: 'inherit' } },
	},
	scheme: {
		control: { type: 'select' },
		options: ['inherit', 'light', 'dark', 'inverted'],
		description: 'Kleurschema: "inherit" volgt de pagina, "inverted" is het tegenovergestelde daarvan',
		table: { defaultValue: { summary: 'inherit' } },
	},
	width: {
		control: 'text',
		description: 'Maximale breedte van de inhoud: "full" haalt de grens weg, een CSS-lengte (bv. "480px") vervangt hem',
	},
	height: {
		control: 'text',
		description: 'Minimale hoogte van de sectie, als CSS-lengte (bv. "400px" of "100dvh")',
	},
	paddingBlock: paddingControl('padding-block', 'Padding boven en onder (token 0 tot 96, "0" haalt hem weg)'),
	paddingTop: paddingControl('padding-top', 'Alleen de padding boven'),
	paddingBottom: paddingControl('padding-bottom', 'Alleen de padding onder'),
	smPaddingBlock: paddingControl('sm-padding-block', 'Padding boven en onder op sm (tot 640px)'),
	smPaddingTop: paddingControl('sm-padding-top', 'Padding boven op sm (tot 640px)'),
	smPaddingBottom: paddingControl('sm-padding-bottom', 'Padding onder op sm (tot 640px)'),
	mdPaddingBlock: paddingControl('md-padding-block', 'Padding boven en onder op md (641 tot 1007px)'),
	mdPaddingTop: paddingControl('md-padding-top', 'Padding boven op md (641 tot 1007px)'),
	mdPaddingBottom: paddingControl('md-padding-bottom', 'Padding onder op md (641 tot 1007px)'),
	lgPaddingBlock: paddingControl('lg-padding-block', 'Padding boven en onder op lg (vanaf 1008px)'),
	lgPaddingTop: paddingControl('lg-padding-top', 'Padding boven op lg (vanaf 1008px)'),
	lgPaddingBottom: paddingControl('lg-padding-bottom', 'Padding onder op lg (vanaf 1008px)'),
};

const toAttribute = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const PAGE_SECTION_ATTRS = Object.keys(pageSectionArgs).map((key) => [key, toAttribute(key)]);

class PageSectionAttrsDirective extends Directive {
	constructor(partInfo: PartInfo) {
		super(partInfo);
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('pageSectionAttrs must be used on an element');
		}
	}

	render(_args: Record<string, unknown>) {
		return nothing;
	}

	override update(part: ElementPart, [args]: [Record<string, unknown>]) {
		const el = part.element;
		for (const [key, attribute] of PAGE_SECTION_ATTRS) {
			const value = args[key];
			if (typeof value === 'string' && value !== '') {
				el.setAttribute(attribute, value);
			} else {
				el.removeAttribute(attribute);
			}
		}
		return nothing;
	}
}

/**
 * Element-part directive that mirrors the PageSectionMixin args onto a section
 * host: `<nldd-simple-section ${pageSectionAttrs(args)}>`. Empty/non-string
 * values remove the attribute so unset controls fall back to the defaults.
 */
export const pageSectionAttrs = directive(PageSectionAttrsDirective);
