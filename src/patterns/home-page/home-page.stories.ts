import markup from './home-page.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: "Patronen/Pagina's/Home",
};

export const Standaard = patternStory(markup, undefined, 640);
