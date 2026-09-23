import { html, nothing } from 'lit';
import './code-editor.js';
import '../../layout/container/container.js';

const SAMPLE_YAML = `# wet_op_de_zorgtoeslag — artikel 2
$id: zorgtoeslagwet
articles:
  - number: '2'
    title: 'Recht op zorgtoeslag'
    is_active: true
    threshold: 32502`;

const SAMPLE_JSON = `{
  "lawId": "zorgtoeslagwet",
  "active": true,
  "threshold": 32502
}`;

/* A layout container owns the (responsive) space; this small bridge forwards
 * clicks on the container's own padding to the editor so clicking next to the
 * text still starts editing on the nearest line. */
const forwardClickToEditor = (event: PointerEvent) => {
	const container = event.currentTarget as HTMLElement;
	// Shadow retargeting: padding clicks have target === container; clicks in
	// the editor have target === the editor — only forward the former.
	if (event.target !== container) return;
	event.preventDefault();
	const editor = container.querySelector('nldd-code-editor') as (HTMLElement & { focusFromPoint(x: number, y: number): void }) | null;
	editor?.focusFromPoint(event.clientX, event.clientY);
};

export default {
	title: 'Components/Inputs/Code Editor',
	component: 'nldd-code-editor',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/code-editor/code-editor.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		variant: 'simple',
		language: '',
		lineNumbers: false,
		value: '',
		placeholder: '',
		rows: 6,
		resize: 'auto',
		wrap: false,
		invalid: false,
		readonly: false,
		required: false,
		disabled: false,
		accessibleLabel: 'Code',
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['simple', 'input-field'],
			description: 'Visuele variant. "simple" (default) is kaal zonder focusring en zonder eigen ruimte; "input-field" voegt rand, vulling, padding, hoeken en focusring toe.',
			table: { defaultValue: { summary: 'simple' } },
		},
		language: {
			control: 'select',
			options: ['(geen)', 'yaml', 'json', 'javascript', 'typescript', 'css', 'html', 'xml', 'bash', 'markdown', 'rust', 'gherkin', 'toml', 'sql', 'python'],
			mapping: { '(geen)': '' },
			description: 'Grammatica voor syntax-highlighting (lazy geladen). Leeg = geen highlighting.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		lineNumbers: {
			name: 'line-numbers',
			control: 'boolean',
			description: 'Toon een regelnummer-gutter (klik een nummer om de caret naar die regel te zetten)',
			table: { defaultValue: { summary: false } },
		},
		value: {
			control: 'text',
			description: 'De inhoud van het veld',
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
			description: 'Wrap lange regels in plaats van horizontaal scrollen',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen staat (focusbaar en selecteerbaar, niet bewerkbaar)',
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
			table: { defaultValue: { summary: 'Code' } },
		},
	},
};

const Template = ({
	variant,
	language,
	lineNumbers,
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
}: Record<string, unknown>) => html`
	<nldd-code-editor
		variant=${variant as string}
		language=${language || nothing}
		?line-numbers=${lineNumbers}
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
	></nldd-code-editor>
`;

export const Standaard = {
	render: Template,
};

export const VariantInputField = {
	name: 'Variant input-field',
	render: () => html`
		<nldd-code-editor
			variant="input-field"
			language="yaml"
			rows="8"
			.value=${SAMPLE_YAML}
			accessible-label="Code"
		></nldd-code-editor>
	`,
	parameters: { controls: { disable: true } },
};

export const MetSyntaxkleuring = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<nldd-code-editor variant="input-field" language="yaml" rows="8" .value=${SAMPLE_YAML} accessible-label="YAML"></nldd-code-editor>
			<nldd-code-editor variant="input-field" language="json" rows="6" .value=${SAMPLE_JSON} accessible-label="JSON"></nldd-code-editor>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const MetRegelnummers = {
	render: () => html`
		<nldd-code-editor
			variant="input-field"
			language="json"
			line-numbers
			rows="6"
			.value=${SAMPLE_JSON}
			accessible-label="Code"
		></nldd-code-editor>
	`,
	parameters: { controls: { disable: true } },
};

export const VariantSimple = {
	name: 'Variant simple',
	render: () => html`
		<nldd-code-editor
			variant="simple"
			language="yaml"
			rows="8"
			.value=${SAMPLE_YAML}
			accessible-label="Code"
		></nldd-code-editor>
	`,
	parameters: {
		docs: {
			description: {
				story: 'De simple variant heeft geen kader, focusring of eigen ruimte — bij focus toont een prominente accent-caret waar je staat. Bedoeld om in een eigen compositie (bv. een message field) te plaatsen die zelf de chrome en focusbehandeling levert.',
			},
		},
	},
};

export const InEenContainer = {
	render: () => html`
		<nldd-container
			padding="24"
			@pointerdown=${forwardClickToEditor}
			style="background: var(--semantics-surfaces-tinted-background-color); border-radius: var(--primitives-corner-radius-lg);"
		>
			<nldd-code-editor
				variant="simple"
				language="yaml"
				rows="6"
				.value=${SAMPLE_YAML}
				accessible-label="Code"
			></nldd-code-editor>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een generieke `nldd-container` bepaalt de (responsive) ruimte; een klein bruggetje stuurt kliks op de container-padding door naar de editor via `focusFromPoint()`. Klik in de rand rond de tekst — de caret springt naar de dichtstbijzijnde regel, zonder dat de editor zelf padding hoeft te beheren.',
			},
		},
	},
};

export const MetWrap = {
	render: () => html`
		<nldd-code-editor
			variant="input-field"
			wrap
			rows="4"
			.value=${'function deeplyNestedFunctionWithAVeryLongNameThatExceedsTheTypicalContainerWidth(parameterOne, parameterTwo, parameterThree) { return parameterOne + parameterTwo + parameterThree; }'}
			accessible-label="Code"
		></nldd-code-editor>
	`,
	parameters: { controls: { disable: true } },
};

export const ToestandReadonly = {
	name: 'Toestand readonly',
	render: () => html`
		<nldd-code-editor
			variant="input-field"
			language="json"
			readonly
			.value=${SAMPLE_JSON}
			accessible-label="Code"
		></nldd-code-editor>
	`,
	parameters: { controls: { disable: true } },
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
		<nldd-code-editor
			variant="input-field"
			disabled
			.value=${'# disabled\nfoo: bar'}
			accessible-label="Code"
		></nldd-code-editor>
	`,
	parameters: { controls: { disable: true } },
};
