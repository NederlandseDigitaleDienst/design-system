import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './button-group.js';
import '../button/button.js';
import '../icon-button/icon-button.js';

describe('nldd-button-group', () => {
	let el: HTMLElement;

	/** The buttons carry the size the group hands them, which is one Lit update
	 *  per button away. */
	const settled = async (group: Element) => {
		for (const button of group.querySelectorAll('nldd-button')) await waitForUpdate(button as HTMLElement);
	};

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('legt de knoppen op een rij in een brede container', async () => {
		el = await fixture(`
			<div style="width: 800px;">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(1);
		expect(buttons[0].getBoundingClientRect().width).toBeLessThan(400);
	});

	it('stapelt ze op volle breedte op een smalle container', async () => {
		el = await fixture(`
			<div style="width: 400px;">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(2);
		expect(Math.round(buttons[0].getBoundingClientRect().width)).toBe(400);
		// The button inside the host as well: a stretched host with a
		// content-sized button in it is a click target that ends halfway.
		const inner = buttons[0].shadowRoot!.querySelector('.button')!;
		expect(Math.round(inner.getBoundingClientRect().width)).toBe(400);
	});

	it('houdt de rij in een container tussen 480px en de sm-breakpoint', async () => {
		el = await fixture(`
			<div style="width: 560px;">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(1);
	});

	it('stapelt vanaf 480px en smaller', async () => {
		el = await fixture(`
			<div style="width: 480px;">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(2);
	});

	it('houdt een eigen richting aan, ook op een smalle container', async () => {
		el = await fixture(`
			<div style="width: 400px;">
				<nldd-button-group orientation="horizontal">
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(1);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-button-group></nldd-button-group>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});
});

describe('nldd-button-group – gestapeld', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('rekt de knoppen, maar laat een icoonknop zijn eigen maat', async () => {
		el = await fixture<HTMLElement>(
			`<div style="width: 320px">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-icon-button icon="settings" text="Instellingen"></nldd-icon-button>
				</nldd-button-group>
			</div>`,
		);
		const groep = el.querySelector('nldd-button-group')!;
		await waitForUpdate(groep as HTMLElement);
		const knop = el.querySelector('nldd-button')! as HTMLElement;
		const icoonknop = el.querySelector('nldd-icon-button')! as HTMLElement;
		await waitForUpdate(icoonknop);
		// Het contract, niet de pixels: zonder variables.css heeft een icoonknop
		// in deze omgeving geen eigen maat, dus meten zegt hier niets.
		expect(getComputedStyle(knop).width).toBe('320px');
		// Een kolom rekt zijn items vanzelf over de volle breedte; dit houdt de
		// icoonknop op zijn eigen maat, want een balk met één glyph erin is geen
		// groter doel, alleen een breder.
		expect(getComputedStyle(icoonknop).alignSelf).toBe('flex-start');
	});

	it('zwijgt als de ouder zijn breedte een tel later alsnog doorgeeft', async () => {
		el = await fixture<HTMLElement>(
			`<div style="width: 0">
				<nldd-button-group>
					<nldd-button text="Een"></nldd-button>
				</nldd-button-group>
			</div>`,
		);
		await waitForUpdate(el.querySelector('nldd-button-group') as HTMLElement);
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
		el.style.width = '320px';
		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(el.querySelector('nldd-button-group')!.matches(':state(no-width)')).toBe(false);
	});

	it('kijkt opnieuw zodra de oriëntatie op auto komt', async () => {
		el = await fixture<HTMLElement>(
			`<div style="display: inline-flex">
				<nldd-button-group orientation="horizontal">
					<nldd-button text="Een"></nldd-button>
				</nldd-button-group>
			</div>`,
		);
		const groep = el.querySelector('nldd-button-group') as HTMLElement & { orientation: string };
		await waitForUpdate(groep);
		await new Promise((resolve) => setTimeout(resolve, 50));
		// Vastgezet op een rij is de groep geen container, dus valt er niets in te klappen.
		expect(el.querySelector('nldd-button-group')!.matches(':state(no-width)')).toBe(false);

		groep.orientation = 'auto';
		await waitForUpdate(groep);
		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(el.querySelector('nldd-button-group')!.matches(':state(no-width)')).toBe(true);
	});

	it('ziet het ook als de groep pas later in beeld komt', async () => {
		el = await fixture<HTMLElement>(
			`<div style="display: none">
				<div style="display: inline-flex">
					<nldd-button-group>
						<nldd-button text="Een"></nldd-button>
						<nldd-button text="Twee"></nldd-button>
					</nldd-button-group>
				</div>
			</div>`,
		);
		await waitForUpdate(el.querySelector('nldd-button-group') as HTMLElement);
		await new Promise((resolve) => setTimeout(resolve, 50));
		// Onzichtbaar is geen ingeklapte groep, dus daar zegt hij nog niets van.
		expect(el.querySelector('nldd-button-group')!.matches(':state(no-width)')).toBe(false);

		el.style.display = 'block';
		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(el.querySelector('nldd-button-group')!.matches(':state(no-width)')).toBe(true);
	});

	it('ziet het als de groep geen breedte krijgt van zijn ouder', async () => {
		el = await fixture<HTMLElement>(
			`<div style="display: inline-flex">
				<nldd-button-group>
					<nldd-button text="Een"></nldd-button>
					<nldd-button text="Twee"></nldd-button>
				</nldd-button-group>
			</div>`,
		);
		await waitForUpdate(el.querySelector('nldd-button-group') as HTMLElement);
		// De groep houdt een nulmeting even vast, voor het geval de ouder
		// zijn breedte een frame later alsnog doorgeeft.
		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(el.querySelector('nldd-button-group')!.matches(':state(no-width)')).toBe(true);
	});
});

describe('nldd-button-group – width="full"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** The fit check runs on the next frame, after the buttons have rendered. */
	const frames = async (count = 3) => {
		for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
	};

	const LONG = 'Aanvraag voor dakisolatie indienen';

	/** The natural width of each label, in a group that does not fill. */
	const natural = async (labels: string[]) => {
		const probe = await fixture<HTMLElement>(`
			<div style="width: 1200px;">
				<nldd-button-group orientation="horizontal">
					${labels.map((label) => `<nldd-button text="${label}"></nldd-button>`).join('')}
				</nldd-button-group>
			</div>
		`);
		await frames();
		const widths = [...probe.querySelectorAll('nldd-button')].map((button) => button.getBoundingClientRect().width);
		cleanup(probe);
		return widths;
	};

	const render = async (width: number, labels: string[], extra = '') => {
		el = await fixture(`
			<div style="width: ${width}px;">
				<nldd-button-group width="full" ${extra}>
					${labels.map((label) => `<nldd-button text="${label}"></nldd-button>`).join('')}
				</nldd-button-group>
			</div>
		`);
		await frames();
		return [...el.querySelectorAll('nldd-button')] as HTMLElement[];
	};

	const rows = (buttons: HTMLElement[]) => new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().top))).size;

	it('deelt de rij in gelijke delen', async () => {
		const buttons = await render(800, ['Bewaar', 'Annuleer']);
		expect(rows(buttons)).toBe(1);
		const [a, b] = buttons.map((button) => button.getBoundingClientRect().width);
		expect(Math.abs(a - b)).toBeLessThan(1);
		expect(a).toBeGreaterThan(350);
	});

	it('maakt een label dat niet in zijn deel past breder, en de rest deelt wat overblijft', async () => {
		const [long, short] = await natural([LONG, 'Ja']);
		const buttons = await render(Math.ceil(long + short + 30), [LONG, 'Ja']);
		expect(rows(buttons)).toBe(1);
		const [a, b] = buttons.map((button) => button.getBoundingClientRect().width);
		expect(a).toBeGreaterThanOrEqual(long - 0.5);
		expect(b).toBeLessThan(a);
	});

	it('zet alles onder elkaar als de labels zelfs zo niet passen', async () => {
		const [long, short] = await natural([LONG, 'Ja']);
		const buttons = await render(Math.floor(long + short - 20), [LONG, 'Ja']);
		expect(rows(buttons)).toBe(2);
		const width = el.getBoundingClientRect().width;
		for (const button of buttons) expect(Math.round(button.getBoundingClientRect().width)).toBe(Math.round(width));
	});

	it('zet drie knoppen die niet passen als twee boven één, de onderste over de volle breedte', async () => {
		const widths = await natural(['Bewaar', 'Annuleer', LONG]);
		const buttons = await render(Math.floor(widths[0] + widths[1] + 40), ['Bewaar', 'Annuleer', LONG]);
		expect(rows(buttons)).toBe(2);
		expect(Math.round(buttons[2].getBoundingClientRect().width)).toBe(Math.round(el.getBoundingClientRect().width));
	});

	it('laat een label dat breder is dan de groep binnen de groep', async () => {
		const buttons = await render(120, [LONG, 'Ja']);
		expect(buttons[0].getBoundingClientRect().width).toBeLessThanOrEqual(120.5);
	});

	it('gaat terug naar een rij als de groep breder wordt', async () => {
		const [long, short] = await natural([LONG, 'Ja']);
		const buttons = await render(Math.floor(long + short - 20), [LONG, 'Ja']);
		expect(rows(buttons)).toBe(2);
		el.style.width = '1200px';
		await frames(4);
		expect(rows(buttons)).toBe(1);
	});

	it('laat een icoonknop zijn eigen maat in de rij', async () => {
		el = await fixture(`
			<div style="width: 800px;">
				<nldd-button-group width="full">
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-icon-button icon="share" text="Delen"></nldd-icon-button>
				</nldd-button-group>
			</div>
		`);
		await frames();
		const icon = el.querySelector('nldd-icon-button') as HTMLElement;
		// The contract, not the pixels: without variables.css an icon button has
		// no size of its own here.
		expect(getComputedStyle(icon).flexGrow).toBe('0');
		expect(getComputedStyle(icon).flexShrink).toBe('0');
	});

	it('blijft een rij met orientation="horizontal"', async () => {
		const [long, short] = await natural([LONG, 'Ja']);
		const buttons = await render(Math.floor(long + short - 20), [LONG, 'Ja'], 'orientation="horizontal"');
		expect(rows(buttons)).toBe(1);
	});

	it('is geen container, want hij vraagt wat er past', async () => {
		await render(800, ['Bewaar', 'Annuleer']);
		const group = el.querySelector('nldd-button-group')!;
		expect(getComputedStyle(group).containerType).toBe('normal');
	});
});

describe('nldd-button-group – labels, extra knoppen, maat en richting', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const frames = async (count = 3) => {
		for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
	};

	const rows = (root: Element) => new Set([...root.querySelectorAll('nldd-button')].map((button) => Math.round(button.getBoundingClientRect().top))).size;

	it('gaat terug naar een rij als een label korter wordt, niet alleen als de groep breder wordt', async () => {
		el = await fixture(`
			<div style="width: 160px;">
				<nldd-button-group width="full">
					<nldd-button text="Aanvraag voor dakisolatie indienen"></nldd-button>
					<nldd-button text="Ja"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await frames();
		expect(rows(el)).toBe(2);
		el.querySelector('nldd-button')!.setAttribute('text', 'Indienen');
		await frames();
		expect(rows(el)).toBe(1);
	});

	it('verbergt een vierde knop met CSS en toont hem weer zodra er plek is', async () => {
		el = await fixture(`
			<div style="width: 800px;">
				<nldd-button-group>
					<nldd-button text="Een"></nldd-button>
					<nldd-button text="Twee"></nldd-button>
					<nldd-button text="Drie"></nldd-button>
					<nldd-button text="Vier"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await frames();
		const fourth = el.querySelectorAll('nldd-button')[3] as HTMLElement;
		expect(fourth.hasAttribute('hidden')).toBe(false);
		expect(getComputedStyle(fourth).display).toBe('none');
		el.querySelector('nldd-button')!.remove();
		await frames();
		expect(getComputedStyle(fourth).display).not.toBe('none');
	});

	it('ziet het als een knop een eigen maat meekrijgt, en zet toch die van de groep', async () => {
		el = await fixture(`
			<div style="width: 800px;">
				<nldd-button-group size="sm">
					<nldd-button text="Een" size="md"></nldd-button>
					<nldd-button text="Twee"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await frames();
		expect(el.querySelector('nldd-button-group')!.matches(':state(own-size-overwritten)')).toBe(true);
		for (const button of el.querySelectorAll('nldd-button')) expect(button.getAttribute('size')).toBe('sm');
	});

	it('ziet geen eigen maat als de groep zijn eigen maat verandert', async () => {
		el = await fixture(`
			<div style="width: 800px;">
				<nldd-button-group>
					<nldd-button text="Een"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		const group = el.querySelector('nldd-button-group') as HTMLElement & { size: string };
		await frames();
		group.size = 'sm';
		await frames();
		expect(el.querySelector('nldd-button-group')!.matches(':state(own-size-overwritten)')).toBe(false);
		expect(el.querySelector('nldd-button')!.getAttribute('size')).toBe('sm');
	});

	it('ziet ook een rij die aan de beginkant uitsteekt, op een pagina van rechts naar links', async () => {
		el = await fixture(`
			<div dir="rtl" style="width: 160px;">
				<nldd-button-group width="full">
					<nldd-button text="Aanvraag voor dakisolatie indienen"></nldd-button>
					<nldd-button text="Ja"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await frames();
		expect(rows(el)).toBe(2);
	});


});
