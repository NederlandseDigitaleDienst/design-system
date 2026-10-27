import { html, render } from 'lit';
import './notification.js';
import { NLDDNotification, type NotificationHandle } from './notification.js';
import '../modal-dialog/modal-dialog.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../content/rich-text/rich-text.js';
import '../../layout/container/container.js';
import '../../layout/page/page.js';
import '../../layout/page-sections/simple-section/simple-section.js';
import '../../layout/sheet/sheet.js';
import '../../layout/window/window.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import { ICONS } from '../../content/icon/icon.js';

export default {
	title: 'Components/Status & Feedback/Notification',
	component: 'nldd-notification',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/notification/notification.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
		// Every notification leaves the story it was written in and joins the one
		// region on the page, so stories rendered side by side would land on the
		// same pile. Its own frame gives each story its own page, and with that
		// its own region.
		docs: { story: { inline: false, height: '160px' } },
	},
	args: {
		variant: 'neutral',
		icon: '',
		text: 'Aanvraag A-1042 is ingediend',
		supportingText: '',
		duration: 10000,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['neutral', 'accent', 'success', 'warning', 'critical'],
			description: 'Soort melding; bepaalt het icoon en de ARIA-rol',
			table: { defaultValue: { summary: 'neutral' } },
		},
		icon: {
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Overschrijft het icoon van de variant',
			table: { defaultValue: { summary: '(geen)' } },
		},
		text: {
			control: 'text',
			description: 'De melding',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Tweede regel onder de melding',
		},
		duration: {
			control: 'number',
			description: 'Milliseconden voordat hij vertrekt zodra hij vooraan de stapel staat; 0 laat hem staan',
			table: { defaultValue: { summary: 10000 } },
		},
	},
};

/** Storybook is nobody's application, so the stories play the consumer: a
 *  notification announces that it is done and whoever put it there removes it. */
const weg = (e: Event) => (e.currentTarget as HTMLElement).remove();

/**
 * A notification moves itself out of the story and into the shared region, so a
 * re-render can no longer reach it: lit would keep the element it already has,
 * update it where it now lives, and the controls would look dead. The story
 * therefore does what a consumer does — clear what is there and make a new one.
 */
const Template = ({ variant, icon, text, supportingText, duration }: Record<string, unknown>) => {
	document.getElementById('nldd-notifications-area')?.remove();
	const melding = document.createElement('nldd-notification');
	melding.setAttribute('variant', String(variant));
	if (icon) melding.setAttribute('icon', String(icon));
	melding.setAttribute('text', String(text));
	if (supportingText) melding.setAttribute('supporting-text', String(supportingText));
	melding.setAttribute('duration', String(duration));
	melding.addEventListener('dismiss', weg);
	return html`${melding}`;
};

/**
 * De melding staat niet in het vlak hieronder maar rechtsboven op de pagina:
 * hij verhuist zichzelf naar de gedeelde regio, net als in een applicatie.
 * Verander een control en er komt een nieuwe.
 */
export const Standaard = {
	render: Template,
	// A story in a frame of its own never hears about a changed arg, so this one
	// renders in the docs page itself. It leaves nothing behind in its own block,
	// hence no reserved height.
	parameters: { docs: { story: { inline: true, height: 'auto' } } },
};

/**
 * Het vlak blijft neutraal en alleen het icoon draagt de kleur: vijf gekleurde
 * vlakken die over de interface zweven schreeuwen, en het icoon zegt al welke
 * soort dit is.
 */
export const Neutraal = {
	render: () => html`
		<nldd-notification
			text="Dossier D-318 wordt bijgewerkt"
			duration="0"
			@dismiss=${weg}
		></nldd-notification>
	`,
	parameters: { controls: { disable: true } },
};

export const Accent = {
	render: () => html`
		<nldd-notification
			variant="accent"
			text="Dossier D-319 is aan je toegewezen"
			duration="0"
			@dismiss=${weg}
		></nldd-notification>
	`,
	parameters: { controls: { disable: true } },
};

export const Succes = {
	render: () => html`
		<nldd-notification
			variant="success"
			text="Aanvraag A-1043 is afgerond"
			duration="0"
			@dismiss=${weg}
		></nldd-notification>
	`,
	parameters: { controls: { disable: true } },
};

