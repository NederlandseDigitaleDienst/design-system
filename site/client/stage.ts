/**
 * The stage: the frame a live example stands on.
 *
 * The site is built with the components it documents, so without a frame a
 * reader cannot tell an example from the page around it. Everything live
 * stands on a stage, and nothing else does. The frame is deliberately not from
 * the system (`site-` prefix, monospace label, a dotted mat), while the canvas
 * inside it is a real surface of the system, so the example looks as it does in
 * an application.
 *
 * A stage owns three things the page does not: its color scheme, its surface
 * and, for an example that needs a window of its own, its width. That keeps the
 * page from leaking into the example, and makes the border between the two
 * visible the moment one of them is switched.
 */

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
	private events = element('ol', 'site-stage__events');
	private dark = siteIsDark();
	private tinted = false;
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
		this.buildControls();
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
		const item = element('li', '', detail ? `${name} ${detail}` : name);
		this.events.prepend(item);
		while (this.events.children.length > 4) this.events.lastElementChild?.remove();
		this.events.hidden = false;
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
			if (event.data.type === 'source') this.setSource(event.data.code);
		});
	}

	private post(message: Record<string, unknown>): void {
		this.frame?.contentWindow?.postMessage({ site: 'stage', ...message }, location.origin);
	}

	private toggle(label: () => string, onClick: () => void): HTMLButtonElement {
		const button = element('button', 'site-stage__tool', label());
		button.type = 'button';
		button.addEventListener('click', () => {
			onClick();
			button.textContent = label();
		});
		return button;
	}

	private build({ tools }: { tools: boolean }): void {
		const bar = element('div', 'site-stage__bar');
		bar.append(element('span', 'site-stage__label', 'Voorbeeld'));
		bar.append(element('span', 'site-stage__name', this.getAttribute('name') ?? ''));
		const toolbar = element('div', 'site-stage__tools');
		if (tools) {
			toolbar.append(
				this.toggle(
					() => (this.dark ? 'Donker' : 'Licht'),
					() => {
						this.dark = !this.dark;
						this.canvas.style.colorScheme = this.dark ? 'dark' : 'light';
						this.post({ type: 'scheme', scheme: this.dark ? 'dark' : 'light' });
					},
				),
			);
			if (!this.frame) {
				toolbar.append(
					this.toggle(
						() => (this.tinted ? 'Getint' : 'Basis'),
						() => {
							this.tinted = !this.tinted;
							this.canvas.dataset.surface = this.tinted ? 'tinted' : 'base';
						},
					),
				);
			} else {
				for (const [label, width] of WIDTHS) {
					const button = element('button', 'site-stage__tool', label);
					button.type = 'button';
					button.setAttribute('aria-pressed', String(width === '100%'));
					button.addEventListener('click', () => {
						this.frame!.style.width = width;
						for (const other of toolbar.querySelectorAll('[aria-pressed]')) {
							other.setAttribute('aria-pressed', String(other === button));
						}
					});
					toolbar.append(button);
				}
			}
			const file = this.getAttribute('file');
			if (file) {
				const open = element('a', 'site-stage__tool', 'Open los');
				open.href = `${import.meta.env.BASE_URL}voorbeeld/?file=${encodeURIComponent(file)}&story=${encodeURIComponent(this.getAttribute('story') ?? '')}`;
				open.target = '_blank';
				open.rel = 'noopener';
				toolbar.append(open);
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
		}).observe(this.canvas);
		this.events.hidden = true;
		this.events.setAttribute('aria-label', 'Events van dit voorbeeld');
		this.replaceChildren(bar, mat, this.events);
	}

	private setSource(code: string): void {
		if (!this.story || !code) return;
		const transform = this.story.parameters.docs?.source?.transform;
		const text = transform ? transform(code) : code;
		if (!this.code) {
			this.code = document.createElement('nldd-code-viewer');
			this.code.setAttribute('language', this.story.parameters.docs?.source?.language ?? 'html');
			this.code.setAttribute('appearance', 'simple');
			const wrapper = element('div', 'site-stage__code');
			wrapper.append(this.code);
			// The code closes the stage, below the controls, whichever of the two
			// arrives first: a framed example reports its markup later.
			this.append(wrapper);
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
		if (given) return this.setSource(given);
		if (this.frame) return;
		const scratch = document.createElement('div');
		const story = this.story;
		const silent: StoryContext = { args: this.args, updateArgs: () => {}, log: () => {} };
		mount(withContext(silent, () => story.render(mapArgs(this.args, story.argTypes))), scratch);
		this.applyOverrides(scratch);
		this.setSource(sourceOf(scratch));
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

	private buildControls(): void {
		const story = this.story;
		if (!story || !this.hasAttribute('primary') || story.parameters.controls?.disable) return;
		const attributes = this.controls?.attributes ?? [];
		const target = this.frame ? null : this.canvas.querySelector(this.controls?.tag ?? ':not(*)');

		// What the story file says about an attribute, by attribute name: a Dutch
		// description, and the arg that feeds it. Everything in argTypes that is
		// not an attribute (the text in a slot, the number of items) is content.
		const described = new Map<string, { key: string; argType: ArgType }>();
		for (const [key, argType] of Object.entries(story.argTypes)) {
			described.set(argType.name ?? kebab(key), { key, argType });
		}
		const names = new Set(attributes.map((a) => a.name));
		const content = [...described].filter(
			([name, { argType }]) => !names.has(name) && argType.control !== false && argType.control !== 'none',
		);
		if (!attributes.length && !content.length) return;

		// Open from the start: changing an attribute and watching the example
		// follow is what the first example of a page is for.
		const panel = element('details', 'site-stage__controls');
		panel.open = true;
		panel.append(element('summary', '', `Pas dit voorbeeld aan (${attributes.length + content.length} attributen)`));
		const grid = element('div', 'site-stage__grid');

		const row = (name: string, input: HTMLElement, description: string) => {
			const label = element('label', 'site-stage__control');
			label.append(element('code', '', name), input);
			if (description) label.append(element('span', 'site-stage__hint', description));
			grid.append(label);
		};

		for (const attribute of attributes) {
			const known = described.get(attribute.name);
			// An attribute the story feeds from an arg follows that arg, so the
			// two cannot disagree; every other attribute is set on the element.
			const fromArg = known && known.key in story.args ? known.key : undefined;
			const start = fromArg
				? story.args[fromArg]
				: attribute.kind === 'boolean'
					? (target?.hasAttribute(attribute.name) ?? false)
					: (target?.getAttribute(attribute.name) ?? '');
			const change = (value: string | boolean) => {
				if (fromArg) this.setArg(fromArg, attribute.kind === 'number' && value !== '' ? Number(value) : value);
				else this.setOverride(attribute.name, value);
			};
			row(
				attribute.name,
				this.input(attribute, start, change, known?.argType),
				known?.argType.description ?? attribute.description,
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
		panel.append(grid);
		const code = this.querySelector(':scope > .site-stage__code');
		if (code) code.before(panel);
		else this.append(panel);
	}

	private input(
		control: AttributeControl,
		start: unknown,
		change: (value: string | boolean) => void,
		argType?: ArgType,
	): HTMLElement {
		if (control.kind === 'boolean') {
			const input = element('input', '');
			input.type = 'checkbox';
			input.checked = start === true || start === 'true';
			input.addEventListener('change', () => change(input.checked));
			return input;
		}
		// The story's own options win when it has them: they carry the labels a
		// reader knows from the story, such as "(geen)" for an empty value.
		const values = argType?.options?.map(String) ?? control.values;
		if (control.kind === 'select' && values && (control.strict || argType?.options)) {
			const select = element('select', '');
			if (!argType?.options) select.append(new Option('(standaard)', ''));
			for (const value of values) select.append(new Option(value, value));
			// An arg holds the value, the list shows the label: find the label
			// whose mapping gives this value, the way the story expects it back.
			const label = Object.entries(argType?.mapping ?? {}).find(([, value]) => value === start)?.[0];
			select.value = label ?? (start === undefined || start === null ? '' : String(start));
			select.addEventListener('change', () => change(select.value));
			return select;
		}
		const input = element('input', '');
		input.type = control.kind === 'number' ? 'number' : 'text';
		input.value = start === undefined || start === null ? '' : String(start);
		if (control.default !== undefined && control.default !== '') input.placeholder = control.default;
		if (values) {
			const list = element('datalist', '');
			list.id = `site-values-${control.name}-${Math.random().toString(36).slice(2, 8)}`;
			for (const value of values) list.append(new Option(value, value));
			input.setAttribute('list', list.id);
			// The input is placed by the caller; the list goes next to it after that.
			queueMicrotask(() => input.after(list));
		}
		input.addEventListener('input', () => change(input.value));
		return input;
	}
}

customElements.define('site-stage', SiteStage);
