/**
 * The stage: the frame a live example stands on.
 *
 * The site is built with the components it documents, so without a frame a
 * reader cannot tell an example from the page around it. Everything live
 * stands on a stage, and nothing else does. What marks the border is the mat:
 * a dotted field around the canvas, the one thing here that is not from the
 * system. Everything around it (the bar, the controls, the code) is built with
 * the components themselves, and the canvas inside it is a real surface of the
 * system, so the example looks as it does in an application.
 *
 * A stage owns three things the page does not: its color scheme, its surface
 * and, for an example that needs a window of its own, its width. That keeps the
 * page from leaking into the example, and makes the border between the two
 * visible the moment one of them is switched.
 */

import '../../src/components/actions/button/button.js';
import '../../src/components/content/text/text.js';
import '../../src/components/content/title/title.js';
import '../../src/components/inputs/segmented-control/segmented-control.js';
import '../../src/components/layout/box/box.js';
import '../../src/components/layout/container/container.js';
import '../../src/components/layout/divider/divider.js';
import { loadStory, mapArgs, mount, sourceOf, type ArgType, type LoadedStory } from './stories.js';
import { withContext, type StoryContext } from './runtime.js';

interface AttributeControl {
	name: string;
	kind: 'boolean' | 'number' | 'select' | 'text';
	values?: string[];
	strict?: boolean;
	default?: string;
	description: string;
}

interface ControlsData {
	tag: string;
	attributes: AttributeControl[];
}

type Args = Record<string, unknown>;

const WIDTHS: [label: string, width: string][] = [
	['Smal', '360px'],
	['Midden', '768px'],
	['Vol', '100%'],
];

/** The controls start open while they leave the examples below them within reach. */
const OPEN_UP_TO = 8;

/** A choice from a handful of options is shown whole; a longer one is a list. */
const SHOWN_WHOLE = { options: 4, characters: 28 };

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function element<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className: string,
	text?: string,
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

/** An element of the design system, with its attributes. */
function nldd(tag: string, attributes: Record<string, string | boolean> = {}, children: Node[] = []): HTMLElement {
	const node = document.createElement(`nldd-${tag}`);
	for (const [name, value] of Object.entries(attributes)) {
		if (typeof value === 'boolean') node.toggleAttribute(name, value);
		else node.setAttribute(name, value);
	}
	node.append(...children);
	return node;
}

/** A section of the stage below the mat, with the inset every section shares. */
function section(className: string, children: Node[]): HTMLElement {
	const container = nldd('container', { padding: '16', gap: '12' }, children);
	container.classList.add(className);
	return container;
}

/** A description from JSDoc, with its backticks as code. */
function described(text: string): Node[] {
	return text.split('`').map((part, index) => (index % 2 ? element('code', '', part) : new Text(part)));
}

function siteIsDark(): boolean {
	const explicit = document.documentElement.dataset.scheme;
	if (explicit) return explicit === 'dark';
	return matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Stops an example from taking the reader away from the page it is on. */
export function keepInPlace(root: HTMLElement): void {
	root.addEventListener(
		'click',
		(event) => {
			const link = event
				.composedPath()
				.find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement && node.hasAttribute('href'));
			if (link) event.preventDefault();
		},
		true,
	);
	root.addEventListener('submit', (event) => event.preventDefault(), true);
}

export class SiteStage extends HTMLElement {
	private story?: LoadedStory;
	private args: Args = {};
	private overrides = new Map<string, string | boolean>();
	private controls?: ControlsData;
	private canvas = element('div', 'site-stage__canvas');
	private frame?: HTMLIFrameElement;
	private code?: HTMLElement;
	private box = nldd('box');
	private events = nldd('container', { list: true, gap: '4' });
	private eventLog = section('site-stage__events', [this.events]);
	private dark = siteIsDark();
	private tinted = false;
	private reserved = { width: 0, height: 0 };
	private reserving = 0;
	/** Each value of each choice in the controls: what the example can be set to. */
	private variants: { name: string; arg?: string; value: string }[] = [];
	private started = false;

	connectedCallback(): void {
		if (this.started) return;
		this.started = true;
		void this.start();
	}

