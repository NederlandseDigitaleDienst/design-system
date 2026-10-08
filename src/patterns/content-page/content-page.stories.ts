import markup from './content-page.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: "Patronen/Pagina's/Contentpagina",
};

type Zijbalk = HTMLElement & { collapsed: boolean; show(): void; hide(): void };

export const Standaard = patternStory(markup, (root) => {
	const zijbalk = root.querySelector('nldd-sidebar-section') as Zijbalk;
	const knop = root.querySelector('#inhoud-openen') as HTMLElement & { expanded: boolean };
	const rijen = [...root.querySelectorAll('[slot="sidebar"] nldd-list-item')] as (HTMLElement & { current: boolean })[];
	const koppen = rijen.map((rij) => root.querySelector(rij.getAttribute('href')!) as HTMLElement);

	knop.addEventListener('click', () => zijbalk.show());
	zijbalk.addEventListener('open', () => { knop.expanded = true; });
	zijbalk.addEventListener('close', () => { knop.expanded = false; });

	// In de sheet sluit een keuze eerst de sheet, en springt dan pas naar de kop:
	// anders scrolt de pagina onder een sheet die nog openstaat. De sheet zet de
	// focus bij het sluiten terug op de knop, dus de sprong komt daarna.
	rijen.forEach((rij, i) => {
		rij.addEventListener('click', (event) => {
			if (!zijbalk.collapsed) return;
			event.preventDefault();
			zijbalk.addEventListener('close', () => queueMicrotask(() => {
				const kop = koppen[i];
				kop.tabIndex = -1;
				kop.scrollIntoView();
				kop.focus({ preventScroll: true });
				history.replaceState(null, '', rij.getAttribute('href'));
			}), { once: true });
			zijbalk.hide();
		});
	});

	// De rij van de kop die je leest is `current`: de laatste kop die boven het
	// bovenste derde van het venster is gekomen, en anders de eerste.
	const markeer = () => {
		const lijn = window.innerHeight / 3;
		const voorbij = koppen.filter((kop) => kop.getBoundingClientRect().top <= lijn).length;
		const actief = Math.max(voorbij - 1, 0);
		rijen.forEach((rij, i) => { rij.current = i === actief; });
	};
	const kijker = new IntersectionObserver(markeer, { rootMargin: '0px 0px -67% 0px' });
	koppen.forEach((kop) => kijker.observe(kop));
}, 640);
