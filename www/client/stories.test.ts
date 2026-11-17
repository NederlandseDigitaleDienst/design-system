import { describe, it, expect, afterEach } from 'vitest';
import '../../src/assets/styles/variables.css';
import { loadStory, mapArgs, mount, sourceOf, storyFiles, storyNames } from './stories.js';
import { withContext, type StoryContext } from './runtime.js';

/**
 * Every story in the repository goes through the same reader the site uses.
 * A story that throws, or renders nothing, fails here instead of showing an
 * empty stage on a page nobody happened to open.
 */
describe('stories', () => {
	let container: HTMLElement | undefined;

	afterEach(() => {
		container?.remove();
		container = undefined;
	});

	const files = storyFiles();

	it('finds the story files', () => {
		expect(files.length).toBeGreaterThan(100);
	});

	for (const file of files) {
		it(`renders every story in ${file}`, async () => {
			const names = await storyNames(file);
			expect(names.length).toBeGreaterThan(0);
			for (const name of names) {
				const story = await loadStory(file, name);
				container = document.createElement('div');
				document.body.append(container);
				const context: StoryContext = { args: story.args, updateArgs: () => {}, log: () => {} };
				mount(withContext(context, () => story.render(mapArgs(story.args, story.argTypes))), container);
				expect(container.childNodes.length, `${name} renders nothing`).toBeGreaterThan(0);
				// Let the components finish their first update while they are still
				// on the page; an overlay that opens itself cannot do so once removed.
				await new Promise((done) => setTimeout(done, 0));
				container.remove();
				container = undefined;
			}
		});
	}

	it('writes the markup of an example the way a reader would type it', () => {
		const scratch = document.createElement('div');
		scratch.innerHTML = '<nldd-button appearance="primary" text="Bewaar" disabled></nldd-button><p> Hallo </p>';
		expect(sourceOf(scratch)).toBe(
			'<nldd-button\n\tappearance="primary"\n\ttext="Bewaar"\n\tdisabled\n></nldd-button>\n<p>Hallo</p>',
		);
	});
});
