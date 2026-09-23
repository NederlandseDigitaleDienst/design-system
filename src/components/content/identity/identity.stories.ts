import { html, nothing } from 'lit';
import './identity.js';
import '../avatar-group/avatar-group.js';
import '../avatar/avatar.js';
import '../../navigation/link/link.js';

// A self-contained SVG avatar (data URI) for the avatar-src attribute demo, so
// the stories don't depend on external images. Slotted avatars use nldd-avatar
// with initials instead.
const AVATAR_IMAGE =
	`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23185FA5'/%3E%3Ctext x='20' y='25' font-family='sans-serif' font-size='14' fill='white' text-anchor='middle'%3EJJ%3C/text%3E%3C/svg%3E`;

/**
 * Een identity toont auteurs of redacteuren van content: optionele avatar(s),
 * een naamregel en ondersteunende tekst (bijvoorbeeld rol of datum). Alle
 * onderdelen zijn optioneel.
 *
 * Eén avatar slot je als `<nldd-avatar slot="avatars">` (of een `<img>`) en
 * krijgt zijn maat van identity; bij meerdere slot je een
 * `<nldd-avatar-group slot="avatars">` eromheen, die het overlappen en de ring
 * verzorgt. Zonder afbeelding valt een `nldd-avatar`
 * terug op de initialen uit `name`. Staat de identity op een gekleurde
 * ondergrond, geef die kleur dan door via `--context-parent-background-color`
 * zodat de ring
 * meekleurt. Zet `decorative` op de avatars wanneer de namen al in de tekst
 * staan.
 */
export default {
	title: 'Components/Content/Identity',
	component: 'nldd-identity',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/identity/identity.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		text: 'Jan Jansen',
		supportingText: 'Redacteur · 12 juni 2026',
	},
	argTypes: {
		text: {
			control: 'text',
			description: 'Naamregel',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst onder de naamregel (bijv. rol of datum)',
		},
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-identity
		text=${args.text || nothing}
		supporting-text=${args.supportingText || nothing}
	>
		<nldd-avatar
			slot="avatars"
			name=${args.text || nothing}
			decorative
		></nldd-avatar>
	</nldd-identity>
`;

export const Standaard = {
	render: Template,
};

export const ZonderSupportingText = {
	render: () => html`
		<nldd-identity text="Jan Jansen">
			<nldd-avatar
				slot="avatars"
				name="Jan Jansen"
				decorative
			></nldd-avatar>
		</nldd-identity>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Eén avatar kun je ook via het `avatar-src`-attribuut meegeven (met optioneel
 * `avatar-srcset`), zonder zelf te slotten. Identity rendert daarvoor intern een
 * `nldd-avatar`. Handig voor de veelvoorkomende enkele-auteur-identity. Meerdere
 * avatars gaan altijd via de slot.
 */
export const EnkeleAvatarViaAttribuut = {
	render: () => html`
		<nldd-identity
			avatar-src=${AVATAR_IMAGE}
			text="Jan Jansen"
			supporting-text="Redacteur · 12 juni 2026"
		></nldd-identity>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Bij meerdere redacteuren overlappen de avatars, gescheiden door een ring in
 * de surface-kleur. Hier tonen ze de initialen uit `name`; geef een `src` mee
 * voor foto's (foto's en initialen mogen door elkaar staan).
 */
export const MeerdereRedacteuren = {
	render: () => html`
		<nldd-identity
			text="Jan Jansen, Petra Pietersen en Ahmed Karim"
			supporting-text="Laatst bijgewerkt op 12 juni 2026"
		>
			<nldd-avatar-group slot="avatars">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Petra Pietersen" decorative></nldd-avatar>
				<nldd-avatar name="Ahmed Karim" decorative></nldd-avatar>
			</nldd-avatar-group>
		</nldd-identity>
	`,
	parameters: { controls: { disable: true } },
};

export const ZonderAvatar = {
	render: () => html`
		<nldd-identity
			text="Jan Jansen"
			supporting-text="Redacteur · 12 juni 2026"
		></nldd-identity>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Gebruik de `text`- en `supporting-text`-slots voor rijke inhoud: een
 * `<time datetime="…">` voor machine-leesbare datums of een link naar het
 * auteursprofiel. Geslotte inhoud vervangt het bijbehorende attribuut.
 */
export const MetTimeEnLink = {
	render: () => html`
		<nldd-identity>
			<nldd-avatar
				slot="avatars"
				name="Jan Jansen"
				decorative
			></nldd-avatar>
			<span slot="text">Door <nldd-link href="#auteur" text="Jan Jansen"></nldd-link></span>
			<time
				slot="supporting-text"
				datetime="2026-06-12"
			>12 juni 2026</time>
		</nldd-identity>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Op een smalle container (≤ 640px) met meerdere avatars komt de avatarrij
 * boven de namen te staan, zodat de tekst de volle breedte houdt. Met één
 * avatar blijft de identity op één regel — zie het verschil tussen de twee
 * kaders hieronder. Het schakelpunt is de breedte van de identity zelf
 * (container query), niet die van het scherm.
 */
export const SmalleContainer = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 360px;">
			<div style="outline: 1px dashed #cbd5e1; padding: 16px;">
				<nldd-identity
					text="Jan Jansen, Petra Pietersen en Ahmed Karim"
					supporting-text="Laatst bijgewerkt op 12 juni 2026"
				>
					<nldd-avatar-group slot="avatars">
						<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
						<nldd-avatar name="Petra Pietersen" decorative></nldd-avatar>
						<nldd-avatar name="Ahmed Karim" decorative></nldd-avatar>
					</nldd-avatar-group>
				</nldd-identity>
			</div>
			<div style="outline: 1px dashed #cbd5e1; padding: 16px;">
				<nldd-identity
					text="Jan Jansen"
					supporting-text="Redacteur · 12 juni 2026"
				>
					<nldd-avatar slot="avatars" name="Jan Jansen" decorative></nldd-avatar>
				</nldd-identity>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
