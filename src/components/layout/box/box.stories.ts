import { html } from 'lit';
import './box.js';
import '../container/container.js';
import '../../content/rich-text/rich-text.js';
import '../spacer/spacer.js';
import '../../actions/button/button.js';

/**
 * Gebruik een box om gerelateerde componenten visueel te groeperen in een afgebakend gebied.
 * Een box trekt de aandacht naar inhoud of acties die bij elkaar horen,
 * zodat gebruikers hun samenhang in één oogopslag begrijpen.
 *
 * ## Gebruik
 * De box tekent alleen het vlak: hij heeft zelf geen padding, net als nldd-card.
 * Zet er een nldd-container in en laat die de inspringing bepalen, zodat één
 * component overal over spacing gaat.
 *
 * ```html
 * <nldd-box>
 *   <nldd-container padding="16">
 *     <nldd-rich-text>
 *       <p>Inhoud van de box.</p>
 *     </nldd-rich-text>
 *   </nldd-container>
 * </nldd-box>
 * ```
 */
export default {
	title: 'Components/Layout/Box',
	component: 'nldd-box',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/box/box.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		background: 'tinted',
	},
	argTypes: {
		background: {
			control: 'select',
			options: ['tinted', 'base', 'critical'],
			description: 'Welk vlak de box tekent. `tinted` voor een box op een plain page, `base` voor een box op een al getinte parent (border ring krijgt +2 stappen voor extra contrast), `critical` voor een gebied met onomkeerbare acties.',
			table: { defaultValue: { summary: 'tinted' } },
		},
	},
};

export const Standaard = ({ background }: Record<string, unknown>) => html`
	<nldd-box background=${background as string}>
		<nldd-container padding="16">
			<nldd-rich-text>
				<h3>Wanneer gebruik je een box?</h3>
				<p>
					Een box groepeert gerelateerde componenten visueel in een afgebakend gebied.
					Gebruik een box wanneer een set van inhoud of acties bij elkaar hoort en
					duidelijk onderscheiden moet worden van de rest van de pagina.
				</p>
				<p>
					De box past zich aan aan de breedte van zijn container en heeft geen vaste hoogte.
					De achtergrondkleur, padding en afronding komen uit de CSS variabelen.
				</p>
				<h4>Richtlijnen</h4>
				<ul>
					<li>Gebruik een box voor het groeperen van formuliervelden, acties of informatieve inhoud.</li>
					<li>Plaats niet te veel verschillende soorten inhoud in één box.</li>
					<li>Gebruik geen geneste boxes.</li>
				</ul>
			</nldd-rich-text>

		</nldd-container>
	</nldd-box>
`;

/**
 * `background="critical"` markeert een gebied waarvan de acties onomkeerbaar zijn,
 * een "danger zone". Anders dan `nldd-banner` is dit geen melding maar een vast
 * onderdeel van de pagina: de box krijgt daarom geen eigen ARIA-rol. De kop en
 * het knoplabel moeten het gevaar benoemen, de kleur bevestigt het alleen.
 */
export const AchtergrondCritical = {
	name: 'Achtergrond critical',
	render: () => html`
		<nldd-box background="critical">
		<nldd-container padding="16">
				<nldd-rich-text>
					<h3>Cluster verwijderen</h3>
					<p>Een cluster verwijderen is definitief en kan niet ongedaan worden gemaakt.</p>
				</nldd-rich-text>
				<nldd-spacer size="16"></nldd-spacer>
				<nldd-button variant="destructive" text="Verwijder dit cluster"></nldd-button>

		</nldd-container>
	</nldd-box>
	`,
	parameters: { controls: { disable: true } },
};

export const Vlakken = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<nldd-box background="tinted">
		<nldd-container padding="16">
					<nldd-rich-text><p>background="tinted" (default) — getint vlak op een plain pagina</p></nldd-rich-text>

		</nldd-container>
	</nldd-box>
			<div style="background: var(--semantics-surfaces-tinted-background-color); padding: 24px;">
				<nldd-box background="base">
		<nldd-container padding="16">
						<nldd-rich-text><p>background="base" — base-colored box op een al getinte parent. Highlight ring is +2 stappen voor extra contrast.</p></nldd-rich-text>

		</nldd-container>
	</nldd-box>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
