import markup from './irreversible-action.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Onomkeerbare actie',
};

export const Standaard = patternStory(markup, (root) => {
	const dialog = root.querySelector('nldd-modal-dialog')!;
	root.querySelector('#dossier-verwijderen')!.addEventListener('click', () => {
		dialog.open = true;
	});
	dialog.querySelectorAll('nldd-button').forEach((button) => {
		button.addEventListener('click', () => {
			dialog.open = false;
		});
	});
});
