import { html, nothing } from 'lit';
import './term.js';
import '../text/text.js';
import '../rich-text/rich-text.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../../navigation/link/link.js';
import '../../layout/spacer/spacer.js';

export default {
	title: 'Components/Content/Term',
	component: 'nldd-term',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/term/term.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		definition: 'Degene die het doel van en de middelen voor de verwerking van persoonsgegevens vaststelt.',
	},
	argTypes: {
		definition: {
			control: 'text',
			description: 'De definitie als platte tekst. De term toont hem in een eigen popover.',
		},
		popovertarget: {
			control: false,
			description: 'Id van een `nldd-popover` elders op de pagina met de definitie. De term zet hem naast zich neer, dus de popover heeft geen `anchor` nodig, en elke term voor hetzelfde begrip kan hem delen. Wint van `definition`.',
		},
	},
};

const Template = ({
	definition,
}: Record<string, unknown>) => html`
	<nldd-text>
		De
		<nldd-term
			definition=${definition || nothing}
		>
			verwerkingsverantwoordelijke
		</nldd-term>
		bepaalt of een DPIA nodig is.
	</nldd-text>
`;

export const Standaard = {
	render: Template,
};

export const MetPopovertarget = {
	render: () => html`
		<nldd-text>
			Een
			<nldd-term popovertarget="term-dpia">data protection impact assessment</nldd-term>
			brengt in kaart wat een verwerking betekent voor de mensen om wie het gaat. Een term van meer woorden loopt mee over de regel, net als de rest van de zin. Vraag daarom een
			<nldd-term popovertarget="term-dpia">DPIA</nldd-term>
			aan voordat de verwerking begint.
		</nldd-text>
		<nldd-popover
			id="term-dpia"
			accessible-label="Data protection impact assessment"
		>
			<nldd-container
				padding="16"
			>
				<nldd-rich-text>
					<p>Een beoordeling vooraf van de risico's van een verwerking voor de mensen van wie de gegevens zijn.</p>
					<p>Verplicht als een verwerking waarschijnlijk een hoog risico oplevert.</p>
				</nldd-rich-text>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-text
					size="sm"
					color="secondary"
				>
					Bron:
					<nldd-link href="#begrippenkader">Begrippenkader</nldd-link>
				</nldd-text>
			</nldd-container>
		</nldd-popover>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een definitie met meer alinea\'s, een bron of een link is een eigen `nldd-popover` buiten de zin, waar `popovertarget` naar wijst. Beide termen gebruiken hier dezelfde popover: hij opent bij de term waarop je klikt.',
			},
		},
	},
};
