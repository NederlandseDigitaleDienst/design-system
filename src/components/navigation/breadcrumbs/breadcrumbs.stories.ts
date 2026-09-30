import { html, nothing } from 'lit';
import './breadcrumbs.js';

export default {
	title: 'Components/Navigation/Breadcrumbs',
	component: 'nldd-breadcrumbs',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/breadcrumbs/breadcrumbs.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		accessibleLabel: '',
	},
	argTypes: {
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Overschrijft het aria-label op de `<nav>`. Leeg laten geeft de vertaling, standaard "Kruimelpad".',
			table: { defaultValue: { summary: 'Kruimelpad' } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-breadcrumbs
			accessible-label=${args.accessibleLabel || nothing}
		>
			<nldd-breadcrumbs-item
				text="Home"
				href="/"
			></nldd-breadcrumbs-item>
			<nldd-breadcrumbs-item
				text="Documentatie"
				href="/docs/"
			></nldd-breadcrumbs-item>
			<nldd-breadcrumbs-item
				text="Architectuur"
				href="/docs/architecture"
			></nldd-breadcrumbs-item>
			<nldd-breadcrumbs-item
				text="Detail"
				current
			></nldd-breadcrumbs-item>
		</nldd-breadcrumbs>
	`,
};

/**
 * In een smalle container wrapt het kruimelpad over meerdere regels, zodat het
 * op elke breedte past.
 */
export const SmalleContainer = {
	render: () => html`
		<div style="max-width: 320px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item
					text="Home"
					href="/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Documentatie"
					href="/docs/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Architectuur"
					href="/docs/architecture"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Huidige pagina"
					current
				></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
