import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatComparison } from './compare.js';

describe('what a comparison found, as text for under a pull request', () => {
	const page = (path, viewport, marks) => ({ path, viewport, identical: marks === 0, file: marks === 0 ? null : `${path.replaceAll('/', '_')}${viewport}.png`, marks });

	it('says so in one line when nothing differs', () => {
		const text = formatComparison([page('/', 'desktop', 0), page('/', 'mobile', 0)]);
		assert.equal(text, '## In beeld\n\n2 vergelijkingen van de gebouwde site, voor en na de upgrade, op de breedte van een bureau en van een telefoon. Ze zijn alle pixel voor pixel gelijk.\n');
	});

	it('shows one image per page, the pages with most marks first, and lists the rest', () => {
		const results = [page('/', 'desktop', 0), page('/aanvraag/', 'mobile', 2), page('/aanvraag/', 'desktop', 2), page('/dossier/', 'mobile', 5), { path: '/weg/', viewport: 'desktop', error: 'Error: 404' }];
		const text = formatComparison(results, 2);
		assert.match(text, /5 vergelijkingen[^\n]*1 is pixel voor pixel gelijk, 3 verschillen\./);
		assert.deepEqual(text.match(/!\[[^\]]*\]\(([^)]*)\)/g), ['![/dossier/, voor en na](./_dossier_mobile.png)', '![/aanvraag/, voor en na](./_aanvraag_desktop.png)']);
		assert.match(text, /<summary>Verschilt ook \(1\)<\/summary>\n\n- `\/aanvraag\/` \(telefoon\): 2 verschillen/);
		assert.match(text, /Niet vergeleken:\n\n- `\/weg\/` \(bureau\): Error: 404/);
	});
});
