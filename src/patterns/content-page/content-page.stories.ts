import markup from './content-page.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Contentpagina',
};

export const Standaard = patternStory(markup, undefined, 640);
