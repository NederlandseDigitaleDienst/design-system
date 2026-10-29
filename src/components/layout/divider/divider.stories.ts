import { html } from 'lit';
import './divider.js';
import '../../content/text/text.js';

/**
 * Gebruik een scheidingslijn om secties van inhoud visueel van elkaar te scheiden.
 * De scheidingslijn loopt altijd horizontaal en past zich aan de breedte van zijn container aan.
 *
 * ## Gebruik
 * ```html
 * <nldd-divider></nldd-divider>
 * ```
 */
export default {
	title: 'Components/Layout/Divider',
	component: 'nldd-divider',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/divider/divider.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
};

export const Standaard = () => html`
	<nldd-text>
		Inhoud boven de scheidingslijn.
	</nldd-text>
	<nldd-divider></nldd-divider>
	<nldd-text>
		Inhoud onder de scheidingslijn.
	</nldd-text>
`;
