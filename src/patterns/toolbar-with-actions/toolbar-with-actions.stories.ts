import markup from './toolbar-with-actions.html?raw';
import tabs from './toolbar-with-actions.tabs.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Werkbalk met acties',
};

export const Standaard = patternStory(markup);

export const MetTabbalk = patternStory(tabs, (root) => {
	const tabItems = [...root.querySelectorAll('nldd-tab-bar-item')];
	const menuItems = [...root.querySelectorAll<HTMLElement & { selected: boolean; text: string }>('nldd-menu-group nldd-menu-item')];
	const show = (text: string) => {
		tabItems.forEach((tab) => { tab.current = tab.text === text; });
		menuItems.forEach((item) => { item.selected = item.text === text; });
	};
	root.querySelector('nldd-tab-bar')!.addEventListener('tabchange', (e) => {
		show((e as CustomEvent<{ item: HTMLElement & { text: string } }>).detail.item.text);
	});
	menuItems.forEach((item) => item.addEventListener('select', () => show(item.text)));
});
