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
import '../../src/components/actions/toolbar/toolbar.js';
import '../../src/components/actions/toolbar/toolbar-item.js';
import '../../src/components/actions/menu/menu.js';
import '../../src/components/actions/menu/menu-item.js';
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

/** An attribute the strip under the example shows while it is set. */
interface QuickEntry {
	name: string;
	kind: 'boolean' | 'select' | 'field';
	/** The labels of a choice that set the attribute, as the controls list them. */
	options: string[];
	/** The attribute as the code writes it, for a value. */
	written: (value: string) => string;
	isDefault: (value: string | boolean) => boolean;
	current: string | boolean;
	/** What removing the token sets the attribute back to. */
	unset: string | boolean;
	set: (value: string | boolean) => void;
	/** A field for a value that is typed rather than chosen, built like the one in the list. */
	field?: (change: (value: string | boolean) => void) => HTMLElement;
}

const WIDTHS: [label: string, width: string][] = [
	['Smal', '360px'],
	['Midden', '768px'],
	['Vol', '100%'],
];

/**
 * A choice of a few short options is shown whole, and fits beside its name on
 * a phone too; a longer one is a dropdown at every width.
 */
const SHOWN_WHOLE = { options: 4, characters: 16 };

/** The width of a field in the controls, and below which width of the list the descriptions fold away. */
const FIELD_WIDTH = 'min(240px, 50%)';
const NARROW_CONTROLS = 560;

/** Puts a value chosen elsewhere into a control of the list. */
function syncInput(input: HTMLElement, value: string | boolean): void {
	if (input.localName === 'nldd-switch') (input as HTMLElement & { checked: boolean }).checked = value === true;
	else if (input.localName === 'nldd-segmented-control') (input as HTMLElement & { value: string }).value = String(value);
	else if (input.localName === 'nldd-dropdown') {
		const select = input.querySelector('select');
		if (select) select.value = String(value);
	} else {
		(input as HTMLElement & { value: string }).value = String(value);
		if (input.localName === 'nldd-combo-box') input.setAttribute('text', String(value));
	}
}

/**
 * Whether an attribute is a choice between named values. A text attribute is
 * one only where the story names a value by something else than itself
 * (`download="aanvraag-A-1042.pdf"`); otherwise its values are suggestions,
 * such as the names of the icons.
 */
function isChoice(control: AttributeControl, argType?: ArgType): boolean {
	if (!(argType?.options ?? control.values)) return false;
	if (control.kind === 'select') return !!(control.strict || argType?.options);
	return Object.entries(argType?.mapping ?? {}).some(
		([label, value]) => value !== null && value !== undefined && value !== '' && value !== label,
	);
}

