/**
 * The address of a sample image from public/sample-images/, for stories and
 * the examples of a pattern.
 *
 * The website shows a story on the page of its component and in a frame of its
 * own, and may be deployed under a base path, so a relative address would miss
 * on every page but one. Photo: Bart van de Biezen, a small white on a
 * butterfly bush.
 */
export function sampleImage(file: string): string {
	return `${import.meta.env.BASE_URL}sample-images/${file}`;
}
