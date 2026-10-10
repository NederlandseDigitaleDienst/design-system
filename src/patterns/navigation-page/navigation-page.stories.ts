import markup from './navigation-page.html?raw';
import cards from './navigation-page.cards.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: "Patronen/Pagina's/Navigatiepagina",
};

export const Standaard = patternStory(markup, undefined, 640);

export const Kaarten = patternStory(cards, undefined, 640);