	private async start(): Promise<void> {
		const data = this.querySelector(':scope > script[type="application/json"]');
		if (data) this.controls = JSON.parse(data.textContent ?? 'null') ?? undefined;

		if (this.hasAttribute('inline-markup')) {
			this.canvas.innerHTML = this.innerHTML;
			this.build({ tools: true });
			return;
		}

		const file = this.getAttribute('file') ?? '';
		const name = this.getAttribute('story') ?? '';
		try {
			this.story = await loadStory(file, name);
		} catch (error) {
			this.build({ tools: false });
			this.canvas.textContent = `Dit voorbeeld kon niet geladen worden: ${(error as Error).message}`;
			return;
		}
		this.args = { ...this.story.args };

		if (this.hasAttribute('bare')) {
			this.replaceChildren();
			this.draw(this);
			return;
		}
		if (this.story.framed) this.buildFrame(file, name);
		this.build({ tools: true });
		if (!this.story.framed) this.draw(this.canvas);
		this.showSource();
		void this.buildControls();
	}

	private get context(): StoryContext {
		return {
			args: this.args,
			updateArgs: (changes) => {
				this.args = { ...this.args, ...changes };
				this.draw(this.canvas);
			},
			log: (name, detail) => this.log(name, detail),
		};
	}

	private draw(container: HTMLElement): void {
		if (!this.story) return;
		const story = this.story;
		const result = withContext(this.context, () => story.render(mapArgs(this.args, story.argTypes)));
		mount(result, container);
		this.applyOverrides(container);
	}

	private applyOverrides(root: ParentNode): void {
		if (!this.controls) return;
		const target = root.querySelector(this.controls.tag);
		if (!target) return;
		for (const [name, value] of this.overrides) {
			if (typeof value === 'boolean') target.toggleAttribute(name, value);
			else if (value === '') target.removeAttribute(name);
			else target.setAttribute(name, value);
		}
	}

	private log(name: string, detail: unknown): void {
		const item = nldd('text', { size: 'sm', color: 'secondary', text: detail ? `${name} ${detail}` : name });
		this.events.prepend(item);
		while (this.events.children.length > 4) this.events.lastElementChild?.remove();
		this.eventLog.hidden = false;
	}

	private buildFrame(file: string, name: string): void {
		const base = import.meta.env.BASE_URL;
		const frame = element('iframe', 'site-stage__frame');
		const height = this.story?.parameters.docs?.story?.height ?? this.story?.parameters.docs?.story?.iframeHeight ?? 480;
		frame.style.height = typeof height === 'number' ? `${height}px` : height;
		frame.title = `Voorbeeld: ${this.getAttribute('name') ?? name}`;
		frame.loading = 'lazy';
		frame.src = `${base}voorbeeld/?file=${encodeURIComponent(file)}&story=${encodeURIComponent(name)}&scheme=${this.dark ? 'dark' : 'light'}`;
		this.frame = frame;
		addEventListener('message', (event) => {
			if (event.source !== frame.contentWindow || event.data?.site !== 'stage') return;
			if (event.data.type === 'event') this.log(event.data.name, event.data.detail);
			if (event.data.type === 'source') void this.setSource(event.data.code);
		});
	}

	private post(message: Record<string, unknown>): void {
		this.frame?.contentWindow?.postMessage({ site: 'stage', ...message }, location.origin);
	}

	/** One choice between a few named options, shown whole. */
	private choice(
		name: string,
		options: [label: string, value: string][],
		selected: string,
		onChange: (value: string) => void,
	): HTMLElement {
		const control = nldd(
			'segmented-control',
			{ size: 'sm', appearance: 'neutral-base', width: 'fit-content', 'accessible-label': name, value: selected },
			options.map(([text, value]) => nldd('segmented-control-item', { text, value })),
		);
		control.addEventListener('change', (event) => onChange((event as CustomEvent<{ value: string }>).detail.value));
		return control;
	}

