import { html, nothing } from 'lit';
import { action } from 'storybook/actions';
import './text-editor.js';
import '../../actions/toolbar/toolbar.js';
import '../../inputs/segmented-control/segmented-control.js';
import '../../inputs/toggle-button/toggle-button.js';
import '../../actions/button/button.js';
import '../../actions/button-bar/button-bar.js';
import '../../status-and-feedback/modal-dialog/modal-dialog.js';
import '../../layout/sheet/sheet.js';
import '../../layout/container/container.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';
import '../../layout/spacer/spacer.js';

const SAMPLE = `# Zorgtoeslag

Een **vetgedrukte** en *cursieve* zin met \`inline code\` en een [link](https://www.rijksoverheid.nl).

> Een blockquote met toelichting.

- Eerste punt
- Tweede punt

## Subkop

Tekst met ~~doorhaling~~ (GFM).`;

/* Shared toolbar demo. The editor is headless: this builds a real toolbar from
 * DS components and wires it both ways — the controls drive the editor's command
 * API, and the editor's nldd-text-editor-state event drives the controls. Used
 * by the WithToolbar and Mixed stories (pass the editor template in). */
const editorOf = (el: Element): any => el.closest('.demo-editor')?.querySelector('nldd-text-editor');
const reconcile = (el: Element, keys: string[], values: string[]) => {
	const editor = editorOf(el);
	if (!editor) return;
	const active = editor.getState().active;
	const desired = new Set(values);
	keys.forEach((key) => { if (desired.has(key) !== Boolean(active[key])) editor.runCommand(key); });
};
const onListChange = (event: CustomEvent) => {
	const value = event.detail.value as string;
	editorOf(event.currentTarget as Element)?.setList(value === 'numbered' ? 'ordered' : value);
};
const HEADING_LABELS = ['Paragraaf', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'];
const onHeadingSelect = (event: Event) => {
	const item = event.target as HTMLElement;
	if (item?.tagName !== 'NLDD-MENU-ITEM') return;
	const editor = editorOf(event.currentTarget as Element);
	if (!editor) return;
	const value = item.getAttribute('value') ?? '0';
	const inCodeBlock = editor.getState().active.codeBlock;
	if (value === 'codeblock') {
		if (!inCodeBlock) editor.toggleCodeBlock(); // wrap; re-selecting it is a no-op
		return;
	}
	// A text style: a code block is its own block type, so step out of it first —
	// that's what makes "Paragraaf" double as the way out of a code block.
	if (inCodeBlock) editor.toggleCodeBlock();
	editor.setHeading(Number(value));
};
const onLink = (event: Event) => editorOf(event.currentTarget as Element)?.toggleLink();
const onIndent = (event: Event) => editorOf(event.currentTarget as Element)?.indent();
const onOutdent = (event: Event) => editorOf(event.currentTarget as Element)?.outdent();
const onUndo = (event: Event) => editorOf(event.currentTarget as Element)?.undo();
const onRedo = (event: Event) => editorOf(event.currentTarget as Element)?.redo();
const onCopy = (event: Event) => editorOf(event.currentTarget as Element)?.copy();
const onCut = (event: Event) => editorOf(event.currentTarget as Element)?.cut();
const onPaste = (event: Event) => editorOf(event.currentTarget as Element)?.paste();

// Run one overflow-menu action against its editor. Mirrors the inline handlers
// (onHeadingSelect/onListChange/…) so an overflowed control behaves the same.
const runOverflowAction = (editor: any, action: string): void => {
	const [name, value] = action.split(':');
	if (name === 'heading') {
		// A code block is its own block type, so step out of it before setting a
		// text style. That is what makes "Paragraaf" double as the way out.
		const inCodeBlock = editor.getState().active.codeBlock;
		if (value === 'codeblock') { if (!inCodeBlock) editor.runCommand('codeBlock'); return; }
		if (inCodeBlock) editor.runCommand('codeBlock');
		editor.runCommand('setHeading', Number(value));
		return;
	}
	if (name === 'list') { editor.runCommand('setList', value === 'numbered' ? 'ordered' : value); return; }
	editor.runCommand(name);
};

// Overflow menu-items are cloned into a menu in document.body, so their @click
// listeners are lost — but the `select` event bubbles (composed). We catch it at
// the document, resolve the editor via the overflow menu's anchor (the overflow
// button lives in the toolbar's shadow root, itself inside a .demo-editor), and
// run the item's `value` as an action. Scoped to the toolbar's own overflow menu
// so the inline heading menu (its own @select handler) isn't double-handled.
document.addEventListener('select', (event: Event) => {
	const item = event.target as HTMLElement | null;
	if (item?.tagName !== 'NLDD-MENU-ITEM') return;
	const menu = item.closest('nldd-menu') as (HTMLElement & { anchorElement?: Element | null }) | null;
	if (!menu?.id.startsWith('nldd-toolbar-overflow-menu')) return;
	const action = item.getAttribute('value');
	if (!action) return;
	const toolbar = (menu.anchorElement?.getRootNode() as ShadowRoot | null)?.host as Element | undefined;
	const editor = toolbar?.closest('.demo-editor')?.querySelector('nldd-text-editor');
	if (editor) runOverflowAction(editor, action);
});
const onToolbarState = (event: CustomEvent) => {
	const active = event.detail.active;
	const root = event.currentTarget as Element;
	// Multi-select segmented controls reflect via .values; single toggle buttons via .selected.
	const reflect = (group: string, keys: string[]) => {
		const el: any = root.querySelector(`[data-group="${group}"]`);
		if (el) el.values = keys.filter((key) => active[key]);
	};
	const reflectToggle = (group: string, key: string) => {
		const el: any = root.querySelector(`[data-group="${group}"]`);
		if (el) el.selected = Boolean(active[key]);
	};
	reflect('inline', ['bold', 'italic', 'strikethrough']);
	reflectToggle('code', 'inlineCode');
	reflectToggle('link', 'link');
	reflectToggle('quote', 'quote');
	const list: any = root.querySelector('[data-group="list"]');
	// A task is a bullet too, so it has to be asked about first.
	if (list) list.value = active.taskList ? 'task' : active.orderedList ? 'numbered' : active.bulletList ? 'bullet' : 'none';

	// Formatting inside code is literal text, not markup: lock the inline formats in
	// any code, and the block formats inside a code block — only the code-block toggle
	// stays (to get back out).
	const inCode = active.inlineCode || active.codeBlock;
	const setDisabled = (group: string, cond: boolean) => {
		const el: any = root.querySelector(`[data-group="${group}"]`);
		if (el) el.disabled = cond;
	};
	setDisabled('inline', inCode);
	setDisabled('link', inCode);
	setDisabled('code', active.codeBlock);
	setDisabled('quote', active.codeBlock);
	setDisabled('list', active.codeBlock);

	// History buttons: enable undo/redo only when there's history in that direction,
	// and dim the whole bar (divider included) when neither applies.
	const historyBar: any = root.querySelector('[data-group="history"]');
	if (historyBar) {
		const { canUndo, canRedo } = event.detail;
		historyBar.disabled = !canUndo && !canRedo;
		historyBar.updateComplete.then(() => {
			const [undoButton, redoButton] = historyBar.querySelectorAll('nldd-icon-button');
			if (undoButton) undoButton.disabled = !canUndo;
			if (redoButton) redoButton.disabled = !canRedo;
		});
	}

	// Clipboard bar: copy and cut need a selection; paste is always available.
	const clipboardBar: any = root.querySelector('[data-group="clipboard"]');
	if (clipboardBar) {
		clipboardBar.updateComplete.then(() => {
			const [copyButton, cutButton] = clipboardBar.querySelectorAll('nldd-icon-button');
			if (copyButton) copyButton.disabled = event.detail.empty;
			if (cutButton) cutButton.disabled = event.detail.empty;
		});
	}

	// Indent buttons reflect what's possible: increase only with a parent to nest
	// under, decrease only when the item is already nested. When neither applies,
	// disable the whole bar so its divider dims too, not just the two buttons.
	const indentBar: any = root.querySelector('[data-group="indent"]');
	if (indentBar) {
		const { canIndent, canOutdent } = event.detail;
		indentBar.disabled = !canIndent && !canOutdent;
		// The bar re-syncs its children from a snapshot whenever `disabled` flips; set
		// the per-button state after that settles so a half-usable bar keeps the exact
		// arrow we want enabled.
		indentBar.updateComplete.then(() => {
			const [increase, decrease] = indentBar.querySelectorAll('nldd-icon-button');
			if (increase) increase.disabled = !canIndent;
			if (decrease) decrease.disabled = !canOutdent;
		});
	}

	// The block-type menu also carries "Codeblok", and it stays enabled in a code
	// block — picking "Paragraaf" is how you get back out.
	const headingButton: any = root.querySelector('[data-group="heading"]');
	if (headingButton) headingButton.text = active.codeBlock ? 'Codeblok' : (HEADING_LABELS[active.heading] ?? 'Paragraaf');
	root.querySelectorAll('#heading-menu nldd-menu-item').forEach((item) => {
		const value = item.getAttribute('value');
		(item as any).selected = active.codeBlock ? value === 'codeblock' : Number(value) === active.heading;
	});

	// Mirror the disabled state onto the overflow fallbacks, so an overflowed control
	// is just as unusable in the menu as it is in the bar. Set it on both the light-DOM
	// originals (used for the next clone) and the live clones in the toolbar's overflow
	// menu (which sits in document.body and doesn't re-clone on a mere state change).
	const toolbar = root.querySelector('nldd-toolbar');
	const overflowMenu = Array.from(document.querySelectorAll('nldd-menu[id^="nldd-toolbar-overflow-menu"]'))
		.find((menu) => (menu as any).anchorElement?.getRootNode()?.host === toolbar) ?? null;
	const { canUndo, canRedo, canIndent, canOutdent, empty } = event.detail;
	const disabledByValue: Record<string, boolean> = {
		bold: inCode, italic: inCode, strikethrough: inCode,
		inlineCode: active.codeBlock,
		link: inCode,
		quote: active.codeBlock,
		'list:none': active.codeBlock, 'list:bullet': active.codeBlock, 'list:numbered': active.codeBlock, 'list:task': active.codeBlock,
		indent: !canIndent, outdent: !canOutdent,
		copy: empty, cut: empty,
		undo: !canUndo, redo: !canRedo,
	};
	for (const [value, disabled] of Object.entries(disabledByValue)) {
		const selector = `nldd-menu-item[value="${value}"]`;
		root.querySelectorAll(selector).forEach((item) => { (item as any).disabled = disabled; });
		overflowMenu?.querySelectorAll(selector).forEach((item) => { (item as any).disabled = disabled; });
	}

	// And mirror the active/checked state onto the checkbox and radio fallbacks, so an
	// overflowed toggle shows the same checkmark (and radio group the same selection)
	// as the control it stands in for. Momentary actions (indent, clipboard, history)
	// carry no state and are absent here.
	const noList = !active.bulletList && !active.orderedList;
	const selectedByValue: Record<string, boolean> = {
		bold: active.bold, italic: active.italic, strikethrough: active.strikethrough,
		inlineCode: active.inlineCode,
		link: active.link,
		quote: active.quote,
		'list:none': noList, 'list:bullet': active.bulletList && !active.taskList, 'list:numbered': active.orderedList, 'list:task': active.taskList,
		'heading:0': !active.codeBlock && active.heading === 0,
		'heading:1': !active.codeBlock && active.heading === 1,
		'heading:2': !active.codeBlock && active.heading === 2,
		'heading:3': !active.codeBlock && active.heading === 3,
		'heading:4': !active.codeBlock && active.heading === 4,
		'heading:5': !active.codeBlock && active.heading === 5,
		'heading:6': !active.codeBlock && active.heading === 6,
		'heading:codeblock': active.codeBlock,
	};
	for (const [value, selected] of Object.entries(selectedByValue)) {
		const selector = `nldd-menu-item[value="${value}"]`;
		root.querySelectorAll(selector).forEach((item) => { (item as any).selected = selected; });
		overflowMenu?.querySelectorAll(selector).forEach((item) => { (item as any).selected = selected; });
	}
};
function toolbarEditor(editor: unknown) {
	return html`
		<div class="demo-editor" @nldd-text-editor-state=${onToolbarState}>
			<nldd-toolbar size="md">
				<nldd-toolbar-item slot="start" label="Nadruk">
					<nldd-segmented-control
						data-group="inline"
						type="checkbox"
						variant="icon"
						accessible-label="Nadruk"
						@change=${(event: CustomEvent) => reconcile(event.currentTarget as Element, ['bold', 'italic', 'strikethrough'], event.detail.values)}
					>
						<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
						<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
						<nldd-segmented-control-item value="strikethrough" text="Doorhalen" icon="strikethrough"></nldd-segmented-control-item>
					</nldd-segmented-control>
					<nldd-menu-group slot="overflow" text="Nadruk">
						<nldd-menu-item type="checkbox" value="bold" text="Vet" icon="bold"></nldd-menu-item>
						<nldd-menu-item type="checkbox" value="italic" text="Cursief" icon="italic"></nldd-menu-item>
						<nldd-menu-item type="checkbox" value="strikethrough" text="Doorhalen" icon="strikethrough"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Code">
					<nldd-toggle-button
						data-group="code"
						variant="icon"
						icon="code"
						accessible-label="Code"
						@change=${(event: CustomEvent) => editorOf(event.currentTarget as Element)?.runCommand('inlineCode')}
					></nldd-toggle-button>
					<nldd-menu-item slot="overflow" type="checkbox" value="inlineCode" text="Code" icon="code"></nldd-menu-item>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Link">
					<nldd-toggle-button
						data-group="link"
						variant="icon"
						icon="link"
						accessible-label="Link"
						@change=${onLink}
					></nldd-toggle-button>
					<nldd-menu-item slot="overflow" type="checkbox" value="link" text="Link" icon="link"></nldd-menu-item>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Citaat">
					<nldd-toggle-button
						data-group="quote"
						variant="icon"
						icon="text-quote"
						accessible-label="Citaat"
						@change=${(event: CustomEvent) => editorOf(event.currentTarget as Element)?.runCommand('quote')}
					></nldd-toggle-button>
					<nldd-menu-item slot="overflow" type="checkbox" value="quote" text="Citaat" icon="text-quote"></nldd-menu-item>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Lijst">
					<nldd-segmented-control
						data-group="list"
						type="radio"
						variant="icon"
						value="none"
						accessible-label="Lijst"
						@change=${onListChange}
					>
						<nldd-segmented-control-item value="none" text="Geen lijst" icon="minus"></nldd-segmented-control-item>
						<nldd-segmented-control-item value="bullet" text="Opsomming" icon="bullet-list"></nldd-segmented-control-item>
						<nldd-segmented-control-item value="numbered" text="Genummerd" icon="numbered-list"></nldd-segmented-control-item>
						<nldd-segmented-control-item value="task" text="Taken" icon="check-list"></nldd-segmented-control-item>
					</nldd-segmented-control>
					<nldd-menu-group slot="overflow" text="Lijst">
						<nldd-menu-item type="radio" value="list:none" text="Geen lijst" icon="minus"></nldd-menu-item>
						<nldd-menu-item type="radio" value="list:bullet" text="Opsomming" icon="bullet-list"></nldd-menu-item>
						<nldd-menu-item type="radio" value="list:numbered" text="Genummerd" icon="numbered-list"></nldd-menu-item>
						<nldd-menu-item type="radio" value="list:task" text="Taken" icon="check-list"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Inspringen">
					<nldd-button-bar data-group="indent">
						<nldd-icon-button icon="indent-increase" text="Meer inspringen" @click=${onIndent}></nldd-icon-button>
						<nldd-button-bar-divider></nldd-button-bar-divider>
						<nldd-icon-button icon="indent-decrease" text="Minder inspringen" @click=${onOutdent}></nldd-icon-button>
					</nldd-button-bar>
					<nldd-menu-group slot="overflow" text="Inspringen">
						<nldd-menu-item value="indent" text="Meer inspringen" icon="indent-increase"></nldd-menu-item>
						<nldd-menu-item value="outdent" text="Minder inspringen" icon="indent-decrease"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Tekststijl">
					<nldd-button data-group="heading" expandable text="Paragraaf">
						<nldd-menu id="heading-menu" slot="popup" @select=${onHeadingSelect}>
							<nldd-menu-item type="radio" value="0" text="Paragraaf" selected></nldd-menu-item>
							<nldd-menu-divider></nldd-menu-divider>
							<nldd-menu-item type="radio" value="1" text="Heading 1"></nldd-menu-item>
							<nldd-menu-item type="radio" value="2" text="Heading 2"></nldd-menu-item>
							<nldd-menu-item type="radio" value="3" text="Heading 3"></nldd-menu-item>
							<nldd-menu-item type="radio" value="4" text="Heading 4"></nldd-menu-item>
							<nldd-menu-item type="radio" value="5" text="Heading 5"></nldd-menu-item>
							<nldd-menu-item type="radio" value="6" text="Heading 6"></nldd-menu-item>
							<nldd-menu-divider></nldd-menu-divider>
							<nldd-menu-item type="radio" value="codeblock" text="Codeblok"></nldd-menu-item>
						</nldd-menu>
					</nldd-button>
					<nldd-menu-group slot="overflow" text="Tekststijl">
						<nldd-menu-item type="radio" value="heading:0" text="Paragraaf"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:1" text="Heading 1"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:2" text="Heading 2"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:3" text="Heading 3"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:4" text="Heading 4"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:5" text="Heading 5"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:6" text="Heading 6"></nldd-menu-item>
						<nldd-menu-item type="radio" value="heading:codeblock" text="Codeblok"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="end" label="Klembord">
					<nldd-button-bar data-group="clipboard">
						<nldd-icon-button icon="copy" text="Kopieer" @click=${onCopy}></nldd-icon-button>
						<nldd-button-bar-divider></nldd-button-bar-divider>
						<nldd-icon-button icon="cut" text="Knip" @click=${onCut}></nldd-icon-button>
						<nldd-button-bar-divider></nldd-button-bar-divider>
						<nldd-icon-button icon="paste" text="Plak" @click=${onPaste}></nldd-icon-button>
					</nldd-button-bar>
					<nldd-menu-group slot="overflow" text="Klembord">
						<nldd-menu-item value="copy" text="Kopieer" icon="copy"></nldd-menu-item>
						<nldd-menu-item value="cut" text="Knip" icon="cut"></nldd-menu-item>
						<nldd-menu-item value="paste" text="Plak" icon="paste"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="end" label="Geschiedenis">
					<nldd-button-bar data-group="history">
						<nldd-icon-button icon="undo" text="Maak ongedaan" @click=${onUndo}></nldd-icon-button>
						<nldd-button-bar-divider></nldd-button-bar-divider>
						<nldd-icon-button icon="redo" text="Voer opnieuw uit" @click=${onRedo}></nldd-icon-button>
					</nldd-button-bar>
					<nldd-menu-group slot="overflow" text="Geschiedenis">
						<nldd-menu-item value="undo" text="Maak ongedaan" icon="undo"></nldd-menu-item>
						<nldd-menu-item value="redo" text="Voer opnieuw uit" icon="redo"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
			</nldd-toolbar>
			<nldd-spacer size="24"></nldd-spacer>
			${editor}
		</div>
	`;
}

export default {
	title: 'Components/Inputs/Text Editor',
	component: 'nldd-text-editor',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/text-editor/text-editor.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		variant: 'simple',
		value: SAMPLE,
		placeholder: '',
		rows: 8,
		resize: 'auto',
		wrap: true,
		invalid: false,
		readonly: false,
		required: false,
		disabled: false,
		accessibleLabel: 'Tekst',
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['simple', 'input-field'],
			description: 'Visuele variant. "simple" is kaal zonder focusring; "input-field" voegt rand, vulling, padding, hoeken en focusring toe.',
			table: { defaultValue: { summary: 'simple' } },
		},
		value: {
			control: 'text',
			description: 'De inhoud (markdown)',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder tekst',
		},
		rows: {
			control: 'number',
			description: 'Minimale zichtbare regels (de vloer in elke resize-modus)',
			table: { defaultValue: { summary: 6 } },
		},
		resize: {
			control: 'select',
			options: ['none', 'vertical', 'auto'],
			description: 'Resize-gedrag. auto = groeit mee, vertical = slepen vanaf rows, none = vast.',
			table: { defaultValue: { summary: 'auto' } },
		},
		wrap: {
			control: 'boolean',
			description: 'Lange regels afbreken (default aan; proza wrapt)',
			table: { defaultValue: { summary: true } },
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen staat',
			table: { defaultValue: { summary: false } },
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label',
			table: { defaultValue: { summary: 'Tekst' } },
		},
	},
};

