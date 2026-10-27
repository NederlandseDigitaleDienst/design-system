/**
 * Theme generation: one stylesheet per reference color that points the accent
 * at that color.
 *
 * A theme does this on `:root[data-nldd-theme="<name>"]`:
 * 1. points every `--primitives-color-accent-*` step at the theme's scale;
 * 2. points `--semantics-categories-accent-*` at the theme's own category;
 * 3. gives each role (button, selection, focus ring, steps, links, …) a step
 *    by a general rule, mostly "the step nearest to the theme color that
 *    reaches N:1 against its ground";
 * 4. applies the choices in THEMES, where a rule's step is not the nicer one;
 * 5. gives `--primitives-color-neutral-*` a gray in the theme's hue. Every step
 *    keeps the luminance of coolgray, so every contrast stays the same.
 *
 * Two kinds of theme bend the accent where a default reads it (see grayAccent).
 * Yellow has no dark version that still reads as yellow: dark enough for
 * 4.5:1, it turns olive, so its dark steps are near-black in light mode. Red
 * and orange read as critical and warning, so a status theme reads the accent
 * as gray, unless a token takes the theme color on purpose (STATUS_IN_COLOR).
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
 * The choices per theme where a rule's step is not the nicer one, picked by
 * eye. A theme leaves out what follows the rules.
 *
 * - `kind`: 'yellow' or 'status', see grayAccent. A yellow theme's filled
 *   category, steps, progress and accent banner icon follow its selection in
 *   light mode; its accent text is near-black there.
 * - `darkButton`: the dark-mode button step, a light tint with black text, so
 *   a mark on it (the dot of a radio, the check of a checkbox) is dark like
 *   the page.
 * - `darkText`: the dark-mode accent text (content, accent-transparent button,
 *   accent tag, accent banner icon, mention) of a yellow theme.
 * - `bannerIcon`: the accent banner icon per mode, closer to the theme color
 *   and still 3:1 on the accent-tinted surface.
 * - `menuBarIndicator`: the light-mode line under the current item of a menu
 *   bar is the line of the steps, the step nearest to the button that stands
 *   out 3:1 on the page, instead of the color of its text.
 * - `linkOffset`: how far the links move from their default steps per mode; a
 *   positive offset is darker in light mode and lighter in dark mode.
 * - `darkLink`: in a yellow or status theme, whose links are lintblauw in light
 *   mode, the dark-mode link step; hover and active go a step lighter each.
 * - `lightLinkInColor`: the links keep the theme color in light mode too.
 * - `accentText`: per mode, whether a status theme's accent text keeps the
 *   theme color on the default steps.
 * - `graySelection`: the light-mode selection is this gray step with white
 *   text, instead of the button or near-black.
 * - `darkSelectionInColor`: a status theme whose selection keeps the theme
 *   color in dark mode.
 * - `ownHighlight`: the highlighted row of a list or menu takes the selected
 *   fill rule in the theme color instead of the selection.
 * - `focusFollowsSelection`: the light-mode focus ring is the selection's gray.
 * - `darkFocus`: the dark-mode focus ring step.
 */
export const THEMES = {
	lintblauw: { darkButton: 650 },
	paars: { darkButton: 600, bannerIcon: { light: 850 }, linkOffset: { light: 50, dark: 50 }, menuBarIndicator: true },
	roze: { bannerIcon: { light: 450 }, menuBarIndicator: true, linkOffset: { dark: 150 }, graySelection: 650, focusFollowsSelection: true },
	violet: { darkButton: 600, menuBarIndicator: true },
	robijnrood: { kind: 'status', darkLink: 600, lightLinkInColor: true, accentText: { light: true, dark: true }, graySelection: 700, darkFocus: 700 },
	rood: { kind: 'status', darkLink: 600, lightLinkInColor: true, accentText: { light: true, dark: true }, graySelection: 700, darkFocus: 700 },
	donkerbruin: { darkButton: 600 },
	oranje: { kind: 'status', darkLink: 650, accentText: { dark: true }, graySelection: 700, darkSelectionInColor: true, darkFocus: 700 },
	donkergeel: { kind: 'yellow', darkText: 800, darkLink: 800, graySelection: 750, focusFollowsSelection: true, darkFocus: 750 },
	bruin: { darkButton: 600, bannerIcon: { light: 500, dark: 600 }, menuBarIndicator: true },
	geel: { kind: 'yellow', darkText: 900, darkLink: 900, graySelection: 750, focusFollowsSelection: true, darkFocus: 750 },
	mosgroen: { darkButton: 600, bannerIcon: { light: 500, dark: 600 }, menuBarIndicator: true },
	groen: { darkButton: 600, bannerIcon: { light: 500, dark: 600 }, menuBarIndicator: true },
	donkergroen: { darkButton: 650, menuBarIndicator: true },
	mintgroen: { bannerIcon: { light: 450, dark: 800 }, graySelection: 650, ownHighlight: true, menuBarIndicator: true },
	lichtblauw: { bannerIcon: { light: 400 }, graySelection: 650, focusFollowsSelection: true, menuBarIndicator: true },
	donkerblauw: { darkButton: 700, bannerIcon: { light: 600 }, menuBarIndicator: true },
	hemelblauw: { darkButton: 700, bannerIcon: { light: 500 }, menuBarIndicator: true },
};

