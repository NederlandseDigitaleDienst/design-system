/**
 * One story on a page of its own, with nothing of the site around it.
 *
 * This is where an example runs when it needs the whole window: an
 * nldd-app-view, a page with a navigation bar, an overlay. It loads the
 * stylesheets the way an application does, so the example behaves here as it
 * does for a consumer. A stage shows this page in a frame, and "Open los" on a
 * stage opens it in a tab.
 *
 * The address is `/voorbeeld/?file=<story file>&story=<export>`.
 */

import '../../src/components/index.js';
import { loadStory, mapArgs, mount, sourceOf, type LoadedStory } from './stories.js';
import { withContext, type StoryContext } from './runtime.js';
import { keepInPlace } from './stage.js';

const params = new URLSearchParams(location.search);
const file = params.get('file') ?? '';
const name = params.get('story') ?? '';
const root = document.createElement('div');
root.className = 'site-frame__root';
document.body.append(root);

const scheme = params.get('scheme');
if (scheme) document.documentElement.dataset.scheme = scheme;

const overrides = new Map<string, { tag: string; value: string | boolean }>();
let story: LoadedStory | undefined;
let args: Record<string, unknown> = {};

function tell(message: Record<string, unknown>): void {
	if (parent !== window) parent.postMessage({ site: 'stage', ...message }, location.origin);
}

function applyOverrides(container: ParentNode): void {
	for (const [attribute, { tag, value }] of overrides) {
		const target = container.querySelector(tag);
		if (!target) continue;
		if (typeof value === 'boolean') target.toggleAttribute(attribute, value);
		else if (value === '') target.removeAttribute(attribute);
		else target.setAttribute(attribute, value);
	}
}

function draw(): void {
	if (!story) return;
	const current = story;
	const context: StoryContext = {
		args,
		updateArgs: (changes) => {
			args = { ...args, ...changes };
			draw();
		},
		log: (event, detail) => tell({ type: 'event', name: event, detail }),
	};
	mount(withContext(context, () => current.render(mapArgs(args, current.argTypes))), root);
	applyOverrides(root);

	if (current.parameters.docs?.source?.code) return;
	const scratch = document.createElement('div');
	const silent: StoryContext = { args, updateArgs: () => {}, log: () => {} };
	mount(withContext(silent, () => current.render(mapArgs(args, current.argTypes))), scratch);
	applyOverrides(scratch);
	tell({ type: 'source', code: sourceOf(scratch) });
}

addEventListener('message', (event) => {
	if (event.source !== parent || event.data?.site !== 'stage') return;
	const message = event.data;
	if (message.type === 'scheme') document.documentElement.dataset.scheme = message.scheme;
	if (message.type === 'args') {
		args = message.args;
		draw();
	}
	if (message.type === 'attribute') {
		overrides.set(message.name, { tag: message.tag, value: message.value });
		draw();
	}
});

try {
	story = await loadStory(file, name);
	args = { ...story.args };
	if (story.parameters.layout !== 'fullscreen') root.classList.add('site-frame__root--padded');
	keepInPlace(root);
	draw();
} catch (error) {
	root.textContent = `Dit voorbeeld kon niet geladen worden: ${(error as Error).message}`;
}