const Template = ({
	variant,
	value,
	placeholder,
	rows,
	resize,
	wrap,
	invalid,
	readonly,
	required,
	disabled,
	accessibleLabel,
}: Record<string, any>) => html`
	<nldd-text-editor
		variant=${variant as string}
		.value=${value || ''}
		placeholder=${placeholder || nothing}
		rows=${rows as number}
		resize=${resize as string}
		?wrap=${wrap}
		?readonly=${readonly}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		accessible-label=${accessibleLabel || nothing}
	></nldd-text-editor>
`;

export const Default = {
	render: Template,
};

export const InputField = {
	render: () => html`
		<nldd-text-editor variant="input-field" rows="10" .value=${SAMPLE} accessible-label="Tekst"></nldd-text-editor>
	`,
	parameters: {
		docs: {
			description: {
				story: 'De `input-field`-variant: kader, vulling, padding, hoeken en focusring — een op zichzelf staand veld. De default is `simple` (kaal), bedoeld om in een eigen compositie te plaatsen die de chrome en focusbehandeling levert.',
			},
		},
	},
};

export const Links = {
	render: () => html`
		<nldd-text-editor
			rows="10"
			accessible-label="Tekst"
			.value=${[
				'Een markdown-link: [Regelrecht](https://regelrecht.rijks.app).',
				'',
				'En een plat geplakte URL: https://regelrecht.rijks.app — die krijgt dezelfde badge.',
				'',
				'Ook www.rijksoverheid.nl en info@rijksoverheid.nl worden herkend.',
			].join('\n')}
		></nldd-text-editor>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Elke link krijgt een "open in nieuw tabblad"-badge — niet alleen markdown-links (`[tekst](url)`), maar ook plat geplakte URL\'s (GFM-autolinks). Scheme-loze vormen krijgen er een: `www.…` → https, een e-mailadres → mailto. De badge is direct klikbaar zonder eerst de caret te plaatsen.',
			},
		},
	},
};

export const Placeholder = {
	render: () => html`
		<nldd-text-editor rows="6" placeholder="Schrijf hier je toelichting in markdown…" accessible-label="Tekst"></nldd-text-editor>
	`,
	parameters: { controls: { disable: true } },
};

export const Mentions = {
	render: () => {
		const users = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid' },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie' },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data' },
			{ id: '4', text: 'Dewi Pratama', supportingText: 'Juridisch' },
			{ id: '5', text: 'Emma Bakker', supportingText: 'Beleid' },
		];
		const source = (query: string) =>
			users.filter((user) => user.text.toLowerCase().includes(query.toLowerCase()));
		const sample = 'Bespreek dit met [@Anouk de Vries](user:1) en [@Bram Jansen](user:2).\n\nTyp `@` om iemand te noemen.';
		return html`
			<nldd-text-editor
				rows="8"
				accessible-label="Tekst"
				.value=${sample}
				.mentionSource=${source}
				@nldd-text-editor-mention=${(event: CustomEvent) => action('nldd-text-editor-mention')(event.detail)}
			></nldd-text-editor>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Typ `@` voor een typeahead. De editor kent zelf geen gebruikers: de consumer levert kandidaten via de `mentionSource`-property (aangeroepen met de tekst na `@`). Een keuze voegt een markdown-token `[@Naam](user:id)` in (als token gerenderd, degradeert tot een gewone link) en vuurt `nldd-text-editor-mention` met id + range.',
			},
		},
	},
};

