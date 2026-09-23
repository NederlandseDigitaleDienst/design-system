import { html, nothing, render } from 'lit';
import './list-item.js';
import '../list/list.js';
import '../cells/text-cell/text-cell.js';
import '../cells/spacer-cell/spacer-cell.js';
import '../cells/icon-cell/icon-cell.js';
import '../cells/drag-handle-cell/drag-handle-cell.js';
import '../../content/icon/icon.js';
import '../list-item-segment/list-item-segment.js';

export default {
	title: 'Components/Lists & Tables/List Item',
	component: 'nldd-list-item',
	tags: ['autodocs'],
	args: {
		size: 'md',
		href: '',
		button: false,
		checkbox: false,
		radio: false,
		selected: false,
		checked: false,
		expanded: false,
		current: false,
		disabled: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Grootte van de rij. Gaat door naar de cellen waar `size` hetzelfde betekent, dus je zet hem één keer per rij.',
			table: { defaultValue: { summary: 'md' } },
		},
		href: {
			control: 'text',
			description: 'Maakt het hele item een link. Wint van `checkbox`, `radio` en `button`.',
		},
		button: {
			control: 'boolean',
			description: 'Maakt het hele item een button. De laatste van de vier: `href`, `checkbox` en `radio` winnen er alle drie van.',
			table: { defaultValue: { summary: false } },
		},
		checkbox: {
			control: 'boolean',
			description: 'Maakt de hele rij een checkbox-control. Wint van `radio` en `button`, verliest van `href`.',
			table: { defaultValue: { summary: false } },
		},
		radio: {
			control: 'boolean',
			description: 'Maakt de hele rij één radio van een groep. Zet de rijen in een `nldd-list type="radiogroup"`. Wint van `button`, verliest van `href` en `checkbox`.',
			table: { defaultValue: { summary: false } },
		},
		selected: {
			control: 'boolean',
			description: 'Een rij die je koos. Blijft grijs, ook met de focus erin; er mogen er meerdere zijn. Voor de rij waar je bent is `current` de juiste.',
			table: { defaultValue: { summary: false } },
		},
		checked: {
			control: 'boolean',
			description: 'Aangevinkte staat van een checkbox- of radio-rij.',
			table: { defaultValue: { summary: false } },
		},
		expanded: {
			control: 'boolean',
			description: 'Uitklapstaat; hoort bij een rij die iets opent (de kindrijen van een tak)',
		},
		current: {
			control: 'boolean',
			description: 'De rij waar je bent: de pagina waar een menu-item heen wijst, het record dat de lijst open heeft staan. In rust net zo grijs als `selected`, en zodra de focus in de rij staat kleurt hij accent. Eén rij per lijst draagt het, waar `selected` er meerdere mag hebben.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Zet de eigen control van de rij uit: een `button`- of `checkbox`-rij reageert niet meer en dimt, een `href`-rij krijgt `aria-disabled` en een geblokkeerde klik. Een rij zonder eigen control heeft niets om uit te zetten, en segmenten hebben hun eigen `disabled`. De pijltjes slaan een uitgezette rij over.',
			table: { defaultValue: { summary: false } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-list variant="simple">
			<nldd-list-item
				size=${args.size}
				href=${args.href || nothing}
				?button=${args.button}
				?checkbox=${args.checkbox}
				?radio=${args.radio}
				?selected=${args.selected}
				?checked=${args.checked}
				?expanded=${args.expanded}
				?current=${args.current}
				?disabled=${args.disabled}
			>
				<nldd-text-cell text="Text cell" supporting-text="Supporting text"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const GrootteMd = {
	name: 'Grootte md',
	render: () => html`
		<nldd-list variant="simple">
			<nldd-list-item size="md">
				<nldd-text-cell text="Medium size item"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const GrootteSm = {
	name: 'Grootte sm',
	render: () => html`
		<nldd-list variant="simple">
			<nldd-list-item size="sm">
				<nldd-text-cell size="sm" text="Small size item"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const ToestandSelected = {
	name: 'Toestand selected',
	render: () => html`
		<nldd-list variant="simple">
			<nldd-list-item>
				<nldd-text-cell text="Not selected"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item selected>
				<nldd-text-cell text="Selected item"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell text="Not selected"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

/**
 * `current` is de rij waar je bent, `selected` een rij die je koos. In rust zien
 * ze er hetzelfde uit; het verschil laat zich zien zodra de focus in de rij
 * staat, en dan gaat alleen de current-rij naar accent. Dat werkt ook wanneer
 * die focus in een geneste `nldd-list-item-segment` zit, waar een gesegmenteerde
 * rij geen eigen knop heeft om op af te gaan.
 *
 * Verder ligt elke staat op dezelfde ladder als bij de buttons: een rust-, een
 * hover- en een indruk-trede, telkens een palettrap uit elkaar. Loop er met de
 * muis en met Tab langs.
 *
 * De laatste twee rijen zetten die twee naast elkaar in de gesegmenteerde vorm.
 * In rust zijn ze niet te onderscheiden: allebei grijs, en hover en indruk
 * blijven bij het segment waar de muis staat. Tab er dan doorheen, want daar
 * scheiden ze: de current-rij gaat naar accent zodra de focus in een van z'n
 * segmenten zit, de selected-rij blijft grijs. Voor `expanded`, de staat van een
 * segment dat iets open heeft staan, zie de story van `nldd-list-item-segment`.
 */
export const AlleToestanden = {
	render: () => html`
		<nldd-list type="navigation" aria-label="Staten">
			<nldd-list-item button>
				<nldd-text-cell text="Interactief: rust, hover, ingedrukt"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item button selected>
				<nldd-text-cell text="Selected: rust, hover, ingedrukt (nooit accent)"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item button current>
				<nldd-text-cell text="Current: grijs tot de focus erin staat, dan accent"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item current>
				<nldd-list-item-segment button disclosure accessible-label="Uitklappen">
					<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
				</nldd-list-item-segment>
				<nldd-list-item-segment button width="full">
					<nldd-text-cell text="Current met segmenten: focus in een segment kleurt de rij accent"></nldd-text-cell>
				</nldd-list-item-segment>
			</nldd-list-item>
			<nldd-list-item selected>
				<nldd-list-item-segment button disclosure accessible-label="Uitklappen">
					<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
				</nldd-list-item-segment>
				<nldd-list-item-segment button width="full">
					<nldd-text-cell text="Selected met segmenten: blijft grijs, ook met de focus erin"></nldd-text-cell>
				</nldd-list-item-segment>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const AlsKnop = {
	render: () => html`
		<nldd-list variant="simple">
			<nldd-list-item button>
				<nldd-text-cell text="Clickable button item"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item button>
				<nldd-text-cell text="Another button item"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const AlsLink = {
	render: () => html`
		<nldd-list variant="simple">
			<nldd-list-item href="/settings">
				<nldd-text-cell text="Settings"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item href="/profile">
				<nldd-text-cell text="Profile"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const BoxMetMarges = {
	render: () => html`
		<nldd-list variant="box-tinted">
			<nldd-list-item>
				<nldd-text-cell text="Gutters visible (spacer)"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell text="Gutters visible (spacer)"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const MetCellenVooraanEnAchteraan = {
	render: () => html`
		<nldd-list variant="box-tinted">
			<nldd-list-item>
				<nldd-icon-cell icon="document" size="32"></nldd-icon-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell text="Item with start icon"></nldd-text-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-icon-cell size="16">
					<nldd-icon icon="chevron-right"></nldd-icon>
				</nldd-icon-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-icon-cell icon="document" size="32"></nldd-icon-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell text="Another item"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const SimpelMetCellenAchteraan = {
	render: () => html`
		<nldd-list variant="simple">
			<nldd-list-item>
				<nldd-text-cell text="Trailing cells"></nldd-text-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-icon-cell size="16">
					<nldd-icon icon="chevron-right"></nldd-icon>
				</nldd-icon-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell text="Alleen tekst"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

/**
 * Voeg het `reorderable-only` attribuut toe aan `nldd-drag-handle-cell` zodat
 * `nldd-list` de hendel herkent in het composed event path. Zonder dit attribuut
 * werkt slepen via pointer en toetsenbord niet.
 */
export const MetSleepgreep = {
	// Imperative render: the nldd-reorder handler mutates the DOM in place so
	// keyboard + pointer drag actually move items. A standard Storybook render
	// function can't do this because Lit templates are stateless.
	render: () => {
		const onReorder = (e: Record<string, any>) => {
			const list = e.currentTarget;
			const { fromIndex, toIndex } = e.detail;
			const items = [...list.querySelectorAll('nldd-list-item')];
			const moved = items[fromIndex];
			if (toIndex === 0) {
				items[0].before(moved);
			} else {
				const ref = items.filter((_, i) => i !== fromIndex)[toIndex - 1];
				ref.after(moved);
			}
		};

		const el = document.createElement('div');
		render(html`
			<nldd-list variant="box-tinted" reorderable @nldd-reorder=${onReorder}>
				<nldd-list-item>
					<nldd-drag-handle-cell size="sm" reorderable-only></nldd-drag-handle-cell>
					<nldd-spacer-cell reorderable-only size="8"></nldd-spacer-cell>
					<nldd-text-cell text="Versleepbaar item"></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-drag-handle-cell size="sm" reorderable-only></nldd-drag-handle-cell>
					<nldd-spacer-cell reorderable-only size="8"></nldd-spacer-cell>
					<nldd-text-cell text="Nog een item"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`, el);
		return el;
	},
	parameters: { controls: { disable: true } },
};

/**
 * Cells kunnen via `hide-below` en `hide-above` verschijnen of verdwijnen op
 * basis van de breedte van het list-item zelf. Maak het browservenster smaller
 * om het effect te zien: de secundaire tekst verdwijnt onder 600px, de trailing
 * chevron onder 480px.
 */
export const ResponsieveCellen = {
	render: () => html`
		<nldd-list variant="box-tinted">
			<nldd-list-item>
				<nldd-icon-cell><nldd-icon icon="file-text"></nldd-icon></nldd-icon-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell text="Begroting 2026"></nldd-text-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell width="fit-content" color="secondary" text="Gewijzigd 2 uur geleden" hide-below="480px"></nldd-text-cell>
				<nldd-spacer-cell size="8" hide-below="280px"></nldd-spacer-cell>
				<nldd-icon-cell hide-below="280px"><nldd-icon icon="chevron-right-small"></nldd-icon></nldd-icon-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-icon-cell><nldd-icon icon="folder"></nldd-icon></nldd-icon-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell text="Projecten"></nldd-text-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell width="fit-content" color="secondary" text="Gisteren" hide-below="480px"></nldd-text-cell>
				<nldd-spacer-cell size="8" hide-below="280px"></nldd-spacer-cell>
				<nldd-icon-cell hide-below="280px"><nldd-icon icon="chevron-right-small"></nldd-icon></nldd-icon-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};
