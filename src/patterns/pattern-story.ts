import '../components/index.js';

/**
 * A pattern story renders its example markup exactly as the skill ships it. The
 * markup file is the single source for the live example, the source block on
 * the docs page and the generated page in the skill
 * (scripts/generate-skill-patterns.js), so the three cannot drift apart.
 *
 * `wire` adds what a consumer writes in their own code, such as opening a
 * sheet from a button. It is not part of the markup, because that code
 * belongs to the consumer's framework.
 *
 * `frame` renders the story in an iframe of that height on the docs page. An
 * nldd-app-view is at least as tall as the viewport, so inline on the page it
 * would stretch it; in a frame of its own it behaves as it does in an app. The
 * wrapper then takes the viewport height, which in an app comes from
 * document-reset.css, a stylesheet Storybook does not load.
 */
export function patternStory(markup: string, wire?: (root: HTMLElement) => void, frame?: number) {
	return {
		render: () => {
			const root = document.createElement('div');
			if (frame) root.style.height = '100dvh';
			else root.style.display = 'contents';
			root.innerHTML = markup;
			wire?.(root);
			return root;
		},
		parameters: {
			...(frame ? { layout: 'fullscreen' } : {}),
			docs: {
				source: { code: markup.trim(), language: 'html' },
				...(frame ? { story: { inline: false, iframeHeight: frame } } : {}),
			},
		},
	};
}
