import markup from './list.html?raw';
import actions from './list.actions.html?raw';
import tree from './list.tree.html?raw';
import empty from './list.empty.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Lijst',
};

export const Standaard = patternStory(markup);

export const MeerdereActies = patternStory(actions);

export const Boom = patternStory(tree, (root) => {
	root.querySelectorAll('nldd-list-item[slot="children"]').forEach((kind) => {
		const tak = kind.parentElement as HTMLElement & { expanded: boolean };
		tak.querySelector('nldd-list-item-segment[disclosure]')!.addEventListener('click', () => {
			tak.toggleAttribute('expanded');
		});
	});
});

export const Leeg = patternStory(empty);