const themeOf = (name) => THEMES[name] ?? {};
const isStatus = (name) => themeOf(name).kind === 'status';
const isYellow = (name) => themeOf(name).kind === 'yellow';

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

/** Whether a light-mode fill stands out 3:1 from the page. */
const standsOut = (palette, step, grounds) => grounds.page.light.every((ground) => contrast(palette.get(step).light, ground) >= 3);

/** The light-mode step nearest to `step` that stands out 3:1 from the page. */
export const nearestStandingStep = (palette, step, grounds) => [...palette.keys()]
	.filter((s) => standsOut(palette, s, grounds))
	.sort((a, b) => Math.abs(a - step) - Math.abs(b - step))[0];

const SELECTED_STATES = [0, 50, 100];

/**
 * The selected fill in the theme color for one mode: the step closest to the
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
 * The selected fill in the theme color. It can differ from the button, which
 * never sits on a selected row and so can get closer to the reference.
 */
export function selectedSteps(palette, ref, grounds) {
	return { light: selectedMode(palette, ref, 'light', grounds), dark: selectedMode(palette, ref, 'dark', grounds) };
}

/**
 * The dark-mode button: the step closest to the reference color with 4.5:1
 * text that also reaches 3:1 against the page. Without that, a dark color
 * would give a dark button on a dark page.
 */