	private build({ tools }: { tools: boolean }): void {
		const name = this.getAttribute('name') ?? '';
		const bar = element('div', 'site-stage__bar');
		bar.append(nldd('title', { overline: 'Voorbeeld', text: name }));
		const toolbar = nldd('container', { layout: 'wrap', gap: '8', width: 'fit-content', 'vertical-alignment': 'center' });
		if (tools) {
			toolbar.append(
				this.choice(
					`Kleurenschema van ${name}`,
					[
						['Licht', 'light'],
						['Donker', 'dark'],
					],
					this.dark ? 'dark' : 'light',
					(scheme) => {
						this.dark = scheme === 'dark';
						this.canvas.style.colorScheme = scheme;
						this.post({ type: 'scheme', scheme });
					},
				),
			);
			if (!this.frame) {
				toolbar.append(
					this.choice(
						`Ondergrond van ${name}`,
						[
							['Basis', 'base'],
							['Getint', 'tinted'],
						],
						'base',
						(surface) => {
							this.tinted = surface === 'tinted';
							this.canvas.dataset.surface = surface;
						},
					),
				);
			} else {
				toolbar.append(
					this.choice(
						`Breedte van ${name}`,
						WIDTHS.map(([label, width]) => [label, width]),
						'100%',
						(width) => {
							this.frame!.style.width = width;
						},
					),
				);
			}
			const file = this.getAttribute('file');
			if (file) {
				toolbar.append(
					nldd('button', {
						size: 'sm',
						appearance: 'neutral-base',
						text: 'Open los',
						href: `${import.meta.env.BASE_URL}voorbeeld/?file=${encodeURIComponent(file)}&story=${encodeURIComponent(this.getAttribute('story') ?? '')}`,
						target: '_blank',
					}),
				);
			}
		}
		bar.append(toolbar);

		const mat = element('div', 'site-stage__mat');
		this.canvas.dataset.surface = 'base';
		if (this.frame) {
			mat.classList.add('site-stage__mat--frame');
			mat.append(this.frame);
		} else {
			keepInPlace(this.canvas);
			mat.append(this.canvas);
		}
		// An example wider than the stage scrolls sideways. A region that scrolls
		// must be reachable by keyboard, but only then: a tab stop on every
		// stage of a page would be noise.
		new ResizeObserver(() => {
			const scrolls = mat.scrollWidth > mat.clientWidth + 1;
			if (scrolls === mat.hasAttribute('tabindex')) return;
			if (scrolls) {
				mat.tabIndex = 0;
				mat.setAttribute('role', 'group');
				mat.setAttribute('aria-label', `Voorbeeld ${this.getAttribute('name') ?? ''}, schuift horizontaal`);
			} else {
				mat.removeAttribute('tabindex');
				mat.removeAttribute('role');
				mat.removeAttribute('aria-label');
			}
			this.holdHeight();
		}).observe(this.canvas);
		this.eventLog.hidden = true;
		this.events.setAttribute('aria-label', `Events van ${name}`);
		this.box.replaceChildren(bar, mat, this.eventLog);
		this.replaceChildren(this.box);
	}

	/**
	 * The canvas keeps the tallest height it has had at this width, so the page
	 * below it does not move when an option makes the example shorter again.
	 */
	private holdHeight(): void {
		const { offsetWidth: width, offsetHeight: height } = this.canvas;
		if (width !== this.reserved.width) {
			this.reserved = { width, height: 0 };
			this.canvas.style.minHeight = '';
			clearTimeout(this.reserving);
			this.reserving = window.setTimeout(() => void this.reserveHeight(), 200);
			return;
		}
		this.reserve(height);
	}

	private reserve(height: number): void {
		if (height <= this.reserved.height) return;
		this.reserved.height = height;
		this.canvas.style.minHeight = `${height}px`;
	}

	/**
	 * Makes room for the tallest variant before the reader picks it: the example
	 * is drawn once per value of each choice, out of sight and at the width of
	 * the canvas. One choice at a time, so a combination can still be taller;
	 * holdHeight() catches that the first time it shows.
	 */
	private async reserveHeight(): Promise<void> {
		const story = this.story;
		if (!story || this.frame || !this.variants.length) return;
		const probe = element('div', 'site-stage__canvas site-stage__probe');
		probe.inert = true;
		probe.dataset.surface = this.canvas.dataset.surface;
		probe.style.width = `${this.canvas.offsetWidth}px`;
		this.canvas.after(probe);
		const silent = (args: Args): StoryContext => ({ args, updateArgs: () => {}, log: () => {} });
		for (const variant of this.variants) {
			const args = variant.arg ? { ...this.args, [variant.arg]: variant.value } : this.args;
			mount(withContext(silent(args), () => story.render(mapArgs(args, story.argTypes))), probe);
			this.applyOverrides(probe);
			if (!variant.arg) probe.querySelector(this.controls?.tag ?? ':not(*)')?.setAttribute(variant.name, variant.value);
			// Components draw after their update, one task later.
			await new Promise((resolve) => setTimeout(resolve));
			this.reserve(probe.offsetHeight);
		}
		probe.remove();
	}

