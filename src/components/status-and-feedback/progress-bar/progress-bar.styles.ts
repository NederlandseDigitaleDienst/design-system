import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const progressBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_progress-bar-height: var(--primitives-space-8);
		--_progress-bar-track-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-150));
		--_progress-bar-track-border-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-200));
		--_progress-bar-track-border-width: var(--primitives-border-width-thin);
		--_progress-bar-corner-radius: var(--primitives-corner-radius-full);
		--_progress-bar-segment-indicator-gap: var(--primitives-space-1);
		--_progress-bar-caption-gap: var(--primitives-space-6);
		--_progress-bar-text-color: var(--semantics-content-color);
		--_progress-bar-supporting-text-color: var(--semantics-content-secondary-color);
		--_progress-bar-text-font: var(--primitives-font-body-md-regular-tight);
		--_progress-bar-supporting-text-font: var(--primitives-font-body-md-regular-tight);
		--_progress-bar-indeterminate-background-color: var(--semantics-categories-accent-filled-background-color);
		--_progress-bar-indeterminate-border-color: var(--semantics-categories-accent-filled-highlight-border-color);
		--_progress-bar-indeterminate-border-width: var(--primitives-border-width-thin);
		--_progress-bar-indeterminate-bar-width: 20%;
		--_progress-bar-indeterminate-duration: 800ms;

		${inheritedTextReset}
		box-sizing: border-box;
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: var(--_progress-bar-caption-gap);
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]) { --_progress-bar-height: var(--primitives-space-4); }
	:host([size="lg"]) { --_progress-bar-height: var(--primitives-space-16); }

	:host([variant="distribution"]) {
		--_progress-bar-segment-indicator-gap: var(--primitives-space-2);
		--_progress-bar-corner-radius: var(--primitives-corner-radius-xxs);
	}


	/* ## Indeterminate fill + border color follow the variant; default is accent (blue) */

	:host([color="neutral"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-neutral-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-neutral-filled-highlight-border-color); }
	:host([color="success"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-success-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-success-filled-highlight-border-color); }
	:host([color="warning"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-warning-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-warning-filled-highlight-border-color); }
	:host([color="critical"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-critical-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-critical-filled-highlight-border-color); }
	:host([color="lintblauw"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-lintblauw-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-lintblauw-filled-highlight-border-color); }
	:host([color="donkerblauw"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-donkerblauw-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-donkerblauw-filled-highlight-border-color); }
	:host([color="hemelblauw"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-hemelblauw-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-hemelblauw-filled-highlight-border-color); }
	:host([color="lichtblauw"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-lichtblauw-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-lichtblauw-filled-highlight-border-color); }
	:host([color="paars"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-paars-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-paars-filled-highlight-border-color); }
	:host([color="violet"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-violet-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-violet-filled-highlight-border-color); }
	:host([color="robijnrood"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-robijnrood-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-robijnrood-filled-highlight-border-color); }
	:host([color="roze"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-roze-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-roze-filled-highlight-border-color); }
	:host([color="rood"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-rood-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-rood-filled-highlight-border-color); }
	:host([color="oranje"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-oranje-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-oranje-filled-highlight-border-color); }
	:host([color="donkergeel"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-donkergeel-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-donkergeel-filled-highlight-border-color); }
	:host([color="geel"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-geel-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-geel-filled-highlight-border-color); }
	:host([color="donkerbruin"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-donkerbruin-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-donkerbruin-filled-highlight-border-color); }
	:host([color="bruin"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-bruin-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-bruin-filled-highlight-border-color); }
	:host([color="donkergroen"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-donkergroen-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-donkergroen-filled-highlight-border-color); }
	:host([color="groen"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-groen-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-groen-filled-highlight-border-color); }
	:host([color="mosgroen"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-mosgroen-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-mosgroen-filled-highlight-border-color); }
	:host([color="mintgroen"]) { --_progress-bar-indeterminate-background-color: var(--semantics-categories-mintgroen-filled-background-color); --_progress-bar-indeterminate-border-color: var(--semantics-categories-mintgroen-filled-highlight-border-color); }


	/* # Caption */

	.progress-bar__caption {
		display: flex;
		gap: var(--_progress-bar-caption-gap);
		justify-content: space-between;
		align-items: baseline;
		color: var(--_progress-bar-text-color);
	}

	.progress-bar__text {
		font: var(--_progress-bar-text-font);
	}

	.progress-bar__supporting-text {
		color: var(--_progress-bar-supporting-text-color);
		font: var(--_progress-bar-supporting-text-font);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}


	/* # Track */

	.progress-bar__track {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border-radius: var(--_progress-bar-corner-radius);
		box-shadow: inset 0 0 0 var(--_progress-bar-track-border-width) var(--_progress-bar-track-border-color);
		background-color: var(--_progress-bar-track-background-color);
		width: 100%;
		height: var(--_progress-bar-height);
		overflow: hidden;
		gap: var(--_progress-bar-segment-indicator-gap);
		container-type: inline-size;
	}

	slot {
		display: contents;
	}


	/* # Indeterminate
	   Knight Rider style: track filled with a translucent variant tint,
	   a solid bar bounces left-right. ease-in-out + alternate
	   gives the typical "scanner" acceleration at the ends. */

	/* Indicator has no own bg — the track (and its inset border)
	   simply show through. Only the K.I.T.T. bar is visible.
	   On fade-out the bar fades away and track + border remain. */

	.progress-bar__indeterminate-indicator {
		position: absolute;
		inset: 0;
		opacity: 1;
		transition: opacity var(--primitives-transition-duration-slow) ease-out;
	}

	.progress-bar__indeterminate-indicator.is-fading-out {
		opacity: 0;
	}

	.progress-bar__indeterminate-indicator.is-fading-in {
		animation: progress-bar-indicator-fade-in var(--primitives-transition-duration-slow) ease-out;
	}

	@keyframes progress-bar-indicator-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* K.I.T.T. bar. translateX uses calc(100cqw - 100%): cqw is the
	   container (track) width, 100% is the bar's own width. */

	.progress-bar__indeterminate-indicator::before {
		content: '';
		position: absolute;
		inset-block: 0;
		left: 0;
		border-radius: var(--_progress-bar-corner-radius);
		background: var(--_progress-bar-indeterminate-background-color);
		box-shadow: inset 0 0 0 var(--_progress-bar-indeterminate-border-width) var(--_progress-bar-indeterminate-border-color);
		width: var(--_progress-bar-indeterminate-bar-width);
		transform: translateX(0);
		/* Duration scales with track width via the container queries below.
		   Wider tracks need longer sweeps so the perceived velocity feels
		   constant — a fast 800 ms cycle reads as frantic on a 1000 px bar
		   and as too slow on a 200 px bar at the same wall-clock time. */
		animation: progress-bar-indeterminate var(--_progress-bar-indeterminate-duration) ease-in-out infinite alternate;
	}

	@container (min-width: 401px) and (max-width: 720px) {
		.progress-bar__indeterminate-indicator::before {
			--_progress-bar-indeterminate-duration: 1000ms;
		}
	}

	@container (min-width: 721px) {
		.progress-bar__indeterminate-indicator::before {
			--_progress-bar-indeterminate-duration: 1200ms;
		}
	}

	@keyframes progress-bar-indeterminate {
		0% { transform: translateX(0); }
		100% { transform: translateX(calc(100cqw - 100%)); }
	}


	/* # Reduced Motion */

	@media (prefers-reduced-motion: reduce) {
		.progress-bar__indeterminate-indicator::before {
			display: none;
		}

		.progress-bar__indeterminate-indicator {
			animation: progress-bar-indeterminate-pulse 2s ease-in-out infinite;
		}

		@keyframes progress-bar-indeterminate-pulse {
			0%, 100% { background-color: color-mix(in srgb, var(--_progress-bar-indeterminate-background-color) 20%, transparent); }
			50% { background-color: color-mix(in srgb, var(--_progress-bar-indeterminate-background-color) 50%, transparent); }
		}
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		.progress-bar__track {
			border: 1px solid CanvasText;
		}
	}
