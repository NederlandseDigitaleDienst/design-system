import { html } from 'lit';
import './skip-link.js';
import '../top-navigation-bar/top-navigation-bar.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import '../../layout/page/page.js';
import '../../layout/page-sections/simple-section/simple-section.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * Skip-link component voor keyboard-navigatie.
 * Verbergt een link totdat de gebruiker er met Tab naartoe navigeert.
 * Klik of Enter om de gewrapte content over te slaan.
 */
export default {
	title: 'Components/Navigation/Skip Link',
	component: 'nldd-skip-link',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		text: '',
		href: '',
	},
	argTypes: {
		text: { control: 'text', description: 'Tekst van de skip-link (default: "Sla over")' },
		href: { control: 'text', description: 'Optioneel extern doel-ID' },
	},
};

export const Standaard = {
	render: () => html`
		<nldd-page>
			<nldd-skip-link slot="header">
				<nldd-top-navigation-bar website-title="DigID">
					<nldd-menu-bar-item slot="global" text="Home" current></nldd-menu-bar-item>
					<nldd-menu-bar-item slot="global" text="Contact"></nldd-menu-bar-item>
					<nldd-menu-bar-item slot="utility" text="Zoeken" icon="magnifier"></nldd-menu-bar-item>
				</nldd-top-navigation-bar>
			</nldd-skip-link>
			<nldd-simple-section>
				<nldd-rich-text>
					<p>Druk op Tab om de skip-link te zien.</p>
					<h1>Hoofdinhoud</h1>
					<p>Na het klikken op de skip-link springt de focus hierheen.</p>
					<a href="#">Eerste link in hoofdinhoud</a>
				</nldd-rich-text>
			</nldd-simple-section>
		</nldd-page>
	`,
};

export const MetTekst = {
	render: () => html`
		<nldd-page>
			<nldd-skip-link slot="header" text="Ga naar hoofdinhoud">
				<nldd-top-navigation-bar website-title="Rijksoverheid">
					<nldd-menu-bar-item slot="global" text="Home" current></nldd-menu-bar-item>
					<nldd-menu-bar-item slot="global" text="Onderwerpen"></nldd-menu-bar-item>
					<nldd-menu-bar-item slot="utility" text="Zoeken" icon="magnifier"></nldd-menu-bar-item>
				</nldd-top-navigation-bar>
			</nldd-skip-link>
			<nldd-simple-section>
				<nldd-rich-text>
					<h1>Hoofdinhoud</h1>
					<a href="#">Link in de content</a>
				</nldd-rich-text>
			</nldd-simple-section>
		</nldd-page>
	`,
};

export const MetHref = {
	render: () => html`
		<nldd-page>
			<nldd-skip-link slot="header" text="Ga naar formulier" href="#contact-form"></nldd-skip-link>
			<nldd-simple-section>
				<nldd-rich-text>
					<p>Content bovenaan de pagina...</p>
				</nldd-rich-text>
			</nldd-simple-section>
			<nldd-simple-section id="contact-form" tabindex="-1">
				<nldd-form novalidate label-alignment="right">
					<nldd-title
						size="3"
						text="Contactformulier"
						heading-level="2"
					></nldd-title>
					<nldd-form-field label="Naam">
						<nldd-text-field name="name" autocomplete="name"></nldd-text-field>
					</nldd-form-field>
					<nldd-form-actions>
						<nldd-button-group orientation="horizontal">
							<nldd-button variant="primary" type="submit" text="Verstuur"></nldd-button>
						</nldd-button-group>
					</nldd-form-actions>
				</nldd-form>
			</nldd-simple-section>
		</nldd-page>
	`,
};