	private async setSource(code: string): Promise<void> {
		if (!this.story || !code) return;
		const transform = this.story.parameters.docs?.source?.transform;
		// A suppression is for the linter, not for whoever copies the example.
		const shown = code.replace(/\s*<!-- nldd-lint-disable-next-line[\s\S]*?-->/g, '');
		const text = transform ? transform(shown) : shown;
		// The code viewer is loaded when the first example needs it, and is on
		// the page only once it is defined: a page without examples does not pay
		// for it, and an element that is not yet defined would hide the page.
		await import('../../src/components/content/code-viewer/code-viewer.js');
		if (!this.code) {
			this.code = document.createElement('nldd-code-viewer');
			this.code.setAttribute('language', this.story.parameters.docs?.source?.language ?? 'html');
			this.code.setAttribute('appearance', 'simple');
			this.code.setAttribute('max-height', '420px');
			// The code closes the stage, below the controls, whichever of the two
			// arrives first: a framed example reports its markup later.
			this.box.append(nldd('divider'), section('site-stage__code', [this.code]));
		}
		this.code.textContent = text;
	}

	/**
	 * The markup shown under an example is rendered a second time, into a
	 * container that is never on the page. Components only update once they are
	 * connected, so this copy holds exactly what the story wrote.
	 */
	private showSource(): void {
		if (!this.story) return;
		const given = this.story.parameters.docs?.source?.code;
		if (given) {
			void this.setSource(given);
			return;
		}
		if (this.frame) return;
		const scratch = document.createElement('div');
		const story = this.story;
		const silent: StoryContext = { args: this.args, updateArgs: () => {}, log: () => {} };
		mount(withContext(silent, () => story.render(mapArgs(this.args, story.argTypes))), scratch);
		this.applyOverrides(scratch);
		void this.setSource(sourceOf(scratch));
	}

	private setOverride(name: string, value: string | boolean): void {
		this.overrides.set(name, value);
		if (this.frame) this.post({ type: 'attribute', tag: this.controls?.tag, name, value });
		else this.applyOverrides(this.canvas);
		this.showSource();
	}

	private setArg(key: string, value: unknown): void {
		this.args = { ...this.args, [key]: value };
		if (this.frame) this.post({ type: 'args', args: this.args });
		else this.draw(this.canvas);
		this.showSource();
	}

	private async buildControls(): Promise<void> {
		const story = this.story;
		if (!story || !this.hasAttribute('primary') || story.parameters.controls?.disable) return;
		const attributes = this.controls?.attributes ?? [];
		const target = this.frame ? null : this.canvas.querySelector(this.controls?.tag ?? ':not(*)');

		// What the story file says about an attribute, by attribute name: a Dutch
		// description, and the arg that feeds it. Everything in argTypes that is
		// not an attribute (the text in a slot, the number of items) is content.
		const known = new Map<string, { key: string; argType: ArgType }>();
		for (const [key, argType] of Object.entries(story.argTypes)) {
			known.set(argType.name ?? kebab(key), { key, argType });
		}
		const names = new Set(attributes.map((a) => a.name));
		const content = [...known].filter(
			([name, { argType }]) => !names.has(name) && argType.control !== false && argType.control !== 'none',
		);
		if (!attributes.length && !content.length) return;

		// Only the first example of a page has controls, so only that one loads
		// the form components.
		await Promise.all([
			import('../../src/components/content/accordion/accordion.js'),
			import('../../src/components/forms/form/form.js'),
			import('../../src/components/forms/form-field/form-field.js'),
			import('../../src/components/inputs/switch/switch.js'),
			import('../../src/components/inputs/dropdown/dropdown.js'),
			import('../../src/components/inputs/number-field/number-field.js'),
			import('../../src/components/inputs/text-field/text-field.js'),
			import('../../src/components/inputs/combo-box/combo-box.js'),
			import('../../src/components/actions/menu/menu.js'),
			import('../../src/components/actions/menu/menu-item.js'),
		]);

		const form = nldd('form', { 'label-alignment': 'left', novalidate: true });
		form.addEventListener('submit', (event) => event.preventDefault());

		const row = (name: string, input: HTMLElement, description: string) => {
			const field = nldd('form-field', { label: name }, [input]);
			if (description) field.append(nldd('form-field-help-text', {}, described(description)));
			form.append(field);
		};

		for (const attribute of attributes) {
			const fromStory = known.get(attribute.name);
			// An attribute the story feeds from an arg follows that arg, so the
			// two cannot disagree; every other attribute is set on the element.
			const fromArg = fromStory && fromStory.key in story.args ? fromStory.key : undefined;
			const start = fromArg
				? story.args[fromArg]
				: attribute.kind === 'boolean'
					? (target?.hasAttribute(attribute.name) ?? false)
					: (target?.getAttribute(attribute.name) ?? '');
			const change = (value: string | boolean) => {
				if (fromArg) this.setArg(fromArg, attribute.kind === 'number' && value !== '' ? Number(value) : value);
				else this.setOverride(attribute.name, value);
			};
			const choices = fromStory?.argType.options?.map(String) ?? (attribute.kind === 'select' ? attribute.values : undefined);
			// A label of the story stands for a value it maps itself, so only plain values are tried.
			if (!fromStory?.argType.mapping) {
				for (const value of choices ?? []) this.variants.push({ name: attribute.name, arg: fromArg, value });
			}
			row(
				attribute.name,
				this.input(attribute, start, change, fromStory?.argType),
				fromStory?.argType.description ?? attribute.description,
			);
		}
		for (const [name, { key, argType }] of content) {
			const type = typeof argType.control === 'object' ? argType.control.type : argType.control;
			const kind = type === 'boolean' ? 'boolean' : type === 'number' ? 'number' : argType.options ? 'select' : 'text';
			const control: AttributeControl = {
				name,
				kind,
				values: argType.options?.map(String),
				strict: true,
				description: argType.description ?? '',
			};
			row(name, this.input(control, story.args[key], (value) => this.setArg(key, value), argType), control.description);
		}
		const count = attributes.length + content.length;
		// Folded in place although it is a form: the example has to stay in view
		// while an attribute changes, which a sheet over the page would not allow.
		const panel = section('site-stage__controls', [
			nldd('accordion', {}, [
				nldd('accordion-item', { text: `Pas dit voorbeeld aan (${count} attributen)`, open: count <= OPEN_UP_TO }, [form]),
			]),
		]);
		const code = this.box.querySelector(':scope > .site-stage__code');
		if (code) code.previousElementSibling!.before(nldd('divider'), panel);
		else this.box.append(nldd('divider'), panel);
		void this.reserveHeight();
	}

