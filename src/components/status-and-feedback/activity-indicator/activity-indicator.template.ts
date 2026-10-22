import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDActivityIndicator } from './activity-indicator.js';

export function activityIndicatorTemplate(component: NLDDActivityIndicator) {
	// Disable + busy-mark the wrapped content while loading (overlay mode). `inert`
	// works over the flat tree, so it reaches the slotted (light-DOM) content and
	// takes its controls out of the tab order — which pointer-events alone can't.
	// (aria-busy below reflects the busy state explicitly as true/false rather than
	// toggling the attribute, which some AT track more reliably; note that inert also
	// removes the subtree from the a11y tree, so AT relies on the role="status" host,
	// not this aria-busy, for the loading announcement.)
	const disableContent = component._visible && !component.complete && component._hasContent;
	// The backdrop dims the inert content in overlay mode (unless opted out). It
	// renders for the whole overlay-mode lifetime; the `loading` host attribute —
	// not conditional rendering — drives its (and the indicator's) fade in AND
	// out, so the overlay can also transition away when loading finishes.
	const renderBackdrop = component._hasContent && !component.noBackdrop;
	// The label always renders so it is the announced content of the
	// role="status" host; show-text only controls whether it is visible.
	const text = component._accessibleName;
	return html`
		<div class="activity-indicator__content"
			?inert=${disableContent}
			aria-busy=${disableContent ? 'true' : 'false'}
		>
			<slot @slotchange=${component._onContentSlotChange}></slot>
		</div>
		${renderBackdrop ? html`<div class="activity-indicator__backdrop" aria-hidden="true"></div>` : nothing}
		<div class="activity-indicator">
			<svg class="activity-indicator__circle"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				focusable="false"
			>
				<circle class="activity-indicator__track"
					cx="12"
					cy="12"
					r="9"
				></circle>
				<circle class="activity-indicator__indicator"
					cx="12"
					cy="12"
					r="9"
					pathLength="100"
				></circle>
			</svg>
			<span class=${classMap({
				'activity-indicator__text': true,
				'activity-indicator__text--visually-hidden': !component.showText,
			})}>${text}</span>
		</div>
	`;
}
