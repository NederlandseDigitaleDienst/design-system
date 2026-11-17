/**
 * The element that really holds focus, inside any shadow roots.
 * `document.activeElement` only names the outermost shadow host.
 */
export function deepActiveElement(): HTMLElement | null {
	let el = document.activeElement;
	while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
	return el as HTMLElement | null;
}