export const Waarschuwing = {
	render: () => html`
		<nldd-notification
			variant="warning"
			text="Aanvraag A-1042 mist nog een bijlage"
			duration="0"
			@dismiss=${weg}
		></nldd-notification>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een fout vertrekt nooit vanzelf, hoe je `duration` ook zet: die is het lezen
 * waard, en een aftelling zou hem weghalen terwijl je bezig was.
 */
export const Kritiek = {
	render: () => html`
		<nldd-notification
			variant="critical"
			text="Aanvraag A-1042 is niet verstuurd"
			supporting-text="De server weigerde het verzoek."
			@dismiss=${weg}
		></nldd-notification>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Hoogstens twee acties, onder de tekst. Naast de tekst zouden ze vechten met
 * de sluitknop om dezelfde hoek, en dan houdt geen van beide ruimte over voor
 * een echt label.
 */
export const MetActies = {
	render: () => html`
		<nldd-notification
			variant="critical"
			text="Bijlage is niet geüpload"
			supporting-text="De aanvraag is bewaard, de bijlage niet."
			@dismiss=${weg}
		>
			<nldd-button
				slot="actions"
				size="sm"
				text="Probeer opnieuw"
			></nldd-button>
			<nldd-button
				slot="actions"
				size="sm"
				text="Aanvraag bekijken"
			></nldd-button>
		</nldd-notification>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Meerdere tegelijk vormen een stapel, geen lijst: de nieuwste staat vooraan en
 * is leesbaar, de oudere steken eronder uit. Onder de voorste ligt een strook
 * over de volle breedte: wijs die aan en de stapel waaiert uit tot hij die
 * strook vult, klik erop en hij klapt helemaal open. Klik of tab je weg, dan
 * valt hij weer dicht. Alleen de voorste telt af, en alleen zolang de stapel
 * dicht is. Staat er een fout vooraan, dan blijft alles staan tot je hem
 * wegklikt.
 */
export const Stapel = {
	render: () => html`
		<nldd-notification
			text="Dossier D-318 wordt bijgewerkt"
			@dismiss=${weg}
		></nldd-notification>
		<nldd-notification
			variant="success"
			text="Aanvraag A-1043 is afgerond"
			@dismiss=${weg}
		></nldd-notification>
		<nldd-notification
			variant="critical"
			text="Aanvraag A-1042 is niet verstuurd"
			@dismiss=${weg}
		></nldd-notification>
	`,
	// Hoog genoeg voor de uitgeklapte lijst, anders klapt hij open buiten zijn
	// eigen frame.
	parameters: { controls: { disable: true }, docs: { story: { height: '320px' } } },
};

/** The buttons and the overlays are siblings in the story, so the overlay to
 *  open is looked up by its tag next to the row of buttons. */
const openOverlay = (tag: string) => (e: Event) => {
	const buttons = (e.currentTarget as HTMLElement).closest('nldd-container');
	buttons?.parentElement?.querySelector<HTMLElement & { show(): void }>(`:scope > ${tag}`)?.show();
};

const sluitDialog = (e: Event) => {
	(e.currentTarget as HTMLElement).closest<HTMLElement & { hide(): void }>('nldd-modal-dialog')?.hide();
};

/** The action does something you can see, so a click on it is a click that
 *  arrived: the failure makes way for a success. */
const probeerOpnieuw = (e: Event) => {
	(e.currentTarget as HTMLElement).closest('nldd-notification')?.remove();
	const gelukt = document.createElement('nldd-notification');
	gelukt.setAttribute('variant', 'success');
	gelukt.setAttribute('text', 'Wijzigingen opgeslagen');
	gelukt.addEventListener('dismiss', weg);
	document.body.append(gelukt);
};

/** What an application does after a failed save: put a new notification on the
 *  page, wherever the code happens to be. Where it ends up is the notification's
 *  business. */
const meldFout = () => {
	const houder = document.createElement('div');
	render(html`
		<nldd-notification
			variant="critical"
			text="Opslaan is mislukt"
			supporting-text="De server gaf geen antwoord."
			@dismiss=${weg}
		>
			<nldd-button
				slot="actions"
				size="sm"
				text="Probeer opnieuw"
				@click=${probeerOpnieuw}
			></nldd-button>
		</nldd-notification>
	`, houder);
	const melding = houder.querySelector('nldd-notification');
	if (melding) document.body.append(melding);
};

/**
 * Een modal dialog, sheet of venster maakt alles eromheen onbereikbaar. Een
 * melding verhuist daarom naar de bovenste overlay die openstaat, en gaat terug
 * naar de hoek van de pagina zodra die sluit. Meld een fout vóór of nadat je een
 * overlay opent. Het kruisje en "Probeer opnieuw" blijven met muis en
 * toetsenbord bereikbaar zolang de overlay openstaat.
 */
let upload: NotificationHandle | null = null;
let geteld = 0;

/** One notification that keeps up with a status, instead of a new one sliding
 *  in for every step. */
const meldVoortgang = () => {
	geteld += 1;
	const melding = { text: `${geteld} van 5 bestanden geüpload`, variant: 'neutral' as const, duration: 5000 };
	if (geteld >= 5) {
		upload?.update({ text: 'Alle bestanden zijn geüpload', variant: 'success', actions: [] });
		geteld = 0;
		upload = null;
		return;
	}
	if (upload) upload.update(melding);
	else upload = NLDDNotification.show({ ...melding, actions: [{ text: 'Annuleer', onClick: () => { geteld = 0; upload = null; } }] });
};

const meldVerwijderd = () => {
	NLDDNotification.show({
		text: 'Aanvraag A-1042 is verwijderd',
		duration: 8000,
		actions: [{
			text: 'Maak ongedaan',
			onClick: () => NLDDNotification.show({ variant: 'success', text: 'Aanvraag A-1042 is teruggezet' }),
		}],
	});
};

/**
 * `NLDDNotification.show()` toont een notificatie vanuit code, zonder element om
 * te beheren: de functie maakt het aan, toont het en ruimt het op na `dismiss`.
 * Een klik op een actie sluit de notificatie ook. Gebruik deze vorm vanuit een
 * framework, want een notificatie verplaatst zichzelf en staat daarna niet meer
 * waar het framework hem neerzette.
 *
 * De functie geeft een object terug met `dismiss()` en `update()`. Met `update()`
 * verandert de melding, komt ze vooraan te staan en begint de klok opnieuw.
 * Klik een paar keer op "Upload een bestand": het blijft één notificatie.
 */
export const VanuitCode = {
	name: 'Vanuit code',
	render: () => html`
		<nldd-button-group>
			<nldd-button
				text="Verwijder aanvraag"
				@click=${meldVerwijderd}
			></nldd-button>
			<nldd-button
				text="Upload een bestand"
				@click=${meldVoortgang}
			></nldd-button>
		</nldd-button-group>
	`,
	parameters: { controls: { disable: true } },
};

export const BovenEenOverlay = {
	// Stacked on the left, clear of the corner the notifications take, so the
	// buttons stay reachable while one is showing.
	render: () => html`
		<nldd-container
			gap="8"
			horizontal-alignment="left"
		>
			<nldd-button
				text="Meld een fout"
				@click=${meldFout}
			></nldd-button>
			<nldd-button
				text="Open modal dialog"
				@click=${openOverlay('nldd-modal-dialog')}
			></nldd-button>
			<nldd-button
				text="Open sheet"
				@click=${openOverlay('nldd-sheet')}
			></nldd-button>
			<nldd-button
				text="Open venster"
				@click=${openOverlay('nldd-window')}
			></nldd-button>
		</nldd-container>
		<nldd-modal-dialog
			text="Modal dialog"
			supporting-text="Meld een fout terwijl deze dialog openstaat."
		>
			<nldd-button
				slot="actions"
				text="Meld een fout"
				@click=${meldFout}
			></nldd-button>
			<nldd-button
				slot="actions"
				text="Sluit"
				@click=${sluitDialog}
			></nldd-button>
		</nldd-modal-dialog>
		<nldd-sheet accessible-label="Sheet">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Sheet"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-container gap="16">
						<nldd-rich-text>
							<p>Meld een fout terwijl deze sheet openstaat.</p>
						</nldd-rich-text>
						<nldd-button
							text="Meld een fout"
							@click=${meldFout}
						></nldd-button>
					</nldd-container>
				</nldd-simple-section>
			</nldd-page>
		</nldd-sheet>
		<nldd-window accessible-label="Venster">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Venster"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-container gap="16">
						<nldd-rich-text>
							<p>Meld een fout terwijl dit venster openstaat.</p>
						</nldd-rich-text>
						<nldd-button
							text="Meld een fout"
							@click=${meldFout}
						></nldd-button>
					</nldd-container>
				</nldd-simple-section>
			</nldd-page>
		</nldd-window>
	`,
	// Tall enough for a sheet and a window, which have no room in the frame the
	// docs page gives a story otherwise.
	parameters: { controls: { disable: true }, docs: { story: { height: '480px' } } },
};