`;


export const progressBarSegmentIndicatorStyles = css`


	/* # Host */

	:host {
		--_progress-bar-segment-indicator-width: var(--context-progress-bar-segment-indicator-width, 0%);
		--_progress-bar-segment-indicator-min-width: var(--primitives-space-2);
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-accent-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-accent-filled-highlight-border-color);
		--_progress-bar-segment-indicator-border-width: var(--primitives-border-width-thin);
		--_progress-bar-segment-indicator-corner-radius: var(--primitives-corner-radius-full);
		--_progress-bar-segment-indicator-distribution-corner-radius: var(--primitives-corner-radius-xxs);

		box-sizing: border-box;
		display: block;
		position: relative;
		box-shadow: inset 0 0 0 var(--_progress-bar-segment-indicator-border-width) var(--_progress-bar-segment-indicator-border-color);
		background-color: var(--_progress-bar-segment-indicator-background-color);
		width: var(--_progress-bar-segment-indicator-width);
		min-width: var(--_progress-bar-segment-indicator-min-width);
		height: 100%;
		overflow: hidden;
		transition: width var(--primitives-transition-duration-medium) ease-out;
	}

	:host([value="0"]),
	:host(:not([value])) {
		display: none;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Grow / shrink
	   Set by the parent (data-grow / data-shrink) on the transitions between
	   indeterminate and determinate. */

	:host([data-grow]) {
		animation: progress-bar-segment-indicator-grow var(--primitives-transition-duration-slow) ease-out;
	}

	:host([data-shrink]) {
		animation: progress-bar-segment-indicator-shrink var(--primitives-transition-duration-slow) ease-out forwards;
	}

	@keyframes progress-bar-segment-indicator-grow {
		from { width: 0%; }
		to { width: var(--_progress-bar-segment-indicator-width); }
	}

	@keyframes progress-bar-segment-indicator-shrink {
		from { width: var(--_progress-bar-segment-indicator-width); opacity: 1; }
		to { width: 0%; opacity: 0; }
	}


	/* ## Rounding per variant
	   Progress variant: every segment is its own capsule. Distribution variant:
	   segments use a small radius matching the track's outer corners.
	   data-variant is set by the parent. */

	:host([data-variant="progress"]) {
		border-radius: var(--_progress-bar-segment-indicator-corner-radius);
	}

	:host([data-variant="distribution"]) {
		border-radius: var(--_progress-bar-segment-indicator-distribution-corner-radius);
	}


	/* ## Variants — semantic */

	:host([color="neutral"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-neutral-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-neutral-filled-highlight-border-color);
	}
	:host([color="success"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-success-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-success-filled-highlight-border-color);
	}
	:host([color="warning"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-warning-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-warning-filled-highlight-border-color);
	}
	:host([color="critical"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-critical-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-critical-filled-highlight-border-color);
	}


	/* ## Variants — Rijkskleuren */
	:host([color="lintblauw"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-lintblauw-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-lintblauw-filled-highlight-border-color);
	}
	:host([color="donkerblauw"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-donkerblauw-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-donkerblauw-filled-highlight-border-color);
	}
	:host([color="hemelblauw"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-hemelblauw-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-hemelblauw-filled-highlight-border-color);
	}
	:host([color="lichtblauw"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-lichtblauw-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-lichtblauw-filled-highlight-border-color);
	}
	:host([color="paars"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-paars-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-paars-filled-highlight-border-color);
	}
	:host([color="violet"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-violet-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-violet-filled-highlight-border-color);
	}
	:host([color="robijnrood"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-robijnrood-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-robijnrood-filled-highlight-border-color);
	}
	:host([color="roze"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-roze-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-roze-filled-highlight-border-color);
	}
	:host([color="rood"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-rood-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-rood-filled-highlight-border-color);
	}
	:host([color="oranje"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-oranje-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-oranje-filled-highlight-border-color);
	}
	:host([color="donkergeel"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-donkergeel-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-donkergeel-filled-highlight-border-color);
	}
	:host([color="geel"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-geel-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-geel-filled-highlight-border-color);
	}
	:host([color="donkerbruin"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-donkerbruin-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-donkerbruin-filled-highlight-border-color);
	}
	:host([color="bruin"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-bruin-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-bruin-filled-highlight-border-color);
	}
	:host([color="donkergroen"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-donkergroen-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-donkergroen-filled-highlight-border-color);
	}
	:host([color="groen"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-groen-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-groen-filled-highlight-border-color);
	}
	:host([color="mosgroen"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-mosgroen-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-mosgroen-filled-highlight-border-color);
	}
	:host([color="mintgroen"]) {
		--_progress-bar-segment-indicator-background-color: var(--semantics-categories-mintgroen-filled-background-color);
		--_progress-bar-segment-indicator-border-color: var(--semantics-categories-mintgroen-filled-highlight-border-color);
	}


	/* # Block
	   Full-bleed inner box; carries what must not sit on :host, like the
	   forced-colors outline below. */

	.progress-bar__segment-indicator {
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}


	/* # Hover area (tooltip trigger)
	   Fills the segment; captures hover/focus for the wrapping nldd-tooltip. */

	.progress-bar__segment-indicator-tooltip-area {
		display: block;
		position: absolute;
		inset: 0;
	}


	/* # Reduced Motion */

	@media (prefers-reduced-motion: reduce) {
		:host {
			transition: none;
		}
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		:host {
			background-color: CanvasText;
		}

		/* box-shadow is stripped in forced-colors, so a real border draws the
		   segment outline. It sits on the block element instead of :host, out
		   of reach of consumer universal resets. */
		.progress-bar__segment-indicator {
			border: 1px solid CanvasText;
		}
	}
`;
