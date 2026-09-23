import { html } from 'lit';
import './pagination.js';

/**
 * De Pagination component voor het navigeren tussen pagina's met inhoud.
 *
 * ## Gebruik
 * ```html
 * <nldd-pagination current="1" total="10"></nldd-pagination>
 *
 * <!-- Met links in plaats van buttons -->
 * <nldd-pagination current="1" total="10" href-pattern="/resultaten?pagina={page}"></nldd-pagination>
 * ```
 */
export default {
	title: 'Components/Navigation/Pagination',
	component: 'nldd-pagination',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/pagination/pagination.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		centered: {
			control: 'boolean',
			description: 'Centers the pagination in the container (host fills the row, items group in the middle)',
			table: { defaultValue: { summary: false } },
		},
		current: {
			control: { type: 'number', min: 1 },
			description: 'Huidige actieve pagina (1-gebaseerd)',
			table: { defaultValue: { summary: 1 } },
		},
		total: {
			control: { type: 'number', min: 1 },
			description: 'Totaal aantal pagina\'s',
			table: { defaultValue: { summary: 1 } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
	},
	args: {
		centered: false,
		current: 1,
		total: 10,
		disabled: false,
	},
};

const Template = ({ centered, current, total, disabled}: Record<string, any>) => html`
	<nldd-pagination
		current=${current}
		total=${total}
		?disabled=${disabled}
		?centered=${centered}
	></nldd-pagination>
`;

export const Standaard = {
	render: Template,
	args: { current: 1, total: 10 },
};

export const VeelPaginas = {
	render: Template,
	args: { current: 25, total: 100 },
};

export const WeinigPaginas = {
	render: Template,
	args: { current: 2, total: 3 },
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: { current: 3, total: 10, disabled: true },
};

export const MetLinks = {
	render: () => html`
	<nldd-pagination current="3" total="10" href-pattern="/resultaten?pagina={page}"></nldd-pagination>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met <code>href-pattern</code> worden pagina-knoppen als links gerenderd in plaats van buttons. Beter voor SEO en bookmarkbare pagina\'s.',
			},
	},
},
};