export const MentionsInEenOverlay = {
	render: () => {
		const users = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid' },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie' },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data' },
			{ id: '4', text: 'Dewi Pratama', supportingText: 'Juridisch' },
			{ id: '5', text: 'Emma Bakker', supportingText: 'Beleid' },
		];
		const source = (query: string) =>
			users.filter((user) => user.text.toLowerCase().includes(query.toLowerCase()));
		const tags = [
			{ trigger: '#', source: (query: string) => ['beleid', 'begroting', 'besluit', 'bezwaar']
				.filter((tag) => tag.startsWith(query.toLowerCase()))
				.map((tag) => ({ id: tag, text: tag, symbol: '#' })) },
		];
		const open = (e: Record<string, any>) => e.currentTarget.nextElementSibling.show();
		return html`
			<nldd-button variant="primary" text="Open modal dialog" @click=${open}></nldd-button>
			<nldd-modal-dialog accessible-label="Notitie">
				<nldd-text-editor
					rows="6"
					accessible-label="Notitie"
					.value=${'Typ `@` voor een naam of `#` voor een label.'}
					.mentionSource=${source}
					.typeaheads=${tags}
				></nldd-text-editor>
				<nldd-button slot="actions" variant="primary" text="Bewaar"></nldd-button>
			</nldd-modal-dialog>

			<nldd-button variant="secondary" text="Open sheet" @click=${open}></nldd-button>
			<nldd-sheet accessible-label="Notitie in een sheet">
				<nldd-container padding="16">
					<nldd-text-editor
						rows="6"
						accessible-label="Notitie"
						.value=${'Ook hier: typ `@` of `#`.'}
						.mentionSource=${source}
						.typeaheads=${tags}
					></nldd-text-editor>
				</nldd-container>
			</nldd-sheet>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De typeahead in een overlay. Open de dialog of de sheet en typ `@` of `#`: de lijst hoort pal onder de cursor te staan, in z\'n volle hoogte, en niet ergens naast het scherm. CodeMirror hangt zijn lijst in de editor, dus gold alles eromheen ook voor de lijst: een overlay verbergt z\'n overflow en knipte hem af, en een voorouder met een transform werd het referentiekader voor een `fixed` popup, waardoor hij naast de pagina belandde. De lijst opent nu in de top layer, net als een nldd-menu. Test dit met het browservenster op de voorgrond: CodeMirror plaatst de popup in een `requestAnimationFrame`, en die staat stil in een achtergrondtab.',
			},
		},
	},
};

