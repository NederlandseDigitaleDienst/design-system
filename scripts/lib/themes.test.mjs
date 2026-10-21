import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
	areaSteps,
	areaTokens,
	buttonContrasts,
	buttonSteps,
	buttonTokens,
	focusRingSteps,
	focusRingTokens,
	badgeTokens,
	tabBarTokens,
	statusBarTokens,
	contrast,
	luminance,
	NEAR_BLACK_INTERACTION,
	NEAR_BLACK_STEPS,
	DARK_LINK_STEPS,
	LIGHT_LINK_IN_COLOR,
	ACCENT_TEXT_IN_COLOR,
	NEAR_WHITE_STEPS,
	parsePalettes,
	selectedSteps,
	selectionSteps,
	listHighlightSteps,
	selectionTokens,
	STATUS_DARK_SELECTION,
	STATUS_SELECTION_IN_COLOR,
	STATUS_THEMES,
	selectionGrounds,
	textOn,
	themeColors,
	themeCss,
} from './themes.js';

const css = readFileSync(new URL('../../src/assets/styles/colors.generated.css', import.meta.url), 'utf8');
const references = JSON.parse(readFileSync(new URL('../reference-colors.json', import.meta.url), 'utf8'));
const palettes = parsePalettes(css);
const themes = themeColors(references);

const neutral = palettes.get('coolgray');
const surfaces = {
	light: { base: neutral.get(0).light, tinted: neutral.get(25).light },
	dark: { base: neutral.get(100).dark, tinted: neutral.get(75).dark },
};
const onSurfaces = (hex, mode) => Math.min(contrast(hex, surfaces[mode].base), contrast(hex, surfaces[mode].tinted));

// The interaction accent: the steps variables.css uses for links and accent
// text. A theme only swaps the scale, so these must hold for every theme color.
const interaction = [
	{ role: 'link', light: 600, dark: 650, min: 4.5 },
	{ role: 'accent text', light: 750, dark: 650, min: 4.5 },
	{ role: 'link hover', light: 650, dark: 700, min: 4.5 },
];

// A selected fill (a checked checkbox, the highlighted menu item) sits on the
// base or tinted surface, or on a selected list-item row, hovered or not.
const grounds = selectionGrounds(neutral);

// The selected fill and its states must reach 3:1 on every ground, with
// 4.5:1 for --primitives-color-neutral-0 on it (white in light, black in dark).
const assertSelectedFill = (palette, mode, steps) => {
	for (const step of steps) {
		const fill = palette.get(step)[mode];
		for (const ground of grounds.selected[mode]) assert.ok(contrast(fill, ground) >= 3, `${mode} ${step} on ${ground}: ${contrast(fill, ground).toFixed(2)}`);
		assert.ok(contrast(fill, neutral.get(0)[mode]) >= 4.5, `${mode} ${step} text`);
	}
};

// A selected fill stands out 3:1 from the page and carries 4.5:1 text. On a
// selected list-item row the controls take the content color instead.
const assertSelection = (palette, steps) => {
	for (const mode of ['light', 'dark']) {
		const m = steps[mode];
		const scale = m.color === 'neutral' ? neutral : palette;
		const fill = scale.get(m.step)[mode];
		for (const ground of grounds.page[mode]) assert.ok(contrast(fill, ground) >= 3, `${mode} on ${ground}: ${contrast(fill, ground).toFixed(2)}`);
		const text = m.text === 'white' ? '#FFFFFF' : '#000000';
		for (const offset of [0, 50, 100]) assert.ok(contrast(scale.get(m.at(offset))[mode], text) >= 4.5, `${mode} +${offset} text`);
		// The mark (check, radio ring, switch thumb): white, or the base color in dark mode.
		const mark = m.text === 'white' ? (mode === 'light' ? neutral.get(0).light : neutral.get(1000).dark) : mode === 'dark' ? neutral.get(100).dark : neutral.get(1000).light;
		for (const offset of [0, 50, 100]) assert.ok(contrast(scale.get(m.at(offset))[mode], mark) >= 3, `${mode} +${offset} mark`);
	}
};

