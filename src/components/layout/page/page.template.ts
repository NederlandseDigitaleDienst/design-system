import { nothing, TemplateResult } from 'lit';
import { html as staticHtml, literal } from 'lit/static-html.js';
import type { NLDDPage } from './page.js';

/**
 * The page's own chrome carries the document landmarks: header is the banner,
 * main the main landmark, footer the contentinfo. A page that is not the
 * document's page swaps those for a section and a div, which drops all three at
 * once: a header inside sectioning content is no longer a banner.
 */
export function pageTemplate(component: NLDDPage): TemplateResult {
	const region = component._isRegion;
	const outer = region ? literal`section` : literal`div`;
	const body = region ? literal`div` : literal`main`;
	const label = component.accessibleLabel.trim() || nothing;

	return staticHtml`
		<${outer} class="page"
			aria-label=${region ? label : nothing}
		>
			<header class="page__header ${component._scrolled ? 'is-scrolled' : ''}">
				<slot name="header"></slot>
			</header>
			<div class="page__scroll">
				<${body} class="page__main"
					aria-label=${region ? nothing : label}
				>
					<slot></slot>
				</${body}>
				<footer class="page__footer">
					<slot name="footer"></slot>
				</footer>
			</div>
		</${outer}>
	`;
}
