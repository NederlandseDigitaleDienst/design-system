/**
 * Says which components the page itself is made of.
 *
 * The site and its examples use the same components, which could confuse; this
 * line turns that into the point. It counts what the page uses outside the
 * stages, so an example never shows up as part of the site.
 */
class SiteBuiltWith extends HTMLElement {
	connectedCallback(): void {
		// After the page has upgraded, so components a component renders into the
		// light DOM are counted too.
		setTimeout(() => this.list(), 0);
	}

	private list(): void {
		const pages = new Set((this.getAttribute('pages') ?? '').split(' ').filter(Boolean));
		const tags = new Set<string>();
		for (const node of document.querySelectorAll('*')) {
			if (node.localName.startsWith('nldd-') && !node.closest('site-stage')) tags.add(node.localName);
		}
		if (!tags.size) return;
		const base = import.meta.env.BASE_URL;
		this.append('Deze pagina is gebouwd met ');
		[...tags].sort().forEach((tag, index, all) => {
			const slug = tag.slice('nldd-'.length);
			const item = document.createElement(pages.has(slug) ? 'a' : 'span');
			if (item instanceof HTMLAnchorElement) item.href = `${base}componenten/${slug}/`;
			item.textContent = tag;
			this.append(item, index === all.length - 1 ? '.' : index === all.length - 2 ? ' en ' : ', ');
		});
	}
}

customElements.define('site-built-with', SiteBuiltWith);
