import { action } from 'storybook/actions';
import { html } from 'lit';
import './top-title-bar.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../layout/page/page.js';
import '../../layout/page-sections/simple-section/simple-section.js';
import '../../content/title/title.js';

/**
 * De Top Title Bar is de werkbalk van een pagina of container.
 * Hij toont een titel en optionele navigatie- en actieknoppen.
 *
 * ## Gebruik
 * ```html
 * <nldd-top-title-bar text="Paginatitel"></nldd-top-title-bar>
 * ```
 *
 * ## Compact stand
 * De component schakelt automatisch naar de compacte stand (`is-compact`) zodra
 * de bovenkant van het ankerelement de bovenkant van de scrollcontainer bereikt.
 * Stel `collapse-anchor` in op het id van het titelelement in de pagina-inhoud.
 *
 * ## Terugknop
 * In de standaard stand: tekstknop met `back-text`. In de compacte stand: icoonknop.
 *
 * ## Sluitknop
 * Stel `dismiss-text` in op 'Sluit', 'Annuleer' of 'Klaar'.
 */
export default {
	title: 'Components/Navigation/Top Title Bar',
	component: 'nldd-top-title-bar',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/top-title-bar/top-title-bar.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		text: {
			control: 'text',
			description: 'Tekst weergegeven in de werkbalk (compact stand)',
		},
		supportingText: {
			control: 'text',
			name: 'supporting-text',
			description: 'Optionele ondersteunende tekst in de werkbalk (compact stand)',
		},
		backText: {
			control: 'text',
			name: 'back-text',
			description: 'Tekst voor de terugknop; weglaten verbergt de knop',
		},
		dismissText: {
			control: 'text',
			name: 'dismiss-text',
			description: "Tekst voor de sluitknop: 'Sluit', 'Annuleer' of 'Klaar'",
		},
		backHref: {
			control: 'text',
			name: 'back-href',
			description: 'Wanneer ingesteld rendert de terugknop als ankerlink',
		},
		collapseAnchor: {
			control: 'text',
			name: 'collapse-anchor',
			description: 'ID van het ankerelement in de pagina-inhoud',
		},
	},
	args: {
		text: 'Paginatitel',
		supportingText: '',
		backText: '',
		dismissText: '',
		backHref: '',
		collapseAnchor: '',
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-page background="tinted" style="height: 120px;">
		<nldd-top-title-bar
			slot="header"
			text=${args.text}
			supporting-text=${args.supportingText}
			back-text=${args.backText}
			back-href=${args.backHref}
			dismiss-text=${args.dismissText}
			collapse-anchor=${args.collapseAnchor}
			@back=${action('back')}
			@dismiss=${action('dismiss')}
		></nldd-top-title-bar>
	</nldd-page>
`;

export const Standaard = {
	render: Template,
	args: { text: 'Paginatitel' },
};

export const MetTerugknop = {
	render: Template,
	args: { text: 'Detailpagina', backText: 'Overzicht' },
	parameters: {
		docs: {
			description: {
				story: 'In de standaard stand wordt de terugknop als tekstknop weergegeven.',
			},
	},
},
};

export const Compact = {
	render: () => html`
	<nldd-page background="tinted" style="height: 120px;">
		<nldd-top-title-bar
			class="is-compact"
			slot="header"
			text="Detailpagina"
			back-text="Overzicht"
			dismiss-text="Sluit"
			@back=${action('back')}
			@dismiss=${action('dismiss')}
		></nldd-top-title-bar>
	</nldd-page>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Compacte stand via de <code>is-compact</code>-klasse: icoonknop, scheider en werkbalktitel.',
			},
	},
},
};

export const MetSluitknop = {
	render: Template,
	args: { text: 'Formulier', dismissText: 'Sluit' },
};

export const MetBeideKnoppen = {
	render: Template,
	args: { text: 'Detailpagina', backText: 'Overzicht', dismissText: 'Annuleer' },
};

export const MetSubtitel = {
	render: Template,
	args: {
		text: 'Paginatitel',
		supportingText: 'Aanvullende informatie',
		backText: 'Overzicht',
		dismissText: 'Sluit',
	},
};

export const MetWerkbalkActies = {
	render: () => html`
	<nldd-page background="tinted" style="height: 120px;">
		<nldd-top-title-bar
			slot="header"
			text="Document"
			back-text="Overzicht"
			dismiss-text="Sluit"
		>
			<nldd-icon-button slot="toolbar" variant="accent-transparent" icon="share" text="Delen"></nldd-icon-button>
			<nldd-icon-button slot="toolbar" variant="accent-transparent" icon="edit" text="Bewerken"></nldd-icon-button>
		</nldd-top-title-bar>
	</nldd-page>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Extra knoppen via de <code>toolbar</code>-slot.',
			},
	},
},
};

export const MetTitelAnker = {
	render: () => html`
	<nldd-page background="tinted" sticky-header style="height: 400px;">
		<nldd-top-title-bar
			slot="header"
			text="Paginatitel"
			back-text="Overzicht"
			dismiss-text="Sluit"
			collapse-anchor="page-title-bar"
			@back=${action('back')}
			@dismiss=${action('dismiss')}
		></nldd-top-title-bar>
		<nldd-simple-section>
			<nldd-title
				id="page-title-bar"
				size="2"
				text="Paginatitel"
				supporting-text="Scroll omlaag om te zien hoe de compacte stand wordt geactiveerd."
				heading-level="1"
			></nldd-title>
			<div style="height: 600px;"></div>
		</nldd-simple-section>
	</nldd-page>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Automatische compacte stand via <code>collapse-anchor</code>.',
			},
	},
},
};

export const MetTitelAnkerZonderActies = {
	render: () => html`
	<nldd-page background="tinted" sticky-header style="height: 400px;">
		<nldd-top-title-bar
			slot="header"
			text="Paginatitel"
			collapse-anchor="page-title-bar-2"
			@back=${action('back')}
			@dismiss=${action('dismiss')}
		></nldd-top-title-bar>
		<nldd-simple-section>
			<nldd-title
				id="page-title-bar-2"
				size="2"
				text="Paginatitel"
				supporting-text="Zonder terugknop of sluitknop."
				heading-level="1"
			></nldd-title>
			<div style="height: 600px;"></div>
		</nldd-simple-section>
	</nldd-page>
`,
	parameters: {
		controls: { disable: true },
	},
};
