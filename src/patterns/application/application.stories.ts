import markup from './application.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Applicatie',
};

export const Standaard = patternStory(markup, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	root.querySelectorAll('nldd-navigation-split-view > nldd-split-view-pane[slot="main"] nldd-list-item').forEach((row) => {
		row.addEventListener('click', (e) => {
			e.preventDefault();
			sheet.open = true;
		});
	});
}, 480);
