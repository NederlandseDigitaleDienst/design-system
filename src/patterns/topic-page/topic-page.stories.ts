import markup from './topic-page.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: "Patronen/Pagina's/Onderwerppagina",
};

export const Standaard = patternStory(markup, undefined, 640);
