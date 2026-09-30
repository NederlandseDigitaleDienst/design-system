import { html, nothing, TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { NLDDCollection } from './collection.js';

export function collectionTemplate(component: NLDDCollection): TemplateResult {
	const isHorizontal = component.layout === 'horizontal-scroll';
	const showLoadMore = !isHorizontal && component.showLoadMore && component._hasMore;
	const scrollable = isHorizontal && component._isScrollable;
	// The horizontal nav controls (and so the footer) only make sense when the
	// items actually overflow. A consumer footer slot keeps the footer regardless.
	const showFooter = scrollable || showLoadMore || component._hasFooterSlot;

	return html`
		<div class="collection__scroll-area">
			<div class="collection__items"
				tabindex=${ifDefined(scrollable ? '0' : undefined)}
				role=${ifDefined(scrollable ? 'region' : undefined)}
				aria-label=${ifDefined(scrollable ? component._t('components.collection.region-label') : undefined)}
			>
				<slot @slotchange=${(e: Event) => component._onSlotChange(e)}></slot>
			</div>
		</div>
		<footer class="collection__footer"
			?hidden=${!showFooter}
		>
			<slot
				name="footer"
				@slotchange=${component._onFooterSlotChange}
			>
				${scrollable ? html`
					<nldd-button-bar>
						<nldd-icon-button
							icon="chevron-left"
							text=${component._t('components.collection.previous-action')}
							tooltip-timing="never"
							.disabled=${component._atStart}
							@click=${() => component._scrollBy(-1)}
						></nldd-icon-button>
						<nldd-button-bar-divider></nldd-button-bar-divider>
						<nldd-icon-button
							icon="chevron-right"
							text=${component._t('components.collection.next-action')}
							tooltip-timing="never"
							.disabled=${component._atEnd}
							@click=${() => component._scrollBy(1)}
						></nldd-icon-button>
					</nldd-button-bar>
				` : nothing}
				${showLoadMore ? html`
					<nldd-button
						variant="neutral-tinted"
						text=${component._t('components.collection.load-more-action')}
						width="full"
						@click=${() => component._loadMore()}
					></nldd-button>
				` : nothing}
			</slot>
		</footer>
	`;
}