	private input(
		control: AttributeControl,
		start: unknown,
		change: (value: string | boolean) => void,
		argType?: ArgType,
	): HTMLElement {
		if (control.kind === 'boolean') {
			const input = nldd('switch', { checked: start === true || start === 'true' });
			input.addEventListener('change', (event) => change((event as CustomEvent<{ checked: boolean }>).detail.checked));
			return input;
		}
		const text = start === undefined || start === null ? '' : String(start);
		// The story's own options win when it has them: they carry the labels a
		// reader knows from the story, such as "(geen)" for an empty value.
		const values = argType?.options?.map(String) ?? control.values;
		if (control.kind === 'select' && values && (control.strict || argType?.options)) {
			const options: [label: string, value: string][] = values.map((value) => [value, value]);
			if (!argType?.options) options.unshift(['(standaard)', '']);
			// An arg holds the value, the list shows the label: find the label
			// whose mapping gives this value, the way the story expects it back.
			const label = Object.entries(argType?.mapping ?? {}).find(([, value]) => value === start)?.[0];
			const selected = label ?? text;
			const fits =
				options.length <= SHOWN_WHOLE.options &&
				options.reduce((sum, [name]) => sum + name.length, 0) <= SHOWN_WHOLE.characters &&
				options.every(([, value]) => value !== '');
			if (fits) return this.choice(control.name, options, selected, change);
			const select = element('select', '');
			for (const [name, value] of options) select.append(new Option(name, value));
			select.value = selected;
			select.addEventListener('change', () => change(select.value));
			return nldd('dropdown', {}, [select]);
		}
		if (control.kind === 'number') {
			const input = nldd('number-field', text === '' ? {} : { value: text });
			input.addEventListener('input', (event) => {
				const { value } = (event as CustomEvent<{ value: number | null }>).detail;
				change(value === null ? '' : String(value));
			});
			return input;
		}
		const placeholder: Record<string, string> = control.default ? { placeholder: control.default } : {};
		if (values) {
			const input = nldd('combo-box', { value: text, text, 'allow-custom': true, ...placeholder }, [
				nldd(
					'menu',
					{},
					values.map((value) => nldd('menu-item', { text: value, value })),
				),
			]);
			for (const type of ['input', 'change']) {
				input.addEventListener(type, (event) => change((event as CustomEvent<{ value: string }>).detail.value));
			}
			return input;
		}
		const input = nldd('text-field', { value: text, ...placeholder });
		input.addEventListener('input', () => change((input as HTMLElement & { value: string }).value));
		return input;
	}
}

customElements.define('site-stage', SiteStage);
