#### Design system 0.23 t/m 0.25

**Nieuw component**
- **`nldd-term`** legt een begrip in lopende tekst uit. Het begrip krijgt een stippellijn eronder en toont de uitleg in een popover, op een telefoon in een bottom sheet.

**Grote wijzigingen**
- **Popovers die op interesse openen**: bij hover, bij focus en bij lang indrukken. Het werkt op `nldd-button`, `nldd-icon-button` en `nldd-link`, en de knop houdt zijn eigen klik. Een reactiebadge kan zo de reactie aan- en uitzetten en tegelijk laten zien wie er reageerde.
- **Tekst neemt de kleur over van het vlak waarop hij staat**, zoals de hero, een tooltip of een geselecteerde rij. Je eigen componenten kunnen hun kleuren op dezelfde manier doorgeven.
- **Tekst en links kunnen in de HTML staan.** Tekstslots nemen een eigen `<p>` of kop, en in `nldd-link` kun je een eigen `<a>` zetten. Zoekmachines, linkvoorbeelden en reader mode zien de inhoud dan zonder script, en routerlinks herladen de pagina niet meer.
- **Het pakket laadt op de server**, dus in Next, Docusaurus, Astro en Remix.
- **`nldd lint` vangt meer.** Hij meldt CSS-tokens die niet bestaan, leest `.js` met JSX, MDX en Go-templates, en werkt met `--pure` ook op een gebouwde site.
- **Rondere hoeken.** Een knop in een veld neemt de hoek van dat veld over, zodat de twee rondingen evenwijdig lopen.
- **4 toegankelijkheidsfixes**: een menu-item zegt dat het een nieuw tabblad of een andere website opent, met `list` wordt een rij tags of kaarten een lijst voor een schermlezer, de secundaire tekst in de tooltip heeft genoeg contrast, en "Gekopieerd" blijft staan zolang je op de kopieerknop staat.

**Kleine wijzigingen**
- **`nldd-avatar`**: initialen tot 4 tekens, voor een afkorting als LVVN.
- **`nldd-code-viewer`**: regelnummers met `line-numbers`.
- **`nldd-date-field` en `nldd-time-field`**: de sheet sluit met "Klaar", en de tijdwielen passen ook in een laag venster.
- **`nldd-menu`**: vervaagt aan de rand waar nog meer staat, en een gekozen item knippert één keer voordat het menu sluit.
- **`nldd-menu-item`**: `target` en `rel`, zoals op een link.
- **`nldd-popover`**: vervaagt aan de rand waar nog meer staat.
- **`nldd-skip-link`**: zegt "Ga naar de hoofdinhoud" als hij in de header staat.
- **`nldd-tag`**: lange tekst loopt door op een volgende regel.
- **`nldd-text-editor`**: laat geen losse `****` meer achter.

**Upgraden?** De linter laat zien wat er in je app verandert, en past het meeste zelf aan:
`npx @nldd/design-system@0.25.0 lint`
`npx @nldd/design-system@0.25.0 lint --fix`

[Volledige changelog](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/CHANGELOG.md)
