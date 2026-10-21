import '../components/index.js';

/**
 * A temporary check for container queries under page zoom in Safari. Open the
 * story in Safari, zoom in with Cmd+ and watch whether the rows switch to the
 * narrow layout at the same width as the readout says.
 */
export default {
	title: 'Docs/Testpagina/Safari-zoom',
	tags: ['!autodocs'],
	parameters: { layout: 'fullscreen' },
};

const styles = `
	.zoom-test { display: flex; flex-direction: column; gap: 24px; padding: 16px; font-family: var(--primitives-font-family-body); color: var(--semantics-content-color); }
	.zoom-test__probe { container-type: inline-size; }
	.zoom-test__probe span::after { content: 'breed (md of lg)'; font-weight: 600; }
	@container (max-width: 640px) { .zoom-test__px span::after { content: 'smal (sm)'; } }
	@container (max-width: 40rem) { .zoom-test__rem span::after { content: 'smal (sm)'; } }
	.zoom-test__readout { font-variant-numeric: tabular-nums; }
`;

const row = (date: string, title: string, text: string) => `
	<nldd-list-item size="md" href="#">
		<nldd-spacer-cell size="16" hide-below="md"></nldd-spacer-cell>
		<nldd-text-cell hide-below="md" width="150px" horizontal-alignment="right" text="${date}" supporting-text="Aanvraag"></nldd-text-cell>
		<nldd-spacer-cell size="16" hide-below="md"></nldd-spacer-cell>
		<nldd-step-cell hide-below="md" status="past" position="between"></nldd-step-cell>
		<nldd-step-cell hide-above="sm" status="past" position="between" vertical-alignment="top" marker-offset="1.8rem"></nldd-step-cell>
		<nldd-spacer-cell size="12" hide-above="sm"></nldd-spacer-cell>
		<nldd-spacer-cell size="16" hide-below="md"></nldd-spacer-cell>
		<nldd-title-cell hide-above="sm" size="5" overline="${date} · Aanvraag" text="${title}" supporting-text="${text}"></nldd-title-cell>
		<nldd-cell hide-below="md" width="full" vertical-alignment="top">
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-title size="4"><h2>${title}</h2></nldd-title>
			<nldd-spacer size="4"></nldd-spacer>
			<nldd-rich-text><p>${text}</p></nldd-rich-text>
			<nldd-spacer size="8"></nldd-spacer>
		</nldd-cell>
		<nldd-spacer-cell size="16"></nldd-spacer-cell>
		<nldd-icon-cell size="20" icon="chevron-right" color="secondary"></nldd-icon-cell>
		<nldd-spacer-cell size="16" hide-below="md"></nldd-spacer-cell>
	</nldd-list-item>`;

export const SafariZoom = {
	name: 'Safari-zoom',
	render: () => {
		const root = document.createElement('div');
		root.innerHTML = `
			<style>${styles}</style>
			<div class="zoom-test">
				<nldd-rich-text>
					<p>Open deze pagina in Safari en zoom in met ⌘+. Onder 641px breed hoort de lijst de smalle indeling te tonen: datum boven de titel, stip naast de eerste regel.</p>
				</nldd-rich-text>
				<p class="zoom-test__readout">Venster: <strong data-viewport></strong> · Lijst: <strong data-list></strong> · Verwacht: <strong data-expected></strong></p>
				<div class="zoom-test__probe zoom-test__px">Container query in px: <span></span></div>
				<div class="zoom-test__probe zoom-test__rem">Container query in rem: <span></span></div>
				<nldd-list appearance="simple" dividers="never">
					${row('12 maart', 'Aanvraag A-1042', 'Dakisolatie. Je aanvraag is in behandeling. We nemen binnen tien werkdagen contact met je op.')}
					${row('4 februari', 'Aanvraag A-1043', 'Warmtepomp. Je aanvraag is afgerond. Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
				</nldd-list>
			</div>`;
		const list = root.querySelector('nldd-list')!;
		const update = () => {
			const width = Math.round(list.getBoundingClientRect().width);
			root.querySelector('[data-viewport]')!.textContent = `${innerWidth}px`;
			root.querySelector('[data-list]')!.textContent = `${width}px`;
			root.querySelector('[data-expected]')!.textContent = width <= 640 ? 'smal (sm)' : 'breed (md of lg)';
		};
		new ResizeObserver(update).observe(list);
		addEventListener('resize', update);
		return root;
	},
};