export const Typeaheads = {
	render: () => {
		const people = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid', avatar: {} },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie', avatar: {} },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data', avatar: {} },
			{ id: '4', text: 'Dienst Toeslagen', supportingText: 'Organisatie', avatar: { type: 'organization' as const } },
		];
		const channels = [
			{ id: 'algemeen', text: 'algemeen', supportingText: 'Het hele team', icon: 'tag' },
			{ id: 'zorgtoeslag', text: 'zorgtoeslag', supportingText: 'Het traject', icon: 'tag' },
			{ id: 'vragen', text: 'vragen', supportingText: 'Hulp en vragen', icon: 'tag' },
		];
		// The shortcode convention of Mattermost and Slack: `:smile:`, the closing
		// colon in the text. Without an `insert` a choice writes `:smile: `, which
		// those systems render themselves; this editor does not, so it writes the
		// emoji itself.
		const emoji = [
			{ id: 'smile', text: 'smile:', symbol: '😄' },
			{ id: 'thumbsup', text: 'thumbsup:', symbol: '👍' },
			{ id: 'tada', text: 'tada:', symbol: '🎉' },
			{ id: 'thinking', text: 'thinking:', symbol: '🤔' },
		];
		const filter = <T extends { text: string }>(items: T[]) => (query: string) =>
			items.filter((item) => item.text.toLowerCase().includes(query.toLowerCase()));
		const typeaheads = [
			{ trigger: '#', source: filter(channels) },
			{ trigger: ':', source: filter(emoji), insert: (candidate: { symbol?: string }) => `${candidate.symbol} ` },
		];
		const sample = 'Typ `@` voor een persoon, `#` voor een kanaal en `:` voor een emoji.';
		const insertDate = (event: Event): void => {
			const editor = (event.currentTarget as Element).parentElement?.querySelector('nldd-text-editor') as unknown as { insertAtCursor(text: string): void } | null;
			editor?.insertAtCursor(new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }));
		};
		return html`
			<div class="demo-editor">
				<nldd-text-editor
					rows="8"
					accessible-label="Bericht"
					.value=${sample}
					.mentionSource=${filter(people)}
					.typeaheads=${typeaheads}
					@nldd-text-editor-mention=${(event: CustomEvent) => action('nldd-text-editor-mention')(event.detail)}
					@nldd-text-editor-typeahead=${(event: CustomEvent) => action('nldd-text-editor-typeahead')(event.detail)}
				></nldd-text-editor>
				<nldd-button variant="secondary" text="Datum invoegen" @click=${insertDate}></nldd-button>
			</div>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Naast de ingebouwde `@`-mention geef je eigen lijsten op via de `typeaheads`-property: een trigger-teken, een `source` met kandidaten voor wat er na de trigger is getypt, en optioneel een `insert` die bepaalt wat een keuze schrijft. Standaard is dat de trigger, de `text` en een spatie: met `text: "smile:"` dus `:smile: `, de shortcode die Mattermost en Slack zelf renderen. Deze editor doet dat niet, dus hier schrijft `:` de emoji zelf. Meerdere lijsten op één trigger worden samengevoegd. Een kandidaat kan een `avatar` meekrijgen (persoon of organisatie, initialen of een afbeelding; de rij wordt dan tweeregelig met `supportingText` eronder), een `icon` (op de maat van een menu-item) of een `symbol` (een teken of emoji, de emoji zelf als beeld). Een keuze uit een eigen lijst vuurt `nldd-text-editor-typeahead` met de trigger, de kandidaat en de positie. De knop laat `insertAtCursor(tekst)` zien: tekst op de caret, in plaats van een selectie.',
			},
		},
	},
};

export const Annotations = {
	render: () => {
		const sample =
			'De Rijksoverheid werkt aan een toegankelijk designsysteem. Componenten zijn herbruikbaar en consistent.\n\nFeedback is welkom op elk onderdeel.';
		const at = (needle: string) => {
			const start = sample.indexOf(needle);
			return { start, end: start + needle.length, quote: needle };
		};
		const annotations = [
			{ id: 'a1', ...at('toegankelijk designsysteem') },
			{ id: 'a2', ...at('herbruikbaar en consistent') },
			// Two annotations on the same text merge into one underline + a "2" badge.
			{ id: 'a3', ...at('Feedback') },
			{ id: 'a4', ...at('Feedback is welkom') },
		];
		return html`
			<nldd-text-editor
				rows="8"
				annotatable
				accessible-label="Tekst"
				.value=${sample}
				.annotations=${annotations}
			></nldd-text-editor>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Annotaties leven buiten de markdown (de tekst blijft schoon); de consumer levert ze via de `annotations`-property. Elke annotatie ankert op een teken-offset (met de geciteerde tekst voor her-ankeren) en rendert als een lichte tint plus een dashed underline, met een telbadge aan het einde. Eén kleur voor alle annotaties: het type komt uit de pane van de consumer, niet uit de kleur. Annotaties op dezelfde tekst mergen tot een onderstreping met een gecombineerde telling.',
			},
		},
	},
};

