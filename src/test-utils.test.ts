import { describe, it, expect } from 'vitest';
import { until } from './test-utils.js';

describe('until', () => {
	it('keert terug zodra de voorwaarde waar is', async () => {
		let ready = false;
		setTimeout(() => {
			ready = true;
		}, 30);
		await until(() => ready);
		expect(ready).toBe(true);
	});

	// Stil teruggeven liet de assertie erna "expected true to be false" melden,
	// wat niets zegt over de verstreken wachttijd en je naar het component
	// stuurt in plaats van naar de test.
	it('gooit met de verstreken tijd erin als de voorwaarde uitblijft', async () => {
		await expect(until(() => false, { timeout: 50 })).rejects.toThrow(/50ms/);
	});

	// Een test die wacht op iets dat juist NIET hoort te gebeuren, gebruikt de
	// timeout als antwoord.
	it('geeft stil terug met throwOnTimeout: false', async () => {
		await expect(
			until(() => false, { timeout: 50, throwOnTimeout: false }),
		).resolves.toBeUndefined();
	});
});
