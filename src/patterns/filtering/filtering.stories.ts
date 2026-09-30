import markup from './filtering.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Filteren',
};

export const Standaard = patternStory(markup, (root) => {
	const section = root.querySelector('nldd-sidebar-section')!;
	const zijbalk = section as HTMLElement & { show(): void; toggle(): void };
	root.querySelector('#filters-openen nldd-button')!.addEventListener('click', () => {
		zijbalk.toggle();
	});
	// Loopt de werkbalk over, dan staat "Filters" in het overflow-menu. Dat toont
	// een kopie, maar meldt de keuze als `select` op het origineel hieronder.
	root.querySelector('#filters-openen nldd-menu-item')!.addEventListener('select', () => {
		zijbalk.show();
	});
	// De rij houdt zijn eigen `checked` bij; het vinkje erin is alleen weergave,
	// dus de app zet die mee. Zie het patroon.
	root.querySelectorAll('[slot="sidebar"] nldd-list-item').forEach((rij) => {
		rij.addEventListener('change', () => {
			const vinkje = rij.querySelector('nldd-checkbox') as HTMLElement & { checked: boolean };
			vinkje.checked = (rij as HTMLElement & { checked: boolean }).checked;
		});
	});
	// De strip met actieve filters bestaat alleen zolang er filters zijn, en de
	// ruimte erboven dus ook: anders blijft er een gat staan waar hij stond.
	const strip = root.querySelector('nldd-container[layout="wrap"]') as HTMLElement;
	const ruimteBoven = strip.previousElementSibling as HTMLElement;
	root.querySelectorAll('nldd-token').forEach((token) => {
		token.addEventListener('dismiss', () => {
			token.remove();
			if (strip.querySelector('nldd-token')) return;
			strip.hidden = true;
			ruimteBoven.hidden = true;
		});
	});
}, 640);