export const AnnotationAuthoring = {
	render: () => {
		const wrap = document.createElement('div');
		wrap.style.display = 'grid';
		wrap.style.gap = '8px';

		const bar = document.createElement('div');
		bar.style.display = 'flex';
		bar.style.gap = '12px';
		bar.style.alignItems = 'center';

		// The "comment" affordance lives in the consumer's toolbar (not inside the
		// editor): it reads getSelection() and adds an annotation on the range.
		const commentBtn = document.createElement('nldd-icon-button');
		commentBtn.setAttribute('icon', 'comment');
		commentBtn.setAttribute('label', 'Reactie toevoegen');
		commentBtn.setAttribute('variant', 'secondary');
		(commentBtn as unknown as { disabled: boolean }).disabled = true;

		const status = document.createElement('span');

		const editor = document.createElement('nldd-text-editor');
		editor.setAttribute('rows', '6');
		editor.setAttribute('annotatable', '');
		editor.setAttribute('accessible-label', 'Tekst');
		(editor as unknown as { value: string }).value =
			'Selecteer een stuk tekst en klik op de reactie-knop om er een annotatie op te plaatsen. Klik daarna op de telbadge om de annotation-click te zien.';

		interface StoryAnnotation { id: string; start: number; end: number; quote: string }
		const annotations: StoryAnnotation[] = [];
		let counter = 0;
		const sync = () => {
			(editor as unknown as { annotations: StoryAnnotation[] }).annotations = [...annotations];
			status.textContent = `${annotations.length} annotatie(s)`;
		};
		sync();

		// Enable the button only when there is a non-empty selection (from the state event).
		editor.addEventListener('nldd-text-editor-state', (e) => {
			(commentBtn as unknown as { disabled: boolean }).disabled = (e as CustomEvent<{ empty: boolean }>).detail.empty;
		});
		commentBtn.addEventListener('click', () => {
			const sel = (editor as unknown as { getSelection(): StoryAnnotation & { empty: boolean } }).getSelection();
			if (sel.empty) return;
			counter += 1;
			annotations.push({ id: `note-${counter}`, start: sel.start, end: sel.end, quote: sel.quote });
			sync();
		});
		editor.addEventListener('nldd-text-editor-annotation-click', (e) => {
			status.textContent = `Geklikt op: ${(e as CustomEvent<{ ids: string[] }>).detail.ids.join(', ')}`;
		});

		bar.append(commentBtn, status);
		wrap.append(bar, editor);
		return wrap;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De volledige authoring-loop zoals een consumer (bijv. regelrecht) hem bouwt: een "reactie"-knop in de eigen toolbar leest `getSelection()` (clean offsets + quote) en voegt een annotatie toe; de knop is uitgeschakeld zolang de selectie leeg is (uit het `nldd-text-editor-state`-event). Een klik op de telbadge vuurt `nldd-text-editor-annotation-click` met de id(s). Annotaties bewegen mee met edits; `getAnnotations()` geeft de mee-geschoven posities terug om op te slaan.',
			},
		},
	},
};

