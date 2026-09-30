import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { NLDDTopNavigationBar } from './top-navigation-bar.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';
import logoSvg from './logo.js';

// # Top navigation bar template

function wordmarkContent(component: NLDDTopNavigationBar) {
	return html`
		<div class="top-navigation-bar__wordmark">
			<div class="top-navigation-bar__wordmark-spacer"></div>
			<div class="top-navigation-bar__wordmark-content">
				<p class="top-navigation-bar__wordmark-title">
					${component.logoTitle}
				</p>
				${component.logoSubtitle ? html`
					<p class="top-navigation-bar__wordmark-subtitle">
						${component.logoSubtitle}
					</p>
				` : nothing}
				${component.logoSupportingText1 ? html`
					<p class="top-navigation-bar__wordmark-supporting-text">
						${component.logoSupportingText1}
					</p>
				` : nothing}
				${component.logoSupportingText2 ? html`
					<p class="top-navigation-bar__wordmark-supporting-text">
						${component.logoSupportingText2}
					</p>
				` : nothing}
			</div>
		</div>
	`;
}

export function template(component: NLDDTopNavigationBar) {
	const safeLogoHref = sanitizeUrl(component.logoHref);
	const safeWebsiteHref = sanitizeUrl(component.websiteHref);

	return html`
		<div class="top-navigation-bar">
			${!component.noLogo ? html`<div class="top-navigation-bar__logo-bar">
				${component.logoTitle && safeLogoHref ? html`
					<a class="top-navigation-bar__logo-and-wordmark"
						href="${safeLogoHref}"
					>
						<div class="top-navigation-bar__logo"
							aria-hidden="true"
						>
							${unsafeHTML(logoSvg)}
						</div>
						${wordmarkContent(component)}
					</a>
				` : safeLogoHref ? html`
					<a class="top-navigation-bar__logo"
						href="${safeLogoHref}"
						aria-label="${component._t('components.top-navigation-bar.logo-label')}"
					>
						<span aria-hidden="true">${unsafeHTML(logoSvg)}</span>
					</a>
				` : html`
					<div class="top-navigation-bar__logo"
						role="img"
						aria-label="${component._t('components.top-navigation-bar.logo-label')}"
					>
						${unsafeHTML(logoSvg)}
					</div>
					${component.logoTitle ? wordmarkContent(component) : nothing}
				`}
			</div>` : nothing}
			<div class="top-navigation-bar__main-bar">
				${component.websiteTitle ? html`
					<div class="top-navigation-bar__website-title-bar">
						${safeWebsiteHref ? html`
							<a class="top-navigation-bar__website-title"
								href="${safeWebsiteHref}"
							>
								${component.websiteTitle}
							</a>
						` : html`
							<span class="top-navigation-bar__website-title">
								${component.websiteTitle}
							</span>
						`}
					</div>
				` : nothing}
				<div class="top-navigation-bar__menu-bar">
					<div class="top-navigation-bar__menu-bar-start">
						${component._hasBackButton ? html`
							<div class="top-navigation-bar__back-button">
								<nldd-menu-bar-item
									icon="chevron-left"
									text="${component._backText}"
									href=${component.backHref || nothing}
									accessible-label="${component._backText}"
									@click=${component._handleBackClick}
								></nldd-menu-bar-item>
							</div>
						` : nothing}
						<div class="top-navigation-bar__menu-button">
							<nldd-menu-bar-item
								icon="menu"
								text="${component._menuText}"
								haspopup="dialog"
								@click=${component._onMenuButtonClick}
							></nldd-menu-bar-item>
						</div>
						<div class="top-navigation-bar__global-menu-bar">
							<slot
								name="global"
								@slotchange=${component._onGlobalSlotChange}
							></slot>
						</div>
					</div>
					<div class="top-navigation-bar__menu-bar-end">
						<div class="top-navigation-bar__utility-menu-bar">
							<slot
								name="utility"
								@slotchange=${component._onUtilitySlotChange}
							></slot>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}
