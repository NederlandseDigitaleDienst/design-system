/**
 * svgo settings for a new icon in src/components/content/icon/icons/, run as
 * `npm run optimize:icons -- <file.svg> …`. They give the house style: no
 * width or height, currentColor instead of a fixed color, one decimal, tabs,
 * each path on its own line. fill-rule goes as well: the icons rely on the
 * winding of their paths, which is what a Figma export gives. So does a
 * clip-path: Figma clips to the frame, which the viewBox already does. Shapes
 * become paths, circles included, so an icon is paths only.
 */
export default {
	floatPrecision: 1,
	js2svg: { pretty: true, indent: '\t' },
	plugins: [
		'removeDimensions',
		{ name: 'removeAttrs', params: { attrs: ['svg:fill', 'fill-rule', 'clip-rule', 'clip-path'] } },
		{
			name: 'preset-default',
			params: {
				overrides: {
					convertColors: { currentColor: true },
					convertShapeToPath: { convertArcs: true },
				},
			},
		},
		'sortAttrs',
	],
};