export const Mixed = {
	render: () => {
		const users = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid' },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie' },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data' },
			{ id: '4', text: 'Dewi Pratama', supportingText: 'Juridisch' },
		];
		const source = (query: string) =>
			users.filter((user) => user.text.toLowerCase().includes(query.toLowerCase()));
		const sample = [
			'# Projectupdate toegankelijkheid',
			'',
			'We verbeteren het **burgerportaal** met [@Anouk de Vries](user:1). De `WCAG 2.2`-criteria zijn leidend, zie de [WCAG-richtlijn](https://www.w3.org/TR/WCAG22/).',
			'',
			'## Actiepunten',
			'',
			'- Contrast op de knoppen verhogen',
			'- Focus-states nalopen met [@Bram Jansen](user:2)',
			'- Screenreader-tests inplannen voor de livegang',
			'',
			'> Let op: de deadline is volgende week vrijdag.',
			'',
			'Voer de toegankelijkheidscheck uit met:',
			'',
			'```bash',
			'npm run test:a11y',
			'```',
			'',
			'Noem iemand met `@` of selecteer tekst voor een annotatie.',
		].join('\n');
		const at = (needle: string) => {
			const start = sample.indexOf(needle);
			return { start, end: start + needle.length, quote: needle };
		};
		const annotations = [
			{ id: 'm1', ...at('leidend') },
			{ id: 'm2', ...at('Contrast op de knoppen verhogen') },
			{ id: 'm3', ...at('deadline is volgende week vrijdag') },
			// Overlapping pair → one block with a "2" badge.
			{ id: 'm4', ...at('Screenreader-tests') },
			{ id: 'm5', ...at('Screenreader-tests inplannen voor de livegang') },
		];
		return toolbarEditor(html`
			<nldd-text-editor
				variant="simple"
				rows="15"
				annotatable
				accessible-label="Tekst"
				.value=${sample}
				.mentionSource=${source}
				.annotations=${annotations}
				@nldd-text-editor-mention=${(event: CustomEvent) => action('nldd-text-editor-mention')(event.detail)}
			></nldd-text-editor>
		`);
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Alles samen: een echte toolbar (DS-componenten, headless gekoppeld) boven een `simple`-editor met annotaties en @-mentions, door verschillende soorten content heen (koppen, vet, inline code, een lijst, een blockquote en links). De annotatie-overlay en de mention-tokens bestaan naast elkaar zonder elkaar in de weg te zitten; de tekst blijft schone markdown.',
			},
		},
	},
};

export const WithToolbar = {
	render: () =>
		toolbarEditor(
			html`<nldd-text-editor variant="simple" rows="10" .value=${SAMPLE} accessible-label="Tekst"></nldd-text-editor>`,
		),
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De editor is headless. Deze toolbar is opgebouwd uit DS-componenten — `nldd-toolbar` met icon-`nldd-segmented-control`s (nadruk vet/cursief, code, citaat, en een exclusieve lijst-keuze geen/opsomming/genummerd) en een uitklapbare `nldd-button` met een `nldd-menu` voor de tekststijl (Paragraaf/Heading 1/…). Tweerichtings gekoppeld: de controls sturen de editor (`runCommand`, `setList`, `setHeading`) en het `nldd-text-editor-state`-event zet hun actieve staat. Sneltoetsen Cmd/Ctrl+B/I/E/K werken ook.',
			},
		},
	},
};
