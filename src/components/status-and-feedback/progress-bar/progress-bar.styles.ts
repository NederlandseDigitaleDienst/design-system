import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const progressBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_height: var(--components-progress-bar-md-height);
		--_track-background-color: var(--components-progress-bar-track-background-color);
		--_track-border-color: var(--components-progress-bar-track-border-color);
		--_track-border-width: var(--components-progress-bar-track-border-width);
		--_corner-radius: var(--components-progress-bar-corner-radius);
		--_segment-indicator-gap: var(--components-progress-bar-progress-segment-indicator-gap);
		--_caption-gap: var(--components-progress-bar-caption-gap);
		--_text-color: var(--components-progress-bar-text-color);
		--_supporting-text-color: var(--components-progress-bar-supporting-text-color);
		--_text-font: var(--components-progress-bar-text-font);
		--_supporting-text-font: var(--components-progress-bar-supporting-text-font);
		--_indeterminate-background-color: var(--semantics-categories-accent-filled-background-color);
		--_indeterminate-border-color: var(--semantics-categories-accent-filled-highlight-border-color);
		--_indeterminate-border-width: var(--components-progress-bar-segment-indicator-border-width);
		--_indeterminate-bar-width: 20%;
		--_indeterminate-duration: 800ms;

		${inheritedTextReset}
		box-sizing: border-box;
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: var(--_caption-gap);
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]) { --_height: var(--components-progress-bar-sm-height); }
	:host([size="lg"]) { --_height: var(--components-progress-bar-lg-height); }

	:host([mode="distribution"]) {
		--_segment-indicator-gap: var(--components-progress-bar-distribution-segment-indicator-gap);
		--_corner-radius: var(--components-progress-bar-distribution-corner-radius);
	}


	/* ## Indeterminate fill + border color follow the variant; default is accent (blue) */

	:host([color="neutral"]) { --_indeterminate-background-color: var(--semantics-categories-neutral-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-neutral-filled-highlight-border-color); }
	:host([color="success"]) { --_indeterminate-background-color: var(--semantics-categories-success-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-success-filled-highlight-border-color); }
	:host([color="warning"]) { --_indeterminate-background-color: var(--semantics-categories-warning-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-warning-filled-highlight-border-color); }
	:host([color="critical"]) { --_indeterminate-background-color: var(--semantics-categories-critical-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-critical-filled-highlight-border-color); }
	:host([color="lintblauw"]) { --_indeterminate-background-color: var(--semantics-categories-lintblauw-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-lintblauw-filled-highlight-border-color); }
	:host([color="donkerblauw"]) { --_indeterminate-background-color: var(--semantics-categories-donkerblauw-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-donkerblauw-filled-highlight-border-color); }
	:host([color="hemelblauw"]) { --_indeterminate-background-color: var(--semantics-categories-hemelblauw-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-hemelblauw-filled-highlight-border-color); }
	:host([color="lichtblauw"]) { --_indeterminate-background-color: var(--semantics-categories-lichtblauw-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-lichtblauw-filled-highlight-border-color); }
	:host([color="paars"]) { --_indeterminate-background-color: var(--semantics-categories-paars-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-paars-filled-highlight-border-color); }
	:host([color="violet"]) { --_indeterminate-background-color: var(--semantics-categories-violet-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-violet-filled-highlight-border-color); }
	:host([color="robijnrood"]) { --_indeterminate-background-color: var(--semantics-categories-robijnrood-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-robijnrood-filled-highlight-border-color); }
	:host([color="roze"]) { --_indeterminate-background-color: var(--semantics-categories-roze-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-roze-filled-highlight-border-color); }
	:host([color="rood"]) { --_indeterminate-background-color: var(--semantics-categories-rood-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-rood-filled-highlight-border-color); }
	:host([color="oranje"]) { --_indeterminate-background-color: var(--semantics-categories-oranje-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-oranje-filled-highlight-border-color); }
	:host([color="donkergeel"]) { --_indeterminate-background-color: var(--semantics-categories-donkergeel-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-donkergeel-filled-highlight-border-color); }
	:host([color="geel"]) { --_indeterminate-background-color: var(--semantics-categories-geel-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-geel-filled-highlight-border-color); }
	:host([color="donkerbruin"]) { --_indeterminate-background-color: var(--semantics-categories-donkerbruin-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-donkerbruin-filled-highlight-border-color); }
	:host([color="bruin"]) { --_indeterminate-background-color: var(--semantics-categories-bruin-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-bruin-filled-highlight-border-color); }
	:host([color="donkergroen"]) { --_indeterminate-background-color: var(--semantics-categories-donkergroen-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-donkergroen-filled-highlight-border-color); }
	:host([color="groen"]) { --_indeterminate-background-color: var(--semantics-categories-groen-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-groen-filled-highlight-border-color); }
	:host([color="mosgroen"]) { --_indeterminate-background-color: var(--semantics-categories-mosgroen-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-mosgroen-filled-highlight-border-color); }
	:host([color="mintgroen"]) { --_indeterminate-background-color: var(--semantics-categories-mintgroen-filled-background-color); --_indeterminate-border-color: var(--semantics-categories-mintgroen-filled-highlight-border-color); }


	/* # Caption */

	.progress-bar__caption {
		display: flex;
		gap: var(--_caption-gap);
		justify-content: space-between;
		align-items: baseline;
		color: var(--_text-color);
	}

	.progress-bar__text {
		font: var(--_text-font);
	}

	.progress-bar__supporting-text {
		color: var(--_supporting-text-color);
		font: var(--_supporting-text-font);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}


	/* # Track */

	.progress-bar__track {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border-radius: var(--_corner-radius);
		box-shadow: inset 0 0 0 var(--_track-border-width) var(--_track-border-color);
		background-color: var(--_track-background-color);
		width: 100%;
		height: var(--_height);
		overflow: hidden;
		gap: var(--_segment-indicator-gap);
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
		border-radius: var(--_corner-radius);
		background: var(--_indeterminate-background-color);
		box-shadow: inset 0 0 0 var(--_indeterminate-border-width) var(--_indeterminate-border-color);
		width: var(--_indeterminate-bar-width);
		transform: translateX(0);
		/* Duration scales with track width via the container queries below.
		   Wider tracks need longer sweeps so the perceived velocity feels
		   constant — a fast 800 ms cycle reads as frantic on a 1000 px bar
		   and as too slow on a 200 px bar at the same wall-clock time. */
		animation: progress-bar-indeterminate var(--_indeterminate-duration) ease-in-out infinite alternate;
	}

	@container (min-width: 401px) and (max-width: 720px) {
		.progress-bar__indeterminate-indicator::before {
			--_indeterminate-duration: 1000ms;
		}
	}

	@container (min-width: 721px) {
		.progress-bar__indeterminate-indicator::before {
			--_indeterminate-duration: 1200ms;
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
			0%, 100% { background-color: color-mix(in srgb, var(--_indeterminate-background-color) 20%, transparent); }
			50% { background-color: color-mix(in srgb, var(--_indeterminate-background-color) 50%, transparent); }
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
		--_width: var(--context-progress-bar-segment-indicator-width, 0%);
		--_min-width: var(--components-progress-bar-segment-indicator-min-width);
		--_background-color: var(--semantics-categories-accent-filled-background-color);
		--_border-color: var(--semantics-categories-accent-filled-highlight-border-color);
		--_border-width: var(--components-progress-bar-segment-indicator-border-width);

		box-sizing: border-box;
		display: block;
		position: relative;
		box-shadow: inset 0 0 0 var(--_border-width) var(--_border-color);
		background-color: var(--_background-color);
		width: var(--_width);
		min-width: var(--_min-width);
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
		to { width: var(--_width); }
	}

	@keyframes progress-bar-segment-indicator-shrink {
		from { width: var(--_width); opacity: 1; }
		to { width: 0%; opacity: 0; }
	}


	/* ## Rounding per mode
	   Progress mode: every segment is its own capsule. Distribution mode:
	   segments use a small radius matching the track's outer corners.
	   data-mode is set by the parent. */

	:host([data-mode="progress"]) {
		border-radius: var(--components-progress-bar-corner-radius);
	}

	:host([data-mode="distribution"]) {
		border-radius: var(--components-progress-bar-distribution-corner-radius);
	}


	/* ## Variants — semantic */

	:host([color="neutral"]) {
		--_background-color: var(--semantics-categories-neutral-filled-background-color);
		--_border-color: var(--semantics-categories-neutral-filled-highlight-border-color);
	}
	:host([color="success"]) {
		--_background-color: var(--semantics-categories-success-filled-background-color);
		--_border-color: var(--semantics-categories-success-filled-highlight-border-color);
	}
	:host([color="warning"]) {
		--_background-color: var(--semantics-categories-warning-filled-background-color);
		--_border-color: var(--semantics-categories-warning-filled-highlight-border-color);
	}
	:host([color="critical"]) {
		--_background-color: var(--semantics-categories-critical-filled-background-color);
		--_border-color: var(--semantics-categories-critical-filled-highlight-border-color);
	}


	/* ## Variants — Rijkskleuren */
	:host([color="lintblauw"]) {
		--_background-color: var(--semantics-categories-lintblauw-filled-background-color);
		--_border-color: var(--semantics-categories-lintblauw-filled-highlight-border-color);
	}
	:host([color="donkerblauw"]) {
		--_background-color: var(--semantics-categories-donkerblauw-filled-background-color);
		--_border-color: var(--semantics-categories-donkerblauw-filled-highlight-border-color);
	}
	:host([color="hemelblauw"]) {
		--_background-color: var(--semantics-categories-hemelblauw-filled-background-color);
		--_border-color: var(--semantics-categories-hemelblauw-filled-highlight-border-color);
	}
	:host([color="lichtblauw"]) {
		--_background-color: var(--semantics-categories-lichtblauw-filled-background-color);
		--_border-color: var(--semantics-categories-lichtblauw-filled-highlight-border-color);
	}
	:host([color="paars"]) {
		--_background-color: var(--semantics-categories-paars-filled-background-color);
		--_border-color: var(--semantics-categories-paars-filled-highlight-border-color);
	}
	:host([color="violet"]) {
		--_background-color: var(--semantics-categories-violet-filled-background-color);
		--_border-color: var(--semantics-categories-violet-filled-highlight-border-color);
	}
	:host([color="robijnrood"]) {
		--_background-color: var(--semantics-categories-robijnrood-filled-background-color);
		--_border-color: var(--semantics-categories-robijnrood-filled-highlight-border-color);
	}
	:host([color="roze"]) {
		--_background-color: var(--semantics-categories-roze-filled-background-color);
		--_border-color: var(--semantics-categories-roze-filled-highlight-border-color);
	}
	:host([color="rood"]) {
		--_background-color: var(--semantics-categories-rood-filled-background-color);
		--_border-color: var(--semantics-categories-rood-filled-highlight-border-color);
	}
	:host([color="oranje"]) {
		--_background-color: var(--semantics-categories-oranje-filled-background-color);
		--_border-color: var(--semantics-categories-oranje-filled-highlight-border-color);
	}
	:host([color="donkergeel"]) {
		--_background-color: var(--semantics-categories-donkergeel-filled-background-color);
		--_border-color: var(--semantics-categories-donkergeel-filled-highlight-border-color);
	}
	:host([color="geel"]) {
		--_background-color: var(--semantics-categories-geel-filled-background-color);
		--_border-color: var(--semantics-categories-geel-filled-highlight-border-color);
	}
	:host([color="donkerbruin"]) {
		--_background-color: var(--semantics-categories-donkerbruin-filled-background-color);
		--_border-color: var(--semantics-categories-donkerbruin-filled-highlight-border-color);
	}
	:host([color="bruin"]) {
		--_background-color: var(--semantics-categories-bruin-filled-background-color);
		--_border-color: var(--semantics-categories-bruin-filled-highlight-border-color);
	}
	:host([color="donkergroen"]) {
		--_background-color: var(--semantics-categories-donkergroen-filled-background-color);
		--_border-color: var(--semantics-categories-donkergroen-filled-highlight-border-color);
	}
	:host([color="groen"]) {
		--_background-color: var(--semantics-categories-groen-filled-background-color);
		--_border-color: var(--semantics-categories-groen-filled-highlight-border-color);
	}
	:host([color="mosgroen"]) {
		--_background-color: var(--semantics-categories-mosgroen-filled-background-color);
		--_border-color: var(--semantics-categories-mosgroen-filled-highlight-border-color);
	}
	:host([color="mintgroen"]) {
		--_background-color: var(--semantics-categories-mintgroen-filled-background-color);
		--_border-color: var(--semantics-categories-mintgroen-filled-highlight-border-color);
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
