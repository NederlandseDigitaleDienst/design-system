import { html } from 'lit';
import './skip-link.js';
import '../top-navigation-bar/top-navigation-bar.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import '../../layout/page/page.js';
import '../../layout/page-sections/simple-section/simple-section.js';
import '../../forms/form/form.js';
import '../../forms/form-section/form-section.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-skip-link` is een link waarmee je met het toetsenbord een blok
 * overslaat. Hij is pas te zien als hij focus krijgt. Zet hem om de kop van een
 * pagina, of om een ander blok met veel tabstops waar je vaak langs wilt: een
 * set filters, een lange werkbalk, een inhoudsopgave. Een skiplink voor elke
 * sectie is een tabstop extra en geen tabstop minder.
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
		text: { control: 'text', description: 'Tekst van de skip-link. Noem wat je overslaat. Valt terug op "Ga naar de hoofdinhoud" rond de kop van een pagina en op "Sla over" elders.' },
		href: { control: 'text', description: 'Optioneel extern doel-ID' },
	},
};

export const Standaard = {
	render: () => html`
		<nldd-page>
			<nldd-skip-link slot="header">
				<nldd-top-navigation-bar website-title="Mijn Dienst">
					<nldd-menu-bar slot="utility">
						<nldd-menu-bar-item
							text="Zoeken"
							icon="magnifier"
							content-priority="text"
						></nldd-menu-bar-item>
					</nldd-menu-bar>
				</nldd-top-navigation-bar>
			</nldd-skip-link>
			<nldd-simple-section>
				<nldd-rich-text>
					<p>Druk op Tab om de skip-link te zien.</p>
					<h1>Aanvraag A-1042</h1>
					<p>Na het klikken op de skip-link springt de focus hierheen.</p>
					<a href="#">Voorwaarden voor dakisolatie</a>
				</nldd-rich-text>
			</nldd-simple-section>
		</nldd-page>
	`,
};

export const MetTekst = {
	render: () => html`
		<nldd-page>
			<nldd-skip-link
				slot="header"
				text="Ga naar hoofdinhoud"
			>
				<nldd-top-navigation-bar website-title="Mijn Dienst">
					<nldd-menu-bar slot="utility">
						<nldd-menu-bar-item
							text="Zoeken"
							icon="magnifier"
							content-priority="text"
						></nldd-menu-bar-item>
					</nldd-menu-bar>
				</nldd-top-navigation-bar>
			</nldd-skip-link>
			<nldd-simple-section>
				<nldd-rich-text>
					<h1>Aanvraag A-1042</h1>
					<a href="#">Voorwaarden voor dakisolatie</a>
				</nldd-rich-text>
			</nldd-simple-section>
		</nldd-page>
	`,
};

export const MetHref = {
	render: () => html`
		<nldd-page>
			<nldd-skip-link
				slot="header"
				text="Ga naar contactformulier"
				href="#contact-form"
			></nldd-skip-link>
			<nldd-simple-section>
				<nldd-rich-text>
					<p>Aanvraag A-1042 voor dakisolatie is in behandeling. Heb je een vraag over je aanvraag? Vul dan het contactformulier hieronder in.</p>
				</nldd-rich-text>
			</nldd-simple-section>
			<nldd-simple-section id="contact-form">
				<nldd-form
					novalidate
					label-alignment="right"
				>
					<nldd-form-section>
						<nldd-title
							slot="header"
							text="Contactformulier"
							heading-level="2"
						></nldd-title>
						<nldd-form-field label="Naam">
							<nldd-text-field
								name="name"
								autocomplete="name"
							></nldd-text-field>
						</nldd-form-field>
					</nldd-form-section>
					<nldd-form-actions>
						<nldd-button-group>
							<nldd-button
								appearance="primary"
								type="submit"
								text="Verstuur"
							></nldd-button>
						</nldd-button-group>
					</nldd-form-actions>
				</nldd-form>
			</nldd-simple-section>
		</nldd-page>
	`,
};