function darkButtonStep(palette, ref, grounds, name) {
	if (themeOf(name).darkButton) return themeOf(name).darkButton;
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

/** A near-black selection, from the theme's gray, with white text. */
export const NEAR_BLACK_SELECTION = { step: 925, text: 'white', color: 'neutral', at: (offset) => Math.min(1000, 925 + offset / 2) };

/** A gray selection on the given step, with white text. */
const graySelection = (step) => ({ step, text: 'white', color: 'neutral', at: (offset) => step + offset });

/** The light gray of a status theme's selection in dark mode, with black text. */
export const STATUS_DARK_SELECTION = { step: 850, text: 'black', color: 'neutral', at: (offset) => 850 + offset };

/**
 * The selected fill (a checked checkbox, a selected segment): in light mode
 * the theme's gray where it has one, else the button where it stands out 3:1
 * from the page, else near-black. In dark mode the button, where it is held
 * to 3:1, except in a status theme, whose selection is a light gray there.
 */
export function selectionSteps(palette, ref, grounds, name) {
	const theme = themeOf(name);
	const button = buttonSteps(palette, ref, grounds, name);
	const light = theme.graySelection
		? graySelection(theme.graySelection)
		: standsOut(palette, button.light.step, grounds) ? button.light : NEAR_BLACK_SELECTION;
	const dark = isStatus(name) && !theme.darkSelectionInColor ? STATUS_DARK_SELECTION : button.dark;
	return { light, dark };
}

/**
 * The current tab of nldd-tab-bar: the button where it stands out, otherwise
 * the light-mode selection. It keeps the theme color in a status theme too: a
 * tab names a place, not a state.
 */
export function tabSteps(palette, ref, grounds, name) {
	const theme = themeOf(name);
	const button = buttonSteps(palette, ref, grounds, name);
	if (standsOut(palette, button.light.step, grounds)) return button;
	return { light: theme.graySelection ? graySelection(theme.graySelection) : NEAR_BLACK_SELECTION, dark: button.dark };
}

/**
 * The highlighted row of a list or menu: the selection, or the button in a
 * status theme, whose selection is gray but whose highlight marks a place, not
 * a state. With `ownHighlight` it takes the selected fill rule in light mode.
 */
export function listHighlightSteps(palette, ref, grounds, name) {
	if (isStatus(name)) return buttonSteps(palette, ref, grounds, name);
	const steps = selectionSteps(palette, ref, grounds, name);
	if (themeOf(name).ownHighlight) steps.light = selectedSteps(palette, ref, grounds).light;
	return steps;
}

/**
 * The focus ring. In light mode it is the step closest to the button that
 * reaches 4.5:1 against the base background, the color of the halo it sits
 * on, or the selection's gray with `focusFollowsSelection`. In dark mode it
 * takes the button color when that reaches 4.5:1 against the page, so a light
 * theme color keeps its brightness; otherwise step 600.
 */
export function focusRingSteps(palette, ref, grounds, name) {
	const theme = themeOf(name);
	const button = buttonSteps(palette, ref, grounds, name);
	const fits = grounds.page.dark.every((ground) => contrast(palette.get(button.dark.step).dark, ground) >= MIN_TEXT_CONTRAST);
	const lightStep = [...palette.keys()]
		.filter((step) => contrast(palette.get(step).light, grounds.page.light[0]) >= MIN_TEXT_CONTRAST)
		.sort((a, b) => Math.abs(a - button.light.step) - Math.abs(b - button.light.step) || a - b)[0];
	return {
		light: theme.focusFollowsSelection ? { step: selectionSteps(palette, ref, grounds, name).light.step, color: 'neutral' } : { step: lightStep },
		dark: { step: theme.darkFocus ?? (fits ? button.dark.step : 600) },
	};
}

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
 * In dark mode, the gray step that replaces each light accent step of a status
 * theme: lighter than the body text (900), so accent text still stands out
 * when the accent has no color.
 */
export const NEAR_WHITE_STEPS = new Map([
	[500, 850], [550, 900], [600, 900], [650, 950], [700, 975], [750, 975],
	[800, 1000], [850, 1000], [900, 1000], [925, 1000], [950, 1000], [975, 1000], [1000, 1000],
]);

const accent = (step, color = 'accent') => `var(--primitives-color-${color}-${step})`;
const pair = (light, dark) => (light === dark ? light : `light-dark(${light}, ${dark})`);
const both = (steps, fn) => pair(fn(steps.light, 'light'), fn(steps.dark, 'dark'));
const textColor = (mode, text, color) => {
	const white = mode === 'light' ? 0 : 1000;
	return accent(text === 'white' ? white : 1000 - white, color);
};

/**
 * What accent step `step` stands for where a theme bends it. In a status theme
 * it is the gray at the same step, which has the same luminance, so every
 * contrast stays; the dark steps become near-black in light mode and the light
 * steps near-white in dark mode. In a yellow theme the dark steps become
 * near-black in light mode. Elsewhere it is the accent step itself.
 */
function grayAccent(name, step, mode) {
	const nearBlack = mode === 'light' && (isStatus(name) || isYellow(name)) && NEAR_BLACK_STEPS.has(step);
	if (nearBlack) return accent(NEAR_BLACK_STEPS.get(step), 'neutral');
	if (!isStatus(name)) return accent(step);
	const nearWhite = mode === 'dark' && NEAR_WHITE_STEPS.has(step);
	return accent(nearWhite ? NEAR_WHITE_STEPS.get(step) : step, 'neutral');
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

/** A value with every accent step bent by grayAccent, in the given modes. */
function bend(name, value, modes) {
	const [light, dark] = splitModes(value);
	const part = (text, mode) => (modes.includes(mode)
		? text.replace(/var\(--primitives-color-accent-(\d+)\)/g, (_, step) => grayAccent(name, Number(step), mode))
		: text);
	return pair(part(light, 'light'), part(dark, 'dark'));
}

/**
 * The `--semantics-buttons-accent-filled-*` declarations. A theme passes its
 * own color, so the button keeps it where the accent scale is bent.
 */
export function buttonTokens(steps, color = 'accent') {
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
		tokens.push([`${prefix}${state}background-color`, both(steps, (m) => accent(m.at(offset), color))]);
		if (!state) tokens.push([`${prefix}divider-color`, both(steps, (m) => accent(m.divider, color))]);
		tokens.push([`${prefix}${state}highlight-border-color`, both(steps, (m) => accent(outward(m, offset), color))]);
		tokens.push([`${prefix}${state}content-color`, both(steps, (m, mode) => textColor(mode, m.text, color))]);
		tokens.push([`${prefix}${state}content-secondary-color`, both(steps, (m) => accent(m.secondaryAt(offset), color))]);
	}
	return tokens;
}

/**
 * The accent badge: read by its text, like a button, so it takes the button's
 * steps. Its own tokens, so a change to one does not move the other.
 */
export function badgeTokens(steps, color = 'accent') {
	return [
		['--components-badge-accent-background-color', both(steps, (m) => accent(m.step, color))],
		['--components-badge-accent-highlight-border-color', both(steps, (m) => accent(outward(m, 0), color))],
		['--components-badge-accent-content-color', both(steps, (m, mode) => textColor(mode, m.text, color))],
	];
}

/**
 * The accent status bar: read by its text, like the badge, and a link or a
 * button when it has to be, so it has the button's hover and active too.
 */
export function statusBarTokens(steps, color = 'accent') {
	return [
		['--components-status-bar-accent-background-color', both(steps, (m) => accent(m.at(0), color))],
		['--components-status-bar-accent-content-color', both(steps, (m, mode) => textColor(mode, m.text, color))],
		['--components-status-bar-accent-is-hovered-background-color', both(steps, (m) => accent(m.at(50), color))],
		['--components-status-bar-accent-is-active-background-color', both(steps, (m) => accent(m.at(100), color))],
	];
}

/** The accent area's declarations: its surface, and the text on it. */
export function areaTokens(steps, color = 'accent') {
	const text = both(steps, (m, mode) => textColor(mode, m.text, color));
	return [
		['--semantics-surfaces-accent-filled-background-color', both(steps, (m) => accent(m.step, color))],
		['--semantics-surfaces-accent-filled-highlight-border-color', both(steps, (m) => accent(outward(m, 0), color))],
		['--semantics-content-on-accent-filled-color', text],
		['--semantics-content-on-accent-filled-secondary-color', text],
	];
}

/** The `--semantics-focus-ring-outline` declaration. */
export function focusRingTokens(steps, color = 'accent') {
	const value = (mode) => accent(steps[mode].step, steps[mode].color ?? color);
	return [['--semantics-focus-ring-outline', `var(--primitives-border-width-regular) solid ${pair(value('light'), value('dark'))}`]];
}

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

const LIST_HIGHLIGHT = '--semantics-list-items-is-highlighted-';

// The text on the selected fill, and on the highlighted row of a list or menu,
// which starts out as the same fill but is its own token.
const HIGHLIGHT_TEXT_TOKENS = [
	...['', 'is-hovered-', 'is-active-'].map((state) => `--semantics-controls-is-selected-${state}contrast-color`),
	`${LIST_HIGHLIGHT}content-color`,
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
	// A border token's offset is its fill's plus one step; it goes outward.
	const fill = (m, offset, token) => accent(token.includes('highlight-border') ? outward(m, offset - 50) : m.at(offset), m.color ?? color);
	const tokens = SELECTED_TOKENS.map(([token, , offset]) => [token, both(steps, (m) => fill(m, offset, token))]);
	const text = both(steps, (m, mode) => textColor(mode, m.text, m.color ?? color));
	const mark = both(steps, (m, mode) => markColor(mode, m.text));
	return [...tokens, ...HIGHLIGHT_TEXT_TOKENS.map((token) => [token, text]), [MARK_TOKEN, mark]];
}

/** The highlighted row's declarations: its fill per state and the text on it. */
function listHighlightTokens(steps, color = 'accent') {
	return [
		...SELECTED_TOKENS.filter(([token]) => token.startsWith(LIST_HIGHLIGHT)).map(([token, , offset]) => [token, both(steps, (m) => accent(m.at(offset), m.color ?? color))]),
		[`${LIST_HIGHLIGHT}content-color`, both(steps, (m, mode) => textColor(mode, m.text, m.color ?? color))],
	];
}

/** The current tab's declarations. */
export function tabBarTokens(steps, color = 'accent') {
	return [
		['', 0],
		['is-hovered-', 50],
		['is-active-', 100],
	].flatMap(([state, offset]) => [
		[`--semantics-tabs-is-current-${state}background-color`, both(steps, (m) => accent(m.at(offset), m.color ?? color))],
		[`--semantics-tabs-is-current-${state}highlight-border-color`, both(steps, (m) => accent(outward(m, offset), m.color ?? color))],
		[`--semantics-tabs-is-current-${state}content-color`, both(steps, (m, mode) => textColor(mode, m.text, m.color ?? color))],
	]);
}

const LINK_TOKENS = [
	['--semantics-links-color', 600, 650],
	['--semantics-links-is-hovered-color', 650, 700],
	['--semantics-links-is-active-color', 700, 750],
];

/**
 * The links. In a yellow or status theme they are lintblauw in light mode, the
 * color a reader expects a link to have, unless `lightLinkInColor`.
 */
function linkTokens(name) {
	const theme = themeOf(name);
	const offset = { light: 0, dark: 0, ...theme.linkOffset };
	if (theme.kind) {
		return LINK_TOKENS.map(([token, light, dark], index) => {
			const darkValue = theme.darkLink
				? accent(Math.min(1000, theme.darkLink + index * 50 + offset.dark))
				: accent(dark, DEFAULT_THEME);
			return [token, pair(accent(light + offset.light, theme.lightLinkInColor ? 'accent' : DEFAULT_THEME), darkValue)];
		});
	}
	if (!theme.linkOffset) return [];
	return LINK_TOKENS.map(([token, light, dark]) => [token, pair(accent(light + offset.light), accent(dark + offset.dark))]);
}

const CATEGORY_TOKENS = ['filled', 'tinted'].flatMap((variant) =>
	['background-color', 'highlight-border-color', 'content-color', 'content-secondary-color'].map((prop) => `${variant}-${prop}`),
);

// The near-black of the selection, per filled property, with white text.
const NEAR_BLACK_FILLED_STEPS = { 'background-color': 925, 'highlight-border-color': 1000, 'content-color': 0, 'content-secondary-color': 0 };

/**
 * The accent category is the theme's own. Red and orange keep their color on
 * a tag too: a tag that must not read as a message takes color="neutral". In a
 * yellow theme the filled category is near-black in light mode, where a light
 * yellow bar barely stands out from a white page (a site that wants it in
 * color picks `color="geel"`), and the text on the tint is the accent text.
 */
function categoryTokens(name) {
	const theme = themeOf(name);
	return CATEGORY_TOKENS.map((token) => {
		const own = `var(--semantics-categories-${name}-${token})`;
		let value = own;
		if (isYellow(name) && token.startsWith('tinted-content')) value = pair(grayAccent(name, 750, 'light'), accent(theme.darkText));
		else if (isYellow(name) && token.startsWith('filled')) value = pair(accent(NEAR_BLACK_FILLED_STEPS[token.replace('filled-', '')], 'neutral'), own);
		return [`--semantics-categories-accent-${token}`, value];
	});
}

/**
 * Accent text that keeps or loses the theme color: a status theme per mode on
 * the default steps (red is the same as critical text, orange is brown in
 * light mode), a yellow theme near-black in light mode and `darkText` in dark
 * mode. A selected mention in a yellow theme takes the button, like the badge.
 * Selected text in a yellow theme is lighter in both modes: at the step
 * of the other themes a saturated yellow reads as mustard, and the text on it
 * keeps far more than 4.5:1 either way.
 */
function accentTextTokens(name, button) {
	const theme = themeOf(name);
	const transparent = '--semantics-buttons-accent-transparent-';
	if (theme.accentText) {
		const value = (light, dark) => pair(
			theme.accentText.light ? accent(light) : grayAccent(name, light, 'light'),
			theme.accentText.dark ? accent(dark) : grayAccent(name, dark, 'dark'),
		);
		return [
			['--semantics-content-accent-color', value(600, 650)],
			[`${transparent}content-color`, value(600, 650)],
			[`${transparent}is-hovered-content-color`, value(650, 700)],
			[`${transparent}is-active-content-color`, value(700, 750)],
			...['', 'is-hovered-', 'is-active-'].map((state) => [`${transparent}${state}content-secondary-color`, value(600, 650)]),
		];
	}
	if (!isYellow(name)) return [];
	const value = (light, offset) => pair(grayAccent(name, light, 'light'), accent(Math.min(1000, theme.darkText + offset)));
	return [
		['--semantics-content-accent-color', value(750, 0)],
		['--semantics-mentions-content-color', value(750, 0)],
		[`${transparent}content-color`, value(750, 0)],
		[`${transparent}is-hovered-content-color`, value(800, 50)],
		[`${transparent}is-active-content-color`, value(850, 100)],
		...['', 'is-hovered-', 'is-active-'].map((state) => [`${transparent}${state}content-secondary-color`, value(550, 0)]),
		['--semantics-mentions-is-selected-background-color', both(button, (m) => accent(m.step))],
		['--semantics-text-selection-background-color', pair(accent(75), accent(300))],
		['--semantics-mentions-is-selected-content-color', both(button, (m, mode) => textColor(mode, m.text, 'accent'))],
	];
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
	'--semantics-mentions-background-color',
	'--semantics-mentions-content-color',
	'--semantics-mentions-highlight-border-color',
	'--semantics-mentions-is-hovered-background-color',
	'--semantics-mentions-is-active-background-color',
	'--semantics-mentions-is-selected-background-color',
	'--semantics-mentions-is-selected-content-color',
]);