test('the default selection in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	const steps = selectionSteps(palettes.get('lintblauw'), '#154273', grounds, 'lintblauw');
	assertSelection(palettes.get('lintblauw'), steps);
	for (const [prop, value] of selectionTokens(steps)) assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
});

// A theme's gray, read back from its generated stylesheet.
const themeNeutral = (name) => {
	const rule = readFileSync(new URL(`../../src/assets/styles/themes/${name}.css`, import.meta.url), 'utf8');
	const scale = new Map();
	const pattern = /--primitives-color-neutral-(\d+): (?:light-dark\((#[0-9A-F]{6}), (#[0-9A-F]{6})\)|(#[0-9A-F]{6}))/g;
	for (const [, step, light, dark, both] of rule.matchAll(pattern)) {
		scale.set(Number(step), { light: light ?? both, dark: dark ?? both });
	}
	return scale;
};

test('every reference color but the neutral and the default becomes a theme', () => {
	const names = themes.map((t) => t.name);
	assert.ok(!names.includes('coolgray'));
	assert.ok(!names.includes('lintblauw'));
	assert.equal(names.length, references.length - 2);
});

for (const { name, hex } of themes) {
	const palette = palettes.get(name);

	test(`${name}: the interaction accent keeps its contrast`, () => {
		for (const { role, light, dark, min } of interaction) {
			assert.ok(onSurfaces(palette.get(light).light, 'light') >= min, `${role} in light`);
			assert.ok(onSurfaces(palette.get(dark).dark, 'dark') >= min, `${role} in dark`);
		}
	});

	if (STATUS_THEMES.includes(name) && !STATUS_SELECTION_IN_COLOR.includes(name)) {
		test(`${name}: the gray selection reaches 3:1 on every ground, with 4.5:1 text`, () => {
			assertSelectedFill(neutral, 'light', [750, 800, 850].map((step) => NEAR_BLACK_STEPS.get(step)));
			assertSelectedFill(neutral, 'dark', [0, 50, 100].map(STATUS_DARK_SELECTION.at));
		});
	} else {
		test(`${name}: the selection is the button, or near-black where a light button does not stand out`, () => {
			const steps = selectionSteps(palette, hex, grounds, name);
			const button = buttonSteps(palette, hex, grounds, name);
			assert.equal(steps.dark.step, button.dark.step);
			if (steps.light.color !== 'neutral') assert.equal(steps.light.step, button.light.step);
			assertSelection(palette, steps);
		});
	}

	test(`${name}: text on the accent area reaches 4.5:1`, () => {
		const area = areaSteps(palette, hex);
		for (const mode of ['light', 'dark']) {
			const text = area[mode].text === 'white' ? '#FFFFFF' : '#000000';
			assert.ok(contrast(palette.get(area[mode].step)[mode], text) >= 4.5, mode);
		}
	});

	test(`${name}: in dark mode the button stands out 3:1 from the page`, () => {
		const fill = palette.get(buttonSteps(palette, hex, grounds, name).dark.step).dark;
		for (const ground of grounds.page.dark) assert.ok(contrast(fill, ground) >= 3, ground);
	});

	test(`${name}: the highlighted row of a list or menu reaches 3:1 on the page, with 4.5:1 text`, () => {
		const steps = listHighlightSteps(palette, hex, grounds, name);
		for (const mode of ['light', 'dark']) {
			const m = steps[mode];
			const scale = m.color === 'neutral' ? neutral : palette;
			const fill = scale.get(m.step)[mode];
			for (const ground of grounds.page[mode]) assert.ok(contrast(fill, ground) >= 3, `${mode} on ${ground}: ${contrast(fill, ground).toFixed(2)}`);
			const text = m.text === 'white' ? '#FFFFFF' : '#000000';
			for (const offset of [0, 50, 100]) assert.ok(contrast(scale.get(m.at(offset))[mode], text) >= 4.5, `${mode} +${offset} text`);
		}
	});

	if (ACCENT_TEXT_IN_COLOR.has(name)) {
		test(`${name}: accent text in the theme color reaches 4.5:1 on the page`, () => {
			const modes = ACCENT_TEXT_IN_COLOR.get(name);
			for (const [mode, steps] of [['light', [600, 650, 700]], ['dark', [650, 700, 750]]].filter(([mode]) => modes[mode])) {
				for (const step of steps) for (const ground of grounds.page[mode]) assert.ok(contrast(palette.get(step)[mode], ground) >= 4.5, `${mode} ${step}`);
			}
		});
	}

	test(`${name}: the focus ring reaches 4.5:1 against the base surface of its halo`, () => {
		const steps = focusRingSteps(palette, hex, grounds, name);
		assert.ok(contrast(palette.get(steps.light.step).light, surfaces.light.base) >= 4.5, 'light');
		assert.ok(contrast(palette.get(steps.dark.step).dark, surfaces.dark.base) >= 4.5, 'dark');
	});

	test(`${name}: the border of the button stands out more from the page than its fill`, () => {
		const steps = buttonSteps(palette, hex, grounds, name);
		for (const mode of ['light', 'dark']) {
			const m = steps[mode];
			const page = grounds.page[mode][0];
			for (const offset of [0, 50, 100]) {
				const fill = palette.get(m.at(offset))[mode];
				const border = palette.get(Math.min(1000, m.at(offset) + 50))[mode];
				assert.ok(contrast(border, page) >= contrast(fill, page), `${mode} +${offset}: border ${contrast(border, page).toFixed(2)}, fill ${contrast(fill, page).toFixed(2)}`);
			}
		}
	});

	test(`${name}: button text reaches 4.5:1 in every state`, () => {
		for (const { mode, offset, role, ratio } of buttonContrasts(palette, buttonSteps(palette, hex, grounds, name))) {
			assert.ok(ratio >= 4.5, `${role} ${mode} +${offset}: ${ratio.toFixed(2)}`);
		}
	});

	test(`${name}: every pair of gray steps that passes with coolgray passes with the tinted gray`, () => {
		const gray = themeNeutral(name);
		assert.equal(gray.size, neutral.size);
		for (const mode of ['light', 'dark']) {
			for (const a of neutral.keys()) {
				for (const b of neutral.keys()) {
					const before = contrast(neutral.get(a)[mode], neutral.get(b)[mode]);
					const after = contrast(gray.get(a)[mode], gray.get(b)[mode]);
					for (const min of [3, 4.5]) {
						if (before >= min) assert.ok(after >= min, `${mode} ${a}/${b}: ${before.toFixed(2)} → ${after.toFixed(2)}`);
					}
				}
			}
		}
	});

	if (NEAR_BLACK_INTERACTION.includes(name)) {
		test(`${name}: every near-black step is darker than the accent step it replaces`, () => {
			const gray = themeNeutral(name);
			for (const [step, replacement] of NEAR_BLACK_STEPS) {
				assert.ok(luminance(gray.get(replacement).light) <= luminance(palette.get(step).light), `${step} → ${replacement}`);
			}
		});

		test(`${name}: links are lintblauw in light mode (red stays red), and reach 4.5:1 in dark mode`, () => {
			const lightLink = LIGHT_LINK_IN_COLOR.includes(name) ? name : 'lintblauw';
			assert.match(themeCss(name, palette, hex, { grounds }), new RegExp(`--semantics-links-color: (light-dark\\()?var\\(--primitives-color-${lightLink}-600\\)`));
			if (LIGHT_LINK_IN_COLOR.includes(name)) {
				for (const step of [600, 650, 700]) for (const ground of grounds.page.light) assert.ok(contrast(palette.get(step).light, ground) >= 4.5, `light ${step}`);
			}
			if (DARK_LINK_STEPS.has(name)) {
				const step = DARK_LINK_STEPS.get(name);
				for (const offset of [0, 50, 100]) {
					const link = palette.get(Math.min(1000, step + offset)).dark;
					for (const ground of grounds.page.dark) assert.ok(contrast(link, ground) >= 4.5, `+${offset} on ${ground}`);
				}
			}
		});
	}

	if (STATUS_THEMES.includes(name)) {
		test(`${name}: every near-white step is lighter than the gray step it replaces in dark mode`, () => {
			const gray = themeNeutral(name);
			for (const [step, replacement] of NEAR_WHITE_STEPS) {
				assert.ok(luminance(gray.get(replacement).dark) >= luminance(gray.get(step).dark), `${step} → ${replacement}`);
			}
		});

		test(`${name}: only the button, the hero, the badge, the status bar, the current tab, the focus ring and the category keep the theme color`, () => {
			const rule = themeCss(name, palette, hex, { grounds });
			const ownColor = [...rule.matchAll(new RegExp(`^\\t(--[\\w-]+): .*--(?:primitives-color|semantics-categories)-${name}-`, 'gm'))].map((m) => m[1]);
			assert.ok(ownColor.length > 0);
			for (const prop of ownColor) {
				const kept = ['--semantics-buttons-accent-filled-', '--semantics-surfaces-accent-filled-', '--semantics-content-on-accent-filled-', '--semantics-categories-accent-', '--components-badge-accent-', '--components-tab-bar-is-current-', '--components-status-bar-accent-', '--semantics-list-items-is-highlighted-', '--semantics-focus-ring-', ...(DARK_LINK_STEPS.has(name) ? ['--semantics-links-'] : []), ...(ACCENT_TEXT_IN_COLOR.has(name) ? ['--semantics-content-accent-color', '--semantics-buttons-accent-transparent-'] : []), ...(STATUS_SELECTION_IN_COLOR.includes(name) ? ['--semantics-controls-is-selected-', '--semantics-buttons-neutral-', '--semantics-list-items-is-highlighted-'] : [])];
				assert.ok(kept.some((prefix) => prop.startsWith(prefix)), prop);
			}
			assert.match(rule, new RegExp(`--semantics-categories-accent-tinted-background-color: var\\(--semantics-categories-${name}-`));
		});
	}

	test(`${name}: the stylesheet scopes everything to its attribute`, () => {
		const rule = themeCss(name, palette, hex, { grounds });
		assert.match(rule, new RegExp(`^:root\\[data-nldd-theme="${name}"\\] \\{`));
		assert.equal(rule.match(/--primitives-color-accent-\d+:/g).length, palette.size);
		assert.equal(rule.match(/--semantics-categories-accent-/g).length, 8);
	});
}

test('the default button in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	for (const [prop, value] of buttonTokens(buttonSteps(palettes.get('lintblauw'), '#154273', grounds, 'lintblauw'))) {
		assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
	}
});

test('the default focus ring in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	for (const [prop, value] of focusRingTokens(focusRingSteps(palettes.get('lintblauw'), '#154273', grounds, 'lintblauw'))) {
		assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
	}
});

