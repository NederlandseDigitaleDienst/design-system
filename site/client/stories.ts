/**
 * Reads the story files the way Storybook did, without Storybook.
 *
 * A story file is a module with a default export describing the component
 * (title, args, argTypes, parameters) and one named export per example. The
 * examples come in four shapes, all of which end up as "a function of args
 * that returns something to put on the page":
 *
 *   export const A = { render: (args) => html`…`, args: {…} };   // an object
 *   export const B = () => html`…`;                               // a function
 *   export const C = Template.bind({}); C.args = {…};            // a bound function
 *   export const D = patternStory(markup);                        // an object from a helper
 *
 * Only what the stories in this repository use is supported. There are no play
 * functions, decorators or loaders, so there is no code for them here.
 */

import { render as renderLit, type TemplateResult } from 'lit';

type Args = Record<string, unknown>;
type Rendered = TemplateResult | Node | string | null | undefined;

export interface ArgType {
	name?: string;
	description?: string;
	control?: string | false | { type?: string };
	options?: unknown[];
	mapping?: Record<string, unknown>;
	table?: { defaultValue?: { summary?: string }; disable?: boolean };
	if?: { arg: string; eq?: unknown; neq?: unknown; truthy?: boolean; exists?: boolean };
}

export interface StoryParameters {
	layout?: string;
	controls?: { disable?: boolean; include?: string[] };
	docs?: {
		source?: { code?: string; language?: string; transform?: (code: string) => string };
		story?: { inline?: boolean; height?: string | number; iframeHeight?: string | number };
	};
}

export interface LoadedStory {
	args: Args;
	argTypes: Record<string, ArgType>;
	parameters: StoryParameters;
	/** Whether the example needs a window of its own instead of a place on the page. */
	framed: boolean;
	render(args: Args): Rendered;
}

const modules = import.meta.glob('../../src/{components,patterns}/**/*.stories.ts');

/** Every story file, as a repository path. */
export function storyFiles(): string[] {
	return Object.keys(modules).map((key) => key.replace('../../', ''));
}

/** The names of the stories a file exports. */
export async function storyNames(file: string): Promise<string[]> {
	const module = (await modules[`../../${file}`]()) as Record<string, unknown>;
	return Object.keys(module).filter((name) => name !== 'default');
}

function merge<T extends Record<string, any>>(base: T | undefined, over: T | undefined): T {
	const result: Record<string, any> = { ...(base ?? {}) };
	for (const [key, value] of Object.entries(over ?? {})) {
		const current = result[key];
		const both = [current, value].every((v) => v && typeof v === 'object' && !Array.isArray(v));
		result[key] = both ? merge(current, value) : value;
	}
	return result as T;
}

/** @param file - the story file as a repository path, e.g. `src/components/…/tag.stories.ts` */
export async function loadStory(file: string, exportName: string): Promise<LoadedStory> {
	const load = modules[`../../${file}`];
	if (!load) throw new Error(`Geen story-bestand ${file}`);
	const module = (await load()) as Record<string, any>;
	const meta = module.default ?? {};
	const story = module[exportName];
	if (!story) throw new Error(`Geen story ${exportName} in ${file}`);

	const fn = typeof story === 'function' ? story : (story.render ?? meta.render);
	if (typeof fn !== 'function') throw new Error(`Story ${exportName} in ${file} heeft geen render.`);
	const parameters = merge<StoryParameters>(meta.parameters, story.parameters);
	return {
		args: { ...(meta.args ?? {}), ...(story.args ?? {}) },
		argTypes: merge<Record<string, ArgType>>(meta.argTypes, story.argTypes),
		parameters,
		framed: parameters.layout === 'fullscreen' || parameters.docs?.story?.inline === false,
		render: (args) => fn(args),
	};
}

/**
 * A select control may show a label that is not the value: `(geen)` for an
 * empty string. The mapping turns the label back into the value before render.
 */
export function mapArgs(args: Args, argTypes: Record<string, ArgType>): Args {
	const mapped: Args = { ...args };
	for (const [key, argType] of Object.entries(argTypes)) {
		const value = mapped[key];
		if (argType.mapping && typeof value === 'string' && value in argType.mapping) {
			mapped[key] = argType.mapping[value];
		}
	}
	return mapped;
}

/** Puts what a story returned into a container. */
export function mount(result: Rendered, container: HTMLElement): void {
	if (result instanceof Node) {
		container.replaceChildren(result);
		return;
	}
	if (typeof result === 'string') {
		container.innerHTML = result;
		return;
	}
	renderLit(result ?? null, container);
}

/**
 * The markup of an example, as a reader would type it.
 *
 * Read straight after render, before the components have updated: by then they
 * reflect internal state onto their host (a role, an inline style), and that is
 * not what a consumer writes.
 */
export function sourceOf(container: HTMLElement): string {
	const lines: string[] = [];
	const walk = (node: Node, depth: number) => {
		const indent = '\t'.repeat(depth);
		if (node.nodeType === Node.TEXT_NODE) {
			const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
			if (text) lines.push(indent + text);
			return;
		}
		if (!(node instanceof Element)) return;
		const tag = node.localName;
		const attributes = [...node.attributes]
			.filter((a) => !(a.name === 'class' && !a.value) && !(a.name === 'style' && !a.value))
			.map((a) => (a.value === '' ? a.name : `${a.name}="${a.value.replace(/"/g, '&quot;')}"`));
		const open =
			attributes.length > 1
				? `<${tag}\n${attributes.map((a) => `${indent}\t${a}`).join('\n')}\n${indent}>`
				: `<${tag}${attributes.length ? ` ${attributes[0]}` : ''}>`;
		const children = [...node.childNodes].filter(
			(child) =>
				child.nodeType === Node.ELEMENT_NODE ||
				(child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim()),
		);
		const voids = ['img', 'input', 'br', 'hr', 'source', 'meta', 'link'];
		if (voids.includes(tag)) {
			lines.push(indent + open);
			return;
		}
		if (!children.length) {
			lines.push(`${indent}${open}</${tag}>`);
			return;
		}
		if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE && attributes.length <= 1) {
			lines.push(`${indent}${open}${(children[0].textContent ?? '').replace(/\s+/g, ' ').trim()}</${tag}>`);
			return;
		}
		lines.push(indent + open);
		for (const child of children) walk(child, depth + 1);
		lines.push(`${indent}</${tag}>`);
	};
	for (const child of container.childNodes) walk(child, 0);
	return lines.join('\n');
}
