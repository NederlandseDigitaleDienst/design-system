/**
 * Theme generation: one stylesheet per reference color that points the accent
 * at that color.
 *
 * A theme does three things on `:root[data-nldd-theme="<name>"]`:
 * 1. points every `--primitives-color-accent-*` step at the theme's scale, so
 *    links, focus, selection and indicators follow with the same contrast;
 * 2. points `--semantics-categories-accent-*` at the theme's own category, so
 *    the hero, badge, tag and progress follow the category's step choices;
 * 3. gives `--semantics-buttons-accent-filled-*` the step closest to the
 *    reference color, with white or black text, because the default steps
 *    (750 / 650) only look like the reference for a dark color;
 * 4. gives `--primitives-color-neutral-*` a gray in the theme's hue, so the
 *    whole interface tints along. Every step keeps the luminance of coolgray,
 *    so every contrast stays the same.
 *
 * Yellow has no dark version that still reads as yellow: dark enough for
 * 4.5:1, it turns olive. In the themes in NEAR_BLACK_INTERACTION the
 * interaction accent in light mode is therefore the theme's near-black gray,
 * and links are lintblauw, the color a reader expects a link to have.
 *
 * Red and orange read as critical and warning. In the STATUS_THEMES the whole
 * accent scale is gray (near-black for the dark steps in light mode), and the
 * tag and banner are neutral. The button, the hero, the badge and the filled
 * category (progress) keep the theme color.
 */

/** The default accent; it has no theme of its own. */
export const DEFAULT_THEME = 'lintblauw';

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const MIN_TEXT_CONTRAST = 4.5;

/**
 * Parse the light and dark hex of every step from colors.generated.css.
 * @returns {Map<string, Map<number, {light: string, dark: string}>>}
 */
