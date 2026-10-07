/**
 * svgo settings for a new icon in src/components/content/icon/icons/, run as
 * `npm run optimize:icons -- <file.svg> …`. They give the house style: no
 * width or height, currentColor instead of a fixed color, two decimals, tabs,
 * each path on its own line. fill-rule goes as well: the icons rely on the
 * winding of their paths, which is what a Figma export gives.
 */
export default {
	floatPrecision: 2,
	js2svg: { pretty: true, indent: '\t' },
	plugins: [
		{ name: 'preset-default', params: { overrides: { convertColors: { currentColor: true } } } },
		'removeDimensions',
		{ name: 'removeAttrs', params: { attrs: ['svg:fill', 'fill-rule', 'clip-rule'] } },
		'sortAttrs',
	],
};
