import { it } from 'vitest';
import { commands } from 'vitest/browser';
import '../../src/assets/styles/variables.css';
import { loadStory, mapArgs, mount, sourceOf, storyFiles, storyNames } from '../../www/client/stories.js';
import { withContext, type StoryContext } from '../../www/client/runtime.js';

/**
 * Writes the markup of every story, as the code block on the site shows it, to
 * scripts/perf/out/stories.json. The perf pages repeat that markup N times.
 *
 *   npx vitest run --config scripts/perf/vitest.config.ts
 */
it('extracts the markup of every story', async () => {
	const stories: { file: string; name: string; component: string; markup: string }[] = [];
	for (const file of storyFiles()) {
		if (!file.startsWith('src/components/')) continue;
		const component = file.split('/').at(-2)!;
		for (const name of await storyNames(file)) {
			const container = document.createElement('div');
			document.body.append(container);
			try {
				const story = await loadStory(file, name);
				const context: StoryContext = { args: story.args, updateArgs: () => {}, log: () => {} };
				mount(withContext(context, () => story.render(mapArgs(story.args, story.argTypes))), container);
				const markup = sourceOf(container);
				if (markup.includes('<nldd-')) stories.push({ file, name, component, markup });
			} catch {
				// A story that needs more than its markup is not a perf page.
			}
			await new Promise((done) => setTimeout(done, 0));
			container.remove();
		}
	}
	await commands.writeFile('scripts/perf/out/stories.json', JSON.stringify(stories, null, '\t'));
}, 600_000);
