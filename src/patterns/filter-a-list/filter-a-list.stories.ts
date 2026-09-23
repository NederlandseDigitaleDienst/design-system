import markup from './filter-a-list.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Een lijst filteren',
};

export const Standaard = patternStory(markup, (root) => {
	const sheet = root.querySelector('nldd-sheet')!;
	root.querySelector('#filters-openen')!.addEventListener('click', () => {
		sheet.open = true;
	});
	sheet.querySelector('nldd-button[variant="primary"]')!.addEventListener('click', () => {
		sheet.open = false;
	});
	root.querySelectorAll('nldd-token').forEach((token) => {
		token.addEventListener('dismiss', () => token.remove());
	});
	root.querySelector('nldd-button[variant="neutral-transparent"]')!.addEventListener('click', () => {
		root.querySelectorAll('nldd-token').forEach((token) => token.remove());
	});
});
