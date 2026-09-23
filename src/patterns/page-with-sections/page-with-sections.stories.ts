import markup from './page-with-sections.html?raw';
import appShell from './page-with-sections.app-shell.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Pagina met secties',
};

export const Standaard = patternStory(markup, undefined, 560);

export const AppShell = patternStory(appShell, undefined, 480);
