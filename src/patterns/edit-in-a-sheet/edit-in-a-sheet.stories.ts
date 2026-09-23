import markup from './edit-in-a-sheet.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Bewerken in een sheet',
};

export const Standaard = patternStory(markup, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	root.querySelector('#aanvraag-bewerken')!.addEventListener('click', () => {
		sheet.open = true;
	});
});
