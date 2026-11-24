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

type Stap = HTMLElement & { show(): void; back(): void };
type Rij = HTMLElement & { selected: boolean };

export const EenStapVerder = patternStory(step, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	const aanvraag = root.querySelector('#aanvraag') as Stap;
	const team = root.querySelector('#team') as Stap;
	const teamCel = root.querySelector('#team-kiezen nldd-text-cell')!;

	root.querySelector(':scope > nldd-page nldd-list-item')!.addEventListener('click', () => {
		aanvraag.show();
		sheet.open = true;
	});
	root.querySelector('#team-kiezen')!.addEventListener('click', () => team.show());

	// Een keuze gaat terug zoals de terugknop: back() toont de aanvraag en zet
	// de focus op de rij die de stap opende.
	const opties = [...team.querySelectorAll('nldd-list-item')] as Rij[];
	opties.forEach((optie) => {
		optie.addEventListener('click', () => {
			opties.forEach((o) => { o.selected = o === optie; });
			teamCel.setAttribute('supporting-text', optie.querySelector('nldd-text-cell')!.getAttribute('text')!);
			team.back();
		});
	});
}, 520);