const DATE_RANGE_TOKENS = [
	'--components-date-picker-day-is-in-range-background-color',
	'--components-date-picker-day-is-in-range-is-hovered-background-color',
	'--components-date-picker-day-is-today-is-in-range-border-color',
];

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
	['## Mentions', '--semantics-mentions-'],
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

/** The semantics and components tokens of variables.css with their default value. */
export function tokenDefaults(css) {
	const defaults = new Map();
	for (const [, token, value] of css.matchAll(/^\t(--(?:semantics|components)-[\w-]+):\s*(.+);$/gm)) {
		if (!defaults.has(token)) defaults.set(token, value);
	}
	return defaults;
}

/** The position of each custom property in variables.css. */
export function propertyOrder(css) {
	const order = new Map();
	for (const [, prop] of css.matchAll(/^\t(--[\w-]+):/gm)) if (!order.has(prop)) order.set(prop, order.size);
	return order;
}

/**
 * The full rule for one theme. `grounds` comes from selectionGrounds;
 * `neutral` is the theme's gray as generate-palette.py prints it, or omitted
 * to keep coolgray; `defaults` are the tokens of variables.css.
 */
export function themeCss(name, palette, ref, { grounds, neutral, order, defaults = new Map() } = {}) {
	const theme = themeOf(name);
	const status = isStatus(name);
	const yellow = isYellow(name);
	const button = buttonSteps(palette, ref, grounds, name);
	const selection = selectionSteps(palette, ref, grounds, name);
	const lines = [...palette.keys()].map((step) => [`--primitives-color-accent-${step}`, accent(step, name)]);

	lines.push(...linkTokens(name), ...categoryTokens(name));
	// The progress bar and circle keep the filled category in light mode, which
	// stands out on the page where a light button would not, and take the
	// button step in dark mode, where the category falls short of 3:1. A yellow
	// theme's follow its selection.
	const lightCategory = (prop) => {
		let part = splitModes(`var(--semantics-categories-${name}-filled-${prop})`)[0];
		for (let token = part.match(/^var\((--semantics-[\w-]+)\)$/); token && defaults.has(token[1]); token = part.match(/^var\((--semantics-[\w-]+)\)$/)) {
			part = splitModes(defaults.get(token[1]))[0];
		}
		return part.replaceAll(`--primitives-color-${name}-`, '--primitives-color-accent-');
	};
	for (const component of ['progress-bar', 'progress-circle']) {
		lines.push(
			[`--components-${component}-accent-background-color`, pair(yellow ? accent(selection.light.step, 'neutral') : lightCategory('background-color'), accent(button.dark.step))],
			[`--components-${component}-accent-highlight-border-color`, pair(yellow ? accent(selection.light.step + 50, 'neutral') : lightCategory('highlight-border-color'), accent(clamp(button.dark.step + 50)))],
		);
	}
	lines.push(
		...buttonTokens(button),
		...areaTokens(areaSteps(palette, ref)),
		...badgeTokens(button),
		...statusBarTokens(button),
		...accentTextTokens(name, button),
		...focusRingTokens(focusRingSteps(palette, ref, grounds, name)),
		...tabBarTokens(tabSteps(palette, ref, grounds, name)),
	);

	// The accent icon of a banner, inline dialog and notification is one color.
	const icon = '--components-banner-accent-icon-color';
	let iconValue;
	if (yellow) {
		iconValue = pair(accent(selection.light.step, 'neutral'), accent(theme.darkText));
	} else if (theme.bannerIcon) {
		const [light, dark] = splitModes(defaults.get(icon) ?? accent(700));
		iconValue = pair(theme.bannerIcon.light ? accent(theme.bannerIcon.light) : light, theme.bannerIcon.dark ? accent(theme.bannerIcon.dark) : dark);
	}
	if (iconValue) {
		for (const token of [icon, '--components-inline-dialog-icon-color', '--components-notification-icon-color']) lines.push([token, iconValue]);
	}

	if (theme.menuBarIndicator) {
		const indicator = '--components-menu-bar-item-is-current-indicator-color';
		lines.push([indicator, pair(accent(nearestStandingStep(palette, button.light.step, grounds)), splitModes(defaults.get(indicator) ?? accent(750))[1])]);
	}

	const ownHighlight = status || theme.ownHighlight;
	lines.push(...selectionTokens(selection).filter(([token]) => !ownHighlight || !token.startsWith(LIST_HIGHLIGHT)));
	if (ownHighlight) lines.push(...listHighlightTokens(listHighlightSteps(palette, ref, grounds, name)));

	// The line and ring of a step take the button step, which matches the
	// progress and the banner icon. In light mode a button that does not stand
	// out 3:1 on the page gives way to the step nearest to it that does; a
	// yellow theme's follow its selection. A finished marker carries its check,
	// so it is the button itself, with the text of the button.
	let line = accent(button.light.step);
	let past = line;
	let pastText = textColor('light', button.light.text, 'accent');
	if (yellow && !standsOut(palette, button.light.step, grounds)) {
		line = past = accent(selection.light.step, 'neutral');
		pastText = textColor('light', 'white', 'neutral');
	} else if (!standsOut(palette, button.light.step, grounds)) {
		line = accent(nearestStandingStep(palette, button.light.step, grounds));
	}
	const dark = accent(button.dark.step);
	lines.push(
		['--semantics-steps-progress-color', pair(line, dark)],
		['--semantics-steps-is-past-background-color', pair(past, dark)],
		['--semantics-steps-is-past-content-color', pair(pastText, textColor('dark', button.dark.text, 'accent'))],
	);

	// The range between two selected days is a tint of the selection, so it is
	// gray in a mode where the selection is.
	const grayIn = { light: selection.light.color === 'neutral', dark: selection.dark.color === 'neutral' };
	if (grayIn.light || grayIn.dark) {
		const gray = (part) => part.replaceAll('--primitives-color-accent-', '--primitives-color-neutral-');
		for (const token of DATE_RANGE_TOKENS.filter((t) => defaults.has(t))) {
			const [light, darkPart] = splitModes(defaults.get(token));
			lines.push([token, pair(grayIn.light ? gray(light) : light, grayIn.dark ? gray(darkPart) : darkPart)]);
		}
	}

	// Every other default that reads the accent keeps what grayAccent makes of
	// it, unless a status theme lets it take the theme color.
	const written = new Set(lines.map(([token]) => token));
	for (const [token, value] of defaults) {
		if (written.has(token) || !/--primitives-color-accent-\d/.test(value)) continue;
		if (status && STATUS_IN_COLOR.has(token)) continue;
		const bent = bend(name, value, status && STATUS_TINT_IN_DARK.has(token) ? ['light'] : ['light', 'dark']);
		if (bent !== value) lines.push([token, bent]);
	}

	if (neutral) {
		// The hex, not the rounded oklch: it is the value generate-palette.py
		// matched to the step's luminance, so contrasts stay those of coolgray.
		const pattern = /--primitives-color-[a-z-]+-(\d+): .*?\/\* light: (#[0-9A-F]{6}) \| dark: (#[0-9A-F]{6})/g;
		for (const [, step, light, darkHex] of neutral.matchAll(pattern)) lines.push([`--primitives-color-neutral-${step}`, pair(light, darkHex)]);
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
