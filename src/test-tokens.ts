import variablesCss from './assets/styles/variables.css?raw';
import colorsCss from './assets/styles/colors.generated.css?raw';

/**
 * Loads the design tokens into the test document, which does not have them:
 * a component's local variables point at primitives and semantics, and without
 * them every value resolves to nothing. variables.css imports the palettes,
 * which an @import in a <style> tag cannot resolve, so those go in separately.
 * Returns a function that removes them again.
 */
export function loadTokens(): () => void {
	const styles = [colorsCss, variablesCss.replace(/@import[^;]+;/g, '')].map((css) => {
		const style = document.createElement('style');
		style.textContent = css;
		document.head.appendChild(style);
		return style;
	});
	return () => styles.forEach((style) => style.remove());
}
