/** Every component by tag, as a function that loads its module. Supplied by site/build/pages.js. */
declare module 'virtual:site-components' {
	const loaders: Record<string, () => Promise<unknown>>;
	export default loaders;
}