/** Numbers the info popovers of the controls, so each id is unique on the page. */
let infoCount = 0;

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
	const container = nldd('container', { padding: '16' }, children);
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
	/** Auto follows the scheme of the site, also when it changes later. */
	private scheme = 'auto';
	private tinted = false;
	private reserved = { width: 0, height: 0 };
	private reserving = 0;
	/** Each value of each choice in the controls: what the example can be set to. */
	private variants: { name: string; arg?: string; value: string }[] = [];
	private started = false;
	private quick: QuickEntry[] = [];
	private quickTokens = new Map<string, HTMLElement>();
	private quickStrip?: HTMLElement;
	/** Fields added from the menu that have no value yet: their token stays while it is filled in. */
	private quickPending = new Set<string>();
	private quickFields = new Map<string, HTMLElement>();
	private quickAdd?: HTMLElement;

	connectedCallback(): void {
		if (this.started) return;
		this.started = true;
		const follow = () => {
			if (this.scheme === 'auto') this.applyScheme();
		};
		new MutationObserver(follow).observe(document.documentElement, { attributeFilter: ['data-scheme'] });
		matchMedia('(prefers-color-scheme: dark)').addEventListener('change', follow);
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

	private applyScheme(): void {
		this.dark = this.scheme === 'auto' ? siteIsDark() : this.scheme === 'dark';
		// Auto leaves the canvas to inherit the page; a frame is told.
		this.canvas.style.colorScheme = this.scheme === 'auto' ? '' : this.scheme;
		this.post({ type: 'scheme', scheme: this.dark ? 'dark' : 'light' });
	}

	private post(message: Record<string, unknown>): void {
		this.frame?.contentWindow?.postMessage({ site: 'stage', ...message }, location.origin);
	}

	private toolItem(control: HTMLElement, overflow: HTMLElement, priority: number, slot = 'start'): HTMLElement {
		overflow.slot = 'overflow';
		return nldd('toolbar-item', { slot, ...(priority ? { priority: String(priority) } : {}) }, [control, overflow]);
	}

	/** A choice in the bar, with the same choice as a submenu for when it moves into the overflow menu. */
	private toolChoice(
		name: string,
		title: string,
		options: [label: string, value: string][],
		selected: string,
		onChange: (value: string) => void,
		priority: number,
	): HTMLElement {
		const items = options.map(([text, value]) =>
			nldd('menu-item', { type: 'radio', text, value, selected: value === selected }),
		);
		const mark = (value: string) => {
			for (const item of items) item.toggleAttribute('selected', item.getAttribute('value') === value);
		};
		const control = this.choice(
			name,
			options,
			selected,
			(value) => {
				mark(value);
				onChange(value);
			},
			{ size: '' },
		);
		for (const item of items) {
			item.addEventListener('select', () => {
				const value = item.getAttribute('value') ?? '';
				mark(value);
				(control as HTMLElement & { value: string }).value = value;
				onChange(value);
			});
		}
		return this.toolItem(control, nldd('menu-item', { text: title }, [nldd('menu', {}, items)]), priority);
	}

	/** One choice between a few named options, shown whole. */
	private choice(
		name: string,
		options: [label: string, value: string][],
		selected: string,
		onChange: (value: string) => void,
		{ size = 'sm', appearance = '' }: { size?: string; appearance?: string } = {},
	): HTMLElement {
		const control = nldd(
			'segmented-control',
			{
				...(size ? { size } : {}),
				...(appearance ? { appearance } : {}),
				width: 'fit-content',
				'accessible-label': name,
				value: selected,
			},
			options.map(([text, value]) => nldd('segmented-control-item', { text, value })),
		);
		control.addEventListener('change', (event) => onChange((event as CustomEvent<{ value: string }>).detail.value));
		return control;
	}

	private build({ tools }: { tools: boolean }): void {
		const name = this.getAttribute('name') ?? '';
		const bar = element('div', 'site-stage__bar');
		const toolbar = nldd('toolbar', { size: 'sm', 'accessible-label': `Weergave van ${name}` });
		if (tools) {
			// What gives way first on a narrow stage: opening it on its own, then the
			// surface or width, and the color scheme last.
			toolbar.append(
				this.toolChoice(
					`Kleurenschema van ${name}`,
					'Kleurenschema',
					[
						['Auto', 'auto'],
						['Licht', 'light'],
						['Donker', 'dark'],
					],
					'auto',
					(scheme) => {
						this.scheme = scheme;
						this.applyScheme();
					},
					2,
				),
			);
			if (!this.frame) {
				toolbar.append(
					this.toolChoice(
						`Ondergrond van ${name}`,
						'Ondergrond',
						[
							['Basis', 'base'],
							['Getint', 'tinted'],
						],
						'base',
						(surface) => {
							this.tinted = surface === 'tinted';
							this.canvas.dataset.surface = surface;
						},
						1,
					),
				);
			} else {
				toolbar.append(
					this.toolChoice(
						`Breedte van ${name}`,
						'Breedte',
						WIDTHS.map(([label, width]) => [label, width]),
						'100%',
						(width) => {
							this.frame!.style.width = width;
						},
						1,
					),
				);
			}
			const file = this.getAttribute('file');
			if (file) {
				const href = `${import.meta.env.BASE_URL}voorbeeld/?file=${encodeURIComponent(file)}&story=${encodeURIComponent(this.getAttribute('story') ?? '')}`;
				toolbar.append(
					this.toolItem(
						nldd('button', { text: 'Open los', href, target: '_blank' }),
						nldd('menu-item', { text: 'Open los', href, target: '_blank' }),
						0,
						'end',
					),
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
		this.box.replaceChildren(...(toolbar.children.length ? [bar] : []), mat, this.eventLog);
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
			// Only the usage tab changes its code, so only there it holds still.
			const changes = this.hasAttribute('primary');
			if (changes) this.code.setAttribute('max-height', '420px');
			this.code.classList.add('site-stage__code');
			// The code comes right after the example, before the controls,
			// whichever of the two arrives first: a framed example reports its
			// markup later.
			this.box.after(this.code);
			this.code.textContent = text;
			// The code keeps the height it has before any change, scrolling when
			// it grows, so the controls below it stay where they are.
			await (this.code as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
			const height = this.code.offsetHeight;
			if (changes && height) {
				this.code.setAttribute('max-height', `${Math.min(height, 420)}px`);
				this.code.style.minHeight = `${this.code.offsetHeight}px`;
			}
			return;
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
			import('../../src/components/lists-and-tables/list/list.js'),
			import('../../src/components/lists-and-tables/list-item/list-item.js'),
			import('../../src/components/lists-and-tables/cells/text-cell/text-cell.js'),
			import('../../src/components/lists-and-tables/cells/cell/cell.js'),
			import('../../src/components/lists-and-tables/cells/spacer-cell/spacer-cell.js'),
			import('../../src/components/content/text/text.js'),
			import('../../src/components/actions/icon-button/icon-button.js'),
			import('../../src/components/layout/popover/popover.js'),
			import('../../src/components/navigation/top-title-bar/top-title-bar.js'),
			import('../../src/components/inputs/switch/switch.js'),
			import('../../src/components/inputs/dropdown/dropdown.js'),
			import('../../src/components/inputs/number-field/number-field.js'),
			import('../../src/components/inputs/text-field/text-field.js'),
			import('../../src/components/inputs/combo-box/combo-box.js'),
			import('../../src/components/actions/menu/menu.js'),
			import('../../src/components/actions/menu/menu-item.js'),
			import('../../src/components/actions/menu/menu-divider.js'),
			import('../../src/components/content/token/token.js'),
			import('../../src/components/layout/spacer/spacer.js'),
		]);

		const list = nldd('list', { type: 'form', appearance: 'box-tinted' });
		list.classList.add('site-stage__controls');

		// The name and what it does on the left, the control on the right. The
		// description is in an nldd-text, which styles the code in it.
		// Where the row is narrow, the description waits behind an info button
		// after the name, so the name and the control stay side by side.
		const infos: { label: HTMLElement; button: HTMLElement; text: HTMLElement }[] = [];
		const popovers: HTMLElement[] = [];
		const row = (name: string, input: HTMLElement, description: string) => {
			const title = element('p', '', `${name} `);
			const label = nldd('text-cell', {}, [title]);
			if (description) {
				const span = element('span', '');
				span.append(...described(description));
				const text = element('p', '');
				text.slot = 'supporting-text';
				text.append(nldd('text', { size: 'sm' }, [span]));
				label.append(text);
				const id = `site-control-info-${++infoCount}`;
				const button = nldd('icon-button', {
					size: 'xs',
					icon: 'info-circle',
					'tooltip-timing': 'never',
					text: `Over ${name}`,
					appearance: 'neutral-base',
					popovertarget: id,
					hidden: true,
				});
				title.append(button);
				const about = span.cloneNode(true);
				// The bar is for the bottom sheet a popover is on a phone; anchored
				// beside the button it needs none.
				const popover = nldd('popover', { id, role: 'region', 'accessible-label': name }, [
					nldd('top-title-bar', { text: name, 'heading-level': '2', 'dismiss-text': 'Sluit' }),
					nldd('container', { padding: '16' }, [nldd('text', {}, [about])]),
				]);
				popover.classList.add('site-control-info');
				popovers.push(popover);
				infos.push({ label, button, text });
			}
			input.setAttribute('accessible-label', name);
			const fits = ['nldd-switch', 'nldd-segmented-control'].includes(input.localName);
			const cell = nldd('cell', { 'horizontal-alignment': 'right', 'vertical-alignment': 'top', ...(fits ? {} : { width: FIELD_WIDTH }) }, [input]);
			list.append(nldd('list-item', {}, [label, nldd('spacer-cell', { size: '12' }), cell]));
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
			let entry: QuickEntry | undefined = undefined;
			const input = this.input(
				attribute,
				start,
				(value) => {
					change(value);
					if (!entry) return;
					entry.current = value;
					this.showQuick();
				},
				fromStory?.argType,
			);
			entry = this.quickEntry(attribute, start, fromStory?.argType, !!fromArg, (value) => {
				change(value);
				syncInput(input, value);
			});
			if (entry) this.quick.push(entry);
			row(attribute.name, input, fromStory?.argType.description ?? attribute.description);
		}
		if (this.quick.length) this.buildQuick();
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
		// In place, not in a sheet: the example has to stay in view while an
		// attribute changes. The usage tab has no other examples to keep in reach.
		this.append(list, ...popovers);
		new ResizeObserver(() => {
			const narrow = list.offsetWidth < NARROW_CONTROLS;
			// Out of the cell rather than hidden: the cell's own style on a slotted
			// paragraph outranks the hidden attribute.
			for (const { label, button, text } of infos) {
				button.hidden = !narrow;
				if (narrow) text.remove();
				else label.append(text);
			}
			// A popover open when its button goes would stay without an anchor.
			if (!narrow) for (const popover of popovers) (popover as HTMLElement & { open: boolean }).open = false;
		}).observe(list);
		void this.reserveHeight();
	}

	/** The entry in the strip for an attribute, when it is a switch or a choice. */
	private quickEntry(
		control: AttributeControl,
		start: unknown,
		argType: ArgType | undefined,
		fromArg: boolean,
		set: (value: string | boolean) => void,
	): QuickEntry | undefined {
		if (control.kind === 'boolean') {
			return {
				name: control.name,
				kind: 'boolean',
				options: [],
				written: () => control.name,
				isDefault: (value) => value !== true,
				current: start === true || start === 'true',
				unset: false,
				set,
			};
		}
		const values = argType?.options?.map(String) ?? control.values;
		// The story knows a default the manifest leaves out, such as a centered alignment.
		const fallback = control.default || String(argType?.table?.defaultValue?.summary ?? '');
		if (!isChoice(control, argType)) {
			return {
				name: control.name,
				kind: 'field',
				options: [],
				written: (value) => `${control.name}="${value}"`,
				isDefault: (value) => [fallback, ''].includes(String(value)),
				current: start === undefined || start === null ? '' : String(start),
				unset: '',
				set,
				field: (change) => this.input(control, start, change, argType),
			};
		}
		const mapping = argType?.mapping ?? {};
		const raw = (label: string) => (label in mapping ? mapping[label] : label);
		// Where a label maps to nothing, an empty value is one of its own: `download` without a name.
		const empty = Object.values(mapping).some((value) => value === null || value === undefined);
		const absent = (label: string) => {
			const value = raw(label);
			return value === null || value === undefined || (value === '' && !empty);
		};
		const isDefault = (label: string | boolean) =>
			absent(String(label)) || (fallback !== '' && String(raw(String(label))) === fallback);
		const label = Object.entries(mapping).find(([, value]) => value === start)?.[0];
		return {
			name: control.name,
			kind: 'select',
			options: values.filter((value) => !absent(value)),
			written: (value) => (raw(value) === '' ? control.name : `${control.name}="${String(raw(value))}"`),
			isDefault,
			current: label ?? (start === undefined || start === null ? '' : String(start)),
			// An arg goes back to the label of the default; an attribute of its own is taken off.
			unset: fromArg ? (values.find((value) => isDefault(value)) ?? '') : '',
			set,
		};
	}

	/**
	 * A strip of tokens under the example, one for each attribute that is set,
	 * written as in the code: what the example is now, in view while it changes.
	 */
	private buildQuick(): void {
		const tag = this.controls?.tag ?? '';
		const menu = nldd('menu', { 'no-blink': true });
		menu.slot = 'popup';
		menu.addEventListener('beforetoggle', (event) => {
			if ((event as ToggleEvent).newState !== 'open') return;
			const unset = this.quick.filter((entry) => entry.isDefault(entry.current) && !this.quickPending.has(entry.name));
			menu.replaceChildren(...unset.map((entry) => this.addItem(entry)));
		});
		this.quickAdd = nldd(
			'icon-button',
			{ icon: 'plus', size: 'sm', expandable: true, 'tooltip-timing': 'never', text: 'Attribuut toevoegen' },
			[menu],
		);
		this.quickStrip = nldd(
			'container',
			{ padding: '16', gap: '8', layout: 'wrap', 'vertical-alignment': 'center', role: 'group', 'accessible-label': `Attributen van ${tag}` },
			[this.quickAdd],
		);
		this.quickStrip.classList.add('site-stage__quick');
		this.eventLog.before(this.quickStrip);
		this.showQuick();
	}

	/** An item of the add menu: a switch is set at once, a choice opens its values. */
	private addItem(entry: QuickEntry): HTMLElement {
		const pick = (item: HTMLElement, value: string | boolean) => {
			item.addEventListener('select', () => this.quickSet(entry, value));
			return item;
		};
		if (entry.kind === 'boolean') return pick(nldd('menu-item', { text: entry.name }), true);
		if (entry.kind === 'field') {
			const item = nldd('menu-item', { text: entry.name });
			item.addEventListener('select', () => this.quickFill(entry));
			return item;
		}
		const values = entry.options.filter((label) => !entry.isDefault(label));
		return nldd('menu-item', { text: entry.name }, [
			nldd(
				'menu',
				{},
				values.map((label) => pick(nldd('menu-item', { text: label }), label)),
			),
		]);
	}

	/** Shows the token of a field without a value yet, with its popover open on the field. */
	private quickFill(entry: QuickEntry): void {
		this.quickPending.add(entry.name);
		this.showQuick();
		const token = this.quickTokens.get(entry.name);
		// The menu hands the focus back to its button first; the field takes it after.
		setTimeout(() => {
			const popover = token?.querySelector<HTMLElement & { invokerOpen(): void }>('nldd-popover');
			popover?.invokerOpen();
		});
	}

	/** A token for a typed value: its popover holds the field, as the list does, and a way to remove it. */
	private fieldToken(entry: QuickEntry): HTMLElement {
		const id = `site-quick-${++infoCount}`;
		const field = entry.field!((value) => {
			entry.current = value;
			entry.set(value);
			this.showQuick();
		});
		syncInput(field, entry.current);
		field.autofocus = true;
		this.quickFields.set(entry.name, field);
		const remove = nldd('button', { size: 'sm', text: 'Verwijder' });
		const popover = nldd('popover', { id, role: 'region', 'accessible-label': entry.name }, [
			nldd('top-title-bar', { text: entry.name, 'heading-level': '2', 'dismiss-text': 'Sluit' }),
			nldd('container', { padding: '16' }, [field, nldd('spacer', { size: '12' }), remove]),
		]);
		popover.slot = 'menu';
		popover.classList.add('site-control-info', 'site-stage__quick-field');
		remove.addEventListener('click', () => {
			(popover as HTMLElement & { invokerClose(): void }).invokerClose();
			this.quickSet(entry, entry.unset);
			syncInput(field, entry.unset);
		});
		// Enter is done, as in the field of a form.
		field.addEventListener('keydown', (event) => {
			if ((event as KeyboardEvent).key !== 'Enter' || field.localName === 'nldd-combo-box') return;
			(popover as HTMLElement & { invokerClose(): void }).invokerClose();
		});
		popover.addEventListener('toggle', (event) => {
			if ((event as ToggleEvent).newState === 'open') return;
			// A field left empty takes its token with it.
			if (!this.quickPending.delete(entry.name)) return;
			this.showQuick();
			setTimeout(() => {
				const active = document.activeElement;
				if (!active || active === document.body) this.quickAdd?.focus();
			});
		});
		return nldd('token', { control: 'menu', 'menu-text': `Bewerk ${entry.name}` }, [popover]);
	}

	private quickToken(entry: QuickEntry): HTMLElement {
		if (entry.kind === 'field') return this.fieldToken(entry);
		if (entry.kind === 'boolean') {
			const token = nldd('token', { control: 'dismiss' });
			token.addEventListener('dismiss', () => this.quickSet(entry, false));
			return token;
		}
		const items = entry.options.map((label) => {
				const item = nldd('menu-item', { type: 'radio', text: label, value: label });
				item.addEventListener('select', () => this.quickSet(entry, label));
				return item;
			});
		const remove = nldd('menu-item', { text: 'Verwijder' });
		remove.addEventListener('select', () => this.quickSet(entry, entry.unset));
		const menu = nldd('menu', { 'no-blink': true }, [...items, nldd('menu-divider'), remove]);
		menu.slot = 'menu';
		return nldd('token', { control: 'menu' }, [menu]);
	}

	private quickSet(entry: QuickEntry, value: string | boolean): void {
		entry.current = value;
		entry.set(value);
		this.showQuick();
		// A token that goes takes the focus with it: it goes to the add button.
		setTimeout(() => {
			const active = document.activeElement;
			if (!active || active === document.body) this.quickAdd?.focus();
		});
	}

	/** Puts the tokens in line with the attributes, keeping the ones that stay. */
	private showQuick(): void {
		const strip = this.quickStrip;
		if (!strip || !this.quickAdd) return;
		let previous: Element | null = null;
		for (const entry of this.quick) {
			let token = this.quickTokens.get(entry.name);
			if (entry.isDefault(entry.current) && !this.quickPending.has(entry.name)) {
				token?.remove();
				this.quickTokens.delete(entry.name);
				this.quickFields.delete(entry.name);
				continue;
			}
			const field = this.quickFields.get(entry.name);
			if (field && !field.matches(':focus-within')) syncInput(field, entry.current);
			if (!token) {
				token = this.quickToken(entry);
				this.quickTokens.set(entry.name, token);
			}
			token.setAttribute('text', entry.written(String(entry.current)));
			for (const item of token.querySelectorAll('nldd-menu-item[type="radio"]')) {
				item.toggleAttribute('selected', item.getAttribute('value') === entry.current);
			}
			const place: Element | null = previous ? previous.nextElementSibling : strip.firstElementChild;
			if (place !== token) {
				if (previous) previous.after(token);
				else strip.prepend(token);
			}
			previous = token;
		}
		this.quickAdd.hidden = this.quick.every((entry) => !entry.isDefault(entry.current) || this.quickPending.has(entry.name));
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
		if (values && isChoice(control, argType)) {
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
			if (fits) return this.choice(control.name, options, selected, change, { size: 'md' });
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
		// The manifest writes a missing default as the word.
		const placeholder: Record<string, string> =
			control.default && control.default !== 'undefined' ? { placeholder: control.default } : {};
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
