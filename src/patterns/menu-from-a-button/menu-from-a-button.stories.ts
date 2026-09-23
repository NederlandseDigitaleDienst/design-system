import markup from './menu-from-a-button.html?raw';
import choice from './menu-from-a-button.choice.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Menu bij een knop',
};

export const Standaard = patternStory(markup);

export const Keuzemenu = patternStory(choice);
