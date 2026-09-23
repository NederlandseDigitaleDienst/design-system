import markup from './list-with-rows.html?raw';
import actions from './list-with-rows.actions.html?raw';
import empty from './list-with-rows.empty.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Lijst met rijen',
};

export const Standaard = patternStory(markup);

export const MeerdereActies = patternStory(actions);

export const Leeg = patternStory(empty);
