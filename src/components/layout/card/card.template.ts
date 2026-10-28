import { html, nothing, TemplateResult } from 'lit';
import type { NLDDCard } from './card.js';
import { linkRel } from '../../../utilities/link-rel.js';
import { downloadLinkHintKey, warnDownloadTarget } from '../../../utilities/link-hint.js';

export function cardTemplate(component: NLDDCard): TemplateResult {
	// A link to another website or a new tab says so (WCAG 2.1 SC 3.2.2).
	const hintKey = downloadLinkHintKey(component.href, component.target, component.download);
	if (component.href) warnDownloadTarget(component, component.download, component.target);
	const linkHint = hintKey ? component._t(`components.card.${hintKey}`) : '';
	// The overlay control has no text, so its name comes from aria-label, with
	// the link hint appended. accessible-label names the link or button when
	// the card is interactive, the article otherwise — so the card carries
	// exactly one name.
	const linkLabel = [component.accessibleLabel, linkHint].filter(Boolean).join(', ') || nothing;
	const isInteractive = Boolean(component.href) || component.button;
	return html`
		<article class="card"
			aria-label=${isInteractive ? nothing : (component.accessibleLabel ?? nothing)}
		>
			${component.href ? html`
				<a class="card__action"
					href=${component.href}
					target=${component.target || nothing}
					rel=${linkRel(component.rel, component.target) || nothing}
					download=${component.download ?? nothing}
					aria-label=${linkLabel}
				></a>
			` : component.button ? html`
				<button class="card__action"
					type="button"
					aria-label=${linkLabel}
				></button>
			` : nothing}
			<header class="card__header"
				hidden
			>
				<slot
					name="header"
					@slotchange=${component._onSlotChange}
				></slot>
			</header>
			<div class="card__main">
				<slot></slot>
			</div>
			<footer class="card__footer"
				hidden
			>
				<slot
					name="footer"
					@slotchange=${component._onSlotChange}
				></slot>
			</footer>
		</article>
		<span class="card__focus-ring"></span>
	`;
}
