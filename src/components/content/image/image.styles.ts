import { css } from 'lit';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const imageStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_corner-radius: var(--primitives-corner-radius-none);
		--_background-color: light-dark(var(--primitives-color-neutral-75), var(--primitives-color-neutral-50));
		--_caption-gap: var(--primitives-space-4);
		--_caption-color: var(--semantics-content-color);
		--_caption-font: var(--primitives-font-body-sm-regular-tight);
		--_credit-color: var(--semantics-content-secondary-color);
		--_credit-font: var(--primitives-font-body-sm-regular-tight);
		--_error-text-color: var(--semantics-content-color);
		--_error-font: var(--primitives-font-body-sm-regular-snug);
		--_error-padding: var(--primitives-space-8);
		--_error-gap: var(--primitives-space-2);
		--_caption-row-gap: var(--primitives-space-8);
		--_object-fit: cover;
		--_object-position: center;
		--_max-width: 100%;

		${inheritedTextReset}
		box-sizing: border-box;
		display: block;
		max-width: var(--_max-width);
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Object-fit variants
	   Driven by the reflected attribute so we can also style slotted img/picture
	   via ::slotted() with the same CSS var. */

	:host([object-fit="contain"]) { --_object-fit: contain; }
	:host([object-fit="fill"]) { --_object-fit: fill; }
	:host([object-fit="scale-down"]) { --_object-fit: scale-down; }
	:host([object-fit="none"]) { --_object-fit: none; }


	/* ## Object-position variants */

	:host([object-position="top"]) { --_object-position: top; }
	:host([object-position="bottom"]) { --_object-position: bottom; }
	:host([object-position="left"]) { --_object-position: left; }
	:host([object-position="right"]) { --_object-position: right; }


	/* ## Shape variants */

	:host([shape="rounded"]) { --_corner-radius: var(--semantics-controls-md-corner-radius); }
	:host([shape="circle"]) { --_corner-radius: 50%; }


	/* # Figure
	   Only rendered when caption or credit is present. Acts as the layout
	   wrapper holding image + figcaption with a small gap. */

	.image__figure {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		margin: 0;
		gap: var(--_caption-gap);
	}


	/* # Media wrapper
	   The box that constrains the image. aspect-ratio is set as an inline style
	   from the component when provided, so we don't need a CSS var. The media is
	   transparent by default; an LQIP paints it while loading, and the error
	   state paints it gray (see "Error state" below). */

	.image__media {
		display: block;
		position: relative;
		overflow: hidden;
		max-width: 100%;
		border-radius: var(--_corner-radius);
	}


	/* # Image element
	   Both the internal img and any slotted img get the same styling so the
	   wrapper behaves identically in both cases. ::slotted() can't reach
	   descendants, so a slotted <picture> works for source switching but
	   consumers must put any extra styling on the inner <img> themselves —
	   object-fit / object-position aren't inheritable into <picture>'s child
	   <img>, so we don't bother targeting <picture> here. */

	.image__img {
		display: block;
		width: 100%;
		height: 100%;
		max-width: 100%;
		object-fit: var(--_object-fit);
		object-position: var(--_object-position);
	}

	::slotted(img) {
		${slottedReset}
		display: block !important;
		width: 100% !important;
		height: 100% !important;
		max-width: 100% !important;
		object-fit: var(--_object-fit) !important;
		object-position: var(--_object-position) !important;
	}

	/* An inline <svg> is a drawing rather than a file, and it arrives through the
	   same slot. It sizes like <picture>: width and height apply to it, object-fit
	   does not, so its own viewBox does the fitting. */
	::slotted(svg) {
		${slottedReset}
		display: block !important;
		width: 100% !important;
		height: 100% !important;
		max-width: 100% !important;
	}

	/* <picture> is a wrapper that picks the right <source>; layout properties
	   like width/height DO apply to it directly even though object-fit doesn't.
	   Size it so the slotted picture fills the media wrapper, then let the
	   consumer style the inner <img> for fit/position. */
	::slotted(picture) {
		${slottedReset}
		display: block !important;
		width: 100% !important;
		height: 100% !important;
		max-width: 100% !important;
	}


	/* # LQIP placeholder
	   Per-cell Oklab LQIP — extends Lean Rada's CSS-only LQIP technique
	   (https://leanrada.com/notes/css-only-lqip/) with one quantized
	   color per cell instead of grayscale-only cells. The component
	   parses lqip="base,c1,c2,c3,c4,c5,c6" and forwards each byte as an
	   inline --context-lqip-* variable (crosses the shadow boundary;
	   hence the --context-* prefix, not --_).
	   Each byte packs 2 bits L + 3 bits a + 3 bits b — the same format
	   Lean uses for his single base color, applied 7 times. The base
	   shows through cell-gradient transparent edges; the six cells carry
	   the per-zone hue. No blend modes are needed because every cell
	   already has its own real color — overlap zones blend naturally
	   through the smooth alpha falloff (stop10/20/30/40).
	   Browser support: depends on CSS mod() (Chrome 113+, Safari 15.4+,
	   Firefox 118+, May 2023 baseline), CSS round(down, ...) (Chrome 111+,
	   Safari 15.4+, Firefox 118+), oklab() (Chrome 111+, Safari 15.4+,
	   Firefox 113+), and the relative-color syntax rgb(from … r g b / α)
	   used in the gradient stops (Chrome 119+, Safari 16.4+, Firefox 128+,
	   mid-2024 baseline). The @supports gate probes all three of the
	   youngest-per-engine capabilities — without the relative-color probe,
	   Firefox 113-127 would pass the gate but render transparent/black
	   stops because rgb(from …) wouldn't parse. Older engines drop the
	   LQIP gradient entirely and fall through to the neutral
	   --_background-color set on .image__media. Degraded but harmless:
	   the placeholder is a "nice to have", not a load-bearing element. */

	@supports (left: mod(1px, 1px)) and (background: oklab(0 0 0)) and (color: rgb(from red r g b)) {

	.image__media--lqip {
		--_lqip-base-ll: mod(round(down, var(--context-lqip-base) / 64), 4);
		--_lqip-base-aaa: mod(round(down, var(--context-lqip-base) / 8), 8);
		--_lqip-base-bbb: mod(var(--context-lqip-base), 8);
		--_lqip-c1-ll: mod(round(down, var(--context-lqip-c1) / 64), 4);
		--_lqip-c1-aaa: mod(round(down, var(--context-lqip-c1) / 8), 8);
		--_lqip-c1-bbb: mod(var(--context-lqip-c1), 8);
		--_lqip-c2-ll: mod(round(down, var(--context-lqip-c2) / 64), 4);
		--_lqip-c2-aaa: mod(round(down, var(--context-lqip-c2) / 8), 8);
		--_lqip-c2-bbb: mod(var(--context-lqip-c2), 8);
		--_lqip-c3-ll: mod(round(down, var(--context-lqip-c3) / 64), 4);
		--_lqip-c3-aaa: mod(round(down, var(--context-lqip-c3) / 8), 8);
		--_lqip-c3-bbb: mod(var(--context-lqip-c3), 8);
		--_lqip-c4-ll: mod(round(down, var(--context-lqip-c4) / 64), 4);
		--_lqip-c4-aaa: mod(round(down, var(--context-lqip-c4) / 8), 8);
		--_lqip-c4-bbb: mod(var(--context-lqip-c4), 8);
		--_lqip-c5-ll: mod(round(down, var(--context-lqip-c5) / 64), 4);
		--_lqip-c5-aaa: mod(round(down, var(--context-lqip-c5) / 8), 8);
		--_lqip-c5-bbb: mod(var(--context-lqip-c5), 8);
		--_lqip-c6-ll: mod(round(down, var(--context-lqip-c6) / 64), 4);
		--_lqip-c6-aaa: mod(round(down, var(--context-lqip-c6) / 8), 8);
		--_lqip-c6-bbb: mod(var(--context-lqip-c6), 8);

		--_lqip-base-clr: oklab(
			calc(var(--_lqip-base-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-base-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-base-bbb) + 1) / 8 * 0.7 - 0.35)
		);
		--_lqip-c1-clr: oklab(
			calc(var(--_lqip-c1-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-c1-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-c1-bbb) + 1) / 8 * 0.7 - 0.35)
		);
		--_lqip-c2-clr: oklab(
			calc(var(--_lqip-c2-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-c2-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-c2-bbb) + 1) / 8 * 0.7 - 0.35)
		);
		--_lqip-c3-clr: oklab(
			calc(var(--_lqip-c3-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-c3-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-c3-bbb) + 1) / 8 * 0.7 - 0.35)
		);
		--_lqip-c4-clr: oklab(
			calc(var(--_lqip-c4-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-c4-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-c4-bbb) + 1) / 8 * 0.7 - 0.35)
		);
		--_lqip-c5-clr: oklab(
			calc(var(--_lqip-c5-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-c5-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-c5-bbb) + 1) / 8 * 0.7 - 0.35)
		);
		--_lqip-c6-clr: oklab(
			calc(var(--_lqip-c6-ll) / 3 * 0.6 + 0.2)
			calc(var(--_lqip-c6-aaa) / 8 * 0.7 - 0.35)
			calc((var(--_lqip-c6-bbb) + 1) / 8 * 0.7 - 0.35)
		);

		--_lqip-stop10: 2%;
		--_lqip-stop20: 8%;
		--_lqip-stop30: 18%;
		--_lqip-stop40: 32%;

		background-color: transparent;
		background-image:
			radial-gradient(50% 75% at 16.67% 25%,
				var(--_lqip-c1-clr),
				rgb(from var(--_lqip-c1-clr) r g b / calc(100% - var(--_lqip-stop10))) 10%,
				rgb(from var(--_lqip-c1-clr) r g b / calc(100% - var(--_lqip-stop20))) 20%,
				rgb(from var(--_lqip-c1-clr) r g b / calc(100% - var(--_lqip-stop30))) 30%,
				rgb(from var(--_lqip-c1-clr) r g b / calc(100% - var(--_lqip-stop40))) 40%,
				rgb(from var(--_lqip-c1-clr) r g b / var(--_lqip-stop40)) 60%,
				rgb(from var(--_lqip-c1-clr) r g b / var(--_lqip-stop30)) 70%,
				rgb(from var(--_lqip-c1-clr) r g b / var(--_lqip-stop20)) 80%,
				rgb(from var(--_lqip-c1-clr) r g b / var(--_lqip-stop10)) 90%,
				transparent),
			radial-gradient(50% 75% at 50% 25%,
				var(--_lqip-c2-clr),
				rgb(from var(--_lqip-c2-clr) r g b / calc(100% - var(--_lqip-stop10))) 10%,
				rgb(from var(--_lqip-c2-clr) r g b / calc(100% - var(--_lqip-stop20))) 20%,
				rgb(from var(--_lqip-c2-clr) r g b / calc(100% - var(--_lqip-stop30))) 30%,
				rgb(from var(--_lqip-c2-clr) r g b / calc(100% - var(--_lqip-stop40))) 40%,
				rgb(from var(--_lqip-c2-clr) r g b / var(--_lqip-stop40)) 60%,
				rgb(from var(--_lqip-c2-clr) r g b / var(--_lqip-stop30)) 70%,
				rgb(from var(--_lqip-c2-clr) r g b / var(--_lqip-stop20)) 80%,
				rgb(from var(--_lqip-c2-clr) r g b / var(--_lqip-stop10)) 90%,
				transparent),
			radial-gradient(50% 75% at 83.33% 25%,
				var(--_lqip-c3-clr),
				rgb(from var(--_lqip-c3-clr) r g b / calc(100% - var(--_lqip-stop10))) 10%,
				rgb(from var(--_lqip-c3-clr) r g b / calc(100% - var(--_lqip-stop20))) 20%,
				rgb(from var(--_lqip-c3-clr) r g b / calc(100% - var(--_lqip-stop30))) 30%,
				rgb(from var(--_lqip-c3-clr) r g b / calc(100% - var(--_lqip-stop40))) 40%,
				rgb(from var(--_lqip-c3-clr) r g b / var(--_lqip-stop40)) 60%,
				rgb(from var(--_lqip-c3-clr) r g b / var(--_lqip-stop30)) 70%,
				rgb(from var(--_lqip-c3-clr) r g b / var(--_lqip-stop20)) 80%,
				rgb(from var(--_lqip-c3-clr) r g b / var(--_lqip-stop10)) 90%,
				transparent),
			radial-gradient(50% 75% at 16.67% 75%,
				var(--_lqip-c4-clr),
				rgb(from var(--_lqip-c4-clr) r g b / calc(100% - var(--_lqip-stop10))) 10%,
				rgb(from var(--_lqip-c4-clr) r g b / calc(100% - var(--_lqip-stop20))) 20%,
				rgb(from var(--_lqip-c4-clr) r g b / calc(100% - var(--_lqip-stop30))) 30%,
				rgb(from var(--_lqip-c4-clr) r g b / calc(100% - var(--_lqip-stop40))) 40%,
				rgb(from var(--_lqip-c4-clr) r g b / var(--_lqip-stop40)) 60%,
				rgb(from var(--_lqip-c4-clr) r g b / var(--_lqip-stop30)) 70%,
				rgb(from var(--_lqip-c4-clr) r g b / var(--_lqip-stop20)) 80%,
				rgb(from var(--_lqip-c4-clr) r g b / var(--_lqip-stop10)) 90%,
				transparent),
			radial-gradient(50% 75% at 50% 75%,
				var(--_lqip-c5-clr),
				rgb(from var(--_lqip-c5-clr) r g b / calc(100% - var(--_lqip-stop10))) 10%,
				rgb(from var(--_lqip-c5-clr) r g b / calc(100% - var(--_lqip-stop20))) 20%,
				rgb(from var(--_lqip-c5-clr) r g b / calc(100% - var(--_lqip-stop30))) 30%,
				rgb(from var(--_lqip-c5-clr) r g b / calc(100% - var(--_lqip-stop40))) 40%,
				rgb(from var(--_lqip-c5-clr) r g b / var(--_lqip-stop40)) 60%,
				rgb(from var(--_lqip-c5-clr) r g b / var(--_lqip-stop30)) 70%,
				rgb(from var(--_lqip-c5-clr) r g b / var(--_lqip-stop20)) 80%,
				rgb(from var(--_lqip-c5-clr) r g b / var(--_lqip-stop10)) 90%,
				transparent),
			radial-gradient(50% 75% at 83.33% 75%,
				var(--_lqip-c6-clr),
				rgb(from var(--_lqip-c6-clr) r g b / calc(100% - var(--_lqip-stop10))) 10%,
				rgb(from var(--_lqip-c6-clr) r g b / calc(100% - var(--_lqip-stop20))) 20%,
				rgb(from var(--_lqip-c6-clr) r g b / calc(100% - var(--_lqip-stop30))) 30%,
				rgb(from var(--_lqip-c6-clr) r g b / calc(100% - var(--_lqip-stop40))) 40%,
				rgb(from var(--_lqip-c6-clr) r g b / var(--_lqip-stop40)) 60%,
				rgb(from var(--_lqip-c6-clr) r g b / var(--_lqip-stop30)) 70%,
				rgb(from var(--_lqip-c6-clr) r g b / var(--_lqip-stop20)) 80%,
				rgb(from var(--_lqip-c6-clr) r g b / var(--_lqip-stop10)) 90%,
				transparent),
			linear-gradient(0deg, var(--_lqip-base-clr), var(--_lqip-base-clr));
	}

	} /* end @supports for LQIP gradient */

	/* Fade-in transitions live OUTSIDE the @supports — they only run when the
	   --lqip class is present and the engine renders the gradient anyway. */

	.image__media--lqip .image__img {
		opacity: 0;
		transition: opacity 300ms ease-out;
	}

	:host([loaded]) .image__media--lqip .image__img {
		opacity: 1;
	}


	/* # Errored image
	   Hide the broken <img> entirely so the browser's native fallback rendering
	   (alt text leaking out + broken-image icon/border) doesn't show through
	   underneath our own error overlay. display:none also drops the element
	   from the accessibility tree, so its alt isn't announced alongside the
	   visible .image__error-text in the overlay (the overlay wrapper itself
	   carries no role/aria-label — the visible text serves AT users too, so a
	   duplicate label there would just announce the alt twice). Box dimensions
	   are preserved by aspect-ratio on .image__media, not by the img itself.
	   Listeners stay attached — only DOM removal detaches them — so the next
	   src change still triggers load/error. */

	:host([errored]) .image__img {
		display: none;
	}


	/* # Live region for dynamic load failures
	   Visually-hidden span sits inside .image__media and announces the
	   translated "image could not be loaded" message + alt text via
	   aria-live="polite" when _imageErrored flips mid-session. The element
	   is always rendered (so AT subscribes from first paint) but the
	   content only flows in on the error transition, which is what fires
	   the announcement. Standard visually-hidden recipe. */

	.image__status {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}


	/* # Error state
	   Centred icon + alt-text shown when the image fails to load. The media is
	   painted gray (--_background-color) via :host([errored]) so the icon and
	   label stay legible — no separate card needed. */

	:host([errored]) .image__media {
		background-color: var(--_background-color);
	}

	.image__error {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--_error-gap);
		padding: var(--_error-padding);
		color: var(--_error-text-color);
		font: var(--_error-font);
		text-align: center;
	}

	.image__error-text {
		max-width: 100%;
		overflow-wrap: anywhere;
	}


	/* # Caption */

	.image__caption {
		display: flex;
		flex-wrap: wrap;
		gap: var(--_caption-row-gap);
		color: var(--_caption-color);
		font: var(--_caption-font);
		text-wrap: pretty;
	}

	.image__credit {
		color: var(--_credit-color);
		font: var(--_credit-font);
	}


	/* # Reduced Motion */

	@media (prefers-reduced-motion: reduce) {
		.image__media--lqip .image__img {
			transition: none;
		}
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		.image__media {
			border: 1px solid CanvasText;
		}
	}
`;
