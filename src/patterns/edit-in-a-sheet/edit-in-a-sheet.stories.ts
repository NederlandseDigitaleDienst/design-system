import markup from './edit-in-a-sheet.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Bewerken in een sheet',
};

export const Standaard = patternStory(markup, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	root.querySelectorAll('nldd-list-item').forEach((row) => {
		row.addEventListener('click', () => {
			sheet.open = true;
		});
	});
}, 520);
