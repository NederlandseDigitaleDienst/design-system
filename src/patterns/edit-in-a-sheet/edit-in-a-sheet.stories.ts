import markup from './edit-in-a-sheet.html?raw';
import step from './edit-in-a-sheet.step.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Algemeen/Bewerken in een sheet',
};

export const Standaard = patternStory(markup, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	root.querySelectorAll('nldd-list-item').forEach((row) => {
		row.addEventListener('click', () => {
			sheet.open = true;
		});
	});
}, 520);

type Rij = HTMLElement & { selected: boolean };

export const EenStapVerder = patternStory(step, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	const paginas = [...sheet.querySelectorAll('nldd-page')];
	const team = sheet.querySelector<HTMLElement>('#team')!;
	const teamRij = sheet.querySelector<HTMLElement>('#team-kiezen')!;
	const teamCel = teamRij.querySelector('nldd-text-cell')!;

	// Welke pagina in beeld is, houdt de app bij. Onthoud de rij die de stap
	// opende: in Safari geeft een klik geen focus, dus focus onthouden werkt niet.
	let opener: HTMLElement | null = null;
	const toon = (id: string) => {
		paginas.forEach((pagina) => { pagina.hidden = pagina.id !== id; });
	};
	const terug = () => {
		toon('aanvraag');
		opener?.focus();
	};

	root.querySelector(':scope > nldd-page nldd-list-item')!.addEventListener('click', () => {
		toon('aanvraag');
		sheet.open = true;
	});
	teamRij.addEventListener('click', () => {
		opener = teamRij;
		toon('team');
		team.querySelector<HTMLElement>('nldd-list-item[selected]')?.focus();
	});
	// De terugknop van de stap vuurt back; een keuze gaat dezelfde weg terug.
	team.addEventListener('back', terug);

	const opties = [...team.querySelectorAll('nldd-list-item')] as Rij[];
	opties.forEach((optie) => {
		optie.addEventListener('click', () => {
			opties.forEach((o) => { o.selected = o === optie; });
			teamCel.setAttribute('supporting-text', optie.querySelector('nldd-text-cell')!.getAttribute('text')!);
			terug();
		});
	});
}, 520);
