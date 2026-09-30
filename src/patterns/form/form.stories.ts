import markup from './form.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Formulier',
};

export const Standaard = patternStory(markup, (root) => {
	root.addEventListener('submit', (event) => event.preventDefault());
});
