import { useEffect, useRef, useState } from 'react';
import '../components/index.js';
import references from '../../scripts/reference-colors.json';
import { DEFAULT_THEME, themesByHue } from '../../scripts/lib/themes.js';

const NAMES = [DEFAULT_THEME, ...themesByHue(references).map((c) => c.name)];

const sample = (theme, scheme) =>
	`iframe.html?id=docs-themacontrole-onderdelen--alle-onderdelen&viewMode=story&globals=nlddTheme:${theme};theme:${scheme}`;

/**
 * The page with every themed part, in light and dark side by side, for the
 * theme picked above it. Each mode is an iframe with its own data-nldd-theme
 * and data-scheme on <html>: a theme applies to the whole page.
 */
export function ThemeViewer({ height }) {
	const [theme, setTheme] = useState(DEFAULT_THEME);
	const group = useRef(null);
	useEffect(() => {
		const element = group.current;
		const onChange = (event) => {
			if (event.detail?.selected) setTheme(event.detail.value);
		};
		element.addEventListener('change', onChange);
		return () => element.removeEventListener('change', onChange);
	}, []);
	return (
		<div>
			<nldd-toggle-button-group ref={group} type="radio" size="sm" accessible-label="Thema" style={{ marginBottom: 16 }}>
				{NAMES.map((name) => (
					<nldd-toggle-button
						key={name}
						value={name}
						text={name === DEFAULT_THEME ? `${name} (standaard)` : name}
						selected={name === DEFAULT_THEME ? true : undefined}
					/>
				))}
			</nldd-toggle-button-group>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
				{['light', 'dark'].map((scheme) => (
					<iframe
						key={scheme}
						title={`${theme}, ${scheme === 'light' ? 'licht' : 'donker'}`}
						src={sample(theme, scheme)}
						style={{ width: '100%', height, border: '1px solid #d9dee5', borderRadius: 8 }}
					/>
				))}
			</div>
		</div>
	);
}
