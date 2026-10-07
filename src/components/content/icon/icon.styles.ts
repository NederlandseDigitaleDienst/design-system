import { css } from 'lit';

export const iconStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host
	 *
	 * Default size = fill the container. Setting [size] pins a fixed spacer
	 * value; the keyword full names the default and inherit follows the
	 * surrounding text. [color] picks a semantic color or a rijkskleur. */

	:host {
		--_icon-size: 100%;
		--_icon-color: inherit;
		--_icon-custom-color: inherit;
		--_icon-glyph-scale: 1;

		display: inline-flex;
		width: var(--_icon-size);
		align-items: center;
		color: var(--_icon-color);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Size */

	:host([size="full"]) { --_icon-size: 100%; }
	/* An inline-flex box sits with its bottom edge on the baseline; the nudge
	   drops it back onto the line, with the text that hangs below it. */
	:host([size="inherit"]) {
		--_icon-size: 1em;

		vertical-align: -0.15em;
	}

	:host([size="16"]) { --_icon-size: var(--primitives-space-16); }
	:host([size="20"]) { --_icon-size: var(--primitives-space-20); }
	:host([size="24"]) { --_icon-size: var(--primitives-space-24); }
	:host([size="28"]) { --_icon-size: var(--primitives-space-28); }
	:host([size="32"]) { --_icon-size: var(--primitives-space-32); }
	:host([size="40"]) { --_icon-size: var(--primitives-space-40); }
	:host([size="44"]) { --_icon-size: var(--primitives-space-44); }
	:host([size="48"]) { --_icon-size: var(--primitives-space-48); }
	:host([size="56"]) { --_icon-size: var(--primitives-space-56); }
	:host([size="64"]) { --_icon-size: var(--primitives-space-64); }
	:host([size="80"]) { --_icon-size: var(--primitives-space-80); }
	:host([size="96"]) { --_icon-size: var(--primitives-space-96); }


	/* # Color — functional */

	:host([color="primary-content"])   { --_icon-color: var(--semantics-content-color); }
	:host([color="secondary-content"]) { --_icon-color: var(--semantics-content-secondary-color); }
	:host([color="accent"])            { --_icon-color: var(--semantics-content-accent-color); }
	:host([color="critical"])          { --_icon-color: var(--semantics-content-critical-color); }
	:host([color="warning"])           { --_icon-color: var(--semantics-content-warning-color); }
	:host([color="success"])           { --_icon-color: var(--semantics-content-success-color); }


	/* # Color — rijkskleuren */

	:host([color="lintblauw"])   { --_icon-color: light-dark(var(--primitives-color-lintblauw-750), var(--primitives-color-lintblauw-500)); }
	:host([color="donkerblauw"]) { --_icon-color: light-dark(var(--primitives-color-donkerblauw-600), var(--primitives-color-donkerblauw-500)); }
	:host([color="hemelblauw"])  { --_icon-color: var(--primitives-color-hemelblauw-500); }
	:host([color="lichtblauw"])  { --_icon-color: light-dark(var(--primitives-color-lichtblauw-450), var(--primitives-color-lichtblauw-800)); }
	:host([color="paars"])       { --_icon-color: light-dark(var(--primitives-color-paars-850), var(--primitives-color-paars-500)); }
	:host([color="violet"])      { --_icon-color: light-dark(var(--primitives-color-violet-650), var(--primitives-color-violet-500)); }
	:host([color="robijnrood"])  { --_icon-color: light-dark(var(--primitives-color-robijnrood-550), var(--primitives-color-robijnrood-500)); }
	:host([color="roze"])        { --_icon-color: light-dark(var(--primitives-color-roze-450), var(--primitives-color-roze-750)); }
	:host([color="rood"])        { --_icon-color: light-dark(var(--primitives-color-rood-550), var(--primitives-color-rood-500)); }
	:host([color="oranje"])      { --_icon-color: light-dark(var(--primitives-color-oranje-450), var(--primitives-color-oranje-600)); }
	:host([color="donkergeel"])  { --_icon-color: light-dark(var(--primitives-color-donkergeel-450), var(--primitives-color-donkergeel-800)); }
	:host([color="geel"])        { --_icon-color: light-dark(var(--primitives-color-geel-450), var(--primitives-color-geel-900)); }
	:host([color="donkerbruin"]) { --_icon-color: light-dark(var(--primitives-color-donkerbruin-750), var(--primitives-color-donkerbruin-500)); }
	:host([color="bruin"])       { --_icon-color: var(--primitives-color-bruin-500); }
	:host([color="donkergroen"]) { --_icon-color: light-dark(var(--primitives-color-donkergroen-700), var(--primitives-color-donkergroen-500)); }
	:host([color="groen"])       { --_icon-color: var(--primitives-color-groen-500); }
	:host([color="mosgroen"])    { --_icon-color: var(--primitives-color-mosgroen-500); }
	:host([color="mintgroen"])   { --_icon-color: light-dark(var(--primitives-color-mintgroen-450), var(--primitives-color-mintgroen-800)); }


	/* # Custom color — after every [color] rule, so it wins over one */

	:host([custom-color]) {
		--_icon-color: var(--_icon-custom-color);
	}


	/* # Elements */

	svg {
		display: block;
		width: calc(100% * var(--_icon-glyph-scale));
	}


	/* # Box
	 *
	 * The colour question turns around: [color] and [custom-color] paint the
	 * box, and the glyph takes whatever contrasts with it. That flip is the
	 * reason this is a component option and not a box a consumer builds; the
	 * pair is the part a consumer cannot check by eye.
	 *
	 * [size] measures the box, so the same size renders a smaller glyph with
	 * [box] than without. Four fifths of the box, and a radius of a fifth,
	 * both written as a ratio so a change lands everywhere at once. */

	:host([box]) {
		--_icon-glyph-scale: calc(4 / 5);

		border-radius: calc(var(--_icon-size) / 5);
		background-color: currentColor;
		aspect-ratio: 1;
		justify-content: center;
	}

	/* Resolved against the host's currentColor, which the rule above painted the
	   box with, and only then assigned to the glyph. Same route as nldd-badge. */
	:host([box]) svg {
		color: var(--semantics-content-contrast-color);
	}
`;