test('the default accent area in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	for (const [prop, value] of areaTokens(areaSteps(palettes.get('lintblauw'), '#154273'))) {
		assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
	}
});

test('the default accent badge in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	for (const [prop, value] of badgeTokens(buttonSteps(palettes.get('lintblauw'), '#154273', grounds, 'lintblauw'))) {
		assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
	}
});

test('the default current tab in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	for (const [prop, value] of tabBarTokens(selectionSteps(palettes.get('lintblauw'), '#154273', grounds, 'lintblauw'))) {
		assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
	}
});

test('the default accent status bar in variables.css follows the same rule as a theme', () => {
	const variables = readFileSync(new URL('../../src/assets/styles/variables.css', import.meta.url), 'utf8');
	for (const [prop, value] of statusBarTokens(buttonSteps(palettes.get('lintblauw'), '#154273', grounds, 'lintblauw'))) {
		assert.ok(variables.includes(`\t${prop}: ${value};`), prop);
	}
});

test('text on a color is white whenever white reaches 4.5:1', () => {
	assert.equal(textOn('#007AC5'), 'white');
	assert.equal(textOn('#FFFFFF'), 'black');
});

test('a light color keeps a light button in dark mode', () => {
	const steps = buttonSteps(palettes.get('geel'), '#F9E11E', grounds);
	assert.equal(steps.light.text, 'black');
	assert.equal(steps.dark.text, 'black');
	assert.ok(steps.dark.step > 500, 'the mirrored dark scale is light above 500');
});
