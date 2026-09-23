import { html, nothing, TemplateResult } from 'lit';
import type { NLDDPagination } from './pagination.js';
import '../../actions/icon-button/icon-button.js';
import '../../content/icon/icon.js';

export function paginationTemplate(component: NLDDPagination): TemplateResult {
	const pages = component._getVisiblePages();
	const atFirst = component.current <= 1;
	const atLast = component.current >= component.total;
	const t = component._t.bind(component);
	const hasHref = !!component.hrefPattern;
	const isDisabled = component.disabled;

	const renderPageButton = (page: number) => {
		const isCurrent = page === component.current;
		const label = t('components.pagination.page-action', { page });

		if (hasHref) {
			return html`
				<a class="pagination__page-button ${isCurrent ? 'is-current' : ''}"
					href=${!isDisabled ? component._hrefForPage(page) : nothing}
					aria-label=${label}
					aria-current=${isCurrent ? 'page' : nothing}
					tabindex=${isDisabled ? -1 : nothing}
					aria-disabled=${isDisabled ? 'true' : nothing}
					@click=${(e: Event) => { e.preventDefault(); component._goToPage(page); }}
				>
					<span class="pagination__page-button-text">${page}</span>
				</a>
			`;
		}

		return html`
			<button class="pagination__page-button ${isCurrent ? 'is-current' : ''}"
				type="button"
				aria-label=${label}
				aria-current=${isCurrent ? 'page' : nothing}
				?disabled=${isDisabled}
				@click=${() => component._goToPage(page)}
			>
				<span class="pagination__page-button-text">${page}</span>
			</button>
		`;
	};

	return html`
		<nav class="pagination"
			aria-label=${t('components.pagination.accessible-label')}
		>
			<div class="pagination__previous-button">
				<nldd-icon-button
					icon="chevron-left-small"
					text=${t('components.pagination.previous-action')}
					variant="neutral-tinted"
					no-highlight-border
					?disabled=${isDisabled || atFirst}
					href=${hasHref && !isDisabled && !atFirst ? component._hrefForPage(component.current - 1) : nothing}
					@click=${(e: Event) => { if (hasHref) e.preventDefault(); component._goToPage(component.current - 1); }}
				></nldd-icon-button>
			</div>
			<div class="pagination__divider"
				aria-hidden="true"
			>
				<div class="pagination__divider-line"></div>
			</div>
			<div class="pagination__page-buttons">
				${pages.map((page) =>
					page === 'ellipsis'
						? html`<div class="pagination__ellipsis"
								aria-hidden="true"
							>&hellip;</div>`
						: renderPageButton(page as number)
				)}
			</div>
			<div class="pagination__compact">
				<div class="pagination__select-wrapper">
					<select class="pagination__select"
						aria-label=${t('components.pagination.go-to-page-label')}
						?disabled=${isDisabled}
						@change=${(e: Event) => component._goToPage(Number((e.target as HTMLSelectElement).value))}
						@focus=${component._handleSelectFocus}
						@blur=${component._handleSelectBlur}
						@keydown=${component._handleSelectKeydown}
						@toggle=${component._handleSelectToggle}
					>
						${Array.from({ length: component.total }, (_, i) => i + 1).map((page) => html`
							<option value=${page} ?selected=${page === component.current}>${page} / ${component.total}</option>
						`)}
					</select>
					<div class="pagination__select-picker-icon">
						<nldd-icon icon="chevron-up-chevron-down"></nldd-icon>
					</div>
				</div>
			</div>
			<div class="pagination__divider"
				aria-hidden="true"
			>
				<div class="pagination__divider-line"></div>
			</div>
			<div class="pagination__next-button">
				<nldd-icon-button
					icon="chevron-right-small"
					text=${t('components.pagination.next-action')}
					variant="neutral-tinted"
					no-highlight-border
					?disabled=${isDisabled || atLast}
					href=${hasHref && !isDisabled && !atLast ? component._hrefForPage(component.current + 1) : nothing}
					@click=${(e: Event) => { if (hasHref) e.preventDefault(); component._goToPage(component.current + 1); }}
				></nldd-icon-button>
			</div>
		</nav>
	`;
}
