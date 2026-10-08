import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { NLDDImage } from './image.js';

export function imageTemplate(component: NLDDImage) {
	// aspect-ratio is applied to the media wrapper (not the img) so it
	// reserves space in the layout *before* the image loads, avoiding CLS.
	// Slotted img/picture also fills this wrapper.
	// --context-lqip-base / --context-lqip-c1..c6 carry the seven quantised
	// Oklab bytes from the parsed lqip attribute across the shadow boundary
	// into the stylesheet. Each byte decodes back into an oklab() color at
	// render time. Uses the --context-* prefix because the inline style and
	// the consuming CSS live in different scopes.
	const parsedLqip = component._parsedLqip;
	const hasLqip = parsedLqip !== null;
	const mediaStyles: Record<string, string> = {};
	if (component._cssAspectRatio) mediaStyles.aspectRatio = component._cssAspectRatio;
	if (hasLqip) {
		mediaStyles['--context-lqip-base'] = String(parsedLqip.base);
		parsedLqip.cells.forEach((cell, i) => {
			mediaStyles[`--context-lqip-c${i + 1}`] = String(cell);
		});
	}

	const isEmpty = component._isEmpty;
	const mediaClasses = classMap({
		'image__media': true,
		// No image at all: a neutral area with an icon, where an image belongs.
		'image__media--empty': isEmpty,
		// The built-in img is on its way and there is no LQIP to show meanwhile:
		// the same neutral area, without the icon, so a fast load does not flash
		// one. Slotted media is left alone, since its load cannot be observed and
		// the fill would stay behind a transparent image.
		'image__media--loading': !isEmpty && !hasLqip && !component._hasSlottedMedia && !component._imageLoaded && !component._imageErrored,
		// LQIP only renders while the image is in-flight. Once it errors we
		// fall back to the neutral background so the error card sits on a
		// calm surface instead of a distracting gradient.
		'image__media--lqip': hasLqip && !component._imageErrored,
	});

	const fallbackImg = html`
		<img class="image__img"
			src=${component.src || nothing}
			alt=${component.decorative ? '' : component.alt}
			aria-hidden=${component.decorative ? 'true' : nothing}
			srcset=${component.srcset || nothing}
			sizes=${component.sizes || nothing}
			width=${ifDefined(component._numericWidth)}
			height=${ifDefined(component.height)}
			loading=${component.loading}
			decoding=${component.decoding}
			fetchpriority=${ifDefined(component.fetchPriority)}
			@load=${component._onImageLoad}
			@error=${component._onImageError}
		>
	`;

	// Error overlay: shown when the fallback img fires an error. Sits centered
	// over the media area on top of the LQIP gradient (or the neutral fallback
	// background when no LQIP is provided).
	// A11y: the visible .image__error-text already carries the alt as readable
	// text for both sighted and screen-reader users, so the wrapper does NOT
	// repeat it via role="img" + aria-label — that produced a duplicate
	// announcement ("image: X" followed by "X"). Decorative images skip the
	// text entirely and aria-hidden the whole overlay so AT users don't get a
	// spurious failure announcement for an image that conveyed nothing anyway.
	const errorOverlay = component._imageErrored ? html`
		<div class="image__error"
			aria-hidden=${component.decorative ? 'true' : nothing}
		>
			<nldd-icon
				icon="broken-image"
				size="32"
				color="secondary-content"
			></nldd-icon>
			${component.decorative ? nothing : html`<span class="image__error-text">${component.alt}</span>`}
		</div>
	` : nothing;

	// Visually-hidden live region announces "image failed to load" once the
	// internal img errors mid-session (gallery swap, lazy reload, etc.). The
	// element is always rendered (so AT subscribes to it from first paint),
	// but populated only on error so the announcement fires when the text
	// flips from empty to non-empty. Decorative images stay silent — they
	// convey nothing, so a failure isn't worth announcing.
	// Append the alt only — never the raw src. A CDN URL with a long path
	// and query string is noise to AT users; when alt is empty (valid in
	// production, DEV-warned) we announce the plain translated message.
	const errorBase = component._t('components.image.error-text');
	const errorStatusMessage = component._imageErrored && !component.decorative
		? (component.alt ? `${errorBase}: ${component.alt}` : errorBase)
		: '';
	const liveRegion = html`<span class="image__status"
		aria-live="polite"
	>${errorStatusMessage}</span>`;

	// An empty image conveys nothing, so the whole area is hidden from
	// assistive technology. The slot stays, so media that arrives later is seen.
	const media = html`
		<div class=${mediaClasses}
			style=${styleMap(mediaStyles)}
			aria-hidden=${isEmpty ? 'true' : nothing}
		>
			<slot @slotchange=${component._onMediaSlotChange}>${isEmpty ? nothing : fallbackImg}</slot>
			${isEmpty ? html`<span class="image__empty-icon"><nldd-icon icon="image"></nldd-icon></span>` : nothing}
			${errorOverlay}
			${liveRegion}
		</div>
	`;

	if (!component._hasCaption) {
		return media;
	}

	return html`
		<figure class="image__figure">
			${media}
			<figcaption class="image__caption">
				<slot
					name="caption" @slotchange=${component._onCaptionSlotChange}
				>${component.caption}</slot>
				${component.credit ? html`<span class="image__credit">${component.credit}</span>` : nothing}
			</figcaption>
		</figure>
	`;
}
