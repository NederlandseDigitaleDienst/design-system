import markup from './content-page.html?raw';
import short from './content-page.short.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: "Patronen/Pagina's/Contentpagina",
};

type Zijbalk = HTMLElement & { show(): void };

export const Standaard = patternStory(markup, (root) => {
	const zijbalk = root.querySelector('nldd-sidebar-section') as Zijbalk;
	const knop = root.querySelector('#inhoud-openen') as HTMLElement & { expanded: boolean };
	const rijen = [...root.querySelectorAll('[slot="sidebar"] nldd-list-item')] as (HTMLElement & { current: boolean })[];
	const koppen = rijen.map((rij) => root.querySelector(rij.getAttribute('href')!) as HTMLElement);

	knop.addEventListener('click', () => zijbalk.show());
	zijbalk.addEventListener('open', () => { knop.expanded = true; });
	zijbalk.addEventListener('close', () => { knop.expanded = false; });

	// Een keuze in de sheet regelt de sectie zelf: hij sluit de sheet en zet de
	// focus daarna op de kop.

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

export const ZonderInhoudsopgave = patternStory(short, undefined, 640);