export function parsePalettes(css) {
	const palettes = new Map();
	const pattern = /--primitives-color-([a-z]+)-(\d+): .*?\/\* light: (#[0-9A-F]{6}) \| dark: (#[0-9A-F]{6})/g;
	for (const [, name, step, light, dark] of css.matchAll(pattern)) {
		if (!palettes.has(name)) palettes.set(name, new Map());
		palettes.get(name).set(Number(step), { light, dark });
	}
	return palettes;
}

function linear(hex) {
	return [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
}

export function luminance(hex) {
	const [r, g, b] = linear(hex);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

function oklab(hex) {
	const [r, g, b] = linear(hex);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

const toOklch = (hex) => {
	const [L, a, b] = oklab(hex);
	return { L, C: Math.hypot(a, b), H: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
};

function oklchToHex({ L, C, H }) {
	const a = C * Math.cos((H * Math.PI) / 180);
	const b = C * Math.sin((H * Math.PI) / 180);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const rgb = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
	const channel = (c) => {
		const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
		return Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
	};
	return `#${rgb.map(channel).join('').toUpperCase()}`;
}

/** The OKLCH hue of a color, in degrees. */
export const hue = (hex) => toOklch(hex).H;

/**
 * How much of coolgray's chroma a theme's gray keeps. Half for the cool hues;
 * none for the warm ones, red through yellow and olive, where a tinted gray
 * reads as brown.
 */
export const NEUTRAL_CHROMA = { default: 0.5, warm: 0 };
const isWarm = (hue) => hue < 120;

/**
 * The reference for a theme's gray: coolgray's lightness and (reduced)
 * chroma in the theme color's hue. generate-palette.py turns it into a scale.
 */
export function neutralReference(neutralHex, themeHex) {
	const gray = toOklch(neutralHex);
	const { H } = toOklch(themeHex);
	const factor = isWarm(H) ? NEUTRAL_CHROMA.warm : NEUTRAL_CHROMA.default;
	return oklchToHex({ L: gray.L, C: gray.C * factor, H });
}

/** ΔE in OKLab: below 0.05 the difference is barely visible. */
export function distance(a, b) {
	const [x, y] = [oklab(a), oklab(b)];
	return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function closestStep(palette, ref, mode) {
	let best;
	for (const [step, hex] of palette) {
		const d = distance(hex[mode], ref);
		if (!best || d < best.d) best = { step, d };
	}
	return best.step;
}

const clamp = (step) => Math.min(1000, Math.max(0, step));

/**
 * The border of a fill in one state: a step further from the page than the
 * fill, whichever way its hover and active go. A higher step is darker in light
 * mode and lighter in dark mode, so the border always adds contrast against
 * the page around it, also on a light fill with black text.
 */
const outward = (m, offset) => clamp(m.at(offset) + 50);

/** White when it reaches 4.5:1, otherwise black. */
export function textOn(hex) {
	if (contrast(hex, WHITE) >= MIN_TEXT_CONTRAST) return 'white';
	if (contrast(hex, BLACK) >= MIN_TEXT_CONTRAST) return 'black';
	throw new Error(`Neither white nor black reaches ${MIN_TEXT_CONTRAST}:1 on ${hex}`);
}

/**
 * Pick the button steps for one mode.
 *
 * `toText` is the step direction toward the text color: in light mode a higher
 * step is darker, in dark mode the scale is mirrored. States move away from
 * the text for more contrast, unless the scale runs out in that direction.
 */
function buttonMode(palette, step, mode, offsets) {
	const text = textOn(palette.get(step)[mode]);
	const darker = mode === 'light' ? 1 : -1;
	const toText = text === 'white' ? -darker : darker;
	let away = -toText;
	if (step + away * offsets.room < 0 || step + away * offsets.room > 1000) away = -away;
	const at = (offset) => clamp(step + away * offset);
	const secondary = clamp(step + toText * offsets.secondary);
	return {
		step,
		text,
		at,
		divider: clamp(step + toText * offsets.divider),
		secondary,
		// Where the scale runs out, states move toward the text, and so toward
		// the secondary color; it then moves along to keep its distance.
		secondaryAt: (offset) => {
			const along = clamp(at(offset) + toText * offsets.secondary);
			return toText > 0 ? Math.max(secondary, along) : Math.min(secondary, along);
		},
	};
}

/**
 * The surfaces a fill can sit on, per mode. `page` is the base and tinted
 * surface; `selected` adds a selected list-item row, hovered or not, where a
 * checked checkbox can sit.
 */
export function selectionGrounds(gray) {
	const page = { light: [0, 25], dark: [100, 75] };
	const rows = { light: [100, 150], dark: [250, 300] };
	const hexes = (steps, mode) => steps.map((step) => gray.get(step)[mode]);
	return {
		page: { light: hexes(page.light, 'light'), dark: hexes(page.dark, 'dark') },
		selected: { light: hexes([...page.light, ...rows.light], 'light'), dark: hexes([...page.dark, ...rows.dark], 'dark') },
	};
}

const SELECTED_STATES = [0, 50, 100];

/**
 * The selected (and current) fill for one mode: the step closest to the
 * reference color whose fill, and hover and active, reach 3:1 on every ground
 * and carry 4.5:1 text. States move away from the text, or back when the
 * scale runs out.
 */
function selectedMode(palette, ref, mode, grounds) {
	const darker = mode === 'light' ? 1 : -1;
	const candidates = [...palette.keys()].sort((a, b) => distance(palette.get(a)[mode], ref) - distance(palette.get(b)[mode], ref));
	for (const step of candidates) {
		let text;
		try {
			text = textOn(palette.get(step)[mode]);
		} catch {
			continue;
		}
		let away = text === 'white' ? darker : -darker;
		if (step + away * 150 < 0 || step + away * 150 > 1000) away = -away;
		const at = (offset) => step + away * offset;
		const fits = SELECTED_STATES.every((offset) => {
			const fill = palette.get(at(offset))?.[mode];
			if (!fill) return false;
			const textHex = text === 'white' ? WHITE : BLACK;
			return contrast(fill, textHex) >= MIN_TEXT_CONTRAST && grounds.selected[mode].every((ground) => contrast(fill, ground) >= 3);
		});
		if (fits) return { step, text, at };
	}
	throw new Error(`No ${mode} step of ${ref} works as a selected fill`);
}

/**
 * The selected fill for a theme. It can differ from the button, which never
 * sits on a selected row and so can get closer to the reference.
 */
export function selectedSteps(palette, ref, grounds) {
	return { light: selectedMode(palette, ref, 'light', grounds), dark: selectedMode(palette, ref, 'dark', grounds) };
}

/**
 * The dark-mode button: the step closest to the reference color with 4.5:1
 * text that also reaches 3:1 against the page. Without that, a dark color
 * would give a dark button on a dark page.
 */
/**
 * A dark-mode button step picked by eye for one color, where the rule's step
 * is not the nicer one: a light tint with black text, so a mark on it (the dot
 * of a radio, the check of a checkbox) is dark like the page.
 */
export const DARK_BUTTON_STEPS = new Map([
	['lintblauw', 650],
	['paars', 600],
	['donkergroen', 650],
	['donkerbruin', 600],
	['violet', 600],
	['bruin', 600],
	['mosgroen', 600],
	['groen', 600],
	['donkerblauw', 700],
	['hemelblauw', 700],
]);

/**
 * A dark-mode step for accent text (--semantics-content-accent-color), the
 * text of an accent-transparent button, the text of an accent tag and the icon
 * of an accent banner, picked by eye for one color whose default step reads
 * dull on the dark page. In light mode they are near-black for these colors.
 */
export const DARK_ACCENT_TEXT_STEPS = new Map([
	['geel', 900],
	['donkergeel', 800],
]);

/**
 * Steps for the icon of an accent banner, for a theme color whose default step
 * turns into an unrelated shade: closer to the theme color, picked by eye, and
 * still 3:1 on the accent-tinted surface, the minimum for an icon. A mode left
 * out keeps the default.
 */
export const BANNER_ICON_STEPS = new Map([
	['roze', { light: 450 }],
	['lichtblauw', { light: 400 }],
	['donkerblauw', { light: 600 }],
	['hemelblauw', { light: 500 }],
	['paars', { light: 850 }],
	['bruin', { light: 500, dark: 600 }],
	['mosgroen', { light: 500, dark: 600 }],
	['groen', { light: 500, dark: 600 }],
	['mintgroen', { light: 450, dark: 800 }],
]);

function darkButtonStep(palette, ref, grounds, name) {
	if (DARK_BUTTON_STEPS.has(name)) return DARK_BUTTON_STEPS.get(name);
	const candidates = [...palette.keys()].sort((a, b) => distance(palette.get(a).dark, ref) - distance(palette.get(b).dark, ref));
	const step = candidates.find((s) => {
		const fill = palette.get(s).dark;
		const readable = contrast(fill, WHITE) >= MIN_TEXT_CONTRAST || contrast(fill, BLACK) >= MIN_TEXT_CONTRAST;
		return readable && grounds.page.dark.every((ground) => contrast(fill, ground) >= 3);
	});
	if (step === undefined) throw new Error(`No dark step of ${ref} works as a button`);
	return step;
}

/**
 * The accent button for a theme: the step closest to the reference color with
 * 4.5:1 text, and in dark mode also 3:1 against the page.
 */
export function buttonSteps(palette, ref, grounds, name) {
	const lightStep = closestStep(palette, ref, 'light');
	const darkStep = darkButtonStep(palette, ref, grounds, name);
	return {
		light: buttonMode(palette, lightStep, 'light', { room: 250, divider: 250, secondary: 550 }),
		dark: buttonMode(palette, darkStep, 'dark', { room: 250, divider: 200, secondary: 550 }),
	};
}

const accent = (step, color = 'accent') => `var(--primitives-color-${color}-${step})`;
const pair = (light, dark) => (light === dark ? light : `light-dark(${light}, ${dark})`);
const textColor = (mode, text, color) => {
	const white = mode === 'light' ? 0 : 1000;
	return accent(text === 'white' ? white : 1000 - white, color);
};

/**
 * The `--semantics-buttons-accent-filled-*` declarations. A theme passes its
 * own color, so the button keeps it where the accent scale turns gray.
 */
export function buttonTokens(steps, color = 'accent') {
	const { light: l, dark: d } = steps;
	const both = (fn) => pair(fn(l, 'light'), fn(d, 'dark'));
	const states = [
		['', 0],
		['is-hovered-', 50],
		['is-active-', 100],
		['is-expanded-', 100],
		['is-expanded-is-hovered-', 150],
		['is-expanded-is-active-', 200],
	];
	const tokens = [];
	const prefix = '--semantics-buttons-accent-filled-';
	for (const [state, offset] of states) {
		tokens.push([`${prefix}${state}background-color`, both((m) => accent(m.at(offset), color))]);
		if (!state) tokens.push([`${prefix}divider-color`, both((m) => accent(m.divider, color))]);
		tokens.push([`${prefix}${state}highlight-border-color`, both((m) => accent(outward(m, offset), color))]);
		tokens.push([`${prefix}${state}content-color`, both((m, mode) => textColor(mode, m.text, color))]);
		tokens.push([`${prefix}${state}content-secondary-color`, both((m) => accent(m.secondaryAt(offset), color))]);
	}
	return tokens;
}

const BADGE_PROPS = ['background-color', 'highlight-border-color', 'content-color'];

/**
 * The accent badge: read by its text, like a button, so it takes the button's
 * steps. Its own tokens, so a change to one does not move the other.
 */
export function badgeTokens(steps, color = 'accent') {
	const { light: l, dark: d } = steps;
	const both = (fn) => pair(fn(l, 'light'), fn(d, 'dark'));
	const values = [both((m) => accent(m.step, color)), both((m) => accent(outward(m, 0), color)), both((m, mode) => textColor(mode, m.text, color))];
	return BADGE_PROPS.map((prop, i) => [`--components-badge-accent-${prop}`, values[i]]);
}

/**
 * A selected mention in nldd-text-editor, for a color whose default (the dark
 * accent steps) turns olive: it takes the button's steps, like the badge.
 */
function mentionSelectedTokens(steps, color) {
	const { light: l, dark: d } = steps;
	const both = (fn) => pair(fn(l, 'light'), fn(d, 'dark'));
	return [
		['--components-text-editor-mention-is-selected-background-color', both((m) => accent(m.step, color))],
		['--components-text-editor-mention-is-selected-content-color', both((m, mode) => textColor(mode, m.text, color))],
	];
}

/**
 * The accent status bar: read by its text, like the badge, and a link or a
 * button when it has to be, so it has the button's hover and active too.
 */
export function statusBarTokens(steps, color = 'accent') {
	const { light: l, dark: d } = steps;
	const both = (fn) => pair(fn(l, 'light'), fn(d, 'dark'));
	return [
		['--components-status-bar-accent-background-color', both((m) => accent(m.at(0), color))],
		['--components-status-bar-accent-content-color', both((m, mode) => textColor(mode, m.text, color))],
		['--components-status-bar-accent-is-hovered-background-color', both((m) => accent(m.at(50), color))],
		['--components-status-bar-accent-is-active-background-color', both((m) => accent(m.at(100), color))],
	];
}

/**
 * The accent area, such as the panel of a hero: in each mode the step closest
 * to the reference color with 4.5:1 text, white when it can. Unlike the button
 * it needs no contrast with the page, so a dark color stays dark in dark mode.
 * The border sits a step away from the text.
 */
export function areaSteps(palette, ref) {
	const mode = (m) => {
		const candidates = [...palette.keys()].sort((a, b) => distance(palette.get(a)[m], ref) - distance(palette.get(b)[m], ref));
		const step = candidates.find((s) => {
			const fill = palette.get(s)[m];
			return contrast(fill, WHITE) >= MIN_TEXT_CONTRAST || contrast(fill, BLACK) >= MIN_TEXT_CONTRAST;
		});
		return buttonMode(palette, step, m, { room: 50, divider: 0, secondary: 0 });
	};
	return { light: mode('light'), dark: mode('dark') };
}

/** The accent area's declarations: its surface, and the text on it. */
export function areaTokens(steps, color = 'accent') {
	const { light: l, dark: d } = steps;
	const both = (fn) => pair(fn(l, 'light'), fn(d, 'dark'));
	const text = both((m, mode) => textColor(mode, m.text, color));
	return [
		['--semantics-surfaces-accent-filled-background-color', both((m) => accent(m.step, color))],
		['--semantics-surfaces-accent-filled-highlight-border-color', both((m) => accent(outward(m, 0), color))],
		['--semantics-content-on-accent-filled-color', text],
		['--semantics-content-on-accent-filled-secondary-color', text],
	];
}

/** Every contrast the button promises, per mode and state, for the test. */
export function buttonContrasts(palette, steps) {
	const result = [];
	for (const mode of ['light', 'dark']) {
		const m = steps[mode];
		const text = m.text === 'white' ? WHITE : BLACK;
		for (const offset of [0, 50, 100, 150, 200]) {
			const background = palette.get(m.at(offset))[mode];
			result.push({ mode, offset, role: 'content', ratio: contrast(background, text) });
			result.push({ mode, offset, role: 'secondary', ratio: contrast(background, palette.get(m.secondaryAt(offset))[mode]) });
		}
	}
	return result;
}

/**
 * Colors whose filled category (the progress bar and circle, a filled tag) is
 * near-black in light mode, like their selection: a light yellow bar barely
 * stands out from a white page. A site that wants it in color picks `color="geel"` or
 * `color="donkergeel"`, whose filled step is darker. Dark mode keeps the theme
 * color.
 */
export const LIGHT_NEAR_BLACK_FILLED = ['geel', 'donkergeel'];
// The near-black of the selection, per filled property, with white text.
const NEAR_BLACK_FILLED_STEPS = { 'background-color': 925, 'highlight-border-color': 1000, 'content-color': 0, 'content-secondary-color': 0 };

const CATEGORY_TOKENS = ['filled', 'tinted'].flatMap((variant) =>
	['background-color', 'highlight-border-color', 'content-color', 'content-secondary-color'].map((prop) => `${variant}-${prop}`),
);

export const STATUS_THEMES = ['rood', 'robijnrood', 'oranje'];

/**
 * Status themes whose selection (checkbox, radio, switch, segment) keeps the
 * theme color in dark mode: a light orange on a dark page does not read as a
 * warning the way red reads as an error. In light mode it stays near-black.
 */
export const STATUS_SELECTION_IN_COLOR = ['oranje'];
export const NEAR_BLACK_INTERACTION = ['geel', 'donkergeel', ...STATUS_THEMES];

/**
 * In light mode, the gray step that replaces each dark accent step. Every
 * replacement is darker than the step it replaces, so every contrast against
 * a light surface goes up, and hover and active still differ.
 */
export const NEAR_BLACK_STEPS = new Map([
	[500, 800], [550, 850], [600, 850], [650, 900], [700, 925], [750, 925],
	[800, 950], [850, 975], [900, 975], [925, 1000], [950, 1000], [975, 1000], [1000, 1000],
]);

/**
 * A dark-mode step for links in a color whose links are lintblauw in light
 * mode: on a dark page yellow and orange read well as a link. Hover and active
 * go a step lighter each.
 */
export const DARK_LINK_STEPS = new Map([
	['geel', 900],
	['donkergeel', 800],
	['oranje', 650],
	['rood', 600],
	['robijnrood', 600],
]);

/**
 * Colors whose links keep the theme color in light mode too, on the default
 * link steps: red stays red where yellow turns olive.
 */
export const LIGHT_LINK_IN_COLOR = ['rood', 'robijnrood'];

/**
 * Status themes whose accent text keeps the theme color, per mode on the
 * default steps (600 in light, 650 in dark). Red takes it in both modes, the
 * same as critical text. Orange only in dark mode: in light mode its step 600
 * is brown, so accent text stays near-black there.
 */
export const ACCENT_TEXT_IN_COLOR = new Map([
	['rood', { light: true, dark: true }],
	['robijnrood', { light: true, dark: true }],
	['oranje', { light: false, dark: true }],
]);

/**
 * A dark-mode focus ring step picked by eye for one color: orange takes the
 * step of its links and accent text.
 */
export const DARK_FOCUS_STEPS = new Map([['oranje', 650]]);

/**
 * Colors whose focus ring is near-black in light mode, the same as their
 * selection: a dark yellow reads as olive or brown, a dark light blue as gray,
 * a dark pink as plum.
 */
export const NEAR_BLACK_FOCUS = ['geel', 'donkergeel', 'lichtblauw', 'roze'];

/** Colors whose finished steps stay near-black in light mode, as their selection. */
export const NEAR_BLACK_PROGRESS = ['geel', 'donkergeel'];


/**
 * The focus ring for a theme. In light mode it is the step closest to the
 * button that reaches 4.5:1 against the base background, or near-black for the
 * colors in NEAR_BLACK_FOCUS. In dark mode it
 * takes the button color when that reaches 4.5:1 against the page, so a light
 * theme color keeps its brightness; otherwise step 600.
 */
export function focusRingSteps(palette, ref, grounds, name) {
	const button = darkButtonStep(palette, ref, grounds, name);
	const fits = grounds.page.dark.every((ground) => contrast(palette.get(button).dark, ground) >= MIN_TEXT_CONTRAST);
	// The ring sits on a halo of the base background, so only that counts.
	const lightButton = buttonSteps(palette, ref, grounds, name).light.step;
	const lightStep = [...palette.keys()]
		.filter((step) => contrast(palette.get(step).light, grounds.page.light[0]) >= MIN_TEXT_CONTRAST)
		.sort((a, b) => Math.abs(a - lightButton) - Math.abs(b - lightButton) || a - b)[0];
	return {
		light: NEAR_BLACK_FOCUS.includes(name) ? { step: NEAR_BLACK_SELECTION.step, color: 'neutral' } : { step: lightStep, own: true },
		dark: { step: DARK_FOCUS_STEPS.get(name) ?? (fits ? button : 600), own: true },
	};
}

/** The `--semantics-focus-ring-outline` declaration. */
export function focusRingTokens(steps, color = 'accent') {
	const value = (mode) => accent(steps[mode].step, steps[mode].color ?? (steps[mode].own ? color : 'accent'));
	return [['--semantics-focus-ring-outline', `var(--primitives-border-width-regular) solid ${pair(value('light'), value('dark'))}`]];
}

const LINK_TOKENS = [
	['--semantics-links-color', 600, 650],
	['--semantics-links-is-hovered-color', 650, 700],
	['--semantics-links-is-active-color', 700, 750],
];

/**
 * How far the links move from their default steps, per mode and picked by eye.
 * A positive offset is a higher step: darker in light mode, lighter in dark
 * mode. Hover and active move along.
 */
export const LINK_OFFSETS = new Map([
	['paars', { light: 50, dark: 50 }],
	['roze', { dark: 150 }],
]);

// Each selected token, with its light step in variables.css and its offset
// from the fill.
const SELECTED_TOKENS = [
	['--semantics-controls-is-selected-indicator-color', 750, 0],
	['--semantics-controls-is-selected-is-hovered-indicator-color', 800, 50],
	['--semantics-controls-is-selected-is-active-indicator-color', 850, 100],
	['--components-date-picker-day-is-today-is-selected-border-color', 900, 150],
	['--semantics-list-items-is-highlighted-background-color', 750, 0],
	['--semantics-list-items-is-highlighted-is-hovered-background-color', 800, 50],
	['--semantics-list-items-is-highlighted-is-active-background-color', 850, 100],
	...['base', 'tinted'].flatMap((surface) => [
		[`--semantics-buttons-neutral-${surface}-is-selected-highlight-border-color`, 800, 50],
		[`--semantics-buttons-neutral-${surface}-is-selected-is-hovered-highlight-border-color`, 850, 100],
		[`--semantics-buttons-neutral-${surface}-is-selected-is-active-highlight-border-color`, 900, 150],
	]),
];

// A status theme's accent is the gray at the same step, which has the same
// luminance, so every contrast stays as it was; near-black replaces the dark
// steps in light mode.
/** A near-black selection, from the theme's gray, with white text. */
const NEAR_BLACK_SELECTION = { step: 925, text: 'white', color: 'neutral', at: (offset) => Math.min(1000, 925 + offset / 2) };

/**
 * The selected fill (a checked checkbox, a selected tab or segment) is the
 * button wherever the button stands out 3:1 from the page: always in dark mode,
 * where the button is held to that, and in light mode for the darker colors.
 * Where a light button does not, the selection is near-black instead.
 */
export function selectionSteps(palette, ref, grounds, name) {
	const button = buttonSteps(palette, ref, grounds, name);
	const fill = palette.get(button.light.step).light;
	const stands = grounds.page.light.every((ground) => contrast(fill, ground) >= 3);
	return { light: stands ? button.light : NEAR_BLACK_SELECTION, dark: button.dark };
}

/** The light gray of a status theme's selection in dark mode, with black text. */
export const STATUS_DARK_SELECTION = { step: 850, at: (offset) => 850 + offset };

const LIST_HIGHLIGHT = '--semantics-list-items-is-highlighted-';

// The text on the selected fill, and on the highlighted row of a list or menu,
// which starts out as the same fill but is its own token.
/**
 * Light colors whose highlighted row in light mode takes a darker step of the
 * theme color instead of near-black: the step closest to the reference that
 * reaches 3:1 on the page, with white text. A dark mint still reads as the
 * theme color; a dark light blue or yellow does not, so those stay near-black.
 */
export const LIGHT_HIGHLIGHT_IN_COLOR = ['mintgroen'];

/**
 * The steps of the highlighted row of a list or menu for a theme: the
 * selection, or the button in a status theme, whose selection is gray but whose
 * highlight marks a place, not a state.
 */
export function listHighlightSteps(palette, ref, grounds, name) {
	if (STATUS_THEMES.includes(name)) return buttonSteps(palette, ref, grounds, name);
	const steps = selectionSteps(palette, ref, grounds, name);
	if (LIGHT_HIGHLIGHT_IN_COLOR.includes(name)) steps.light = selectedSteps(palette, ref, grounds).light;
	return steps;
}

/** The highlighted row's declarations: its fill per state and the text on it. */
function listHighlightTokens(steps, color) {
	const both = (fn) => pair(fn(steps.light, 'light'), fn(steps.dark, 'dark'));
	return [
		...SELECTED_TOKENS.filter(([token]) => token.startsWith(LIST_HIGHLIGHT)).map(([token, , offset]) => [token, both((m) => accent(m.at(offset), m.color ?? color))]),
		[`${LIST_HIGHLIGHT}content-color`, both((m, mode) => textColor(mode, m.text, m.color ?? color))],
	];
}

const HIGHLIGHT_TEXT_TOKENS = [
	...['', 'is-hovered-', 'is-active-'].map((state) => `--semantics-controls-is-selected-${state}contrast-color`),
	'--semantics-list-items-is-highlighted-content-color',
];

/**
 * The mark on a selected fill (the check of a checkbox, the ring of a radio,
 * the thumb of a switch): where the text would be black in dark mode it is the
 * page's base color instead, so the mark reads as a hole in the fill. White
 * stays white; in light mode white is the base color already.
 */
const MARK_TOKEN = '--semantics-controls-is-selected-mark-color';
const markColor = (mode, text) => {
	if (mode === 'light') return accent(text === 'white' ? 0 : 1000, 'neutral');
	return accent(text === 'white' ? 1000 : 100, 'neutral');
};

/** The selected fill's declarations, with the text and mark color on it. */
export function selectionTokens(steps, color = 'accent') {
	const { light: l, dark: d } = steps;
	// A border token's offset is its fill's plus one step; it goes outward.
	const fill = (m, offset, token) => accent(token.includes('highlight-border') ? outward(m, offset - 50) : m.at(offset), m.color ?? color);
	const tokens = SELECTED_TOKENS.map(([token, , offset]) => [token, pair(fill(l, offset, token), fill(d, offset, token))]);
	const text = pair(textColor('light', l.text, l.color ?? color), textColor('dark', d.text, d.color ?? color));
	const mark = pair(markColor('light', l.text), markColor('dark', d.text));
	return [...tokens, ...HIGHLIGHT_TEXT_TOKENS.map((token) => [token, text]), [MARK_TOKEN, mark]];
}

/**
 * The current tab of nldd-tab-bar. It follows the selection rule, but keeps
 * the theme color in a status theme too: a tab names a place, not a state.
 */
export function tabBarTokens(steps, color = 'accent') {
	const { light: l, dark: d } = steps;
	const value = (fn) => pair(fn(l, 'light'), fn(d, 'dark'));
	const fill = (offset) => value((m) => accent(m.at(offset), m.color ?? color));
	const text = value((m, mode) => textColor(mode, m.text, m.color ?? color));
	return [
		['', 0],
		['is-hovered-', 50],
		['is-active-', 100],
	].flatMap(([state, offset]) => [
		[`--semantics-tabs-is-current-${state}background-color`, fill(offset)],
		[`--semantics-tabs-is-current-${state}highlight-border-color`, value((m) => accent(outward(m, offset), m.color ?? color))],
		[`--semantics-tabs-is-current-${state}content-color`, text],
	]);
}

/**
 * In dark mode, the gray step that replaces each light accent step of a status
 * theme: lighter than the body text (900), so accent text still stands out
 * when the accent has no color.
 */
export const NEAR_WHITE_STEPS = new Map([
	[500, 850], [550, 900], [600, 900], [650, 950], [700, 975], [750, 975],
	[800, 1000], [850, 1000], [900, 1000], [925, 1000], [950, 1000], [975, 1000], [1000, 1000],
]);

/**
 * What an accent step stood for before the accent scale became the theme color
 * in every theme: gray in a status theme, near-black for the dark steps of
 * yellow in light mode. The scale itself no longer bends; the tokens that
 * relied on this keep it, written out (see withLegacyAccent).
 */
const accentStep = (name, step) => {
	const status = STATUS_THEMES.includes(name);
	const own = status ? accent(step, 'neutral') : accent(step, name);
	const nearBlack = NEAR_BLACK_INTERACTION.includes(name) && NEAR_BLACK_STEPS.has(step);
	const nearWhite = status && NEAR_WHITE_STEPS.has(step);
	if (!nearBlack && !nearWhite) return own;
	return pair(nearBlack ? accent(NEAR_BLACK_STEPS.get(step), 'neutral') : own, nearWhite ? accent(NEAR_WHITE_STEPS.get(step), 'neutral') : own);
};

/**
 * The full rule for one theme. `grounds` comes from selectionGrounds;
 * `neutral` is the theme's gray as generate-palette.py prints it, or omitted
 * to keep coolgray.
 */
// The sections of a theme stylesheet, in the order and with the headings of
// variables.css, so the two can be read side by side.
const SECTIONS = [
	['# Primitives', null],
	['### Neutral', '--primitives-color-neutral-'],
	['### Accent', '--primitives-color-accent-'],
	['# Semantics', null],
	['## Surfaces', '--semantics-surfaces-'],
	['## Text', '--semantics-text-'],
	['## Content', '--semantics-content-'],
	['## Categories', '--semantics-categories-'],
	['## Links', '--semantics-links-'],
	['## Controls', '--semantics-controls-'],
	['## Buttons', '--semantics-buttons-'],
	['## Focus ring', '--semantics-focus-ring-'],
	['## List items', '--semantics-list-items-'],
	['## Steps', '--semantics-steps-'],
	['## Tabs', '--semantics-tabs-'],
	['# Components', null],
	['## Badge', '--components-badge-'],
	['## Banner', '--components-banner-'],
	['## Card', '--components-card-'],
	['## Code editor', '--components-code-editor-'],
	['## Date picker', '--components-date-picker-'],
	['## Inline dialog', '--components-inline-dialog-'],
	['## Menu bar item', '--components-menu-bar-item-'],
	['## Notification', '--components-notification-'],
	['## Progress bar', '--components-progress-bar-'],
	['## Progress circle', '--components-progress-circle-'],
	['## Text editor', '--components-text-editor-'],
	['## Status bar', '--components-status-bar-'],
];

/**
 * Group declarations under the headings of variables.css. `order` maps a
 * property to its position in variables.css; within a section that order
 * wins, so a theme lines up with the file it overrides.
 */
function groupBySection(lines, order) {
	const blocks = [];
	let pendingHeading = null;
	for (const [heading, prefix] of SECTIONS) {
		if (!prefix) {
			pendingHeading = heading;
			continue;
		}
		const own = lines.filter(([prop]) => prop.startsWith(prefix));
		if (!own.length) continue;
		if (order) own.sort(([a], [b]) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity));
		const body = own.map(([prop, value]) => `\t${prop}: ${value};`).join('\n');
		blocks.push(`${pendingHeading ? `\t/* ${pendingHeading} */\n\n` : ''}\t/* ${heading} */\n\n${body}`);
		pendingHeading = null;
	}
	const placed = new Set(SECTIONS.filter(([, prefix]) => prefix).flatMap(([, prefix]) => lines.filter(([prop]) => prop.startsWith(prefix)).map(([prop]) => prop)));
	const rest = lines.filter(([prop]) => !placed.has(prop));
	if (rest.length) throw new Error(`No section for ${rest.map(([prop]) => prop).join(', ')}`);
	return blocks.join('\n\n\n');
}

/** The position of each custom property in variables.css. */
/** The semantics and components tokens of variables.css with their default value. */
export function tokenDefaults(css) {
	const defaults = new Map();
	for (const [, token, value] of css.matchAll(/^\t(--(?:semantics|components)-[\w-]+):\s*(.+);$/gm)) {
		if (!defaults.has(token)) defaults.set(token, value);
	}
	return defaults;
}

/** The light and dark part of a value: the two halves of a top-level light-dark(), or the value twice. */
function splitModes(value) {
	const inner = value.match(/^light-dark\((.*)\)$/s)?.[1];
	if (!inner) return [value, value];
	let depth = 0;
	for (let i = 0; i < inner.length; i++) {
		if (inner[i] === '(') depth++;
		else if (inner[i] === ')') depth--;
		else if (inner[i] === ',' && depth === 0) return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
	}
	return [value, value];
}

const legacyStep = (name, step, mode) => {
	const [light, dark] = splitModes(accentStep(name, step));
	const legacy = mode === 'light' ? light : dark;
	// Where the step already was the theme color, it stays a reference to the scale.
	return legacy === accent(step, name) ? accent(step) : legacy;
};

/** A value with each accent step written out as what it stood for before, in the given modes. */
export function withLegacyAccent(name, value, modes = ['light', 'dark']) {
	// A shorthand such as an outline carries its light-dark() inside.
	const start = value.indexOf('light-dark(');
	if (start > 0) {
		let depth = 0;
		let end = start + 'light-dark'.length;
		do {
			if (value[end] === '(') depth++;
			else if (value[end] === ')') depth--;
			end++;
		} while (depth > 0 && end < value.length);
		return value.slice(0, start) + withLegacyAccent(name, value.slice(start, end), modes) + value.slice(end);
	}
	const [light, dark] = splitModes(value);
	const resolve = (part, mode) => (modes.includes(mode)
		? part.replace(/var\(--primitives-color-accent-(\d+)\)/g, (_, step) => legacyStep(name, Number(step), mode))
		: part);
	return pair(resolve(light, 'light'), resolve(dark, 'dark'));
}

/**
 * Status-theme tokens on a light tint that take the theme color in dark mode
 * only: in light mode light red reads as pink, so there they stay gray. The
 * accent-tinted surface is not among them: in dark mode it would match the
 * critical-tinted one, and an accent banner would read as an error.
 */
export const STATUS_TINT_IN_DARK = new Set([
	'--components-card-is-hovered-background-color',
	'--components-card-is-hovered-border-color',
	'--components-card-is-active-background-color',
	'--components-card-is-active-border-color',
	'--components-text-editor-drag-ghost-background-color',
]);

/**
 * Status-theme tokens that take the theme color in both modes: they point
 * something out without reading as a message. The fill of the current step
 * sits inside a ring in the theme color, selected text sits under the text,
 * and a link badge or mention is a link, as red as the links of the theme.
 */
export const STATUS_IN_COLOR = new Set([
	'--semantics-steps-is-current-background-color',
	'--semantics-text-selection-background-color',
	'--components-code-editor-caret-color',
	'--components-text-editor-caret-color',
	'--components-text-editor-drop-cursor-color',
	'--components-text-editor-link-badge-content-color',
	'--components-text-editor-link-badge-background-color',
	'--components-text-editor-link-badge-highlight-border-color',
	'--components-text-editor-link-badge-is-hovered-background-color',
	'--components-text-editor-link-badge-is-active-background-color',
	'--components-text-editor-link-badge-is-hovered-highlight-border-color',
	'--components-text-editor-link-badge-is-active-highlight-border-color',
	'--components-text-editor-mention-background-color',
	'--components-text-editor-mention-content-color',
	'--components-text-editor-mention-is-selected-background-color',
	'--components-text-editor-mention-is-selected-content-color',
]);

export function propertyOrder(css) {
	const order = new Map();
	for (const [, prop] of css.matchAll(/^\t(--[\w-]+):/gm)) if (!order.has(prop)) order.set(prop, order.size);
	return order;
}

export function themeCss(name, palette, ref, { grounds, neutral, order, defaults = new Map() } = {}) {
	const lines = [];
	for (const step of palette.keys()) {
		lines.push([`--primitives-color-accent-${step}`, accent(step, name)]);
	}
	const linkOffsets = { light: 0, dark: 0, ...LINK_OFFSETS.get(name) };
	if (NEAR_BLACK_INTERACTION.includes(name)) {
		LINK_TOKENS.forEach(([token, light, dark], index) => {
			const darkValue = DARK_LINK_STEPS.has(name)
				? accent(Math.min(1000, DARK_LINK_STEPS.get(name) + index * 50 + linkOffsets.dark), name)
				: `var(--primitives-color-${DEFAULT_THEME}-${dark})`;
			const lightColor = LIGHT_LINK_IN_COLOR.includes(name) ? name : DEFAULT_THEME;
			lines.push([token, pair(`var(--primitives-color-${lightColor}-${light + linkOffsets.light})`, darkValue)]);
		});
	} else if (LINK_OFFSETS.has(name)) {
		for (const [token, light, dark] of LINK_TOKENS) {
			lines.push([token, pair(accent(light + linkOffsets.light, name), accent(dark + linkOffsets.dark, name))]);
		}
	}
	for (const token of CATEGORY_TOKENS) {
		// Red and orange keep their color on a tag too: a tag that must not read
		// as a message takes color="neutral". The banner reads surfaces instead.
		const own = `var(--semantics-categories-${name}-${token})`;
		// The text and icon on the tint (tag, banner) follow the accent text.
		const tintText = DARK_ACCENT_TEXT_STEPS.has(name) && /^tinted-content/.test(token);
		// In light mode that is the accent text, near-black for yellow.
		const nearBlackInLight = LIGHT_NEAR_BLACK_FILLED.includes(name) && token.startsWith('filled');
		const value = tintText
			? `light-dark(${accent(750)}, ${accent(DARK_ACCENT_TEXT_STEPS.get(name), name)})`
			: nearBlackInLight ? `light-dark(${accent(NEAR_BLACK_FILLED_STEPS[token.replace('filled-', '')], 'neutral')}, ${own})` : own;
		lines.push([`--semantics-categories-accent-${token}`, value]);
	}
	// The progress bar and circle keep the filled category in light mode, which
	// stands out on the page where a light button would not, and take the
	// button step in dark mode, where the category falls short of 3:1. Written
	// out per theme, so a theme can move away from either.
	const resolve = (value, mode) => {
		const index = mode === 'light' ? 0 : 1;
		let part = splitModes(value)[index];
		for (let ref = part.match(/^var\((--semantics-[\w-]+)\)$/); ref && defaults.has(ref[1]); ref = part.match(/^var\((--semantics-[\w-]+)\)$/)) {
			part = splitModes(defaults.get(ref[1]))[index];
		}
		return part;
	};
	const category = (prop) => lines.find(([token]) => token === `--semantics-categories-accent-filled-${prop}`)[1];
	const darkButton = buttonSteps(palette, ref, grounds, name).dark.step;
	for (const component of ['progress-bar', 'progress-circle']) {
		lines.push(
			[`--components-${component}-accent-background-color`, pair(resolve(category('background-color'), 'light'), accent(darkButton, name))],
			[`--components-${component}-accent-highlight-border-color`, pair(resolve(category('highlight-border-color'), 'light'), accent(clamp(darkButton + 50), name))],
		);
	}
	lines.push(...buttonTokens(buttonSteps(palette, ref, grounds, name), name));
	lines.push(...areaTokens(areaSteps(palette, ref), name));
	lines.push(...badgeTokens(buttonSteps(palette, ref, grounds, name), name));
	if (DARK_ACCENT_TEXT_STEPS.has(name)) lines.push(...mentionSelectedTokens(buttonSteps(palette, ref, grounds, name), name));
	if (ACCENT_TEXT_IN_COLOR.has(name)) {
		const modes = ACCENT_TEXT_IN_COLOR.get(name);
		const own = (light, dark) => pair(modes.light ? accent(light, name) : accent(light), modes.dark ? accent(dark, name) : accent(dark));
		const transparent = '--semantics-buttons-accent-transparent-';
		lines.push(
			['--semantics-content-accent-color', own(600, 650)],
			[`${transparent}content-color`, own(600, 650)],
			[`${transparent}is-hovered-content-color`, own(650, 700)],
			[`${transparent}is-active-content-color`, own(700, 750)],
			...['', 'is-hovered-', 'is-active-'].map((state) => [`${transparent}${state}content-secondary-color`, own(600, 650)]),
		);
	}
	if (DARK_ACCENT_TEXT_STEPS.has(name)) {
		const step = DARK_ACCENT_TEXT_STEPS.get(name);
		const dark = (offset) => accent(Math.min(1000, step + offset), name);
		const transparent = '--semantics-buttons-accent-transparent-';
		lines.push(
			['--semantics-content-accent-color', `light-dark(${accent(750)}, ${dark(0)})`],
			['--components-banner-accent-icon-color', `light-dark(${accent(750)}, ${dark(0)})`],
			['--components-text-editor-mention-content-color', `light-dark(${accent(750)}, ${dark(0)})`],
			[`${transparent}content-color`, `light-dark(${accent(750)}, ${dark(0)})`],
			[`${transparent}is-hovered-content-color`, `light-dark(${accent(800)}, ${dark(50)})`],
			[`${transparent}is-active-content-color`, `light-dark(${accent(850)}, ${dark(100)})`],
			...['', 'is-hovered-', 'is-active-'].map((state) => [`${transparent}${state}content-secondary-color`, `light-dark(${accent(550)}, ${dark(0)})`]),
		);
	}
	if (BANNER_ICON_STEPS.has(name)) {
		const steps = BANNER_ICON_STEPS.get(name);
		const [light, dark] = splitModes(defaults.get('--components-banner-accent-icon-color') ?? accent(700));
		lines.push(['--components-banner-accent-icon-color', pair(steps.light ? accent(steps.light) : light, steps.dark ? accent(steps.dark) : dark)]);
	}
	lines.push(...statusBarTokens(buttonSteps(palette, ref, grounds, name), name));
	lines.push(...focusRingTokens(focusRingSteps(palette, ref, grounds, name), name));
	lines.push(...tabBarTokens(selectionSteps(palette, ref, grounds, name), name));
	if (STATUS_THEMES.includes(name) && !STATUS_SELECTION_IN_COLOR.includes(name)) {
		// A status theme's selection stays in its gray accent: near-black with
		// white text in light mode, light gray with black text in dark mode.
		const isListHighlight = (token) => token.startsWith(LIST_HIGHLIGHT);
		for (const [token, light, offset] of SELECTED_TOKENS) {
			if (isListHighlight(token)) continue;
			// The legacy accent stops at 975, one step short of a ring around it.
			const lightValue = token.startsWith('--components-') ? accent(NEAR_BLACK_SELECTION.at(offset), 'neutral') : accent(light);
			lines.push([token, `light-dark(${lightValue}, ${accent(STATUS_DARK_SELECTION.at(offset), 'neutral')})`]);
		}
		const text = pair(textColor('light', 'white', 'neutral'), textColor('dark', 'black', 'neutral'));
		for (const token of HIGHLIGHT_TEXT_TOKENS) if (!isListHighlight(token)) lines.push([token, text]);
		lines.push([MARK_TOKEN, pair(markColor('light', 'white'), markColor('dark', 'black'))]);
		// The highlighted row of a list or menu marks where you are, not a
		// state, so it takes the theme color of the button.
		lines.push(...listHighlightTokens(listHighlightSteps(palette, ref, grounds, name), name));
	} else {
		const steps = selectionSteps(palette, ref, grounds, name);
		if (STATUS_SELECTION_IN_COLOR.includes(name)) steps.light = NEAR_BLACK_SELECTION;
		const ownHighlight = STATUS_SELECTION_IN_COLOR.includes(name) || LIGHT_HIGHLIGHT_IN_COLOR.includes(name);
		lines.push(...selectionTokens(steps, name).filter(([token]) => !ownHighlight || !token.startsWith(LIST_HIGHLIGHT)));
		if (ownHighlight) lines.push(...listHighlightTokens(listHighlightSteps(palette, ref, grounds, name), name));
	}
	// Everything this theme writes keeps what its accent steps stood for. The
	// defaults that read the accent scale do too, unless a rule above lets them
	// take the theme color.
	const written = new Set(lines.map(([token]) => token));
	const status = STATUS_THEMES.includes(name);
	for (const line of lines) {
		if (!line[0].startsWith('--primitives-')) line[1] = withLegacyAccent(name, line[1]);
	}
	// The line, ring and finished marker of a step take the button step, which
	// matches the progress and the banner icon. In light mode a button that does
	// not stand out 3:1 on the page gives way to the step nearest to it that
	// does; in geel and donkergeel that is a dark yellow, so they keep the
	// near-black accent text.
	const button = buttonSteps(palette, ref, grounds, name);
	const stands = (step) => grounds.page.light.every((ground) => contrast(palette.get(step).light, ground) >= 3);
	const buttonText = splitModes(lines.find(([token]) => token === '--semantics-buttons-accent-filled-content-color')?.[1] ?? accent(0, name));
	let progressLight;
	let progressTextLight;
	if (stands(button.light.step)) {
		progressLight = accent(button.light.step, name);
		progressTextLight = buttonText[0];
	} else if (NEAR_BLACK_PROGRESS.includes(name)) {
		const accentText = lines.find(([token]) => token === '--semantics-content-accent-color')?.[1]
			?? withLegacyAccent(name, defaults.get('--semantics-content-accent-color') ?? accent(750));
		progressLight = splitModes(accentText)[0];
		progressTextLight = splitModes(withLegacyAccent(name, defaults.get('--semantics-steps-progress-content-color') ?? accent(0)))[0];
	} else {
		const step = [...palette.keys()].filter(stands).sort((a, b) => Math.abs(a - button.light.step) - Math.abs(b - button.light.step))[0];
		progressLight = accent(step, name);
		progressTextLight = textColor('light', textOn(palette.get(step).light), name);
	}
	lines.push(['--semantics-steps-progress-color', pair(progressLight, accent(button.dark.step, name))]);
	written.add('--semantics-steps-progress-color');
	// The check on a finished marker is the text of whatever fills it.
	lines.push(['--semantics-steps-progress-content-color', pair(progressTextLight, buttonText[1])]);
	written.add('--semantics-steps-progress-content-color');
	// The range between two selected days is a tint of the selection, so it is
	// gray in a mode where the selection is gray or near-black. A selection
	// must not read as an error, so in a status theme it stays gray.
	const grayLight = status || selectionSteps(palette, ref, grounds, name).light === NEAR_BLACK_SELECTION;
	const grayDark = status && !STATUS_SELECTION_IN_COLOR.includes(name);
	for (const range of ['--components-date-picker-day-is-in-range-background-color', '--components-date-picker-day-is-in-range-is-hovered-background-color', '--components-date-picker-day-is-today-is-in-range-border-color']) {
		if (!defaults.has(range) || !(grayLight || grayDark)) continue;
		const [light, dark] = splitModes(defaults.get(range));
		const gray = (part) => part.replaceAll('--primitives-color-accent-', '--primitives-color-neutral-');
		lines.push([range, pair(grayLight ? gray(light) : light, grayDark ? gray(dark) : dark)]);
		written.add(range);
	}
	for (const [token, value] of defaults) {
		if (written.has(token) || !/--primitives-color-accent-\d/.test(value)) continue;
		if (status && STATUS_IN_COLOR.has(token)) continue;
		const kept = withLegacyAccent(name, value, status && STATUS_TINT_IN_DARK.has(token) ? ['light'] : ['light', 'dark']);
		if (kept !== value) lines.push([token, kept]);
	}
	if (neutral) {
		// The hex, not the rounded oklch: it is the value generate-palette.py
		// matched to the step's luminance, so contrasts stay those of coolgray.
		const pattern = /--primitives-color-[a-z-]+-(\d+): .*?\/\* light: (#[0-9A-F]{6}) \| dark: (#[0-9A-F]{6})/g;
		for (const [, step, light, dark] of neutral.matchAll(pattern)) lines.push([`--primitives-color-neutral-${step}`, pair(light, dark)]);
	}
	return `:root[data-nldd-theme="${name}"] {\n${groupBySection(lines, order)}\n}\n`;
}

/** The reference colors that become a theme: all but the neutral and the default. */
export function themeColors(references) {
	return references.filter((c) => !c.neutral && c.name !== DEFAULT_THEME);
}

/** The themes around the color wheel by OKLCH hue, starting at the default. */
export function themesByHue(references) {
	const start = hue(references.find((c) => c.name === DEFAULT_THEME).hex);
	const fromStart = (hex) => (hue(hex) - start + 360) % 360;
	return themeColors(references).sort((a, b) => fromStart(a.hex) - fromStart(b.hex));
}
