import { html, nothing } from 'lit';
import './slider.js';
import { ICONS } from '../../content/icon/icon.js';
import '../../forms/form-field/form-field.js';
import '../number-field/number-field.js';
import type { NLDDSlider } from './slider.js';
import '../../layout/container/container.js';

/**
 * Een waarde kiezen langs een baan: door de knop te slepen, op de baan te
 * klikken of met de pijltjes. Met `range` kies je een bereik, met een knop voor
 * elk uiteinde. De namen volgen die van Apple: de track, de thumb, en de
 * gevulde minimum track tot de thumb, of tussen de thumbs van een range.
 *
 * Een slider is voor een waarde die ongeveer mag kloppen, zoals een filter
 * ("een prijs tussen …"). Moet de waarde precies zijn, gebruik dan een
 * `nldd-number-field`: een thumb op één getal zetten is lastig, zeker met een
 * hand die niet stil is.
 *
 * De waarde staat in een tooltip boven de thumb zolang de pointer boven de
 * slider is, een thumb focus heeft of wordt gesleept. Overlappen de twee
 * tooltips van een range, dan worden ze één ("200 – 1.200"). Met `formatValue`
 * bepaal je de tekst van de tooltip en wat een schermlezer hoort.
 */
export default {
	title: 'Components/Inputs/Slider',
	component: 'nldd-slider',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/slider/slider.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
		// The canvas spacing below is not part of the example, so keep it out
		// of the code a reader copies.
		docs: { source: { excludeDecorators: true } },
	},
	// Room above the track for the value tooltip, which would otherwise fall
	// off the top of the canvas.
	decorators: [
		(story: () => unknown) => html`
			<nldd-container
				padding-top="40"
				max-width="480px"
			>
				${story()}
			</nldd-container>
		`,
	],
	args: {
		size: 'md',
		range: false,
		histogram: '',
		startIcon: '',
		endIcon: '',
		accessibleLabel: 'Volume',
		tooltipTiming: 'instant',
		invalid: false,
		disabled: false,
		value: 40,
		startValue: undefined,
		endValue: undefined,
		min: 0,
		max: 100,
		step: 1,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md'],
			description: 'Maat van de slider',
			table: { defaultValue: { summary: 'md' } },
		},
		range: {
			control: 'boolean',
			description: 'Kiest een bereik, met een thumb voor elk uiteinde',
			table: { defaultValue: { summary: false } },
		},
		histogram: {
			control: 'text',
			description: 'Aantallen als balken boven de baan, één per vak, gescheiden door komma\'s (bijv. `2, 4, 7, 12`)',
		},
		startIcon: {
			name: 'start-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon aan het begin van de baan',
			table: { defaultValue: { summary: '(geen)' } },
		},
		endIcon: {
			name: 'end-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon aan het eind van de baan',
			table: { defaultValue: { summary: '(geen)' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam; een range zet er "minimum" en "maximum" achter',
		},
		tooltipTiming: {
			name: 'tooltip-timing',
			control: 'select',
			options: ['instant', 'never'],
			description: 'Wanneer de waarde boven de thumb staat: bij hover, focus en slepen, of nooit',
			table: { defaultValue: { summary: 'instant' } },
		},
		invalid: {
			control: 'boolean',
			description: 'Markeert de slider als ongeldig',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
		value: {
			control: 'number',
			description: 'De waarde (zonder `range`)',
		},
		startValue: {
			name: 'start-value',
			control: 'number',
			description: 'Het begin van een bereik (met `range`)',
			table: { defaultValue: { summary: 'min' } },
		},
		endValue: {
			name: 'end-value',
			control: 'number',
			description: 'Het eind van een bereik (met `range`)',
			table: { defaultValue: { summary: 'max' } },
		},
		min: {
			control: 'number',
			description: 'Kleinste waarde',
			table: { defaultValue: { summary: 0 } },
		},
		max: {
			control: 'number',
			description: 'Grootste waarde',
			table: { defaultValue: { summary: 100 } },
		},
		step: {
			control: 'number',
			description: 'Stap tussen de waarden',
			table: { defaultValue: { summary: 1 } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-slider
			size=${args.size}
			?range=${args.range}
			histogram=${args.histogram || nothing}
			start-icon=${args.startIcon || nothing}
			end-icon=${args.endIcon || nothing}
			accessible-label=${args.accessibleLabel || nothing}
			tooltip-timing=${args.tooltipTiming}
			?invalid=${args.invalid}
			?disabled=${args.disabled}
			value=${args.value}
			start-value=${args.startValue ?? nothing}
			end-value=${args.endValue ?? nothing}
			min=${args.min}
			max=${args.max}
			step=${args.step}
		></nldd-slider>
	`,
};

/**
 * Met `range` kies je een bereik. Een klik op de baan zet de dichtstbijzijnde
 * thumb daar neer, en de thumbs gaan niet langs elkaar heen. In een formulier
 * worden beide waarden onder `name` ingediend, de begin eerst.
 */
export const Range = {
	render: () => html`
		<nldd-slider
			range
			accessible-label="Prijs"
			min="0"
			max="2000"
			step="50"
			start-value="200"
			end-value="1200"
			.formatValue=${(value: number) => `€ ${value.toLocaleString('nl-NL')}`}
		></nldd-slider>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Met `histogram` staan er balken boven de baan, zoals hoeveel resultaten er
 * bij elke prijs zijn, zodat je het bereik kiest met de spreiding in beeld. De
 * balken binnen het gekozen bereik kleuren mee.
 *
 * Je geeft één aantal per vak. Bij n getallen verdelen de vakken `min` tot `max`
 * in n gelijke stukken van `(max - min) / n`; het eerste getal is het aantal in
 * het eerste vak. Alleen de verhouding telt: het hoogste aantal is de volle
 * hoogte. Een 0 is een leeg vak. 20 tot 40 vakken lezen het best, los van `step`.
 *
 * ```js
 * const min = 0, max = 2000, buckets = 24;
 * const width = (max - min) / buckets;
 * const counts = Array(buckets).fill(0);
 * for (const price of prices) {
 *   const index = Math.min(buckets - 1, Math.floor((price - min) / width));
 *   if (index >= 0) counts[index]++;
 * }
 * slider.histogram = counts;
 * ```
 *
 * In HTML kan het ook als attribuut: `histogram="2, 4, 7, 12"`. De balken zijn
 * verborgen voor een schermlezer; zet wat ze laten zien in de tekst eromheen.
 *
 * Staat de waarde al in velden boven de slider, die meteen meeveranderen, zet
 * de tooltip dan uit met `tooltip-timing="never"`. Velden en slider houden
 * elkaar bij via hun `input`-events.
 */
export const MetHistogramEnVelden = {
	name: 'Met histogram en velden',
	render: () => {
		const root = (event: Event) => (event.target as Element).closest('nldd-container:has(> nldd-slider)')!;
		const fromSlider = (event: Event) => {
			const { startValue, endValue } = (event as CustomEvent).detail;
			const [start, end] = root(event).querySelectorAll('nldd-number-field');
			start.value = startValue;
			end.value = endValue;
		};
		const fromField = (event: Event, end: boolean) => {
			const slider = root(event).querySelector('nldd-slider') as NLDDSlider;
			const value = (event as CustomEvent).detail.value;
			if (end) slider.endValue = value;
			else slider.startValue = value;
		};
		return html`
			<nldd-container
				gap="16"
			>
				<nldd-container
					layout="row"
					gap="12"
				>
					<nldd-form-field label="Van">
						<nldd-number-field
							value="200"
							min="0"
							max="2000"
							step="50"
							hide-spin-buttons
							@change=${(event: Event) => fromField(event, false)}
						></nldd-number-field>
					</nldd-form-field>
					<nldd-form-field label="Tot">
						<nldd-number-field
							value="1200"
							min="0"
							max="2000"
							step="50"
							hide-spin-buttons
							@change=${(event: Event) => fromField(event, true)}
						></nldd-number-field>
					</nldd-form-field>
				</nldd-container>
				<nldd-slider
					range
					accessible-label="Prijs"
					tooltip-timing="never"
					min="0"
					max="2000"
					step="50"
					start-value="200"
					end-value="1200"
					histogram="2, 4, 7, 12, 18, 26, 31, 28, 22, 24, 30, 27, 19, 14, 11, 9, 7, 6, 4, 3, 3, 2, 2, 1"
					@input=${fromSlider}
				></nldd-slider>
			</nldd-container>
		`;
	},
	parameters: { controls: { disable: true } },
};

/**
 * Iconen aan de uiteinden zeggen wat de baan betekent, zoals Apple de
 * luidsprekers bij het volume zet.
 */
export const MetIconen = {
	name: 'Met iconen',
	render: () => html`
		<nldd-slider
			accessible-label="Volume"
			start-icon="no-volume"
			end-icon="high-volume"
			value="60"
		></nldd-slider>
	`,
	parameters: { controls: { disable: true } },
};

/** De drie maten onder elkaar, zo hoog als de andere controls van die maat. */
export const Grootten = {
	render: () => html`
		<nldd-container
			gap="40"
		>
			<nldd-slider
				accessible-label="Volume md"
				start-icon="no-volume"
				end-icon="high-volume"
				value="40"
			></nldd-slider>
			<nldd-slider
				size="sm"
				accessible-label="Volume sm"
				start-icon="no-volume"
				end-icon="high-volume"
				value="40"
			></nldd-slider>
			<nldd-slider
				size="xs"
				accessible-label="Volume xs"
				start-icon="no-volume"
				end-icon="high-volume"
				value="40"
			></nldd-slider>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * In een `nldd-form-field` krijgt de slider zijn label en maat van het veld,
 * net als elk ander invoerveld.
 */
export const InEenFormulierveld = {
	name: 'In een formulierveld',
	render: () => html`
		<nldd-form-field label="Bijdrage in de kosten">
			<nldd-slider
				name="bijdrage"
				min="0"
				max="100"
				step="5"
				value="50"
				.formatValue=${(value: number) => `${value}%`}
			></nldd-slider>
		</nldd-form-field>
	`,
	parameters: { controls: { disable: true } },
};
